// src/services/searchAnalytics.ts - VERSÃO MELHORADA
import { supabase } from './api'

export interface PopularSearch {
  search_term: string
  search_type: 'category' | 'complex' | 'general'
  total_searches: number
}

// Lista de categorias profissionais válidas (baseada no fallback)
const VALID_CATEGORIES = [
  'Advogado',
  'Psicólogo',
  'Contador',
  'Dentista',
  'Nutricionista',
  'Arquiteto',
]

// Normalizar texto (lowercase, sem acentos, trim)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Verificar se o termo é uma categoria válida
function isValidCategory(searchTerm: string): boolean {
  const normalized = normalizeText(searchTerm)
  return VALID_CATEGORIES.some((category) => normalizeText(category) === normalized)
}

// Verificar se parece ser uma profissão válida (heurística simples)
function looksLikeProfession(searchTerm: string): boolean {
  const normalized = normalizeText(searchTerm)

  // Palavras-chave que indicam profissão
  const professionKeywords = [
    'consultor',
    'especialista',
    'profissional',
    'terapeuta',
    'tecnico',
    'analista',
    'advogado',
    'medico',
    'doutor',
    'professor',
  ]

  // Sufixos comuns de profissões
  const professionSuffixes = ['ista', 'logo', 'eiro', 'dor']

  const hasKeyword = professionKeywords.some((keyword) => normalized.includes(keyword))
  const hasSuffix = professionSuffixes.some((suffix) => normalized.endsWith(suffix))

  return hasKeyword || hasSuffix
}

// Verificar se é um complexo cadastrado
async function isValidComplex(searchTerm: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('complexes')
      .select('id')
      .ilike('name', `%${searchTerm}%`)
      .limit(1)

    if (error) return false
    return data && data.length > 0
  } catch (err) {
    console.error('Erro ao verificar complexo:', err)
    return false
  }
}

/**
 * Determina o tipo de pesquisa baseado no termo
 */
export function determineSearchType(
  searchTerm: string,
  categories: string[],
  complexNames: string[],
): 'category' | 'complex' | 'general' {
  const normalized = searchTerm.trim().toLowerCase()

  // Verificar se é uma categoria conhecida
  const isCategory = categories.some(
    (cat) => cat.toLowerCase() === normalized || normalized.includes(cat.toLowerCase()),
  )
  if (isCategory) return 'category'

  // Verificar se é um complexo conhecido
  const isComplex = complexNames.some(
    (complex) => complex.toLowerCase() === normalized || normalized.includes(complex.toLowerCase()),
  )
  if (isComplex) return 'complex'

  return 'general'
}

/**
 * Determina automaticamente o tipo de pesquisa (versão assíncrona melhorada)
 */
async function autoDetectSearchType(
  searchTerm: string,
): Promise<'category' | 'complex' | 'general'> {
  // 1. Verificar se é categoria válida
  if (isValidCategory(searchTerm)) {
    return 'category'
  }

  // 2. Verificar se parece ser uma profissão
  if (looksLikeProfession(searchTerm)) {
    return 'category'
  }

  // 3. Verificar se é um complexo cadastrado
  const isComplex = await isValidComplex(searchTerm)
  if (isComplex) {
    return 'complex'
  }

  // 4. Se não se encaixa, é pesquisa geral
  return 'general'
}

/**
 * Registra uma pesquisa no banco de dados
 */
export async function trackSearch(
  searchTerm: string,
  searchType: 'category' | 'complex' | 'general',
  resultCount: number = 0,
) {
  try {
    // Normalizar o termo (remover espaços extras)
    const normalizedTerm = searchTerm.trim()

    if (!normalizedTerm) return

    // Validar o tipo automaticamente se for 'general'
    let finalSearchType = searchType
    if (searchType === 'general') {
      finalSearchType = await autoDetectSearchType(normalizedTerm)
    }

    // 1. Inserir no histórico de pesquisas
    await supabase.from('search_analytics').insert({
      search_term: normalizedTerm,
      search_type: finalSearchType,
      result_count: resultCount,
    })

    // 2. Atualizar ou criar no cache de pesquisas populares
    const { data: existing } = await supabase
      .from('popular_searches')
      .select('*')
      .eq('search_term', normalizedTerm)
      .single()

    if (existing) {
      // Atualizar contador
      await supabase
        .from('popular_searches')
        .update({
          total_searches: existing.total_searches + 1,
          last_searched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('search_term', normalizedTerm)
    } else {
      // Criar novo registro
      await supabase.from('popular_searches').insert({
        search_term: normalizedTerm,
        search_type: finalSearchType,
        total_searches: 1,
      })
    }
  } catch (error) {
    console.error('❌ Erro ao trackear pesquisa:', error)
    // Não bloquear a aplicação se o tracking falhar
  }
}

/**
 * Busca os termos mais pesquisados (mix de categorias e complexos)
 * MELHORADO: Filtra apenas categorias e complexos válidos
 */
export async function getPopularSearches(limit: number = 6): Promise<PopularSearch[]> {
  try {
    // Buscar as mais pesquisadas dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('popular_searches')
      .select('search_term, search_type, total_searches')
      .gte('last_searched_at', thirtyDaysAgo.toISOString())
      .in('search_type', ['category', 'complex']) // 🔥 FILTRO: apenas categoria e complexo
      .order('total_searches', { ascending: false })
      .limit(limit * 2) // Buscar mais para ter opções após filtrar

    if (error) throw error

    if (!data || data.length === 0) {
      return getFallbackSearches()
    }

    // Validação adicional: filtrar categorias inválidas
    const validSearches = data.filter((search) => {
      // Se for categoria, verificar se está na lista de válidas
      if (search.search_type === 'category') {
        return isValidCategory(search.search_term)
      }
      // Complexos passam direto (já foram validados na criação)
      return true
    })

    if (validSearches.length === 0) {
      return getFallbackSearches()
    }

    // Mesclar categorias e complexos (priorizar categorias)
    const categories = validSearches.filter((s) => s.search_type === 'category')
    const complexes = validSearches.filter((s) => s.search_type === 'complex')

    // Priorizar: 4 categorias, 2 complexos (ou ajustar conforme disponível)
    const result: PopularSearch[] = []

    // Adicionar até 4 categorias
    result.push(...categories.slice(0, 4))

    // Completar com complexos
    const remaining = limit - result.length
    result.push(...complexes.slice(0, remaining))

    // Se ainda não tiver o suficiente, completar com mais categorias
    if (result.length < limit) {
      result.push(...categories.slice(4, limit))
    }

    // Se ainda faltar, usar fallback
    if (result.length < limit) {
      const fallback = getFallbackSearches()
      const existingTerms = new Set(result.map((r) => normalizeText(r.search_term)))
      const additionalTerms = fallback.filter(
        (f) => !existingTerms.has(normalizeText(f.search_term)),
      )
      result.push(...additionalTerms.slice(0, limit - result.length))
    }

    return result.slice(0, limit)
  } catch (error) {
    console.error('❌ Erro ao buscar pesquisas populares:', error)
    return getFallbackSearches()
  }
}

/**
 * Pesquisas fallback caso não haja dados suficientes
 */
function getFallbackSearches(): PopularSearch[] {
  return [
    { search_term: 'Advogado', search_type: 'category', total_searches: 0 },
    { search_term: 'Psicólogo', search_type: 'category', total_searches: 0 },
    { search_term: 'Contador', search_type: 'category', total_searches: 0 },
    { search_term: 'Dentista', search_type: 'category', total_searches: 0 },
    { search_term: 'Nutricionista', search_type: 'category', total_searches: 0 },
    { search_term: 'Arquiteto', search_type: 'category', total_searches: 0 },
  ]
}

// Exportar lista de categorias válidas para uso em outros lugares
export { VALID_CATEGORIES }

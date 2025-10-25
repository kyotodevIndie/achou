// src/services/searchAnalytics.ts
import { supabase } from './api'

export interface PopularSearch {
  search_term: string
  search_type: 'category' | 'complex' | 'general'
  total_searches: number
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
    // Normalizar o termo (remover espaços extras, lowercase para comparação)
    const normalizedTerm = searchTerm.trim()

    if (!normalizedTerm) return

    console.log('📊 Tracking search:', { searchTerm: normalizedTerm, searchType, resultCount })

    // 1. Inserir no histórico de pesquisas
    await supabase.from('search_analytics').insert({
      search_term: normalizedTerm,
      search_type: searchType,
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
        search_type: searchType,
        total_searches: 1,
      })
    }

    console.log('✅ Search tracked successfully')
  } catch (error) {
    console.error('❌ Erro ao trackear pesquisa:', error)
    // Não bloquear a aplicação se o tracking falhar
  }
}

/**
 * Busca os termos mais pesquisados (mix de categorias e complexos)
 */
export async function getPopularSearches(limit: number = 6): Promise<PopularSearch[]> {
  try {
    console.log('🔍 Buscando pesquisas populares...')

    // Buscar as mais pesquisadas dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('popular_searches')
      .select('search_term, search_type, total_searches')
      .gte('last_searched_at', thirtyDaysAgo.toISOString())
      .order('total_searches', { ascending: false })
      .limit(limit * 2) // Buscar mais para ter opções após filtrar

    if (error) throw error

    if (!data || data.length === 0) {
      console.log('⚠️ Nenhuma pesquisa popular encontrada, usando fallback')
      return getFallbackSearches()
    }

    // Mesclar categorias e complexos (50/50 se possível)
    const categories = data.filter((s) => s.search_type === 'category')
    const complexes = data.filter((s) => s.search_type === 'complex')
    const general = data.filter((s) => s.search_type === 'general')

    // Priorizar: 4 categorias, 2 complexos (ou ajustar conforme disponível)
    const result: PopularSearch[] = []

    // Adicionar até 4 categorias
    result.push(...categories.slice(0, 4))

    // Completar com complexos
    const remaining = limit - result.length
    result.push(...complexes.slice(0, remaining))

    // Se ainda faltar, adicionar pesquisas gerais
    if (result.length < limit) {
      result.push(...general.slice(0, limit - result.length))
    }

    console.log('✅ Pesquisas populares carregadas:', result.length)
    return result.slice(0, limit)
  } catch (error) {
    console.error('❌ Erro ao buscar pesquisas populares:', error)
    return getFallbackSearches()
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

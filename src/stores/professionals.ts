// src/stores/professionals.ts - Store completo com busca avançada E FOTOS + RATINGS
import { supabase } from '@/services/api'
import type { AdvancedSearchParams, Professional, SearchParams, UserLocation } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useProfessionalsStore = defineStore('professionals', () => {
  // State
  const professionals = ref<Professional[]>([])
  const currentProfessional = ref<Professional | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const userLocation = ref<UserLocation | null>(null)

  // Getters
  const totalProfessionals = computed(() => professionals.value.length)

  // Função para calcular distância entre dois pontos (Haversine)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Função para converter range de preço para números
  function parsePriceRange(priceRange: string): { min: number; max: number } {
    if (priceRange.includes('+')) {
      return { min: parseInt(priceRange.replace('+', '')), max: 999999 }
    }
    const [min, max] = priceRange.split('-').map((p) => parseInt(p) || 0)
    return { min: min || 0, max: max || 999999 }
  }

  // Busca avançada
  async function searchProfessionalsAdvanced(params: AdvancedSearchParams) {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('professionals')
        .select(
          `
          *,
          professional_photos(
            id,
            photo_url,
            is_primary,
            order_index
          ),
          rating,
          review_count
        `,
        )
        .eq('is_active', true) // ✅ APENAS PROFISSIONAIS ATIVOS

      // Filtro de texto em múltiplos campos
      if (params.query) {
        query = query.or(
          `name.ilike.%${params.query}%,category.ilike.%${params.query}%,specialty.ilike.%${params.query}%,complex_name.ilike.%${params.query}%,address.ilike.%${params.query}%,description.ilike.%${params.query}%`,
        )
      }

      // Filtros de categoria
      if (params.categories.length > 0) {
        query = query.in('category', params.categories)
      }

      // Filtros de cidade
      if (params.cities.length > 0) {
        query = query.in('city', params.cities)
      }

      // Filtros de bairro
      if (params.neighborhoods.length > 0) {
        query = query.in('neighborhood', params.neighborhoods)
      }

      // Filtro de fotos
      if (params.hasPhotos) {
        // Subquery para profissionais com fotos
        const { data: professionalIds } = await supabase
          .from('professional_photos')
          .select('professional_id')

        if (professionalIds && professionalIds.length > 0) {
          const ids = professionalIds.map((p) => p.professional_id)
          query = query.in('id', ids)
        } else {
          // Se não há fotos, retornar vazio
          professionals.value = []
          return
        }
      }

      // Filtro verificado
      if (params.verified) {
        query = query.eq('verified', true)
      }

      // Filtro urgência
      if (params.acceptsUrgent) {
        query = query.eq('accepts_urgent', true)
      }

      // Filtro tempo de resposta
      if (params.responseTime.length > 0) {
        query = query.in('response_time', params.responseTime)
      }

      // Ordenação inicial
      switch (params.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'price_asc':
        case 'price_desc':
          query = query.order('price_range', { ascending: params.sortBy === 'price_asc' })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error: apiError } = await query

      if (apiError) throw new Error(apiError.message)

      let results = data || []

      // Buscar ratings para cada profissional
      if (results.length > 0) {
        const professionalIds = results.map((p) => p.id)

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('professional_id, rating')
          .in('professional_id', professionalIds)
          .eq('status', 'approved') // Apenas reviews aprovadas

        // Calcular média de rating para cada profissional
        const ratingsMap = new Map<string, { rating: number; count: number }>()

        if (reviewsData) {
          reviewsData.forEach((review) => {
            const current = ratingsMap.get(review.professional_id) || { rating: 0, count: 0 }
            current.rating += review.rating
            current.count += 1
            ratingsMap.set(review.professional_id, current)
          })
        }

        // Processar fotos e ratings para cada profissional
        results = results.map((prof) => {
          const reviewStats = ratingsMap.get(prof.id)
          return {
            ...prof,
            photos: prof.professional_photos || [],
            rating: reviewStats ? reviewStats.rating / reviewStats.count : 0,
            review_count: reviewStats ? reviewStats.count : 0,
          }
        })
      }

      // Processamento pós-busca
      if (results.length > 0) {
        // Calcular distâncias se há localização do usuário
        if (params.userLocation) {
          results = results.map((prof) => {
            if (prof.latitude && prof.longitude) {
              const distance = calculateDistance(
                params.userLocation!.latitude,
                params.userLocation!.longitude,
                prof.latitude,
                prof.longitude,
              )
              return { ...prof, distance }
            }
            return prof
          })

          // Filtrar por distância máxima
          if (params.maxDistance) {
            results = results.filter(
              (prof) => !prof.distance || prof.distance <= params.maxDistance!,
            )
          }

          // Ordenar por distância se solicitado
          if (params.sortBy === 'distance') {
            results = results.sort((a, b) => (a.distance || 999) - (b.distance || 999))
          }
        }

        // Filtrar por faixa de preço (pós-processamento pois price_range é string)
        if (params.priceMin > 0 || params.priceMax < 1000) {
          results = results.filter((prof) => {
            const { min, max } = parsePriceRange(prof.price_range)
            return (
              (min >= params.priceMin || max >= params.priceMin) &&
              (min <= params.priceMax || max <= params.priceMax)
            )
          })
        }

        // Ordenação final por relevância (se não há ordenação específica)
        if (params.sortBy === 'relevance') {
          results = results.sort((a, b) => {
            let scoreA = 0
            let scoreB = 0

            // Boost para verificados
            if (a.verified) scoreA += 10
            if (b.verified) scoreB += 10

            // Boost para com fotos
            if (a.photos?.length > 0) scoreA += 5
            if (b.photos?.length > 0) scoreB += 5

            // Boost para resposta rápida
            if (a.response_time === 'fast') scoreA += 3
            if (b.response_time === 'fast') scoreB += 3

            // Boost por rating (novo)
            if (a.rating > 0) scoreA += a.rating * 2
            if (b.rating > 0) scoreB += b.rating * 2

            // Boost por proximidade (se há localização)
            if (params.userLocation && a.distance && b.distance) {
              if (a.distance < 2) scoreA += 8
              if (b.distance < 2) scoreB += 8
              if (a.distance < 5) scoreA += 4
              if (b.distance < 5) scoreB += 4
            }

            return scoreB - scoreA // Maior score primeiro
          })
        }
      }

      professionals.value = results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar profissionais'
      console.error('Erro na busca avançada:', err)
    } finally {
      loading.value = false
    }
  }

  // Busca simples (compatibilidade)
  async function searchProfessionals(params: SearchParams = {}) {
    const advancedParams: AdvancedSearchParams = {
      query: params.query || '',
      categories: params.category ? [params.category] : [],
      specialties: [],
      priceMin: 0,
      priceMax: 1000,
      cities: params.city ? [params.city] : [],
      neighborhoods: [],
      hasPhotos: false,
      responseTime: [],
      acceptsUrgent: false,
      verified: false,
      sortBy: 'relevance',
      userLocation: userLocation.value || undefined,
    }

    return searchProfessionalsAdvanced(advancedParams)
  }

  async function getProfessional(id: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: apiError } = await supabase
        .from('professionals')
        .select(
          `
          *,
          professional_photos(
            id,
            photo_url,
            is_primary,
            order_index
          )
        `,
        )
        .eq('id', id)
        .eq('is_active', true) // ✅ APENAS PROFISSIONAIS ATIVOS
        .single()

      if (apiError) throw new Error(apiError.message)

      // Buscar reviews do profissional
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('professional_id', id)
        .eq('status', 'approved')

      // Calcular rating médio
      let rating = 0
      let reviewCount = 0

      if (reviewsData && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0)
        rating = totalRating / reviewsData.length
        reviewCount = reviewsData.length
      }

      // Processar profissional
      const professional = {
        ...data,
        photos: data.professional_photos || [],
        rating,
        review_count: reviewCount,
      }

      // Calcular distância se há localização do usuário
      if (userLocation.value && professional.latitude && professional.longitude) {
        const distance = calculateDistance(
          userLocation.value.latitude,
          userLocation.value.longitude,
          professional.latitude,
          professional.longitude,
        )
        professional.distance = distance
      }

      currentProfessional.value = professional
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar profissional'
      console.error('Erro ao buscar profissional:', err)
    } finally {
      loading.value = false
    }
  }

  // Função para obter contadores de filtros
  async function getFilterCounts() {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('category, city, neighborhood, verified, response_time')
        .eq('is_active', true) // ✅ APENAS PROFISSIONAIS ATIVOS

      if (error) throw error

      const counts = {
        categories: {} as Record<string, number>,
        cities: {} as Record<string, number>,
        neighborhoods: {} as Record<string, number>,
        verified: 0,
        fastResponse: 0,
      }

      data.forEach((prof) => {
        // Contar categorias
        if (prof.category) {
          counts.categories[prof.category] = (counts.categories[prof.category] || 0) + 1
        }

        // Contar cidades
        if (prof.city) {
          counts.cities[prof.city] = (counts.cities[prof.city] || 0) + 1
        }

        // Contar bairros
        if (prof.neighborhood) {
          counts.neighborhoods[prof.neighborhood] =
            (counts.neighborhoods[prof.neighborhood] || 0) + 1
        }

        // Contar verificados
        if (prof.verified) {
          counts.verified++
        }

        // Contar resposta rápida
        if (prof.response_time === 'fast') {
          counts.fastResponse++
        }
      })

      return counts
    } catch (err) {
      console.error('Erro ao obter contadores:', err)
      return null
    }
  }

  async function trackView(professionalId: string) {
    try {
      await supabase.from('profile_views').insert({
        professional_id: professionalId,
        viewer_ip: '127.0.0.1', // Em produção, pegar IP real
      })
    } catch (err) {
      console.error('Erro ao trackear visualização:', err)
    }
  }

  async function trackWhatsAppClick(professionalId: string) {
    try {
      await supabase.from('whatsapp_clicks').insert({ professional_id: professionalId })
    } catch (err) {
      console.error('Erro ao trackear clique WhatsApp:', err)
    }
  }

  // Função para salvar localização do usuário
  function setUserLocation(location: UserLocation) {
    userLocation.value = location
  }

  return {
    // State
    professionals,
    currentProfessional,
    loading,
    error,
    userLocation,

    // Getters
    totalProfessionals,

    // Actions
    searchProfessionals,
    searchProfessionalsAdvanced,
    getProfessional,
    getFilterCounts,
    trackView,
    trackWhatsAppClick,
    setUserLocation,
  }
})

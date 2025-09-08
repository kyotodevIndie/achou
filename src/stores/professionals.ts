import { supabase } from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Professional {
  id: string
  name: string
  email: string
  phone: string
  category: string
  description?: string
  address: string
  city: string
  price_range: string
  is_active: boolean
  photos?: Array<{
    id: string
    photo_url: string
    is_primary: boolean
  }>
}

export interface SearchParams {
  query?: string
  category?: string
  city?: string
}

export const useProfessionalsStore = defineStore('professionals', () => {
  // State
  const professionals = ref<Professional[]>([])
  const currentProfessional = ref<Professional | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalProfessionals = computed(() => professionals.value.length)

  // Actions
  async function searchProfessionals(params: SearchParams = {}) {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('professionals')
        .select(
          `
          *,
          professional_photos(*)
        `,
        )
        .eq('is_active', true)

      // Aplicar filtros
      if (params.query) {
        query = query.ilike('name', `%${params.query}%`)
      }

      if (params.category) {
        query = query.eq('category', params.category)
      }

      if (params.city) {
        query = query.eq('city', params.city)
      }

      const { data, error: apiError } = await query.order('created_at', { ascending: false })

      if (apiError) throw new Error(apiError.message)

      professionals.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar profissionais'
      console.error('Erro na busca:', err)
    } finally {
      loading.value = false
    }
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
          professional_photos(*)
        `,
        )
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (apiError) throw new Error(apiError.message)

      currentProfessional.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar profissional'
      console.error('Erro ao buscar profissional:', err)
    } finally {
      loading.value = false
    }
  }

  async function trackView(professionalId: string) {
    try {
      const { error } = await supabase
        .from('profile_views')
        .insert({ professional_id: professionalId })
    } catch (err) {
      console.error('Erro ao trackear visualização:', err)
    }
  }

  async function trackWhatsAppClick(professionalId: string) {
    try {
      const { error } = await supabase
        .from('whatsapp_clicks')
        .insert({ professional_id: professionalId })
    } catch (err) {
      console.error('Erro ao trackear clique WhatsApp:', err)
    }
  }

  return {
    // State
    professionals,
    currentProfessional,
    loading,
    error,

    // Getters
    totalProfessionals,

    // Actions
    searchProfessionals,
    getProfessional,
    trackView,
    trackWhatsAppClick,
  }
})

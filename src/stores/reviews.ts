// src/stores/reviews.ts - COM ATUALIZAÇÃO DE RATING
import { supabase } from '@/services/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Review {
  id: string
  professional_id: string
  user_name: string
  rating: number
  comment: string | null
  created_at: string
  status?: string
}

export interface CreateReviewData {
  professional_id: string
  user_name: string
  rating: number
  comment?: string
  email?: string
  captchaToken: string
}

export const useReviewsStore = defineStore('reviews', () => {
  const reviews = ref<Review[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Função para recalcular e atualizar rating do profissional
  async function updateProfessionalRating(professionalId: string) {
    try {
      // Buscar todas as reviews aprovadas do profissional
      const { data: approvedReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('professional_id', professionalId)
        .eq('status', 'approved')

      if (reviewsError) throw reviewsError

      let rating = 0
      let reviewCount = 0

      if (approvedReviews && approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
        rating = totalRating / approvedReviews.length
        reviewCount = approvedReviews.length
      }

      // Atualizar tabela professionals com rating e review_count
      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          rating: rating,
          review_count: reviewCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', professionalId)

      if (updateError) throw updateError
    } catch (err) {
      console.error('Erro ao atualizar rating do profissional:', err)
    }
  }

  // Buscar reviews de um profissional (apenas aprovadas para exibição)
  async function getReviews(professionalId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: apiError } = await supabase
        .from('reviews')
        .select('id, professional_id, user_name, rating, comment, created_at, status')
        .eq('professional_id', professionalId)
        .eq('status', 'approved') // Apenas reviews aprovadas
        .order('created_at', { ascending: false })

      if (apiError) throw new Error(apiError.message)

      reviews.value = data || []
      return reviews.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar avaliações'
      console.error('Erro ao buscar reviews:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Criar review via Netlify Function
  async function createReview(reviewData: CreateReviewData) {
    loading.value = true
    error.value = null

    try {
      // Chamar Netlify Function
      const response = await fetch('/.netlify/functions/create-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar avaliação')
      }

      // Adicionar a nova review à lista (se aprovada automaticamente)
      if (result.review && result.review.status === 'approved') {
        reviews.value.unshift(result.review)

        // Atualizar rating do profissional
        await updateProfessionalRating(reviewData.professional_id)
      }

      return result.review
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar avaliação'
      console.error('Erro ao criar review:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Calcular média de reviews (auxiliar)
  function getAverageRating(professionalReviews?: Review[]): number {
    const reviewsToUse = professionalReviews || reviews.value
    if (reviewsToUse.length === 0) return 0

    const sum = reviewsToUse.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviewsToUse.length
  }

  // Contar reviews (auxiliar)
  function getReviewCount(professionalReviews?: Review[]): number {
    const reviewsToUse = professionalReviews || reviews.value
    return reviewsToUse.length
  }

  return {
    reviews,
    loading,
    error,
    getReviews,
    createReview,
    updateProfessionalRating,
    getAverageRating,
    getReviewCount,
  }
})

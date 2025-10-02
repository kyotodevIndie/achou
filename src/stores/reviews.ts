// src/stores/reviews.ts - VERSÃO CORRIGIDA
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

  // Buscar reviews de um profissional
  async function getReviews(professionalId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: apiError } = await supabase
        .from('reviews')
        .select('id, professional_id, user_name, rating, comment, created_at')
        .eq('professional_id', professionalId)
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

  // ⭐ CRIAR REVIEW VIA NETLIFY FUNCTION (NÃO INSERIR DIRETO NO SUPABASE)
  async function createReview(reviewData: CreateReviewData) {
    loading.value = true
    error.value = null

    try {
      console.log('Enviando review para Netlify Function...', reviewData)

      // ⭐ CHAMAR NETLIFY FUNCTION
      const response = await fetch('/.netlify/functions/create-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      const result = await response.json()
      console.log('Resposta da função:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar avaliação')
      }

      // Adicionar a nova review à lista
      if (result.review) {
        reviews.value.unshift(result.review)
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

  // Calcular média de reviews
  function getAverageRating(professionalReviews?: Review[]): number {
    const reviewsToUse = professionalReviews || reviews.value
    if (reviewsToUse.length === 0) return 0

    const sum = reviewsToUse.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviewsToUse.length
  }

  // Contar reviews
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
    getAverageRating,
    getReviewCount,
  }
})

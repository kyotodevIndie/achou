<!-- src/components/reviews/ReviewsList.vue -->
<template>
  <div class="space-y-6">
    <!-- Header com Resumo -->
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Avaliações</h3>
        <div v-if="reviews.length > 0" class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <ReviewStars :model-value="averageRating" readonly />
            <span class="font-semibold text-gray-900">{{ averageRating.toFixed(1) }}</span>
          </div>
          <span class="text-gray-600">{{ reviews.length }} avaliações</span>
        </div>
        <p v-else class="text-gray-600">Ainda não há avaliações</p>
      </div>

      <button
        @click="$emit('openReviewModal')"
        class="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
      >
        <Star class="w-4 h-4" />
        Avaliar
      </button>
    </div>

    <!-- Distribuição de Estrelas -->
    <div v-if="reviews.length > 0" class="space-y-2 p-4 bg-gray-50 rounded-lg">
      <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-3">
        <span class="text-sm font-medium text-gray-700 w-12">{{ rating }} ⭐</span>
        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-yellow-400 transition-all"
            :style="{ width: `${getRatingPercentage(rating)}%` }"
          ></div>
        </div>
        <span class="text-sm text-gray-600 w-8 text-right">
          {{ getRatingCount(rating) }}
        </span>
      </div>
    </div>

    <!-- Lista de Reviews -->
    <div v-if="reviews.length > 0" class="space-y-4">
      <div
        v-for="review in displayedReviews"
        :key="review.id"
        class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User class="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ review.user_name }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(review.created_at) }}</p>
            </div>
          </div>
          <ReviewStars :model-value="review.rating" readonly />
        </div>

        <!-- Comentário -->
        <p v-if="review.comment" class="text-gray-700 leading-relaxed">
          {{ review.comment }}
        </p>
      </div>

      <!-- Botão Ver Mais -->
      <button
        v-if="reviews.length > displayLimit && displayLimit < reviews.length"
        @click="displayLimit += 5"
        class="w-full py-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
      >
        Ver mais avaliações ({{ reviews.length - displayLimit }} restantes)
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
      <Star class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h4 class="text-lg font-semibold text-gray-900 mb-2">Seja o primeiro a avaliar</h4>
      <p class="text-gray-600 mb-4">Compartilhe sua experiência com este profissional</p>
      <button
        @click="$emit('openReviewModal')"
        class="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
      >
        Deixar avaliação
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, User } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import ReviewStars from './ReviewStars.vue'

interface Review {
  id: string
  professional_id: string
  user_name: string
  rating: number
  comment: string | null
  created_at: string
}

const props = defineProps<{
  reviews: Review[]
}>()

defineEmits<{
  openReviewModal: []
}>()

const displayLimit = ref(5)

const displayedReviews = computed(() => {
  return props.reviews.slice(0, displayLimit.value)
})

const averageRating = computed(() => {
  if (props.reviews.length === 0) return 0
  const sum = props.reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / props.reviews.length
})

function getRatingCount(rating: number): number {
  return props.reviews.filter((r) => r.rating === rating).length
}

function getRatingPercentage(rating: number): number {
  if (props.reviews.length === 0) return 0
  return (getRatingCount(rating) / props.reviews.length) * 100
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`

  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

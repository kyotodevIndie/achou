<template>
  <div class="group cursor-pointer" :style="animationStyle" @click="handleClick">
    <div
      class="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 group-hover:border-rose-300 group-hover:-translate-y-3"
    >
      <!-- Header com gradiente -->
      <div
        class="relative h-40 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 overflow-hidden"
      >
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-600"></div>
        </div>
      </div>

      <!-- Avatar -->
      <div class="relative px-6 -mt-16 mb-4">
        <div
          class="w-32 h-32 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-white group-hover:scale-105 transition-transform"
        >
          <img
            v-if="primaryPhoto"
            :src="primaryPhoto"
            :alt="professional.name"
            class="w-full h-full object-cover rounded-2xl"
          />
          <span v-else>{{ initials }}</span>
        </div>
      </div>

      <!-- Conteúdo -->
      <div class="px-6 pb-6">
        <h3 class="text-xl font-bold text-gray-900 mb-1">{{ professional.name }}</h3>
        <p class="text-rose-600 font-medium mb-4">{{ professional.category }}</p>

        <!-- Rating -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
            <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
            <span class="font-bold text-gray-900">{{ rating }}</span>
          </div>
          <span class="text-sm text-gray-500">({{ reviewCount }} avaliações)</span>
        </div>

        <!-- Complexo/Local -->
        <div
          v-if="professional.complex_name"
          class="flex items-center gap-2 text-sm text-gray-600 mb-6"
        >
          <Building2 class="w-4 h-4 text-gray-400" />
          <span>{{ professional.complex_name }}</span>
        </div>
        <div
          v-else-if="professional.city"
          class="flex items-center gap-2 text-sm text-gray-600 mb-6"
        >
          <MapPin class="w-4 h-4 text-gray-400" />
          <span>{{ professional.city }}</span>
        </div>

        <!-- Botão de ação -->
        <button
          class="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
        >
          Ver Perfil
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Building2, MapPin, Star } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Professional {
  id: string
  name: string
  category: string
  complex_name?: string
  city?: string
  rating?: number
  review_count?: number
  photos?: Array<{
    photo_url: string
    is_primary: boolean
  }>
}

interface Props {
  professional: Professional
  index?: number
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  animated: true,
})

const router = useRouter()

// Computed
const primaryPhoto = computed(() => {
  if (!props.professional.photos || props.professional.photos.length === 0) return null
  const primary = props.professional.photos.find((p) => p.is_primary)
  return primary?.photo_url || props.professional.photos[0]?.photo_url || null
})

const initials = computed(() => {
  return props.professional.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const rating = computed(() => {
  return props.professional.rating?.toFixed(1) || 'N/A'
})

const reviewCount = computed(() => {
  return props.professional.review_count || 0
})

const animationStyle = computed(() => {
  if (!props.animated) return {}
  return {
    animation: `slideUp 0.6s ease-out ${props.index * 0.15}s both`,
  }
})

// Methods
function handleClick() {
  router.push({ name: 'ProfessionalProfile', params: { id: props.professional.id } })
}
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

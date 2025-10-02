<!-- src/components/professional/ProfessionalCard.vue - Com campo complexo -->
<template>
  <div
    class="group cursor-pointer transition-transform hover:scale-[1.02] duration-300"
    @click="handleCardClick"
  >
    <!-- Foto Principal -->
    <div class="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
      <img
        v-if="primaryPhoto"
        :src="primaryPhoto.photo_url"
        :alt="`Sala de ${professional.name}`"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
        <div class="text-center text-gray-400">
          <div class="text-4xl mb-2">📷</div>
          <p class="text-sm">Sem foto</p>
        </div>
      </div>

      <!-- Badge da categoria -->
      <div class="absolute top-3 left-3">
        <span
          class="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm"
        >
          {{ professional.category }}
        </span>
      </div>

      <!-- Botão de favorito (futuro) -->
      <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart class="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="space-y-2">
      <!-- Local com Complexo -->
      <div class="text-gray-500 text-sm space-y-1">
        <p v-if="professional.complex_name" class="font-medium flex items-center gap-1">
          🏢 {{ professional.complex_name }}
        </p>
        <p class="flex items-center gap-1">📍 {{ professional.city }}, CE</p>
      </div>

      <!-- Nome -->
      <h3 class="font-semibold text-gray-900 text-lg leading-tight line-clamp-1">
        {{ professional.name }}
      </h3>

      <!-- Descrição -->
      <p v-if="professional.description" class="text-gray-600 text-sm line-clamp-2 leading-relaxed">
        {{ professional.description }}
      </p>

      <!-- Preço -->
      <div class="flex items-center justify-between pt-2">
        <div class="flex items-baseline gap-1">
          <span class="font-semibold text-gray-900">R$ {{ professional.price_range }}</span>
          <span class="text-gray-500 text-sm">por consulta</span>
        </div>

        <!-- Rating (futuro) -->
        <div class="flex items-center gap-1 text-sm">
          <template v-if="professional.average_rating && professional.review_count">
            <Star class="w-4 h-4 text-yellow-400 fill-current" />
            <span class="text-gray-900 font-medium">{{
              professional.average_rating.toFixed(1)
            }}</span>
            <span class="text-gray-600">({{ professional.review_count }})</span>
          </template>
          <template v-else>
            <Star class="w-4 h-4 text-gray-400" />
            <span class="text-gray-600">Sem avaliações</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Professional } from '@/types'
import { Heart, Star } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  professional: Professional
}>()

const emit = defineEmits<{
  viewProfile: [id: string]
}>()

// Buscar foto principal
const primaryPhoto = computed(() => {
  if (!props.professional.photos?.length) return null

  // Priorizar foto marcada como primary
  const primary = props.professional.photos.find((photo) => photo.is_primary)
  if (primary) return primary

  // Senão, usar a primeira foto
  return props.professional.photos[0]
})

// Handlers para os eventos
function handleCardClick() {
  emit('viewProfile', props.professional.id)
}

// Função para formatar distância
function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m de você`
  } else {
    return `${distance.toFixed(1)}km de você`
  }
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

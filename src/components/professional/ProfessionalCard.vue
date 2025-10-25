<template>
  <!-- VIEW GRID -->
  <div
    v-if="viewMode === 'grid'"
    class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col h-full"
    @click="$emit('view-profile', professional.id)"
  >
    <div class="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
      <img
        v-if="primaryPhoto"
        :src="primaryPhoto.photo_url"
        :alt="`Sala de ${professional.name}`"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Camera class="w-12 h-12 text-gray-400" />
      </div>

      <div v-if="professional.verified" class="absolute top-3 right-3">
        <div
          class="flex items-center gap-1 text-xs text-white bg-green-500 px-2 py-1 rounded-full shadow-lg"
        >
          <CheckCircle class="w-3 h-3" />
          <span>Verificado</span>
        </div>
      </div>
    </div>

    <div class="p-5 flex flex-col flex-1">
      <span
        class="bg-rose-50 text-rose-700 text-xs font-medium px-2.5 py-1 rounded-full w-fit mb-3"
      >
        {{ professional.category }}
      </span>

      <h3
        class="text-lg font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors line-clamp-1"
      >
        {{ professional.name }}
      </h3>

      <div class="flex items-center gap-2 mb-3 min-h-[20px]">
        <div v-if="professional.rating && professional.rating > 0" class="flex items-center gap-1">
          <div class="flex">
            <Star
              v-for="star in 5"
              :key="star"
              class="w-4 h-4"
              :class="
                star <= Math.round(professional.rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              "
            />
          </div>
          <span class="text-sm font-medium text-gray-900">{{
            professional.rating.toFixed(1)
          }}</span>
          <span class="text-sm text-gray-500">({{ professional.review_count || 0 }})</span>
        </div>
        <div v-else class="flex items-center gap-1">
          <div class="flex">
            <Star v-for="star in 5" :key="star" class="w-4 h-4 fill-gray-200 text-gray-200" />
          </div>
          <span class="text-sm text-gray-400">Sem avaliações</span>
        </div>
      </div>

      <div class="space-y-1.5 mb-3 min-h-[44px]">
        <div v-if="professional.complex_name" class="flex items-start gap-2 text-sm text-gray-600">
          <Building2 class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span class="line-clamp-1">{{ professional.complex_name }}</span>
        </div>
        <div class="flex items-start gap-2 text-sm text-gray-600">
          <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div class="flex-1">
            <span class="line-clamp-1">{{ professional.city }}, CE</span>
            <span v-if="professional.distance" class="text-blue-600 font-medium block">
              {{ formatDistance(professional.distance) }}
            </span>
          </div>
        </div>
      </div>

      <p class="text-sm text-gray-600 line-clamp-2 mb-4 flex-1 min-h-[40px]">
        {{ professional.description || 'Profissional disponível para atendimento.' }}
      </p>

      <div class="pt-4 border-t border-gray-100 mt-auto">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-bold text-gray-900">
              R$ {{ professional.price_range?.split('-')[0] || '100' }}
            </span>
            <span class="text-xs text-gray-500">/ atendimento</span>
          </div>
        </div>

        <Button
          @click.stop="handleWhatsAppClick"
          class="w-full bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <MessageCircle class="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      </div>
    </div>
  </div>

  <!-- VIEW LIST -->
  <div
    v-else
    class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
    @click="$emit('view-profile', professional.id)"
  >
    <div class="flex gap-6">
      <div class="flex-shrink-0">
        <div
          class="relative w-40 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden"
        >
          <img
            v-if="primaryPhoto"
            :src="primaryPhoto.photo_url"
            :alt="`Sala de ${professional.name}`"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Camera class="w-10 h-10 text-gray-400" />
          </div>

          <div v-if="professional.verified" class="absolute top-2 right-2">
            <div
              class="flex items-center gap-1 text-xs text-white bg-green-500 px-2 py-1 rounded-full shadow-lg"
            >
              <CheckCircle class="w-3 h-3" />
              <span>Verificado</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 min-w-0 flex flex-col">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <span
              class="bg-rose-50 text-rose-700 text-sm font-medium px-3 py-1 rounded-full inline-block mb-2"
            >
              {{ professional.category }}
            </span>

            <h3
              class="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors"
            >
              {{ professional.name }}
            </h3>

            <div class="flex items-center gap-2 mb-3">
              <div
                v-if="professional.rating && professional.rating > 0"
                class="flex items-center gap-1.5"
              >
                <div class="flex">
                  <Star
                    v-for="star in 5"
                    :key="star"
                    class="w-4 h-4"
                    :class="
                      star <= Math.round(professional.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    "
                  />
                </div>
                <span class="text-sm font-medium text-gray-900">{{
                  professional.rating.toFixed(1)
                }}</span>
                <span class="text-sm text-gray-500"
                  >({{ professional.review_count || 0 }} avaliações)</span
                >
              </div>
              <span v-else class="text-sm text-gray-400">Sem avaliações ainda</span>
            </div>

            <div class="text-gray-600 text-sm space-y-1.5 mb-3">
              <div v-if="professional.complex_name" class="flex items-center gap-2">
                <Building2 class="w-4 h-4 flex-shrink-0" />
                <span class="font-medium">{{ professional.complex_name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4 flex-shrink-0" />
                <span>{{ professional.city }}, CE</span>
                <span v-if="professional.distance" class="text-blue-600 font-medium">
                  · {{ formatDistance(professional.distance) }}
                </span>
              </div>
            </div>

            <p class="text-gray-600 text-sm line-clamp-2">
              {{ professional.description || 'Profissional disponível para atendimento.' }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-bold text-gray-900">
              R$ {{ professional.price_range?.split('-')[0] || '100' }}
            </span>
            <span class="text-gray-500 text-sm">por consulta</span>
          </div>

          <Button
            @click.stop="handleWhatsAppClick"
            class="bg-green-600 hover:bg-green-700 shadow-sm"
            size="sm"
          >
            <MessageCircle class="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { Professional, ProfessionalPhoto } from '@/types'
import { Building2, Camera, CheckCircle, MapPin, MessageCircle, Star } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  professional: Professional
  viewMode?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid',
})

const emit = defineEmits<{
  (e: 'view-profile', id: string): void
  (e: 'whatsapp-click', professional: Professional): void
}>()

const primaryPhoto = computed<ProfessionalPhoto | null>(() => {
  if (!props.professional.photos?.length) return null
  return props.professional.photos.find((p) => p.is_primary) || props.professional.photos[0]
})

function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

function handleWhatsAppClick() {
  emit('whatsapp-click', props.professional)
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

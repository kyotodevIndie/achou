<!-- src/components/professional/ProfessionalCard.vue -->
<template>
  <Card
    class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    @click="handleCardClick"
  >
    <!-- Foto Principal -->
    <div class="aspect-video bg-gray-200 relative">
      <img
        v-if="primaryPhoto"
        :src="primaryPhoto.photo_url"
        :alt="`Sala de ${professional.name}`"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">
        📷 Sem foto
      </div>

      <!-- Badge da categoria -->
      <Badge variant="secondary" class="absolute top-2 left-2">
        {{ professional.category }}
      </Badge>
    </div>

    <!-- Conteúdo -->
    <div class="p-4">
      <h3 class="font-semibold text-lg mb-1 line-clamp-1">{{ professional.name }}</h3>
      <p class="text-sm text-muted-foreground mb-2 line-clamp-1">{{ professional.city }}</p>

      <!-- Descrição se houver -->
      <p v-if="professional.description" class="text-sm text-muted-foreground mb-3 line-clamp-2">
        {{ professional.description }}
      </p>

      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-primary">R$ {{ professional.price_range }}</span>
        <Button size="sm" @click.stop="handleButtonClick"> Ver Perfil </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Professional } from '@/types'
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

function handleButtonClick() {
  emit('viewProfile', props.professional.id)
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

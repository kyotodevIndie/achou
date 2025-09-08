<!-- src/pages/ProfessionalProfile.vue -->
<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="text-center py-16">
      <p class="text-muted-foreground">Carregando perfil...</p>
    </div>

    <div v-else-if="!professional" class="text-center py-16">
      <h1 class="text-2xl font-bold mb-4">Profissional não encontrado</h1>
      <Button @click="$router.push('/buscar')"> Voltar para busca </Button>
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <!-- Header do perfil -->
      <div class="mb-8">
        <Button variant="ghost" @click="$router.back()" class="mb-4"> ← Voltar </Button>

        <div class="flex items-start gap-6 mb-6">
          <div class="flex-1">
            <Badge variant="secondary" class="mb-2">
              {{ professional.category }}
            </Badge>
            <h1 class="text-4xl font-bold mb-2">{{ professional.name }}</h1>
            <p class="text-muted-foreground text-lg mb-4">{{ professional.address }}</p>
            <p class="text-2xl font-bold text-primary">R$ {{ professional.price_range }}</p>
          </div>
        </div>
      </div>

      <!-- Galeria de fotos -->
      <div v-if="professional.photos?.length" class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Fotos da Sala</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <img
            v-for="photo in professional.photos"
            :key="photo.id"
            :src="photo.photo_url"
            :alt="`Foto da sala de ${professional.name}`"
            class="aspect-video object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            @click="openPhotoModal(photo.photo_url)"
          />
        </div>
      </div>

      <!-- Descrição -->
      <div v-if="professional.description" class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Sobre o Profissional</h2>
        <p class="text-lg text-muted-foreground leading-relaxed">{{ professional.description }}</p>
      </div>

      <!-- Informações de contato -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 class="text-xl font-bold mb-4">Entre em contato</h3>
        <Button
          size="lg"
          class="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
          @click="contactWhatsApp"
        >
          💬 Falar no WhatsApp
        </Button>
        <p class="text-sm text-muted-foreground mt-2">
          Clique para conversar diretamente com {{ professional.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProfessionalsStore } from '@/stores/professionals'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const professionalStore = useProfessionalsStore()
const { currentProfessional: professional, loading } = storeToRefs(professionalStore)

function contactWhatsApp() {
  if (professional.value?.phone) {
    // Trackear clique no WhatsApp
    professionalStore.trackWhatsAppClick(professional.value.id)

    // Abrir WhatsApp
    const message = `Olá ${professional.value.name}, encontrei seu perfil no Achou e gostaria de agendar uma consulta.`
    const phone = professional.value.phone.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }
}

function openPhotoModal(photoUrl: string) {
  // Implementar modal de foto depois
  window.open(photoUrl, '_blank')
}

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await professionalStore.getProfessional(id)
    // Trackear visualização
    if (professional.value) {
      professionalStore.trackView(professional.value.id)
    }
  }
})
</script>

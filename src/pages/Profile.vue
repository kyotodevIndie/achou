<!-- src/pages/ProfessionalProfile.vue -->
<template>
  <div class="min-h-screen bg-white">
    <div v-if="loading" class="container mx-auto p-4">
      <div class="text-center py-16">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Carregando perfil...</p>
      </div>
    </div>

    <div v-else-if="!professional" class="container mx-auto p-4">
      <div class="text-center py-16">
        <h1 class="text-2xl font-bold mb-4">Profissional não encontrado</h1>
        <Button @click="$router.push('/buscar')" class="bg-rose-500 hover:bg-rose-600">
          Voltar para busca
        </Button>
      </div>
    </div>

    <div v-else>
      <!-- Header com Breadcrumb -->
      <div class="border-b border-gray-200 bg-white sticky top-16 z-40">
        <div class="container mx-auto px-4 py-4">
          <Button variant="ghost" @click="$router.back()" class="mb-2"> ← Voltar </Button>
          <h1 class="text-2xl font-bold text-gray-900">{{ professional.name }}</h1>
        </div>
      </div>

      <!-- Galeria de Fotos -->
      <section v-if="professional.photos?.length" class="container mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 max-w-6xl mx-auto">
          <!-- Foto Principal -->
          <div class="lg:row-span-2">
            <img
              :src="mainPhoto.photo_url"
              :alt="`Sala de ${professional.name}`"
              class="w-full h-96 lg:h-full object-cover rounded-xl cursor-pointer hover:brightness-105 transition-all"
              @click="openGallery(0)"
            />
          </div>

          <!-- Fotos Secundárias -->
          <div class="grid grid-cols-2 gap-2">
            <img
              v-for="(photo, index) in secondaryPhotos.slice(0, 4)"
              :key="photo.id"
              :src="photo.photo_url"
              :alt="`Foto ${index + 2} da sala`"
              class="w-full h-48 object-cover rounded-xl cursor-pointer hover:brightness-105 transition-all"
              :class="{ relative: index === 3 && secondaryPhotos.length > 4 }"
              @click="openGallery(index + 1)"
            />
            <!-- Overlay "Ver mais fotos" -->
            <div
              v-if="index === 3 && secondaryPhotos.length > 4"
              class="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center cursor-pointer"
              @click="openGallery(4)"
            >
              <span class="text-white font-medium">+{{ secondaryPhotos.length - 4 }} fotos</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Conteúdo Principal -->
      <div class="container mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- Coluna Principal -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Informações Básicas -->
            <section>
              <div class="flex items-start justify-between mb-4">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span
                      class="bg-rose-100 text-rose-800 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {{ professional.category }}
                    </span>
                    <div class="flex items-center gap-1 text-sm text-gray-600">
                      <Star class="w-4 h-4 text-yellow-400 fill-current" />
                      <span>Novo no Achou</span>
                    </div>
                  </div>
                  <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ professional.name }}</h2>
                  <div class="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin class="w-4 h-4" />
                    <span>{{ professional.address }}, {{ professional.city }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Descrição -->
            <section v-if="professional.description">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Sobre o profissional</h3>
              <p class="text-gray-700 leading-relaxed">{{ professional.description }}</p>
            </section>

            <!-- Serviços/Especialidades -->
            <section v-if="professional.specialty">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Especialidades</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="specialty in professional.specialty.split(',')"
                  :key="specialty.trim()"
                  class="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                >
                  {{ specialty.trim() }}
                </span>
              </div>
            </section>

            <!-- Localização -->
            <section>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Localização</h3>
              <div class="bg-gray-100 rounded-xl p-6">
                <div class="flex items-center gap-2 mb-2">
                  <MapPin class="w-5 h-5 text-gray-600" />
                  <span class="font-medium">{{ professional.address }}</span>
                </div>
                <p class="text-gray-600">{{ professional.city }}, Ceará</p>
                <!-- Aqui poderia ter um mapa no futuro -->
                <div class="mt-4 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span class="text-gray-500">Mapa em breve</span>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar - Card de Reserva -->
          <div class="lg:col-span-1">
            <div class="sticky top-32">
              <div class="border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div class="mb-6">
                  <div class="flex items-baseline gap-2 mb-2">
                    <span class="text-2xl font-bold">R$ {{ professional.price_range }}</span>
                    <span class="text-gray-600">por consulta</span>
                  </div>
                  <div class="flex items-center gap-1 text-sm text-gray-600">
                    <Star class="w-4 h-4 text-yellow-400 fill-current" />
                    <span>Novo • 0 avaliações</span>
                  </div>
                </div>

                <!-- Informações de Contato -->
                <div class="space-y-4 mb-6">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <Phone class="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p class="font-medium">Contato direto</p>
                      <p class="text-sm text-gray-600">WhatsApp disponível</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                    >
                      <Clock class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p class="font-medium">Resposta rápida</p>
                      <p class="text-sm text-gray-600">Normalmente em 1 hora</p>
                    </div>
                  </div>
                </div>

                <!-- Botão Principal -->
                <Button
                  @click="contactWhatsApp"
                  class="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-4 mb-4"
                >
                  <MessageCircle class="w-5 h-5 mr-2" />
                  Falar no WhatsApp
                </Button>

                <p class="text-xs text-gray-500 text-center">
                  Ao clicar, você será redirecionado para o WhatsApp do profissional
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Galeria (futuro) -->
    <div
      v-if="showGallery"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      @click="closeGallery"
    >
      <div class="max-w-4xl max-h-full">
        <img
          :src="professional.photos[currentPhotoIndex]?.photo_url"
          :alt="`Foto ${currentPhotoIndex + 1}`"
          class="max-w-full max-h-full object-contain"
        />
        <Button
          @click="closeGallery"
          variant="outline"
          class="absolute top-4 right-4 bg-white/10 border-white/20 text-white"
        >
          <X class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useProfessionalsStore } from '@/stores/professionals'
import { Clock, MapPin, MessageCircle, Phone, Star, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const professionalStore = useProfessionalsStore()
const { currentProfessional: professional, loading } = storeToRefs(professionalStore)

const showGallery = ref(false)
const currentPhotoIndex = ref(0)

// Computeds para organizar fotos
const mainPhoto = computed(() => {
  if (!professional.value?.photos?.length) return null
  return professional.value.photos.find((p) => p.is_primary) || professional.value.photos[0]
})

const secondaryPhotos = computed(() => {
  if (!professional.value?.photos?.length) return []
  return professional.value.photos.filter((p) => p.id !== mainPhoto.value?.id)
})

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

function openGallery(index: number) {
  currentPhotoIndex.value = index
  showGallery.value = true
}

function closeGallery() {
  showGallery.value = false
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

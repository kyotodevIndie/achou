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
      <div class="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div class="container mx-auto px-4 py-4">
          <Button variant="ghost" @click="$router.back()" class="mb-2"> ← Voltar </Button>
          <h1 class="text-2xl font-bold text-gray-900">{{ professional.name }}</h1>
        </div>
      </div>

      <section
        v-if="professional.photos && professional.photos.length > 0"
        class="container mx-auto px-4 py-4"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 max-w-6xl mx-auto">
          <div v-if="mainPhoto" class="lg:row-span-2">
            <img
              :src="mainPhoto.photo_url"
              :alt="`Sala de ${professional.name}`"
              class="w-full h-64 lg:h-80 object-cover rounded-xl cursor-pointer hover:brightness-105 transition-all"
              @click="openGallery(0)"
              loading="lazy"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="(photo, index) in secondaryPhotos.slice(0, 4)"
              :key="photo.id"
              class="relative"
            >
              <img
                :src="photo.photo_url"
                :alt="`Foto ${index + 2} da sala`"
                class="w-full h-32 lg:h-40 object-cover rounded-xl cursor-pointer hover:brightness-105 transition-all"
                @click="openGallery(index + 1)"
                loading="lazy"
              />
              <div
                v-if="index === 3 && secondaryPhotos.length > 4"
                class="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center cursor-pointer"
                @click="openGallery(4)"
              >
                <span class="text-white font-medium">+{{ secondaryPhotos.length - 4 }} fotos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="container mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div class="lg:col-span-2 space-y-8">
            <section>
              <div class="flex items-start justify-between mb-4">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span
                      class="bg-rose-100 text-rose-800 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {{ professional.category }}
                    </span>
                    <div
                      v-if="professional.verified"
                      class="flex items-center gap-1 text-sm text-green-600"
                    >
                      <CheckCircle class="w-4 h-4" />
                      <span>Verificado</span>
                    </div>
                  </div>
                  <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ professional.name }}</h2>
                  <div class="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin class="w-4 h-4" />
                    <span>{{ professional.address }}, {{ professional.city }}</span>
                  </div>
                  <div
                    v-if="professional.complex_name"
                    class="flex items-center gap-2 text-gray-600"
                  >
                    <Building2 class="w-4 h-4" />
                    <span>{{ professional.complex_name }}</span>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="professional.description">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Sobre o profissional</h3>
              <p class="text-gray-700 leading-relaxed">{{ professional.description }}</p>
            </section>

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

            <section>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Informações</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                  <Clock class="w-5 h-5 text-gray-600" />
                  <div>
                    <p class="font-medium text-sm">Tempo de resposta</p>
                    <p class="text-gray-600 text-sm">
                      {{ getResponseTimeText(professional.response_time) }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="professional.accepts_urgent"
                  class="flex items-center gap-3 bg-amber-50 p-4 rounded-lg"
                >
                  <Zap class="w-5 h-5 text-amber-600" />
                  <div>
                    <p class="font-medium text-sm">Urgência</p>
                    <p class="text-amber-700 text-sm">Aceita atendimentos urgentes</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Localização</h3>
              <StaticMap
                v-if="professional.latitude && professional.longitude"
                :latitude="professional.latitude"
                :longitude="professional.longitude"
                :address="professional.address"
                :complexName="professional.complex_name"
                :professionalName="professional.name"
                :zoom="16"
              />
              <div v-else class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div class="flex items-start gap-3">
                  <MapPin class="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p class="font-medium mb-1">{{ professional.address }}</p>
                    <p class="text-gray-600">{{ professional.city }}, Ceará</p>
                    <p v-if="professional.complex_name" class="text-gray-600 text-sm mt-2">
                      🏢 {{ professional.complex_name }}
                    </p>
                  </div>
                </div>
                <a
                  :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(professional.address + ', ' + professional.city)}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 mt-4 text-rose-600 hover:text-rose-700 font-medium text-sm"
                >
                  <Navigation class="w-4 h-4" />
                  Ver no Google Maps
                </a>
              </div>
            </section>

            <section>
              <ReviewsList :reviews="reviews" @open-review-modal="openReviewModal" />
            </section>
          </div>

          <div class="lg:col-span-1">
            <div class="sticky top-24">
              <div class="border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div class="mb-6">
                  <div class="flex items-baseline gap-2 mb-2">
                    <span class="text-2xl font-bold">R$ {{ professional.price_range }}</span>
                    <span class="text-gray-600">por consulta</span>
                  </div>
                </div>

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
                      <p class="font-medium">
                        {{ getResponseTimeText(professional.response_time) }}
                      </p>
                      <p class="text-sm text-gray-600">Tempo de resposta</p>
                    </div>
                  </div>
                </div>

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

    <div
      v-if="showGallery && professional && professional.photos"
      class="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      @click="closeGallery"
    >
      <Button
        @click="closeGallery"
        variant="outline"
        class="absolute top-4 right-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <X class="w-5 h-5" />
      </Button>

      <div class="max-w-5xl max-h-full relative" @click.stop>
        <img
          v-if="professional.photos[currentPhotoIndex]"
          :src="professional.photos[currentPhotoIndex].photo_url"
          :alt="`Foto ${currentPhotoIndex + 1}`"
          class="max-w-full max-h-[85vh] object-contain rounded-lg"
        />

        <div v-if="professional.photos.length > 1" class="flex items-center justify-between mt-4">
          <Button
            @click.stop="previousPhoto"
            :disabled="currentPhotoIndex === 0"
            variant="outline"
            class="bg-white/10 border-white/20 text-white"
          >
            ← Anterior
          </Button>

          <span class="text-white">
            {{ currentPhotoIndex + 1 }} / {{ professional.photos.length }}
          </span>

          <Button
            @click.stop="nextPhoto"
            :disabled="currentPhotoIndex === professional.photos.length - 1"
            variant="outline"
            class="bg-white/10 border-white/20 text-white"
          >
            Próxima →
          </Button>
        </div>
      </div>
    </div>

    <ReviewModal
      v-if="professional"
      :is-open="showReviewModal"
      :professional-id="professional.id"
      :professional-name="professional.name"
      :category="professional.category"
      @close="showReviewModal = false"
      @submit="handleReviewSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import StaticMap from '@/components/maps/StaticMap.vue'
import ReviewModal from '@/components/reviews/ReviewModal.vue'
import ReviewsList from '@/components/reviews/ReviewsList.vue'
import { Button } from '@/components/ui/button'
import { useProfessionalsStore } from '@/stores/professionals'
import { useReviewsStore } from '@/stores/reviews'
import type { ProfessionalPhoto } from '@/types'
import {
  Building2,
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  X,
  Zap,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const professionalStore = useProfessionalsStore()
const reviewsStore = useReviewsStore()
const { currentProfessional: professional, loading } = storeToRefs(professionalStore)
const { reviews } = storeToRefs(reviewsStore)

const showGallery = ref(false)
const currentPhotoIndex = ref(0)
const showReviewModal = ref(false)

const mainPhoto = computed<ProfessionalPhoto | null>(() => {
  if (!professional.value?.photos?.length) return null
  return professional.value.photos.find((p) => p.is_primary) || professional.value.photos[0]
})

const secondaryPhotos = computed<ProfessionalPhoto[]>(() => {
  if (!professional.value?.photos?.length || !mainPhoto.value) return []
  return professional.value.photos.filter((p) => p.id !== mainPhoto.value?.id)
})

function getResponseTimeText(time: string | undefined): string {
  if (!time) return 'Tempo de resposta não definido'

  const times: Record<string, string> = {
    fast: 'Resposta em até 2h',
    medium: 'Resposta em até 24h',
    slow: 'Resposta em até 48h',
  }
  return times[time] || 'Tempo de resposta não definido'
}

function contactWhatsApp() {
  if (!professional.value?.phone) return

  professionalStore.trackWhatsAppClick(professional.value.id)
  const message = `Olá ${professional.value.name}, encontrei seu perfil no Achou e gostaria de agendar uma consulta.`
  const phone = professional.value.phone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}

function openGallery(index: number) {
  currentPhotoIndex.value = index
  showGallery.value = true
}

function closeGallery() {
  showGallery.value = false
}

function nextPhoto() {
  if (!professional.value?.photos) return
  if (currentPhotoIndex.value < professional.value.photos.length - 1) {
    currentPhotoIndex.value++
  }
}

function previousPhoto() {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--
  }
}

function openReviewModal() {
  showReviewModal.value = true
}

async function handleReviewSubmit(reviewData: {
  rating: number
  userName: string
  email: string
  comment: string
  captchaToken: string
}) {
  if (!professional.value) return

  try {
    await reviewsStore.createReview({
      professional_id: professional.value.id,
      user_name: reviewData.userName,
      email: reviewData.email,
      rating: reviewData.rating,
      comment: reviewData.comment,
      captchaToken: reviewData.captchaToken,
    })

    showReviewModal.value = false
    alert('✅ Avaliação enviada com sucesso!')
  } catch (err: any) {
    const errorMsg = err?.message || 'Erro ao enviar avaliação. Tente novamente.'
    alert('❌ ' + errorMsg)
  }
}

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await professionalStore.getProfessional(id)

    await reviewsStore.getReviews(id)

    if (professional.value) {
      professionalStore.trackView(professional.value.id)
    }
  }
})
</script>

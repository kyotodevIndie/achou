<!-- src/pages/Search.vue - Versão simplificada -->
<template>
  <div class="container mx-auto p-4">
    <!-- Header de Busca Simples -->
    <div
      class="bg-white dark:bg-gray-900 sticky top-16 z-40 py-4 border-b border-gray-200 dark:border-gray-700 mb-6"
    >
      <div class="flex gap-4 flex-wrap items-center">
        <Input
          v-model="searchQuery"
          placeholder="Buscar por nome, categoria, complexo..."
          class="flex-1 min-w-64 theme-input"
          @input="debouncedSearch"
        />

        <Select v-model="selectedCategory" @update:model-value="handleSearch">
          <SelectTrigger class="w-52 theme-input">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent class="theme-card">
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="dentista">🦷 Dentista</SelectItem>
            <SelectItem value="medico">👨‍⚕️ Médico</SelectItem>
            <SelectItem value="psicologo">🧠 Psicólogo</SelectItem>
            <SelectItem value="nutricionista">🥗 Nutricionista</SelectItem>
            <SelectItem value="advogado">⚖️ Advogado</SelectItem>
            <SelectItem value="contador">💼 Contador</SelectItem>
            <SelectItem value="arquiteto">🏗️ Arquiteto</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedCity" @update:model-value="handleSearch">
          <SelectTrigger class="w-48 theme-input">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent class="theme-card">
            <SelectItem value="all">Todas as cidades</SelectItem>
            <SelectItem value="Fortaleza">Fortaleza</SelectItem>
            <SelectItem value="Caucaia">Caucaia</SelectItem>
            <SelectItem value="Maracanaú">Maracanaú</SelectItem>
          </SelectContent>
        </Select>

        <!-- Botão de geolocalização -->
        <Button
          @click="requestLocation"
          :disabled="gettingLocation"
          class="shrink-0 theme-button-outline"
        >
          <MapPin class="w-4 h-4 mr-2" />
          <span v-if="gettingLocation">Localizando...</span>
          <span v-else-if="userLocation">Próximos ({{ nearbyCount }})</span>
          <span v-else>Usar localização</span>
        </Button>

        <Button v-if="hasActiveFilters" @click="clearFilters" class="theme-button-outline">
          Limpar Filtros
        </Button>
      </div>

      <!-- Dica de busca -->
      <div class="mt-3 text-sm text-gray-500 dark:text-gray-400">
        💡 Dica: Você pode buscar por nome do profissional, categoria, complexo/edifício ou endereço
      </div>
    </div>

    <!-- Header dos Resultados -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <p class="text-gray-600">
          {{ professionals.length }} profissionais encontrados
          <span v-if="searchQuery">para "{{ searchQuery }}"</span>
        </p>

        <div
          v-if="userLocation"
          class="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2"
        >
          <MapPin class="w-4 h-4" />
          Usando sua localização
        </div>
      </div>

      <!-- Toggle View -->
      <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
        <Button
          @click="viewMode = 'grid'"
          :variant="viewMode === 'grid' ? 'default' : 'ghost'"
          size="sm"
          class="px-3"
        >
          <Grid3X3 class="w-4 h-4" />
        </Button>
        <Button
          @click="viewMode = 'list'"
          :variant="viewMode === 'list' ? 'default' : 'ghost'"
          size="sm"
          class="px-3"
        >
          <List class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
      <p class="text-gray-600">Buscando profissionais...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="professionals.length === 0" class="text-center py-16">
      <div class="text-gray-400 text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-bold text-gray-700 mb-2">Nenhum profissional encontrado</h3>
      <p class="text-gray-500 mb-6">Tente ajustar seus filtros ou buscar por outro termo</p>
      <Button @click="clearFilters" class="bg-rose-500 hover:bg-rose-600">
        Ver todos os profissionais
      </Button>
    </div>

    <!-- Grid View -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <ProfessionalCard
        v-for="professional in professionals"
        :key="professional.id"
        :professional="professional"
        @view-profile="goToProfile"
      />
    </div>

    <!-- List View -->
    <div v-else class="space-y-4">
      <div
        v-for="professional in professionals"
        :key="professional.id"
        class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        @click="goToProfile(professional.id)"
      >
        <div class="flex gap-6">
          <!-- Foto -->
          <div class="flex-shrink-0">
            <img
              v-if="getPrimaryPhoto(professional)"
              :src="getPrimaryPhoto(professional)!.photo_url"
              :alt="`Sala de ${professional.name}`"
              class="w-32 h-24 object-cover rounded-lg"
            />
            <div v-else class="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera class="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span
                    class="bg-rose-100 text-rose-800 text-sm font-medium px-2 py-1 rounded-full"
                  >
                    {{ professional.category }}
                  </span>
                  <div
                    v-if="professional.verified"
                    class="flex items-center gap-1 text-xs text-green-600"
                  >
                    <CheckCircle class="w-3 h-3" />
                    <span>Verificado</span>
                  </div>
                </div>

                <h3 class="text-xl font-bold text-gray-900 mb-1">{{ professional.name }}</h3>

                <!-- Local com complexo e distância -->
                <div class="text-gray-600 text-sm mb-2 space-y-1">
                  <div v-if="professional.complex_name" class="flex items-center gap-2">
                    <Building2 class="w-4 h-4" />
                    <span class="font-medium">{{ professional.complex_name }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <MapPin class="w-4 h-4" />
                    <span>
                      {{ professional.neighborhood ? `${professional.neighborhood}, ` : ''
                      }}{{ professional.city }}, CE
                    </span>

                    <!-- Distância -->
                    <span v-if="professional.distance" class="text-blue-600 font-medium ml-2">
                      • {{ formatDistance(professional.distance) }}
                    </span>
                  </div>
                </div>

                <p v-if="professional.description" class="text-gray-600 text-sm line-clamp-2 mb-3">
                  {{ professional.description }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-bold text-gray-900"
                  >R$ {{ professional.price_range }}</span
                >
                <span class="text-gray-500 text-sm">por consulta</span>
              </div>

              <Button
                @click.stop="contactWhatsApp(professional)"
                class="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <MessageCircle class="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfessionalCard from '@/components/professional/ProfessionalCard.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProfessionalsStore } from '@/stores/professionals'
import type { Professional, ProfessionalPhoto } from '@/types'
import { useDebounceFn } from '@vueuse/core'
import {
  Building2,
  Camera,
  CheckCircle,
  Grid3X3,
  List,
  MapPin,
  MessageCircle,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const professionalStore = useProfessionalsStore()
const { professionals, loading } = storeToRefs(professionalStore)

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedCity = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const gettingLocation = ref(false)
const userLocation = ref<{ latitude: number; longitude: number } | null>(null)

const hasActiveFilters = computed(() =>
  Boolean(selectedCategory.value !== 'all' || selectedCity.value !== 'all' || searchQuery.value),
)

const nearbyCount = computed(() => {
  if (!userLocation.value) return 0
  return professionals.value.filter((p) => p.distance && p.distance <= 5).length
})

function getPrimaryPhoto(professional: Professional): ProfessionalPhoto | null {
  if (!professional.photos?.length) return null
  return professional.photos.find((p) => p.is_primary) || professional.photos[0]
}

function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m de você`
  } else {
    return `${distance.toFixed(1)}km de você`
  }
}

function contactWhatsApp(professional: Professional) {
  if (professional.phone) {
    professionalStore.trackWhatsAppClick(professional.id)
    const message = `Olá ${professional.name}, encontrei seu perfil no Achou e gostaria de agendar uma consulta.`
    const phone = professional.phone.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }
}

async function requestLocation() {
  if (!navigator.geolocation) {
    alert('Geolocalização não suportada pelo seu navegador')
    return
  }

  gettingLocation.value = true

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      })
    })

    userLocation.value = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }

    professionalStore.setUserLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: Date.now(),
    })

    // Refazer busca com localização
    handleSearch()
  } catch (error) {
    console.error('Erro ao obter localização:', error)
    alert('Não foi possível obter sua localização')
  } finally {
    gettingLocation.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  handleSearch()
}, 500)

async function handleSearch() {
  const searchParams = {
    query: searchQuery.value || undefined,
    category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
    city: selectedCity.value !== 'all' ? selectedCity.value : undefined,
  }

  await professionalStore.searchProfessionals(searchParams)

  // Atualizar URL
  const query: Record<string, string> = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedCategory.value !== 'all') query.categoria = selectedCategory.value
  if (selectedCity.value !== 'all') query.cidade = selectedCity.value

  router.replace({ query })
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  selectedCity.value = 'all'
  handleSearch()
}

function goToProfile(id: string) {
  router.push({ name: 'ProfessionalProfile', params: { id } })
}

onMounted(() => {
  // Pegar filtros da URL
  const urlQuery = route.query.q as string
  const category = route.query.categoria as string
  const city = route.query.cidade as string

  if (urlQuery) searchQuery.value = urlQuery
  if (category) selectedCategory.value = category
  if (city) selectedCity.value = city

  handleSearch()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

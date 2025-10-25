<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-4 max-w-7xl">
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6 sticky top-20 z-30 shadow-sm">
        <div class="flex gap-3 items-center">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              placeholder="Buscar por nome, profissão, complexo, endereço..."
              class="text-base"
              @input="debouncedSearch"
            >
              <template #prefix>
                <Search class="w-5 h-5 text-gray-400" />
              </template>
            </Input>
          </div>

          <Select v-model="sortBy" @update:model-value="handleSearch">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevância</SelectItem>
              <SelectItem value="rating">Melhor Avaliados</SelectItem>
              <SelectItem value="newest">Mais Recentes</SelectItem>
              <SelectItem value="price_asc">Menor Preço</SelectItem>
              <SelectItem value="price_desc">Maior Preço</SelectItem>
            </SelectContent>
          </Select>

          <Button
            @click="requestLocation"
            :disabled="gettingLocation"
            variant="outline"
            class="shrink-0"
          >
            <MapPin class="w-4 h-4 mr-2" />
            <span v-if="gettingLocation">Localizando...</span>
            <span v-else-if="userLocation">Próximos ({{ nearbyCount }})</span>
            <span v-else>Localização</span>
          </Button>

          <Button v-if="hasActiveFilters" @click="clearFilters" variant="ghost" size="sm">
            <X class="w-4 h-4 mr-1" />
            Limpar
          </Button>
        </div>

        <div
          v-if="userLocation"
          class="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full"
        >
          <MapPin class="w-4 h-4" />
          Mostrando profissionais próximos a você
        </div>
      </div>

      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ loading ? 'Buscando...' : `${professionals.length} profissionais` }}
          </h2>
          <span v-if="searchQuery" class="text-gray-500"> · "{{ searchQuery }}" </span>
          <span v-if="sortBy !== 'relevance'" class="text-gray-500">
            · {{ getSortLabel(sortBy) }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <Button
            @click="showMap = !showMap"
            variant="outline"
            size="sm"
            class="flex items-center gap-2"
          >
            <Map class="w-4 h-4" />
            {{ showMap ? 'Esconder' : 'Ver' }} mapa
          </Button>

          <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <Button
              @click="viewMode = 'grid'"
              :variant="viewMode === 'grid' ? 'default' : 'ghost'"
              size="sm"
              class="px-2"
              :class="{ 'bg-rose-600': viewMode === 'grid' }"
            >
              <Grid3X3 class="w-4 h-4" />
            </Button>
            <Button
              @click="viewMode = 'list'"
              :variant="viewMode === 'list' ? 'default' : 'ghost'"
              size="sm"
              class="px-2"
              :class="{ 'bg-rose-600': viewMode === 'list' }"
            >
              <List class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        v-if="showMap && professionals.length > 0"
        class="mb-6 h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-sm"
      >
        <ProfessionalsMap
          :professionals="professionals"
          :selectedId="null"
          @selectProfessional="goToProfile"
        />
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
        <p class="text-gray-600">Buscando profissionais...</p>
      </div>

      <div v-else-if="professionals.length === 0" class="text-center py-20">
        <div
          class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Search class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Nenhum profissional encontrado</h3>
        <p class="text-gray-600 mb-6">Tente ajustar seus filtros ou buscar por outro termo</p>
        <Button @click="clearFilters" class="bg-rose-500 hover:bg-rose-600">
          Ver todos os profissionais
        </Button>
      </div>

      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <ProfessionalCard
          v-for="professional in professionals"
          :key="professional.id"
          :professional="professional"
          view-mode="grid"
          @view-profile="goToProfile"
          @whatsapp-click="contactWhatsApp"
        />
      </div>

      <div v-else class="space-y-4">
        <ProfessionalCard
          v-for="professional in professionals"
          :key="professional.id"
          :professional="professional"
          view-mode="list"
          @view-profile="goToProfile"
          @whatsapp-click="contactWhatsApp"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfessionalsMap from '@/components/maps/ProfessionalsMap.vue'
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
import { supabase } from '@/services/api'
import { determineSearchType, trackSearch } from '@/services/searchAnalytics'
import { useProfessionalsStore } from '@/stores/professionals'
import type { Professional } from '@/types'
import { useDebounceFn } from '@vueuse/core'
import { Grid3X3, List, Map, MapPin, Search, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const professionalStore = useProfessionalsStore()
const { professionals, loading } = storeToRefs(professionalStore)

const searchQuery = ref('')
const sortBy = ref<'relevance' | 'rating' | 'newest' | 'price_asc' | 'price_desc' | 'distance'>(
  'relevance',
)
const viewMode = ref<'grid' | 'list'>('grid')
const gettingLocation = ref(false)
const userLocation = ref<{ latitude: number; longitude: number } | null>(null)
const showMap = ref(false)

// Cache de categorias e complexos para determinar tipo de pesquisa
const knownCategories = ref<string[]>([])
const knownComplexes = ref<string[]>([])

const hasActiveFilters = computed(() => Boolean(searchQuery.value || sortBy.value !== 'relevance'))

const nearbyCount = computed(() => {
  if (!userLocation.value) return 0
  return professionals.value.filter((p) => p.distance && p.distance <= 5).length
})

function getSortLabel(sort: string): string {
  const labels = {
    relevance: 'Relevância',
    rating: 'Melhor Avaliados',
    newest: 'Mais Recentes',
    price_asc: 'Menor Preço',
    price_desc: 'Maior Preço',
    distance: 'Mais Próximos',
  }
  return labels[sort as keyof typeof labels] || 'Relevância'
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

    sortBy.value = 'distance'
    handleSearch()
  } catch (error) {
    console.error('Erro ao obter localização:', error)
    alert('Não foi possível obter sua localização')
  } finally {
    gettingLocation.value = false
  }
}

// Carregar categorias e complexos conhecidos
async function loadKnownData() {
  try {
    // Buscar categorias únicas
    const { data: categoriesData } = await supabase
      .from('professionals')
      .select('category')
      .eq('is_active', true)

    if (categoriesData) {
      knownCategories.value = [...new Set(categoriesData.map((p) => p.category))]
    }

    // Buscar complexos únicos
    const { data: complexesData } = await supabase
      .from('complexes')
      .select('name')
      .eq('is_active', true)

    if (complexesData) {
      knownComplexes.value = complexesData.map((c) => c.name)
    }
  } catch (error) {
    console.error('Erro ao carregar dados conhecidos:', error)
  }
}

const debouncedSearch = useDebounceFn(() => {
  handleSearch()
}, 400)

async function handleSearch() {
  await professionalStore.searchProfessionalsAdvanced({
    query: searchQuery.value || '',
    categories: [],
    specialties: [],
    priceMin: 0,
    priceMax: 1000,
    cities: [],
    neighborhoods: [],
    hasPhotos: false,
    responseTime: [],
    acceptsUrgent: false,
    verified: false,
    sortBy:
      sortBy.value === 'rating'
        ? 'relevance'
        : (sortBy.value as 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'distance'),
    userLocation: userLocation.value || undefined,
  })

  // Trackear a pesquisa
  if (searchQuery.value.trim()) {
    const searchType = determineSearchType(
      searchQuery.value,
      knownCategories.value,
      knownComplexes.value,
    )
    trackSearch(searchQuery.value.trim(), searchType, professionals.value.length)
  }

  // Se ordenar por rating, fazer ordenação manual após busca
  if (sortBy.value === 'rating') {
    professionals.value.sort((a, b) => {
      if ((b.rating || 0) !== (a.rating || 0)) {
        return (b.rating || 0) - (a.rating || 0)
      }
      return (b.review_count || 0) - (a.review_count || 0)
    })
  }

  const query: Record<string, string> = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (sortBy.value !== 'relevance') query.ordenar = sortBy.value

  router.replace({ query })
}

function clearFilters() {
  searchQuery.value = ''
  sortBy.value = 'relevance'
  userLocation.value = null
  handleSearch()
}

function goToProfile(id: string) {
  router.push({ name: 'ProfessionalProfile', params: { id } })
}

onMounted(() => {
  // Carregar dados conhecidos para determinar tipo de pesquisa
  loadKnownData()

  const urlQuery = route.query.q as string
  const complex = route.query.complexo as string
  const order = route.query.ordenar as string

  if (urlQuery) searchQuery.value = urlQuery
  if (complex) searchQuery.value = complex
  if (order && ['relevance', 'rating', 'newest', 'price_asc', 'price_desc'].includes(order)) {
    sortBy.value = order as typeof sortBy.value
  }

  handleSearch()
})
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

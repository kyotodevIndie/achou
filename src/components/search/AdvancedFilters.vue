<!-- src/components/search/AdvancedFilters.vue -->
<template>
  <div class="bg-white border-b border-gray-200 sticky top-16 z-40">
    <div class="container mx-auto px-4 py-4">
      <!-- Barra de busca principal -->
      <div class="flex gap-4 items-center mb-4">
        <div class="flex-1 relative">
          <Input
            v-model="searchQuery"
            placeholder="Buscar profissional, categoria, complexo..."
            class="pr-10"
            @input="debouncedSearch"
          />
          <Search
            class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"
          />
        </div>

        <!-- Geolocalização -->
        <Button
          @click="requestLocation"
          :disabled="gettingLocation"
          variant="outline"
          class="shrink-0"
        >
          <MapPin class="w-4 h-4 mr-2" />
          <span v-if="gettingLocation">Localizando...</span>
          <span v-else-if="userLocation">Próximos de você</span>
          <span v-else>Usar localização</span>
        </Button>

        <!-- Toggle filtros avançados -->
        <Button @click="showAdvanced = !showAdvanced" variant="outline" class="shrink-0">
          <SlidersHorizontal class="w-4 h-4 mr-2" />
          Filtros {{ showAdvanced ? 'simples' : 'avançados' }}
        </Button>
      </div>

      <!-- Filtros Rápidos (sempre visíveis) -->
      <div v-if="!showAdvanced" class="space-y-3">
        <!-- Chips de filtros ativos -->
        <div v-if="activeFiltersCount > 0" class="flex flex-wrap gap-2">
          <div
            v-for="filter in activeFilters"
            :key="filter.key"
            class="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {{ filter.label }}
            <button @click="removeFilter(filter.key)" class="hover:bg-rose-200 rounded-full p-0.5">
              <X class="w-3 h-3" />
            </button>
          </div>
          <Button @click="clearAllFilters" variant="ghost" size="sm" class="text-gray-500">
            Limpar todos
          </Button>
        </div>

        <!-- Filtros básicos em linha -->
        <div class="flex gap-3 flex-wrap items-center">
          <Select v-model="filters.categories[0]" @update:model-value="updateSearch">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              <SelectItem
                v-for="category in CATEGORIES"
                :key="category.value"
                :value="category.value"
              >
                {{ category.icon }} {{ category.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="selectedCity" @update:model-value="updateSearch">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="Fortaleza">Fortaleza</SelectItem>
              <SelectItem value="Caucaia">Caucaia</SelectItem>
              <SelectItem value="Maracanaú">Maracanaú</SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="selectedPriceRange" @update:model-value="updatePriceRange">
            <SelectTrigger class="w-44">
              <SelectValue placeholder="Faixa de preço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Qualquer preço</SelectItem>
              <SelectItem v-for="range in PRICE_RANGES" :key="range.value" :value="range.value">
                {{ range.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Distância (só se tem localização) -->
          <Select v-if="userLocation" v-model="selectedDistance" @update:model-value="updateSearch">
            <SelectTrigger class="w-36">
              <SelectValue placeholder="Distância" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Qualquer</SelectItem>
              <SelectItem value="1">Até 1 km</SelectItem>
              <SelectItem value="2">Até 2 km</SelectItem>
              <SelectItem value="5">Até 5 km</SelectItem>
              <SelectItem value="10">Até 10 km</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Filtros Avançados -->
      <div v-else class="space-y-4 border-t border-gray-100 pt-4">
        <!-- Grid de filtros -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Categorias múltiplas -->
          <div>
            <label class="text-sm font-medium mb-2 block">Categorias</label>
            <div class="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
              <label
                v-for="category in CATEGORIES"
                :key="category.value"
                class="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  :value="category.value"
                  v-model="filters.categories"
                  @change="updateSearch"
                  class="rounded border-gray-300"
                />
                {{ category.icon }} {{ category.label }}
                <span class="text-gray-400 text-xs ml-auto">
                  ({{ getCategoryCount(category.value) }})
                </span>
              </label>
            </div>
          </div>

          <!-- Localização -->
          <div>
            <label class="text-sm font-medium mb-2 block">Localização</label>
            <div class="space-y-2">
              <Select v-model="selectedCity" @update:model-value="updateCityAndNeighborhoods">
                <SelectTrigger>
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as cidades</SelectItem>
                  <SelectItem value="Fortaleza">Fortaleza</SelectItem>
                  <SelectItem value="Caucaia">Caucaia</SelectItem>
                  <SelectItem value="Maracanaú">Maracanaú</SelectItem>
                </SelectContent>
              </Select>

              <!-- Bairros (só se Fortaleza) -->
              <div v-if="selectedCity === 'Fortaleza'" class="max-h-32 overflow-y-auto">
                <div class="space-y-1">
                  <label
                    v-for="neighborhood in NEIGHBORHOODS_FORTALEZA"
                    :key="neighborhood"
                    class="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      :value="neighborhood"
                      v-model="filters.neighborhoods"
                      @change="updateSearch"
                      class="rounded border-gray-300"
                    />
                    {{ neighborhood }}
                    <span class="text-gray-400 text-xs ml-auto">
                      ({{ getNeighborhoodCount(neighborhood) }})
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Preço -->
          <div>
            <label class="text-sm font-medium mb-2 block">
              Preço: R$ {{ filters.priceMin }} - R$ {{ filters.priceMax }}
            </label>
            <div class="space-y-3">
              <div>
                <input
                  type="range"
                  v-model="filters.priceMin"
                  min="0"
                  max="500"
                  step="25"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  @input="debouncedSearch"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>R$ 0</span>
                  <span>R$ 500+</span>
                </div>
              </div>
              <div>
                <input
                  type="range"
                  v-model="filters.priceMax"
                  min="50"
                  max="1000"
                  step="25"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  @input="debouncedSearch"
                />
              </div>
            </div>
          </div>

          <!-- Qualidade e Filtros Extras -->
          <div>
            <label class="text-sm font-medium mb-2 block">Filtros de Qualidade</label>
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  v-model="filters.hasPhotos"
                  @change="updateSearch"
                  class="rounded border-gray-300"
                />
                📷 Com fotos da sala
              </label>

              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  v-model="filters.verified"
                  @change="updateSearch"
                  class="rounded border-gray-300"
                />
                ✅ Perfil verificado
              </label>

              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  v-model="filters.acceptsUrgent"
                  @change="updateSearch"
                  class="rounded border-gray-300"
                />
                🚨 Aceita urgência
              </label>

              <div class="mt-3">
                <label class="text-xs font-medium block mb-1">Tempo de resposta</label>
                <Select v-model="selectedResponseTime" @update:model-value="updateSearch">
                  <SelectTrigger class="h-8">
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer tempo</SelectItem>
                    <SelectItem value="fast">⚡ Resposta rápida</SelectItem>
                    <SelectItem value="medium">⏰ Resposta normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ordenação e Resultados -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600"> {{ resultsCount }} profissionais encontrados </span>

          <div v-if="userLocation" class="text-xs text-blue-600 flex items-center gap-1">
            <MapPin class="w-3 h-3" />
            Usando sua localização
          </div>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-600">Ordenar por:</label>
          <Select v-model="filters.sortBy" @update:model-value="updateSearch">
            <SelectTrigger class="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">📍 Relevância</SelectItem>
              <SelectItem value="distance" v-if="userLocation">📏 Distância</SelectItem>
              <SelectItem value="price_asc">💰 Menor preço</SelectItem>
              <SelectItem value="price_desc">💎 Maior preço</SelectItem>
              <SelectItem value="newest">🆕 Mais recente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CATEGORIES,
  NEIGHBORHOODS_FORTALEZA,
  PRICE_RANGES,
  type AdvancedSearchParams,
  type UserLocation,
} from '@/types'
import { useDebounceFn } from '@vueuse/core'
import { MapPin, Search, SlidersHorizontal, X } from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'

const emit = defineEmits<{
  search: [params: AdvancedSearchParams]
}>()

const props = defineProps<{
  resultsCount: number
}>()

// Estado dos filtros
const searchQuery = ref('')
const showAdvanced = ref(false)
const gettingLocation = ref(false)
const userLocation = ref<UserLocation | null>(null)

// Filtros básicos (compatibilidade)
const selectedCity = ref('')
const selectedPriceRange = ref('')
const selectedDistance = ref('')
const selectedResponseTime = ref('')

// Filtros avançados
const filters = reactive<AdvancedSearchParams>({
  query: '',
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
  sortBy: 'relevance',
  maxDistance: undefined,
})

// Computed
const activeFilters = computed(() => {
  const active = []

  if (searchQuery.value) {
    active.push({ key: 'query', label: `"${searchQuery.value}"` })
  }

  if (filters.categories.length > 0) {
    active.push({
      key: 'categories',
      label:
        filters.categories.length === 1
          ? CATEGORIES.find((c) => c.value === filters.categories[0])?.label || ''
          : `${filters.categories.length} categorias`,
    })
  }

  if (selectedCity.value) {
    active.push({ key: 'city', label: selectedCity.value })
  }

  if (filters.neighborhoods.length > 0) {
    active.push({
      key: 'neighborhoods',
      label:
        filters.neighborhoods.length === 1
          ? filters.neighborhoods[0]
          : `${filters.neighborhoods.length} bairros`,
    })
  }

  if (selectedPriceRange.value) {
    const range = PRICE_RANGES.find((r) => r.value === selectedPriceRange.value)
    if (range) active.push({ key: 'price', label: range.label })
  }

  if (selectedDistance.value && userLocation.value) {
    active.push({ key: 'distance', label: `Até ${selectedDistance.value} km` })
  }

  if (filters.hasPhotos) {
    active.push({ key: 'hasPhotos', label: 'Com fotos' })
  }

  if (filters.verified) {
    active.push({ key: 'verified', label: 'Verificado' })
  }

  if (filters.acceptsUrgent) {
    active.push({ key: 'acceptsUrgent', label: 'Aceita urgência' })
  }

  if (selectedResponseTime.value) {
    active.push({
      key: 'responseTime',
      label: selectedResponseTime.value === 'fast' ? 'Resposta rápida' : 'Resposta normal',
    })
  }

  return active
})

const activeFiltersCount = computed(() => activeFilters.value.length)

// Métodos
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
        maximumAge: 300000, // 5 minutos
      })
    })

    userLocation.value = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now(),
    }

    // Atualizar filtros com localização
    filters.userLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }

    // Se não tem distância selecionada, usar 5km por padrão
    if (!selectedDistance.value || selectedDistance.value === 'all') {
      selectedDistance.value = '5'
      filters.maxDistance = 5
    }

    updateSearch()
  } catch (error) {
    console.error('Erro ao obter localização:', error)
    alert('Não foi possível obter sua localização. Verifique as permissões do navegador.')
  } finally {
    gettingLocation.value = false
  }
}

function removeFilter(key: string) {
  switch (key) {
    case 'query':
      searchQuery.value = ''
      filters.query = ''
      break
    case 'categories':
      filters.categories = []
      break
    case 'city':
      selectedCity.value = ''
      filters.cities = []
      break
    case 'neighborhoods':
      filters.neighborhoods = []
      break
    case 'price':
      selectedPriceRange.value = ''
      filters.priceMin = 0
      filters.priceMax = 1000
      break
    case 'distance':
      selectedDistance.value = ''
      filters.maxDistance = undefined
      break
    case 'hasPhotos':
      filters.hasPhotos = false
      break
    case 'verified':
      filters.verified = false
      break
    case 'acceptsUrgent':
      filters.acceptsUrgent = false
      break
    case 'responseTime':
      selectedResponseTime.value = ''
      filters.responseTime = []
      break
  }
  updateSearch()
}

function clearAllFilters() {
  searchQuery.value = ''
  selectedCity.value = ''
  selectedPriceRange.value = ''
  selectedDistance.value = ''
  selectedResponseTime.value = ''

  Object.assign(filters, {
    query: '',
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
    sortBy: 'relevance',
    maxDistance: undefined,
  })

  updateSearch()
}

function updateCityAndNeighborhoods() {
  if (selectedCity.value !== 'Fortaleza') {
    filters.neighborhoods = []
  }
  filters.cities = selectedCity.value ? [selectedCity.value] : []
  updateSearch()
}

function updatePriceRange() {
  if (selectedPriceRange.value) {
    const range = PRICE_RANGES.find((r) => r.value === selectedPriceRange.value)
    if (range) {
      filters.priceMin = range.min
      filters.priceMax = range.max
    }
  } else {
    filters.priceMin = 0
    filters.priceMax = 1000
  }
  updateSearch()
}

function updateSearch() {
  // Atualizar query
  filters.query = searchQuery.value

  // Atualizar cidades
  if (selectedCity.value) {
    filters.cities = [selectedCity.value]
  } else {
    filters.cities = []
  }

  // Atualizar distância
  if (selectedDistance.value && userLocation.value) {
    filters.maxDistance = parseInt(selectedDistance.value)
  } else {
    filters.maxDistance = undefined
  }

  // Atualizar tempo de resposta
  if (selectedResponseTime.value) {
    filters.responseTime = [selectedResponseTime.value as 'fast' | 'medium' | 'slow']
  } else {
    filters.responseTime = []
  }

  emit('search', { ...filters })
}

// Mock functions para contadores (implementar depois)
function getCategoryCount(category: string): number {
  // TODO: Implementar contagem real baseada nos dados
  return Math.floor(Math.random() * 10) + 1
}

function getNeighborhoodCount(neighborhood: string): number {
  // TODO: Implementar contagem real baseada nos dados
  return Math.floor(Math.random() * 8) + 1
}

const debouncedSearch = useDebounceFn(() => {
  updateSearch()
}, 500)

// Watchers
watch(searchQuery, (newQuery) => {
  filters.query = newQuery
  debouncedSearch()
})

watch(
  () => filters.priceMin,
  () => {
    debouncedSearch()
  },
)

watch(
  () => filters.priceMax,
  () => {
    debouncedSearch()
  },
)
</script>

<style scoped>
/* Estilos customizados para sliders */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type='range']::-webkit-slider-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #f43f5e;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type='range']::-moz-range-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
  border: none;
}

input[type='range']::-moz-range-thumb {
  background: #f43f5e;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

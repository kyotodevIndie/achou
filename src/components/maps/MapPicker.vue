<template>
  <div class="map-picker-wrapper">
    <div class="map-picker-header">
      <label class="text-sm font-medium block mb-2"> Localização no Mapa </label>
      <p class="text-sm text-gray-600 mb-3">
        Clique no mapa para marcar a localização exata da sua sala comercial
      </p>

      <div class="relative mb-3">
        <div class="flex gap-2">
          <div class="flex-1 relative">
            <Input
              v-model="searchAddress"
              placeholder="Digite o endereço para buscar..."
              @input="handleSearchInput"
              @keydown.enter.prevent="selectFirstSuggestion"
              @focus="showSuggestions = true"
              @blur="hideSuggestionsDelayed"
            />

            <div v-if="searching" class="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
            </div>

            <div
              v-if="showSuggestions && suggestions.length > 0"
              class="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(suggestion, index) in suggestions"
                :key="index"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                @mousedown.prevent="selectSuggestion(suggestion)"
              >
                <div class="flex items-start gap-2">
                  <MapPin class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span class="text-sm text-gray-900">{{ suggestion.display_name }}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            @click.prevent="searchCurrentAddress"
            type="button"
            :disabled="searching || !searchAddress"
          >
            {{ searching ? 'Buscando...' : 'Buscar' }}
          </Button>
        </div>
      </div>
    </div>

    <div class="map-picker-container">
      <div
        ref="mapContainer"
        class="map-wrapper border-2 border-dashed border-gray-300 rounded-lg"
        :class="{ 'border-green-500': modelValue.latitude && modelValue.longitude }"
      ></div>
    </div>

    <p class="text-xs text-gray-500 mt-2">
      💡 Dica: Use o scroll do mouse para dar zoom e arraste para mover o mapa
    </p>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-vue-next'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Location {
  latitude: number | null
  longitude: number | null
}

const props = defineProps<{
  modelValue: Location
  initialCenter?: { lat: number; lng: number }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Location]
}>()

const mapContainer = ref<HTMLElement>()
const searchAddress = ref('')
const searching = ref(false)
const suggestions = ref<Array<{ display_name: string; lat: string; lon: string }>>([])
const showSuggestions = ref(false)
const mapLoading = ref(true)
let map: L.Map | null = null
let marker: L.Marker | null = null
let searchTimeout: NodeJS.Timeout | null = null
const isInitialized = ref(false)

const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        font-size: 32px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">📍</div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

function destroyMap() {
  

  if (marker) {
    try {
      if (map) map.removeLayer(marker)
    } catch (e) {
      
    }
    marker = null
  }

  if (map) {
    try {
      map.off()
      map.remove()
    } catch (e) {
      
    }
    map = null
  }

  // CRÍTICO: Limpar o container HTML completamente
  if (mapContainer.value) {
    mapContainer.value.innerHTML = ''
    // Remover atributo que o Leaflet adiciona
    mapContainer.value.removeAttribute('data-leaflet-id')
    // Remover classes do Leaflet
    mapContainer.value.className = 'map-wrapper border-2 border-dashed border-gray-300 rounded-lg'
  }

  isInitialized.value = false
  
}

async function initMap() {
  if (!mapContainer.value) {
    
    return
  }

  // Sempre destruir antes de criar novo
  if (map || isInitialized.value) {
    
    destroyMap()
    await nextTick()
  }

  try {
    

    const initialLat = props.modelValue.latitude || props.initialCenter?.lat || -3.7327
    const initialLng = props.modelValue.longitude || props.initialCenter?.lng || -38.527

    map = L.map(mapContainer.value, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Adicionar marker se já tiver localização
    if (props.modelValue.latitude && props.modelValue.longitude) {
      addMarker(props.modelValue.latitude, props.modelValue.longitude)
    }

    // Evento de clique no mapa
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      updateLocation(lat, lng)
    })

    // Forçar recalcular tamanho do mapa
    setTimeout(() => {
      if (map) {
        map.invalidateSize()
        isInitialized.value = true
        
      }
    }, 150)
  } catch (error) {
    console.error('❌ Erro ao inicializar mapa:', error)
    // Em caso de erro, tentar limpar e mostrar mensagem
    destroyMap()
  }
}

function addMarker(lat: number, lng: number) {
  if (!map) {
    
    return
  }

  // Remover marker anterior
  if (marker) {
    try {
      map.removeLayer(marker)
    } catch (e) {
      
    }
  }

  // Adicionar novo marker
  marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
  map.setView([lat, lng], map.getZoom())
}

function updateLocation(lat: number, lng: number) {
  emit('update:modelValue', {
    latitude: lat,
    longitude: lng,
  })

  addMarker(lat, lng)
}

async function handleSearchInput() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!searchAddress.value.trim()) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  searchTimeout = setTimeout(async () => {
    await fetchSuggestions()
  }, 300)
}

async function fetchSuggestions() {
  if (!searchAddress.value || searchAddress.value.length < 3) return

  searching.value = true

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress.value)}&limit=5&countrycodes=br`,
    )

    const data = await response.json()
    suggestions.value = data || []
    showSuggestions.value = suggestions.value.length > 0
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error)
    suggestions.value = []
  } finally {
    searching.value = false
  }
}

function selectSuggestion(suggestion: { display_name: string; lat: string; lon: string }) {
  searchAddress.value = suggestion.display_name
  showSuggestions.value = false

  const latitude = parseFloat(suggestion.lat)
  const longitude = parseFloat(suggestion.lon)

  updateLocation(latitude, longitude)

  setTimeout(() => {
    if (map) {
      map.invalidateSize()
      map.setView([latitude, longitude], 17)
    }
  }, 100)
}

function selectFirstSuggestion() {
  if (suggestions.value.length > 0) {
    selectSuggestion(suggestions.value[0])
  } else {
    searchCurrentAddress()
  }
}

function hideSuggestionsDelayed() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

async function searchCurrentAddress() {
  if (!searchAddress.value || !map) return

  searching.value = true

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress.value)}&limit=1&countrycodes=br`,
    )

    const data = await response.json()

    if (data && data.length > 0) {
      const { lat, lon } = data[0]
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)

      updateLocation(latitude, longitude)

      setTimeout(() => {
        if (map) {
          map.invalidateSize()
          map.setView([latitude, longitude], 17)
        }
      }, 100)
    } else {
      alert('Endereço não encontrado. Tente ser mais específico.')
    }
  } catch (error) {
    console.error('Erro ao buscar endereço:', error)
    alert('Erro ao buscar endereço. Tente novamente.')
  } finally {
    searching.value = false
  }
}

// Watch para mudanças no modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue.latitude && newValue.longitude && map) {
      addMarker(newValue.latitude, newValue.longitude)
    } else if (!newValue.latitude && !newValue.longitude && marker) {
      if (map) {
        try {
          map.removeLayer(marker)
        } catch (e) {
          
        }
      }
      marker = null
    }
  },
  { deep: true },
)

// Watch para initialCenter (quando editar complexo)
watch(
  () => props.initialCenter,
  async (newCenter) => {
    if (newCenter) {
      
      await initMap()
    }
  },
  { deep: true },
)

onMounted(async () => {
  
  await nextTick()
  await initMap()
})

onBeforeUnmount(() => {
  
  destroyMap()
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<style scoped>
.map-picker-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.map-picker-header {
  width: 100%;
  flex-shrink: 0;
}

.map-picker-container {
  width: 100%;
  height: 300px;
  position: relative;
  flex-shrink: 0;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f3f4f6;
  position: relative;
  z-index: 1;
}

/* FIX CRÍTICO: Garantir que o mapa fique DENTRO do container */
:deep(.leaflet-container) {
  z-index: 1 !important;
  width: 100%;
  height: 100%;
  position: relative;
}

:deep(.leaflet-pane) {
  z-index: 2 !important;
}

:deep(.leaflet-tile-pane) {
  z-index: 1 !important;
}

:deep(.leaflet-overlay-pane) {
  z-index: 3 !important;
}

:deep(.leaflet-shadow-pane) {
  z-index: 4 !important;
}

:deep(.leaflet-marker-pane) {
  z-index: 5 !important;
}

:deep(.leaflet-tooltip-pane) {
  z-index: 6 !important;
}

:deep(.leaflet-popup-pane) {
  z-index: 7 !important;
}

:deep(.leaflet-control) {
  z-index: 10 !important;
}

:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 10 !important;
}

:deep(.leaflet-control-attribution) {
  font-size: 10px;
  z-index: 10 !important;
}

/* Estilo do dropdown de sugestões - ACIMA do mapa */
.suggestions-dropdown {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.suggestions-dropdown::-webkit-scrollbar {
  width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
  background: #f7fafc;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}
</style>

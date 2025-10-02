<template>
  <div class="map-picker-container">
    <div class="mb-4">
      <label class="text-sm font-medium block mb-2"> Localização no Mapa </label>
      <p class="text-sm text-gray-600 mb-3">
        Clique no mapa para marcar a localização exata da sua sala comercial
      </p>

      <!-- Input de busca de endereço -->
      <div class="flex gap-2 mb-3">
        <Input
          v-model="searchAddress"
          placeholder="Digite o endereço para buscar..."
          class="flex-1"
          @keydown.enter.prevent="searchLocation"
        />
        <Button @click="searchLocation" type="button" :disabled="searching || !searchAddress">
          {{ searching ? 'Buscando...' : 'Buscar' }}
        </Button>
      </div>

      <!-- Coordenadas selecionadas -->
      <div
        v-if="modelValue.latitude && modelValue.longitude"
        class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <span class="text-green-800 font-medium">Localização marcada</span>
            <span class="text-green-600 ml-2">
              {{ modelValue.latitude.toFixed(6) }}, {{ modelValue.longitude.toFixed(6) }}
            </span>
          </div>
          <Button
            @click="clearLocation"
            variant="ghost"
            size="sm"
            type="button"
            class="text-red-600 hover:text-red-700"
          >
            Limpar
          </Button>
        </div>
      </div>
    </div>

    <!-- Mapa -->
    <div
      ref="mapContainer"
      class="map-wrapper border-2 border-dashed border-gray-300 rounded-lg"
      :class="{ 'border-green-500': modelValue.latitude && modelValue.longitude }"
    ></div>

    <p class="text-xs text-gray-500 mt-2">
      Dica: Use o scroll do mouse para dar zoom e arraste para mover o mapa
    </p>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { onMounted, onUnmounted, ref, watch } from 'vue'

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
let map: L.Map | null = null
let marker: L.Marker | null = null

// Ícone customizado para o marker
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

function initMap() {
  if (!mapContainer.value) return

  // Usar coordenadas iniciais ou centro de Fortaleza
  const initialLat = props.modelValue.latitude || props.initialCenter?.lat || -3.7327
  const initialLng = props.modelValue.longitude || props.initialCenter?.lng || -38.527

  map = L.map(mapContainer.value).setView([initialLat, initialLng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  // Se já tiver coordenadas, adicionar marker
  if (props.modelValue.latitude && props.modelValue.longitude) {
    addMarker(props.modelValue.latitude, props.modelValue.longitude)
  }

  // Evento de clique no mapa
  map.on('click', (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    updateLocation(lat, lng)
  })
}

function addMarker(lat: number, lng: number) {
  if (!map) return

  // Remover marker anterior se existir
  if (marker) {
    marker.remove()
  }

  // Adicionar novo marker
  marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

  // Centralizar mapa no marker
  map.setView([lat, lng], map.getZoom())
}

function updateLocation(lat: number, lng: number) {
  emit('update:modelValue', {
    latitude: lat,
    longitude: lng,
  })

  addMarker(lat, lng)
}

function clearLocation() {
  emit('update:modelValue', {
    latitude: null,
    longitude: null,
  })

  if (marker) {
    marker.remove()
    marker = null
  }
}

async function searchLocation() {
  if (!searchAddress.value || !map) return

  searching.value = true

  try {
    // Usar Nominatim API (gratuita) do OpenStreetMap para geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress.value)}&limit=1`,
    )

    const data = await response.json()

    if (data && data.length > 0) {
      const { lat, lon } = data[0]
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)

      updateLocation(latitude, longitude)
      map.setView([latitude, longitude], 17)
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

// Watch para atualizar marker quando modelValue mudar externamente
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue.latitude && newValue.longitude && map) {
      addMarker(newValue.latitude, newValue.longitude)
    } else if (marker) {
      marker.remove()
      marker = null
    }
  },
  { deep: true },
)

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-picker-container {
  width: 100%;
}

.map-wrapper {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f3f4f6;
}

:deep(.leaflet-control-attribution) {
  font-size: 10px;
}
</style>

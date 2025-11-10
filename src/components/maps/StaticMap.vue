<template>
  <div class="static-map-container">
    <div v-if="latitude && longitude" class="relative rounded-lg overflow-hidden bg-gray-100">
      <div ref="mapContainer" class="map-wrapper"></div>

      <div
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 text-white pointer-events-none"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <p class="font-semibold mb-1 text-sm">{{ address }}</p>
            <p v-if="complexName" class="text-xs opacity-90">{{ complexName }}</p>
          </div>

          <a
            :href="googleMapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-white text-gray-900 px-3 py-2 rounded-lg font-medium text-xs hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap pointer-events-auto"
          >
            <Navigation class="w-3 h-3" />
            Ver rotas
          </a>
        </div>
      </div>
    </div>

    <div v-else class="bg-gray-100 rounded-lg p-8 text-center border border-gray-200">
      <MapPin class="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p class="text-gray-600 mb-2">Localização não disponível</p>
      <p class="text-sm text-gray-500 mb-4">{{ address }}</p>
      <a
        :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium text-sm"
      >
        <Navigation class="w-4 h-4" />
        Buscar no Google Maps
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  latitude?: number | null
  longitude?: number | null
  address: string
  complexName?: string | null
  professionalName: string
  zoom?: number
}>()

const mapContainer = ref<HTMLElement>()
let map: L.Map | null = null

const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        font-size: 28px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      ">📍</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

const googleMapsUrl = computed(() => {
  if (!props.latitude || !props.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.address)}`
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${props.latitude},${props.longitude}`
})

function initMap() {
  if (!mapContainer.value || !props.latitude || !props.longitude) {
    console.warn('StaticMap - Não pode inicializar: faltam dados')
    return
  }

  try {
    map = L.map(mapContainer.value, {
      center: [props.latitude, props.longitude],
      zoom: props.zoom || 16,
      dragging: false,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    L.marker([props.latitude, props.longitude], {
      icon: customIcon,
      interactive: false,
    }).addTo(map)
  } catch (error) {
    console.error('Erro ao inicializar mapa:', error)
  }
}

onMounted(() => {
  if (props.latitude && props.longitude) {
    setTimeout(() => {
      initMap()

      if (map) {
        setTimeout(() => {
          map?.invalidateSize()
        }, 200)
      }
    }, 100)
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.static-map-container {
  width: 100%;
  height: 300px;
}

.static-map-container > div {
  height: 100%;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  min-height: 300px;
  cursor: default;
  position: relative;
}

/* FIX: Garantir que o mapa fique ABAIXO de modais, dialogs e headers */
:deep(.leaflet-container) {
  height: 100% !important;
  width: 100% !important;
  border-radius: 12px;
  z-index: 1 !important;
}

:deep(.leaflet-pane) {
  z-index: 1 !important;
}

:deep(.leaflet-control) {
  z-index: 2 !important;
}

:deep(.leaflet-control-attribution) {
  font-size: 9px;
  background: rgba(255, 255, 255, 0.7);
  z-index: 2 !important;
}

:deep(.leaflet-tile-pane) {
  filter: saturate(0.95);
}
</style>

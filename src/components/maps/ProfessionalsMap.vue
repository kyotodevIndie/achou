<template>
  <div class="professionals-map-container">
    <div ref="mapContainer" class="map-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import type { Professional } from '@/types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  professionals: Professional[]
  selectedId?: string | null
}>()

const emit = defineEmits<{
  selectProfessional: [id: string]
}>()

const mapContainer = ref<HTMLElement>()
let map: L.Map | null = null
const markers: L.Marker[] = []

// Ícone customizado para pins
const createCustomIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${isSelected ? '#f43f5e' : '#1f2937'};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          margin-top: -4px;
        ">📍</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

function initMap() {
  if (!mapContainer.value) return

  // Criar mapa centrado em Fortaleza
  map = L.map(mapContainer.value).setView([-3.7327, -38.527], 12)

  // Adicionar tiles do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  updateMarkers()
}

function updateMarkers() {
  if (!map) return

  // Remover markers antigos
  markers.forEach((marker) => marker.remove())
  markers.length = 0

  const bounds: L.LatLngBounds[] = []

  // Adicionar markers para cada profissional
  props.professionals.forEach((professional) => {
    // Pular se não tiver coordenadas
    if (!professional.latitude || !professional.longitude) return

    const isSelected = professional.id === props.selectedId

    const marker = L.marker([professional.latitude, professional.longitude], {
      icon: createCustomIcon(isSelected),
    })

    // Popup com informações básicas
    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="font-weight: 600; margin-bottom: 4px;">${professional.name}</h3>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
          ${professional.category}
        </p>
        ${
          professional.complex_name
            ? `
          <p style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">
            📍 ${professional.complex_name}
          </p>
        `
            : ''
        }
        <button
          onclick="window.dispatchEvent(new CustomEvent('selectProfessional', { detail: '${professional.id}' }))"
          style="
            background-color: #f43f5e;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 13px;
            width: 100%;
            margin-top: 8px;
          "
        >
          Ver perfil
        </button>
      </div>
    `

    marker.bindPopup(popupContent)
    marker.addTo(map!)
    markers.push(marker)

    bounds.push(
      L.latLngBounds(
        [professional.latitude, professional.longitude],
        [professional.latitude, professional.longitude],
      ),
    )
  })

  // Ajustar zoom para mostrar todos os markers
  if (bounds.length > 0 && map) {
    const group = new L.FeatureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

// Watch para atualizar markers quando profissionais mudarem
watch(() => props.professionals, updateMarkers, { deep: true })
watch(() => props.selectedId, updateMarkers)

// Listener para evento customizado do popup
onMounted(() => {
  initMap()

  window.addEventListener('selectProfessional', ((event: CustomEvent) => {
    emit('selectProfessional', event.detail)
  }) as EventListener)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.professionals-map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-tip) {
  background: white;
}
</style>

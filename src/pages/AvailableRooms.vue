<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
    <!-- Hero -->
    <section
      class="relative overflow-hidden min-h-[400px] flex items-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
    >
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600"></div>
      </div>

      <div class="relative container mx-auto px-4 py-16">
        <div class="text-center space-y-6 max-w-4xl mx-auto">
          <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
            Encontre Sua
            <span
              class="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent"
            >
              Sala Ideal
            </span>
          </h1>

          <p class="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Salas comerciais disponíveis nos melhores complexos empresariais
          </p>

          <!-- Filtros -->
          <div
            class="max-w-3xl mx-auto mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-white text-sm font-medium mb-2">Complexo</label>
                <input
                  v-model="filters.complexName"
                  type="text"
                  placeholder="Nome do complexo"
                  class="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label class="block text-white text-sm font-medium mb-2">Valor Máximo</label>
                <input
                  v-model.number="filters.maxPrice"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="R$ 0,00"
                  class="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div class="flex items-end">
                <button
                  @click="loadRooms"
                  class="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Search class="w-5 h-5" />
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Results -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">Carregando salas disponíveis...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-12">
          <div class="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
            <h3 class="text-lg font-bold text-red-700 mb-2">Erro ao carregar salas</h3>
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="rooms.length === 0" class="text-center py-12">
          <div class="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg border border-gray-200">
            <Building2 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhuma sala disponível</h3>
            <p class="text-gray-600 mb-6">Tente ajustar os filtros ou volte mais tarde</p>
          </div>
        </div>

        <!-- Results Grid -->
        <div v-else>
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-bold text-gray-900">
              {{ rooms.length }} {{ rooms.length === 1 ? 'sala encontrada' : 'salas encontradas' }}
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="room in rooms"
              :key="room.id"
              class="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <!-- Image -->
              <div
                class="relative h-56 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden"
              >
                <img
                  v-if="room.photo_url"
                  :src="room.photo_url"
                  :alt="`Sala ${room.room_number}`"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div v-else class="absolute inset-0 flex items-center justify-center">
                  <Building2 class="w-20 h-20 text-white opacity-30" />
                </div>

                <!-- Complex Badge -->
                <div class="absolute top-4 left-4">
                  <span
                    class="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg"
                  >
                    {{ room.complex_name }}
                  </span>
                </div>
              </div>

              <!-- Content -->
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-1">
                      Sala {{ room.room_number }}
                    </h3>
                    <p v-if="room.floor" class="text-sm text-gray-600">{{ room.floor }}º andar</p>
                  </div>
                  <div class="text-right">
                    <p class="text-3xl font-bold text-rose-600">
                      {{ formatPrice(room.monthly_rent_cents) }}
                    </p>
                    <p class="text-xs text-gray-500">por mês</p>
                  </div>
                </div>

                <p
                  v-if="room.size_sqm"
                  class="text-sm text-gray-700 mb-3 flex items-center gap-2"
                >
                  <Maximize2 class="w-4 h-4 text-gray-500" />
                  <span class="font-semibold">{{ room.size_sqm }}m²</span>
                </p>

                <p v-if="room.description" class="text-sm text-gray-700 mb-4 line-clamp-3">
                  {{ room.description }}
                </p>

                <!-- Amenities -->
                <div v-if="room.amenities && room.amenities.length > 0" class="mb-6">
                  <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Comodidades</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="amenity in room.amenities"
                      :key="amenity"
                      class="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium"
                    >
                      {{ getAmenityLabel(amenity) }}
                    </span>
                  </div>
                </div>

                <!-- Contact -->
                <div class="pt-4 border-t border-gray-100 space-y-3">
                  <a
                    v-if="room.contact_phone"
                    :href="`https://wa.me/55${room.contact_phone.replace(/\D/g, '')}`"
                    target="_blank"
                    class="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle class="w-5 h-5" />
                    Entrar em Contato
                  </a>

                  <a
                    v-if="room.contact_email"
                    :href="`mailto:${room.contact_email}`"
                    class="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Mail class="w-5 h-5" />
                    Enviar E-mail
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { supabase } from '@/services/api'
import { ROOM_AMENITIES, type AvailableRoom } from '@/types'
import { Building2, Mail, Maximize2, MessageCircle, Search } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const rooms = ref<AvailableRoom[]>([])
const loading = ref(false)
const error = ref('')

const filters = ref({
  complexName: '',
  maxPrice: undefined as number | undefined,
})

onMounted(() => {
  loadRooms()
})

async function loadRooms() {
  loading.value = true
  error.value = ''

  try {
    let query = supabase
      .from('available_rooms')
      .select('*')
      .eq('is_available', true)
      .order('monthly_rent_cents', { ascending: true })

    if (filters.value.complexName) {
      query = query.ilike('complex_name', `%${filters.value.complexName}%`)
    }

    if (filters.value.maxPrice) {
      query = query.lte('monthly_rent_cents', filters.value.maxPrice * 100)
    }

    const { data, error: apiError } = await query

    if (apiError) throw apiError

    rooms.value = data || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar salas'
    console.error('Erro:', err)
  } finally {
    loading.value = false
  }
}

function formatPrice(priceCents: number) {
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function getAmenityLabel(value: string) {
  const amenity = ROOM_AMENITIES.find((a) => a.value === value)
  return amenity ? `${amenity.icon} ${amenity.label}` : value
}
</script>

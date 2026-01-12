<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl"
      >
        <h2 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Editar Sala' : 'Nova Sala' }}
        </h2>
        <button
          @click="$emit('close')"
          class="w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center"
        >
          <X class="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Room Number & Floor -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"> Número da Sala * </label>
            <input
              v-model="formData.room_number"
              type="text"
              required
              placeholder="Ex: 101, A-23"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"> Andar </label>
            <input
              v-model="formData.floor"
              type="text"
              placeholder="Ex: 1º, 2º, Térreo"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <!-- Size & Price -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"> Tamanho (m²) </label>
            <input
              v-model.number="formData.size_sqm"
              type="number"
              min="1"
              step="0.01"
              placeholder="Ex: 25.5"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Aluguel Mensal (R$) *
            </label>
            <input
              v-model="rentDisplay"
              @input="handleRentInput"
              type="text"
              required
              placeholder="R$ 0,00"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> Descrição </label>
          <textarea
            v-model="formData.description"
            rows="4"
            placeholder="Descreva as características da sala..."
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
          ></textarea>
        </div>

        <!-- Amenities -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3"> Comodidades </label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label
              v-for="amenity in ROOM_AMENITIES"
              :key="amenity.value"
              class="relative flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
              :class="
                formData.amenities?.includes(amenity.value)
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-white'
              "
            >
              <input
                type="checkbox"
                :value="amenity.value"
                v-model="formData.amenities"
                class="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
              />
              <span class="text-sm font-medium text-gray-700">
                {{ amenity.icon }} {{ amenity.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- Photo URL -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> URL da Foto </label>
          <input
            v-model="formData.photo_url"
            type="url"
            placeholder="https://exemplo.com/foto.jpg"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
          />
          <p class="text-xs text-gray-500 mt-1">
            Cole o link de uma imagem hospedada (ex: Imgur, Google Drive)
          </p>
        </div>

        <!-- Contact Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"> Telefone </label>
            <input
              v-model="formData.contact_phone"
              type="tel"
              placeholder="(85) 99999-9999"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"> E-mail </label>
            <input
              v-model="formData.contact_email"
              type="email"
              placeholder="contato@exemplo.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
        >
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{{ isEditing ? 'Salvar' : 'Criar Sala' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ROOM_AMENITIES, type AvailableRoom, type CreateRoomData } from '@/types'
import { X } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  room?: AvailableRoom | null
  complexId: string
  complexName: string
}>()

const emit = defineEmits<{
  close: []
  save: [data: CreateRoomData]
}>()

const isEditing = computed(() => !!props.room)

const formData = ref<CreateRoomData>({
  complex_id: props.complexId,
  complex_name: props.complexName,
  room_number: '',
  floor: '',
  size_sqm: undefined,
  monthly_rent_cents: 0,
  description: '',
  amenities: [],
  photo_url: '',
  contact_phone: '',
  contact_email: '',
})

const rentDisplay = ref('')
const submitting = ref(false)
const errorMessage = ref('')

onMounted(() => {
  if (props.room) {
    formData.value = {
      complex_id: props.room.complex_id,
      complex_name: props.room.complex_name,
      room_number: props.room.room_number,
      floor: props.room.floor || '',
      size_sqm: props.room.size_sqm,
      monthly_rent_cents: props.room.monthly_rent_cents,
      description: props.room.description || '',
      amenities: props.room.amenities || [],
      photo_url: props.room.photo_url || '',
      contact_phone: props.room.contact_phone || '',
      contact_email: props.room.contact_email || '',
    }
    rentDisplay.value = formatCurrency(props.room.monthly_rent_cents / 100)
  }
})

function handleRentInput(event: Event) {
  const input = (event.target as HTMLInputElement).value
  const numbers = input.replace(/\D/g, '')
  const value = parseInt(numbers) / 100

  if (!isNaN(value)) {
    formData.value.monthly_rent_cents = Math.round(value * 100)
    rentDisplay.value = formatCurrency(value)
  }
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    if (!formData.value.room_number.trim()) {
      throw new Error('Número da sala é obrigatório')
    }

    if (formData.value.monthly_rent_cents <= 0) {
      throw new Error('Valor do aluguel deve ser maior que zero')
    }

    emit('save', formData.value)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Erro ao salvar sala'
  } finally {
    submitting.value = false
  }
}
</script>

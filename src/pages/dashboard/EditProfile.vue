<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-4 max-w-5xl">
      <div class="mb-8">
        <Button variant="ghost" @click="$router.push('/dashboard')" class="mb-4">
          ← Voltar para Dashboard
        </Button>
        <h1 class="text-3xl font-bold mb-2">Editar Perfil</h1>
        <p class="text-gray-600">Mantenha suas informações sempre atualizadas</p>
      </div>

      <div v-if="loadingProfile" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>

      <div v-else class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <form @submit.prevent="saveProfile" class="space-y-8">
            <div>
              <h2 class="text-xl font-semibold mb-4">Informações Básicas</h2>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium block mb-2">Nome Completo *</label>
                    <Input
                      v-model="profileForm.name"
                      placeholder="Seu nome completo"
                      required
                      :disabled="saving"
                    />
                  </div>

                  <div>
                    <label class="text-sm font-medium block mb-2">Telefone *</label>
                    <Input
                      v-model="profileForm.phone"
                      placeholder="(85) 99999-9999"
                      required
                      :disabled="saving"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium block mb-2">Categoria *</label>
                    <Input
                      v-model="profileForm.category"
                      placeholder="Ex: Dentista, Médico, Advogado, Contador..."
                      required
                      :disabled="saving"
                      list="category-suggestions"
                    />
                    <datalist id="category-suggestions">
                      <option value="Dentista"></option>
                      <option value="Médico"></option>
                      <option value="Psicólogo"></option>
                      <option value="Nutricionista"></option>
                      <option value="Fisioterapeuta"></option>
                      <option value="Advogado"></option>
                      <option value="Despachante"></option>
                      <option value="Contador"></option>
                      <option value="Consultor Financeiro"></option>
                      <option value="Arquiteto"></option>
                      <option value="Engenheiro Civil"></option>
                      <option value="Designer de Interiores"></option>
                      <option value="Esteticista"></option>
                      <option value="Dermatologista"></option>
                      <option value="Professor Particular"></option>
                      <option value="Psicopedagogo"></option>
                      <option value="Consultor TI"></option>
                      <option value="Desenvolvedor"></option>
                      <option value="Coach"></option>
                      <option value="Consultor RH"></option>
                    </datalist>
                    <p class="text-xs text-gray-500 mt-1">
                      Digite sua profissão ou escolha uma sugestão
                    </p>
                  </div>

                  <div>
                    <label class="text-sm font-medium block mb-2">Especialidade</label>
                    <Input
                      v-model="profileForm.specialty"
                      placeholder="Ex: Ortodontia, Direito Civil, etc."
                      :disabled="saving"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200"></div>

            <div>
              <h2 class="text-xl font-semibold mb-4">Descrição Profissional</h2>
              <div>
                <label class="text-sm font-medium block mb-2">Sobre você e seus serviços</label>
                <textarea
                  v-model="profileForm.description"
                  class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows="5"
                  placeholder="Conte um pouco sobre você, sua experiência, diferenciais e como você pode ajudar seus clientes..."
                  :disabled="saving"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Uma boa descrição ajuda seus clientes a conhecerem melhor seu trabalho
                </p>
              </div>
            </div>

            <div class="border-t border-gray-200"></div>

            <div>
              <h2 class="text-xl font-semibold mb-4">Localização</h2>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium block mb-2">Cidade *</label>
                    <Select
                      v-model="profileForm.city"
                      :disabled="saving"
                      @update:model-value="loadComplexesByCity"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fortaleza">Fortaleza</SelectItem>
                        <SelectItem value="Caucaia">Caucaia</SelectItem>
                        <SelectItem value="Maracanaú">Maracanaú</SelectItem>
                        <SelectItem value="Sobral">Sobral</SelectItem>
                        <SelectItem value="Juazeiro do Norte">Juazeiro do Norte</SelectItem>
                        <SelectItem value="Crato">Crato</SelectItem>
                        <SelectItem value="Itapipoca">Itapipoca</SelectItem>
                        <SelectItem value="Maranguape">Maranguape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label class="text-sm font-medium block mb-2">Complexo/Edifício</label>
                    <Select
                      v-model="profileForm.complex_name"
                      :disabled="saving || loadingComplexes || !profileForm.city"
                      @update:model-value="onComplexChange"
                    >
                      <SelectTrigger>
                        <SelectValue
                          :placeholder="
                            loadingComplexes
                              ? 'Carregando...'
                              : !profileForm.city
                                ? 'Selecione uma cidade primeiro'
                                : 'Selecione o complexo'
                          "
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum (deixar em branco)</SelectItem>
                        <SelectItem
                          v-for="complex in availableComplexes"
                          :key="complex.id"
                          :value="complex.name"
                        >
                          {{ complex.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p class="text-xs text-gray-500 mt-1">
                      {{
                        availableComplexes.length > 0
                          ? `${availableComplexes.length} ${availableComplexes.length === 1 ? 'complexo disponível' : 'complexos disponíveis'}`
                          : profileForm.city
                            ? 'Nenhum complexo cadastrado nesta cidade'
                            : 'Selecione uma cidade para ver os complexos'
                      }}
                    </p>
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium block mb-2">Endereço Completo *</label>
                  <Input
                    v-model="profileForm.address"
                    placeholder="Rua, número, sala/andar, bairro"
                    required
                    :disabled="saving"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Seja específico para facilitar a localização dos seus clientes
                  </p>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200"></div>

            <div>
              <h2 class="text-xl font-semibold mb-4">Configurações de Atendimento</h2>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium block mb-2">Faixa de Preço *</label>
                    <Select v-model="profileForm.price_range" :disabled="saving">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50-100">R$ 50 - R$ 100</SelectItem>
                        <SelectItem value="100-200">R$ 100 - R$ 200</SelectItem>
                        <SelectItem value="200-300">R$ 200 - R$ 300</SelectItem>
                        <SelectItem value="300-500">R$ 300 - R$ 500</SelectItem>
                        <SelectItem value="500+">R$ 500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label class="text-sm font-medium block mb-2">Tempo de Resposta</label>
                    <Select v-model="profileForm.response_time" :disabled="saving">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tempo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">⚡ Rápido (até 2h)</SelectItem>
                        <SelectItem value="medium">🕐 Normal (até 24h)</SelectItem>
                        <SelectItem value="slow">🕑 Flexível (até 48h)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    id="accepts_urgent"
                    type="checkbox"
                    v-model="profileForm.accepts_urgent"
                    :disabled="saving"
                    class="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500"
                  />
                  <label for="accepts_urgent" class="text-sm font-medium text-gray-900">
                    🚨 Aceito atendimentos urgentes
                  </label>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200"></div>

            <div>
              <h2 class="text-xl font-semibold mb-4">Localização no Mapa</h2>

              <!-- Aviso quando complexo está selecionado - SEM MAPA -->
              <div
                v-if="isComplexSelected"
                class="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <p class="text-sm text-blue-800 font-medium mb-2">
                  📍 Localização automática do complexo
                  <strong>{{ profileForm.complex_name }}</strong>
                </p>
                <p class="text-xs text-blue-600">
                  A localização é definida pelo complexo e não pode ser alterada. Para usar uma
                  localização personalizada, selecione "Nenhum" no campo de complexo.
                </p>
              </div>

              <!-- Mapa normal quando não há complexo -->
              <div v-else class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-800 mb-3">
                  📍 Clique no mapa para marcar a localização exata da sua sala/consultório
                </p>
                <div
                  v-if="location.latitude && location.longitude"
                  class="mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm"
                >
                  <span class="font-medium text-green-800">✓ Localização marcada:</span>
                  <span class="text-green-700 ml-2">
                    {{ location.latitude.toFixed(6) }}, {{ location.longitude.toFixed(6) }}
                  </span>
                </div>
                <MapPicker
                  v-model="location"
                  :initialCenter="{
                    lat: location.latitude || -3.7327,
                    lng: location.longitude || -38.527,
                  }"
                />
              </div>
            </div>

            <div class="border-t border-gray-200"></div>

            <div class="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <h3 class="font-semibold text-gray-900">Salvar Alterações</h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ hasChanges ? 'Você tem alterações não salvas' : 'Nenhuma alteração pendente' }}
                </p>
              </div>
              <Button
                type="submit"
                :disabled="saving || !hasChanges"
                class="bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400 min-w-[160px]"
              >
                {{ saving ? 'Salvando...' : 'Salvar Perfil' }}
              </Button>
            </div>

            <div
              v-if="showSuccessMessage"
              class="bg-green-50 border border-green-200 rounded-lg p-3 text-center"
            >
              <div class="text-green-600 font-medium">✅ Perfil atualizado com sucesso!</div>
            </div>

            <div
              v-if="profileError"
              class="bg-red-50 border border-red-200 rounded-lg p-3 text-center"
            >
              <div class="text-red-600 font-medium">❌ {{ profileError }}</div>
            </div>
          </form>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-semibold">Fotos da Sala</h2>
              <p class="text-gray-600 text-sm mt-1">
                {{ photos.length }} de {{ MAX_PHOTOS }} fotos • {{ photosRemaining }} restante(s)
              </p>
            </div>
            <div v-if="!canAddMorePhotos" class="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle class="w-4 h-4" />
              Limite atingido
            </div>
          </div>

          <div
            v-if="canAddMorePhotos"
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-gray-400 transition-colors"
            :class="{
              'opacity-50 cursor-not-allowed': uploading || compressing,
              'cursor-pointer': !uploading && !compressing,
            }"
            @click="triggerFileInput"
          >
            <Upload class="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p class="text-gray-600 mb-2">
              {{
                compressing
                  ? 'Comprimindo imagens...'
                  : 'Clique para adicionar fotos ou arraste aqui'
              }}
            </p>
            <p class="text-sm text-gray-500 mb-4">PNG, JPG até 5MB • Será comprimido para ~0.8MB</p>

            <div v-if="compressing" class="w-full max-w-xs mx-auto mb-4">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-rose-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${compressionProgress}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ compressionProgress }}% concluído</p>
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              @change="handleFileUpload"
              class="hidden"
              ref="fileInputRef"
              :disabled="uploading || compressing"
            />
            <Button type="button" variant="outline" :disabled="uploading || compressing">
              <Camera class="w-4 h-4 mr-2" />
              {{ compressing ? 'Comprimindo...' : uploading ? 'Enviando...' : 'Escolher Fotos' }}
            </Button>
          </div>

          <div v-else class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p class="text-amber-800 text-sm">
              Você atingiu o limite de {{ MAX_PHOTOS }} fotos. Remova uma foto para adicionar outra.
            </p>
          </div>

          <div v-if="photos.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(photo, index) in photos" :key="photo.id" class="relative group">
              <img
                :src="getPhotoUrl(photo)"
                :alt="`Foto ${index + 1}`"
                class="w-full aspect-video object-cover rounded-lg"
                loading="lazy"
              />

              <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2"
              >
                <Button
                  size="sm"
                  variant="outline"
                  @click="setMainPhoto(photo.id)"
                  v-if="!photo.is_primary"
                  class="bg-white/90 text-gray-900 hover:bg-white"
                  type="button"
                  :disabled="updatingPhotos"
                >
                  <Star class="w-4 h-4 mr-1" />
                  Principal
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  @click="removePhoto(photo.id)"
                  class="bg-red-500/90 hover:bg-red-600"
                  type="button"
                  :disabled="updatingPhotos"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>

              <div v-if="photo.is_primary" class="absolute top-2 left-2">
                <span
                  class="bg-rose-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                >
                  <Star class="w-3 h-3 fill-current" />
                  Principal
                </span>
              </div>
            </div>
          </div>

          <div v-if="photos.length === 0 && !uploading && !compressing" class="text-center py-8">
            <Camera class="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p class="text-gray-600">Nenhuma foto adicionada ainda</p>
            <p class="text-sm text-gray-500">
              Adicione até {{ MAX_PHOTOS }} fotos para deixar seu perfil mais atrativo
            </p>
          </div>

          <div v-if="photoError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div class="text-red-600 text-sm">❌ {{ photoError }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MapPicker from '@/components/maps/MapPicker.vue'
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
import { useAuthStore } from '@/stores/auth'
import type { ProfessionalPhoto } from '@/types'
import imageCompression from 'browser-image-compression'
import { AlertCircle, Camera, Star, Trash2, Upload } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const MAX_PHOTOS = 3
const MAX_FILE_SIZE_MB = 5
const TARGET_COMPRESSED_SIZE_MB = 0.8

const profileError = ref<string | null>(null)
const photoError = ref<string | null>(null)

const loadingProfile = ref(true)
const saving = ref(false)
const uploading = ref(false)
const updatingPhotos = ref(false)
const compressing = ref(false)
const showSuccessMessage = ref(false)
const photos = ref<ProfessionalPhoto[]>([])
const fileInputRef = ref<HTMLInputElement>()
const compressionProgress = ref(0)

// Lista de complexos disponíveis
const availableComplexes = ref<
  Array<{
    id: string
    name: string
    city: string
    latitude: number | null
    longitude: number | null
  }>
>([])
const loadingComplexes = ref(false)

interface OriginalFormState {
  name?: string
  phone?: string
  category?: string
  specialty?: string
  description?: string
  complex_name?: string
  address?: string
  city?: string
  price_range?: string
  response_time?: 'fast' | 'medium' | 'slow'
  accepts_urgent?: boolean
  latitude?: number | null
  longitude?: number | null
}

const originalProfileForm = ref<OriginalFormState>({})

const profileForm = reactive({
  name: '',
  phone: '',
  category: '',
  specialty: '',
  description: '',
  complex_name: 'none',
  address: '',
  city: '',
  price_range: '',
  response_time: 'medium' as 'fast' | 'medium' | 'slow',
  accepts_urgent: false,
})

const location = ref<{ latitude: number | null; longitude: number | null }>({
  latitude: null,
  longitude: null,
})

const isComplexSelected = computed(() => {
  return profileForm.complex_name !== 'none' && profileForm.complex_name !== ''
})

const hasChanges = computed(() => {
  const formChanged = JSON.stringify(profileForm) !== JSON.stringify(originalProfileForm.value)
  const locationChanged =
    location.value.latitude !== originalProfileForm.value.latitude ||
    location.value.longitude !== originalProfileForm.value.longitude

  return formChanged || locationChanged
})

const canAddMorePhotos = computed(() => photos.value.length < MAX_PHOTOS)
const photosRemaining = computed(() => MAX_PHOTOS - photos.value.length)

async function loadComplexesByCity() {
  if (!profileForm.city) {
    availableComplexes.value = []
    return
  }

  loadingComplexes.value = true

  try {
    const { data, error } = await supabase
      .from('complexes')
      .select('id, name, city, latitude, longitude')
      .eq('city', profileForm.city)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error

    availableComplexes.value = data || []

    // Se o complexo atual não está na lista da nova cidade, limpar
    if (
      profileForm.complex_name &&
      profileForm.complex_name !== 'none' &&
      !availableComplexes.value.find((c) => c.name === profileForm.complex_name)
    ) {
      profileForm.complex_name = 'none'
      // Restaurar localização manual se havia
      if (
        originalProfileForm.value.complex_name === '' ||
        originalProfileForm.value.complex_name === 'none'
      ) {
        location.value = {
          latitude: originalProfileForm.value.latitude || null,
          longitude: originalProfileForm.value.longitude || null,
        }
      }
    }
  } catch (err) {
    console.error('Erro ao carregar complexos:', err)
    availableComplexes.value = []
  } finally {
    loadingComplexes.value = false
  }
}

async function onComplexChange(complexName: any) {
  // Handle null value
  if (complexName === null) {
    complexName = 'none'
  }

  if (complexName === 'none' || !complexName) {
    // Restaurar localização manual original ou limpar
    if (
      originalProfileForm.value.complex_name === '' ||
      originalProfileForm.value.complex_name === 'none'
    ) {
      location.value = {
        latitude: originalProfileForm.value.latitude || null,
        longitude: originalProfileForm.value.longitude || null,
      }
    } else {
      location.value = {
        latitude: null,
        longitude: null,
      }
    }
    // Forçar re-render do mapa
    return
  }

  // Buscar localização do complexo selecionado
  const selectedComplex = availableComplexes.value.find((c) => c.name === complexName)

  if (selectedComplex && selectedComplex.latitude && selectedComplex.longitude) {
    location.value = {
      latitude: selectedComplex.latitude,
      longitude: selectedComplex.longitude,
    }
    // Forçar re-render do mapa com a nova localização
  }
}
async function loadCurrentProfile() {
  if (!authStore.user?.id) {
    router.push('/login')
    return
  }

  loadingProfile.value = true
  profileError.value = null

  try {
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', authStore.user.id)
      .single()

    if (profError) {
      if (profError.code === 'PGRST116') {
        await createProfessionalProfile()
        return
      }
      throw profError
    }

    Object.assign(profileForm, {
      name: professional.name || '',
      phone: professional.phone || '',
      category: professional.category || '',
      specialty: professional.specialty || '',
      description: professional.description || '',
      complex_name: professional.complex_name || 'none',
      address: professional.address || '',
      city: professional.city || '',
      price_range: professional.price_range || '',
      response_time: professional.response_time || 'medium',
      accepts_urgent: professional.accepts_urgent || false,
    })

    location.value = {
      latitude: professional.latitude || null,
      longitude: professional.longitude || null,
    }

    originalProfileForm.value = {
      ...profileForm,
      latitude: professional.latitude,
      longitude: professional.longitude,
    }

    await loadPhotos(professional.id)

    // Carregar complexos da cidade selecionada
    if (professional.city) {
      await loadComplexesByCity()
    }
  } catch (err) {
    console.error('Erro ao carregar perfil:', err)
    profileError.value = err instanceof Error ? err.message : 'Erro ao carregar perfil'
  } finally {
    loadingProfile.value = false
  }
}

async function createProfessionalProfile() {
  try {
    const { error } = await supabase
      .from('professionals')
      .insert({
        user_id: authStore.user!.id,
        email: authStore.user!.email,
        name: authStore.user?.user_metadata?.name || '',
        phone: '',
        category: '',
        city: 'Fortaleza',
        address: '',
        price_range: '100-200',
        description: '',
        is_active: false,
      })
      .select()
      .single()

    if (error) throw error
    await loadCurrentProfile()
  } catch (err) {
    console.error('Erro ao criar perfil:', err)
    profileError.value = 'Erro ao criar perfil de profissional'
  }
}

async function loadPhotos(professionalId: string) {
  try {
    const { data, error } = await supabase
      .from('professional_photos')
      .select('*')
      .eq('professional_id', professionalId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw error
    photos.value = data || []
  } catch (err) {
    console.error('Erro ao carregar fotos:', err)
  }
}

async function saveProfile() {
  if (!authStore.user?.id) return

  saving.value = true
  profileError.value = null
  showSuccessMessage.value = false

  try {
    // Converte "none" para string vazia ao salvar
    const complexNameToSave = profileForm.complex_name === 'none' ? '' : profileForm.complex_name

    const { error: updateError } = await supabase
      .from('professionals')
      .update({
        name: profileForm.name,
        phone: profileForm.phone,
        category: profileForm.category,
        specialty: profileForm.specialty,
        description: profileForm.description,
        complex_name: complexNameToSave,
        address: profileForm.address,
        city: profileForm.city,
        price_range: profileForm.price_range,
        response_time: profileForm.response_time,
        accepts_urgent: profileForm.accepts_urgent,
        latitude: location.value.latitude,
        longitude: location.value.longitude,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', authStore.user.id)

    if (updateError) throw updateError

    originalProfileForm.value = {
      ...profileForm,
      latitude: location.value.latitude,
      longitude: location.value.longitude,
    }

    showSuccessMessage.value = true

    setTimeout(() => {
      showSuccessMessage.value = false
    }, 5000)
  } catch (err) {
    console.error('Erro ao salvar perfil:', err)
    profileError.value = err instanceof Error ? err.message : 'Erro ao salvar perfil'
  } finally {
    saving.value = false
  }
}

function triggerFileInput() {
  if (!uploading.value && !compressing.value && canAddMorePhotos.value) {
    fileInputRef.value?.click()
  }
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || !authStore.user?.id) return

  const availableSlots = MAX_PHOTOS - photos.value.length
  if (availableSlots === 0) {
    photoError.value = `Limite de ${MAX_PHOTOS} fotos atingido. Remova uma foto antes de adicionar outra.`
    target.value = ''
    return
  }

  const filesToUpload = Array.from(files).slice(0, availableSlots)

  if (files.length > availableSlots) {
    photoError.value = `Você só pode adicionar mais ${availableSlots} foto(s). As outras foram ignoradas.`
  }

  compressing.value = true
  uploading.value = true
  photoError.value = null
  compressionProgress.value = 0

  try {
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', authStore.user.id)
      .single()

    if (profError) throw profError

    const professionalId = professional.id
    const totalFiles = filesToUpload.length

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      compressionProgress.value = Math.round((i / totalFiles) * 100)

      if (!file.type.startsWith('image/')) {
        console.warn(`Arquivo ${file.name} não é uma imagem válida.`)
        continue
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
        photoError.value = `A imagem "${file.name}" é muito grande (${fileSizeMB}MB). O tamanho máximo permitido é ${MAX_FILE_SIZE_MB}MB.`
        continue
      }

      const options = {
        maxSizeMB: TARGET_COMPRESSED_SIZE_MB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: 0.8,
      }

      const compressedFile = await imageCompression(file, options)

      const fileExt = file.name.split('.').pop()
      const fileName = `${professionalId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('professional-photos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('professional-photos').getPublicUrl(fileName)
      const { data: photoData, error: insertPhotoError } = await supabase
        .from('professional_photos')
        .insert({
          professional_id: professionalId,
          photo_url: urlData.publicUrl,
          is_primary: photos.value.length === 0,
        })
        .select()
        .single()

      if (insertPhotoError) throw insertPhotoError

      photos.value.push(photoData)
    }

    compressionProgress.value = 100
  } catch (err) {
    console.error('Erro no upload:', err)
    photoError.value = err instanceof Error ? err.message : 'Erro ao fazer upload das fotos'
  } finally {
    compressing.value = false
    uploading.value = false
    compressionProgress.value = 0
    if (target) target.value = ''
  }
}

function getPhotoUrl(photo: ProfessionalPhoto): string {
  return photo.photo_url
}

async function setMainPhoto(photoId: string) {
  if (!authStore.user?.id) return

  updatingPhotos.value = true

  try {
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', authStore.user.id)
      .single()

    if (profError) throw profError

    await supabase
      .from('professional_photos')
      .update({ is_primary: false })
      .eq('professional_id', professional.id)

    const { error: updateError } = await supabase
      .from('professional_photos')
      .update({ is_primary: true })
      .eq('id', photoId)

    if (updateError) throw updateError

    photos.value.forEach((photo) => {
      photo.is_primary = photo.id === photoId
    })
  } catch (err) {
    console.error('Erro ao definir foto principal:', err)
    photoError.value = 'Erro ao definir foto principal'
  } finally {
    updatingPhotos.value = false
  }
}

async function removePhoto(photoId: string) {
  if (!confirm('Tem certeza que deseja remover esta foto?')) return

  updatingPhotos.value = true
  photoError.value = null

  try {
    const photoToRemove = photos.value.find((p) => p.id === photoId)
    if (!photoToRemove) return

    try {
      const url = new URL(photoToRemove.photo_url)
      const pathSegments = url.pathname.split('/')
      const bucketIndex = pathSegments.indexOf('professional-photos')
      if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
        const filePath = pathSegments.slice(bucketIndex + 1).join('/')
        await supabase.storage.from('professional-photos').remove([filePath])
      }
    } catch (storageError) {
      console.warn('Erro ao deletar do storage:', storageError)
    }

    const { error } = await supabase.from('professional_photos').delete().eq('id', photoId)

    if (error) throw error

    const removedIndex = photos.value.findIndex((p) => p.id === photoId)
    const wasMain = photos.value[removedIndex].is_primary
    photos.value.splice(removedIndex, 1)

    if (wasMain && photos.value.length > 0) {
      await setMainPhoto(photos.value[0].id)
    }
  } catch (err) {
    console.error('Erro ao remover foto:', err)
    photoError.value = 'Erro ao remover foto'
  } finally {
    updatingPhotos.value = false
  }
}

watch(
  [profileForm, location],
  () => {
    profileError.value = null
    showSuccessMessage.value = false
  },
  { deep: true },
)

watch(
  photos,
  () => {
    photoError.value = null
  },
  { deep: true },
)

onMounted(() => {
  loadCurrentProfile()
})
</script>

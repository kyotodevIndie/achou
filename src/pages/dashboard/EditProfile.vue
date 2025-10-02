<!-- src/pages/dashboard/EditProfile.vue - VERSÃO COMPLETA COM COMPRESSÃO -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-4">
      <div class="mb-6">
        <Button variant="ghost" @click="$router.push('/dashboard')" class="mb-4">
          ← Voltar para Dashboard
        </Button>

        <h1 class="text-3xl font-bold mb-2">Editar Perfil</h1>
        <p class="text-gray-600">Mantenha suas informações sempre atualizadas</p>
      </div>

      <!-- Loading inicial -->
      <div v-if="loadingProfile" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>

      <div v-else class="max-w-4xl mx-auto space-y-8">
        <!-- Informações Básicas -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xl font-semibold mb-6">Informações Básicas</h2>

          <form @submit.prevent="saveProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="text-sm font-medium block mb-2">Nome Completo</label>
                <Input
                  v-model="profileForm.name"
                  placeholder="Seu nome completo"
                  required
                  :disabled="saving"
                />
              </div>

              <div>
                <label class="text-sm font-medium block mb-2">Telefone</label>
                <Input
                  v-model="profileForm.phone"
                  placeholder="(85) 99999-9999"
                  required
                  :disabled="saving"
                />
              </div>
            </div>

            <!-- Seletor de Localização no Mapa -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <MapPicker v-model="location" :initialCenter="{ lat: -3.7327, lng: -38.527 }" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="text-sm font-medium block mb-2">Categoria</label>
                <Select v-model="profileForm.category" :disabled="saving">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua profissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dentista">🦷 Dentista</SelectItem>
                    <SelectItem value="medico">👨‍⚕️ Médico</SelectItem>
                    <SelectItem value="psicologo">🧠 Psicólogo</SelectItem>
                    <SelectItem value="nutricionista">🥗 Nutricionista</SelectItem>
                    <SelectItem value="fisioterapeuta">💪 Fisioterapeuta</SelectItem>
                    <SelectItem value="advogado">⚖️ Advogado</SelectItem>
                    <SelectItem value="despachante">📋 Despachante</SelectItem>
                    <SelectItem value="contador">💼 Contador</SelectItem>
                    <SelectItem value="consultor-financeiro">💰 Consultor Financeiro</SelectItem>
                    <SelectItem value="arquiteto">🗂️ Arquiteto</SelectItem>
                    <SelectItem value="engenheiro">👷‍♂️ Engenheiro Civil</SelectItem>
                    <SelectItem value="designer">🎨 Designer de Interiores</SelectItem>
                    <SelectItem value="esteticista">💅 Esteticista</SelectItem>
                    <SelectItem value="dermatologista">👩‍⚕️ Dermatologista</SelectItem>
                    <SelectItem value="professor">📚 Professor Particular</SelectItem>
                    <SelectItem value="psicopedagogo">🎓 Psicopedagogo</SelectItem>
                    <SelectItem value="consultor-ti">💻 Consultor TI</SelectItem>
                    <SelectItem value="desenvolvedor">⌨️ Desenvolvedor</SelectItem>
                    <SelectItem value="coach">🎯 Coach</SelectItem>
                    <SelectItem value="consultor-rh">👥 Consultor RH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label class="text-sm font-medium block mb-2">Especialidade (opcional)</label>
                <Input
                  v-model="profileForm.specialty"
                  placeholder="Ex: Ortodontia, Direito Civil, etc."
                  :disabled="saving"
                />
              </div>
            </div>

            <div>
              <label class="text-sm font-medium block mb-2">Descrição</label>
              <textarea
                v-model="profileForm.description"
                class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows="4"
                placeholder="Conte um pouco sobre você e seus serviços..."
                :disabled="saving"
              />
            </div>

            <!-- Localização da Sala Comercial -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                🏢 Localização da Sala Comercial
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium block mb-2">Nome do Complexo/Edifício</label>
                  <Input
                    v-model="profileForm.complex_name"
                    placeholder="Ex: Edifício Empresarial Central"
                    :disabled="saving"
                  />
                  <p class="text-xs text-blue-600 mt-1">
                    Isso ajuda clientes a te encontrarem mais facilmente
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium block mb-2">Endereço Completo</label>
                  <Input
                    v-model="profileForm.address"
                    placeholder="Rua, número, sala/andar, bairro"
                    required
                    :disabled="saving"
                  />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="text-sm font-medium block mb-2">Cidade</label>
                <Select v-model="profileForm.city" :disabled="saving">
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
                <label class="text-sm font-medium block mb-2">Faixa de Preço</label>
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
            </div>

            <!-- Configurações Adicionais -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Configurações do Atendimento</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div class="flex items-center gap-3">
                  <input
                    id="accepts_urgent"
                    type="checkbox"
                    v-model="profileForm.accepts_urgent"
                    :disabled="saving"
                    class="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500"
                  />
                  <label for="accepts_urgent" class="text-sm font-medium text-gray-900">
                    Aceito atendimentos urgentes
                  </label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              :disabled="saving || !hasChanges"
              class="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400"
            >
              {{ saving ? 'Salvando...' : 'Salvar Informações' }}
            </Button>

            <!-- Feedback de sucesso -->
            <div
              v-if="showSuccessMessage"
              class="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
            >
              <div class="text-green-600 font-medium">✅ Perfil atualizado com sucesso!</div>
            </div>

            <!-- Feedback de erro -->
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div class="text-red-600 font-medium">❌ {{ error }}</div>
            </div>
          </form>
        </div>

        <!-- Fotos da Sala -->
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

          <!-- Upload de Fotos -->
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

            <!-- Progress bar durante compressão -->
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

          <!-- Mensagem quando limite atingido -->
          <div v-else class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p class="text-amber-800 text-sm">
              Você atingiu o limite de {{ MAX_PHOTOS }} fotos. Remova uma foto para adicionar outra.
            </p>
          </div>

          <!-- Grid de Fotos -->
          <div v-if="photos.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(photo, index) in photos" :key="photo.id" class="relative group">
              <img
                :src="getPhotoUrl(photo)"
                :alt="`Foto ${index + 1}`"
                class="w-full aspect-video object-cover rounded-lg"
                loading="lazy"
              />

              <!-- Overlay -->
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

              <!-- Badge Foto Principal -->
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

          <!-- Nenhuma foto -->
          <div v-if="photos.length === 0 && !uploading && !compressing" class="text-center py-8">
            <Camera class="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p class="text-gray-600">Nenhuma foto adicionada ainda</p>
            <p class="text-sm text-gray-500">
              Adicione até {{ MAX_PHOTOS }} fotos para deixar seu perfil mais atrativo
            </p>
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
import type { Professional, ProfessionalPhoto } from '@/types'
import imageCompression from 'browser-image-compression'
import { AlertCircle, Camera, Star, Trash2, Upload } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

// Constantes
const MAX_PHOTOS = 3
const MAX_FILE_SIZE_MB = 5 // Tamanho máximo do arquivo original
const TARGET_COMPRESSED_SIZE_MB = 0.8 // Tamanho alvo após compressão

// Estados
const loadingProfile = ref(true)
const saving = ref(false)
const uploading = ref(false)
const updatingPhotos = ref(false)
const compressing = ref(false)
const error = ref<string | null>(null)
const showSuccessMessage = ref(false)
const photos = ref<ProfessionalPhoto[]>([])
const fileInputRef = ref<HTMLInputElement>()
const compressionProgress = ref(0)

const originalProfileForm = ref<Partial<Professional>>({})

const profileForm = reactive({
  name: '',
  phone: '',
  category: '',
  specialty: '',
  description: '',
  complex_name: '',
  address: '',
  city: '',
  price_range: '',
  response_time: 'medium' as 'fast' | 'medium' | 'slow',
  accepts_urgent: false,
})

// Estado para localização no mapa
const location = ref<{ latitude: number | null; longitude: number | null }>({
  latitude: null,
  longitude: null,
})

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(profileForm) !== JSON.stringify(originalProfileForm.value)
})

const canAddMorePhotos = computed(() => photos.value.length < MAX_PHOTOS)
const photosRemaining = computed(() => MAX_PHOTOS - photos.value.length)

async function loadCurrentProfile() {
  if (!authStore.user?.id) {
    router.push('/login')
    return
  }

  loadingProfile.value = true
  error.value = null

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
      complex_name: professional.complex_name || '',
      address: professional.address || '',
      city: professional.city || '',
      price_range: professional.price_range || '',
      response_time: professional.response_time || 'medium',
      accepts_urgent: professional.accepts_urgent || false,
    })

    // Carregar coordenadas do mapa
    location.value = {
      latitude: professional.latitude || null,
      longitude: professional.longitude || null,
    }

    originalProfileForm.value = { ...profileForm }
    await loadPhotos(professional.id)
  } catch (err) {
    console.error('Erro ao carregar perfil:', err)
    error.value = err instanceof Error ? err.message : 'Erro ao carregar perfil'
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
    error.value = 'Erro ao criar perfil de profissional'
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
  error.value = null
  showSuccessMessage.value = false

  try {
    const { error: updateError } = await supabase
      .from('professionals')
      .update({
        name: profileForm.name,
        phone: profileForm.phone,
        category: profileForm.category,
        specialty: profileForm.specialty,
        description: profileForm.description,
        complex_name: profileForm.complex_name,
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

    originalProfileForm.value = { ...profileForm }
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 5000)
  } catch (err) {
    console.error('Erro ao salvar perfil:', err)
    error.value = err instanceof Error ? err.message : 'Erro ao salvar perfil'
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
    error.value = `Limite de ${MAX_PHOTOS} fotos atingido. Remova uma foto antes de adicionar outra.`
    target.value = ''
    return
  }

  const filesToUpload = Array.from(files).slice(0, availableSlots)

  if (files.length > availableSlots) {
    error.value = `Você só pode adicionar mais ${availableSlots} foto(s). As outras foram ignoradas.`
  }

  compressing.value = true
  uploading.value = true
  error.value = null
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

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        console.warn(`Arquivo ${file.name} não é uma imagem válida.`)
        continue
      }

      // VALIDAR TAMANHO ORIGINAL - MÁXIMO 5MB
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
        error.value = `A imagem "${file.name}" é muito grande (${fileSizeMB}MB). O tamanho máximo permitido é ${MAX_FILE_SIZE_MB}MB.`
        continue
      }

      // Comprimir imagem para 0.8MB
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

      const { data: photoData, error: photoError } = await supabase
        .from('professional_photos')
        .insert({
          professional_id: professionalId,
          photo_url: urlData.publicUrl,
          is_primary: photos.value.length === 0,
        })
        .select()
        .single()

      if (photoError) throw photoError

      photos.value.push(photoData)
    }

    compressionProgress.value = 100
  } catch (err) {
    console.error('Erro no upload:', err)
    error.value = err instanceof Error ? err.message : 'Erro ao fazer upload das fotos'
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
    error.value = 'Erro ao definir foto principal'
  } finally {
    updatingPhotos.value = false
  }
}

async function removePhoto(photoId: string) {
  if (!confirm('Tem certeza que deseja remover esta foto?')) return

  updatingPhotos.value = true

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
    error.value = 'Erro ao remover foto'
  } finally {
    updatingPhotos.value = false
  }
}

watch(
  [profileForm],
  () => {
    error.value = null
    showSuccessMessage.value = false
  },
  { deep: true },
)

onMounted(() => {
  loadCurrentProfile()
})
</script>

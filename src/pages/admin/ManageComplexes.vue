<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div v-if="!isAuthorized" class="container mx-auto max-w-md mt-20">
      <div class="bg-white rounded-xl border border-red-200 p-8 text-center">
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Shield class="w-8 h-8 text-red-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
        <p class="text-gray-600 mb-6">Você não tem permissão para acessar esta página.</p>
        <Button @click="$router.push('/dashboard')" variant="outline">
          Voltar para Dashboard
        </Button>
      </div>
    </div>

    <div v-else class="container mx-auto max-w-4xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Gerenciar Complexos</h1>
        <p class="text-gray-600">Cadastre e gerencie complexos comerciais</p>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 class="text-xl font-semibold mb-6">
          {{ editingComplex ? 'Editar Complexo' : 'Cadastrar Novo Complexo' }}
        </h2>

        <form @submit.prevent="saveComplex" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium block mb-2">Nome do Complexo *</label>
              <Input
                v-model="form.name"
                placeholder="Ex: Edifício Empresarial Central"
                required
                :disabled="saving"
              />
            </div>

            <div>
              <label class="text-sm font-medium block mb-2">Cidade *</label>
              <Input
                v-model="form.city"
                placeholder="Ex: Fortaleza, São Paulo, Rio de Janeiro..."
                required
                :disabled="saving"
              />
              <p class="text-xs text-gray-500 mt-1">
                A cidade será preenchida automaticamente ao buscar o endereço no mapa
              </p>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">Endereço</label>
            <Input v-model="form.address" placeholder="Rua, número, bairro" :disabled="saving" />
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">Bairro</label>
            <Input v-model="form.neighborhood" placeholder="Ex: Aldeota" :disabled="saving" />
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">Descrição</label>
            <textarea
              v-model="form.description"
              class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              rows="3"
              placeholder="Informações adicionais sobre o complexo..."
              :disabled="saving"
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">Localização no Mapa *</label>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-sm text-blue-800 mb-3">
                📍 Clique no mapa para marcar a localização exata do complexo
              </p>
              <div
                v-if="complexLocation.latitude && complexLocation.longitude"
                class="mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm"
              >
                <span class="font-medium text-green-800">✓ Localização marcada:</span>
                <span class="text-green-700 ml-2">
                  {{ complexLocation.latitude.toFixed(6) }},
                  {{ complexLocation.longitude.toFixed(6) }}
                </span>
              </div>
              <MapPicker
                v-model="complexLocation"
                :initialCenter="getMapCenter()"
                :key="`map-${mapKey}`"
              />
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Esta localização será usada automaticamente quando profissionais selecionarem este
              complexo
            </p>
          </div>

          <div>
            <label class="text-sm font-medium block mb-2">Foto da Fachada</label>

            <div v-if="form.photo_url" class="mb-4">
              <div class="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  :src="form.photo_url"
                  alt="Foto do complexo"
                  class="w-full h-full object-cover"
                />
                <Button
                  @click="removePhoto"
                  variant="destructive"
                  size="sm"
                  class="absolute top-2 right-2"
                  type="button"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div
              v-else
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              :class="{ 'opacity-50 cursor-not-allowed': uploading }"
              @click="triggerFileInput"
            >
              <Upload class="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p class="text-gray-600 mb-2">
                {{ uploading ? 'Enviando...' : 'Clique para adicionar foto' }}
              </p>
              <p class="text-sm text-gray-500">PNG, JPG até 5MB</p>

              <input
                type="file"
                accept="image/*"
                @change="handlePhotoUpload"
                class="hidden"
                ref="fileInputRef"
                :disabled="uploading"
              />
            </div>
          </div>

          <div class="flex items-center gap-3">
            <input
              id="is_active"
              type="checkbox"
              v-model="form.is_active"
              :disabled="saving"
              class="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500"
            />
            <label for="is_active" class="text-sm font-medium">
              Complexo ativo (visível para profissionais)
            </label>
          </div>

          <div class="flex gap-3">
            <Button
              type="submit"
              :disabled="saving || uploading || !hasLocation"
              class="bg-rose-500 hover:bg-rose-600"
            >
              {{ saving ? 'Salvando...' : editingComplex ? 'Atualizar' : 'Cadastrar' }}
            </Button>

            <Button
              v-if="editingComplex"
              @click="cancelEdit"
              type="button"
              variant="outline"
              :disabled="saving"
            >
              Cancelar
            </Button>
          </div>

          <div v-if="!hasLocation" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p class="text-amber-800 text-sm">
              ⚠️ Por favor, marque a localização do complexo no mapa antes de salvar
            </p>
          </div>

          <div
            v-if="message"
            class="p-4 rounded-lg"
            :class="
              messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            "
          >
            {{ message }}
          </div>
        </form>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-6">Complexos Cadastrados</h2>

        <div v-if="loadingComplexes" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
        </div>

        <div v-else-if="complexes.length === 0" class="text-center py-8 text-gray-500">
          Nenhum complexo cadastrado ainda
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="complex in complexes"
            :key="complex.id"
            class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                v-if="complex.photo_url"
                :src="complex.photo_url"
                :alt="complex.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <Building2 class="w-8 h-8" />
              </div>
            </div>

            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{{ complex.name }}</h3>
              <p class="text-sm text-gray-600">{{ complex.city }}</p>
              <p v-if="complex.latitude && complex.longitude" class="text-xs text-gray-500 mt-1">
                📍 Lat: {{ complex.latitude.toFixed(4) }}, Lng: {{ complex.longitude.toFixed(4) }}
              </p>
              <span
                class="inline-block mt-1 text-xs px-2 py-1 rounded-full"
                :class="
                  complex.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                "
              >
                {{ complex.is_active ? 'Ativo' : 'Inativo' }}
              </span>
            </div>

            <div class="flex gap-2">
              <Button @click="editComplex(complex)" variant="outline" size="sm">
                <Edit class="w-4 h-4" />
              </Button>
              <Button @click="deleteComplex(complex.id)" variant="destructive" size="sm">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
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
import { supabase } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { Building2, Edit, Shield, Trash2, Upload } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const AUTHORIZED_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

const isAuthorized = computed(() => {
  const userEmail = authStore.user?.email
  return userEmail === AUTHORIZED_EMAIL
})

interface Complex {
  id: string
  name: string
  city: string
  address: string | null
  neighborhood: string | null
  photo_url: string | null
  description: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
}

const form = ref({
  name: '',
  city: 'Fortaleza',
  address: '',
  neighborhood: '',
  photo_url: null as string | null,
  description: '',
  is_active: true,
})

const complexLocation = ref<{ latitude: number | null; longitude: number | null }>({
  latitude: null,
  longitude: null,
})

const hasLocation = computed(() => {
  return complexLocation.value.latitude !== null && complexLocation.value.longitude !== null
})

const complexes = ref<Complex[]>([])
const editingComplex = ref<string | null>(null)
const loadingComplexes = ref(false)
const saving = ref(false)
const uploading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const fileInputRef = ref<HTMLInputElement>()
const mapKey = ref(0)

function getMapCenter() {
  if (complexLocation.value.latitude && complexLocation.value.longitude) {
    return {
      lat: complexLocation.value.latitude,
      lng: complexLocation.value.longitude,
    }
  }
  return { lat: -3.7327, lng: -38.527 }
}

async function loadComplexes() {
  loadingComplexes.value = true
  try {
    const { data, error } = await supabase
      .from('complexes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    complexes.value = data || []
  } catch (err) {
    console.error('Erro ao carregar complexos:', err)
  } finally {
    loadingComplexes.value = false
  }
}

function triggerFileInput() {
  if (!uploading.value) {
    fileInputRef.value?.click()
  }
}

async function handlePhotoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  message.value = ''

  try {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Máximo 5MB.')
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Arquivo deve ser uma imagem.')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `complexes/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('professional-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('professional-photos').getPublicUrl(fileName)

    form.value.photo_url = urlData.publicUrl
    message.value = 'Foto enviada com sucesso!'
    messageType.value = 'success'
  } catch (err) {
    console.error('Erro no upload:', err)
    message.value = err instanceof Error ? err.message : 'Erro ao enviar foto'
    messageType.value = 'error'
  } finally {
    uploading.value = false
    if (target) target.value = ''
  }
}

function removePhoto() {
  form.value.photo_url = null
}

async function saveComplex() {
  if (!hasLocation.value) {
    message.value = 'Por favor, marque a localização do complexo no mapa'
    messageType.value = 'error'
    return
  }

  saving.value = true
  message.value = ''

  try {
    const lat = Number(complexLocation.value.latitude)
    const lng = Number(complexLocation.value.longitude)

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Coordenadas inválidas. Por favor, marque novamente a localização no mapa.')
    }

    const complexData = {
      name: form.value.name.trim(),
      city: form.value.city,
      address: form.value.address?.trim() || null,
      neighborhood: form.value.neighborhood?.trim() || null,
      photo_url: form.value.photo_url || null,
      description: form.value.description?.trim() || null,
      latitude: lat,
      longitude: lng,
      is_active: form.value.is_active,
    }

    if (editingComplex.value) {
      const { data, error } = await supabase
        .from('complexes')
        .update({
          ...complexData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingComplex.value)
        .select()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }

      message.value = 'Complexo atualizado com sucesso!'
    } else {
      const { data, error } = await supabase.from('complexes').insert(complexData).select()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }

      message.value = 'Complexo cadastrado com sucesso!'
    }

    messageType.value = 'success'
    resetForm()
    await loadComplexes()
  } catch (err: any) {
    console.error('Erro ao salvar complexo:', err)
    message.value = err?.message || 'Erro ao salvar complexo'
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

function editComplex(complex: Complex) {
  editingComplex.value = complex.id
  form.value = {
    name: complex.name,
    city: complex.city,
    address: complex.address || '',
    neighborhood: complex.neighborhood || '',
    photo_url: complex.photo_url,
    description: complex.description || '',
    is_active: complex.is_active,
  }
  complexLocation.value = {
    latitude: complex.latitude,
    longitude: complex.longitude,
  }
  if (complex.latitude && complex.longitude) {
    setTimeout(() => {
      mapKey.value++
    }, 50)
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  resetForm()
}

async function deleteComplex(id: string) {
  if (!confirm('Tem certeza que deseja excluir este complexo?')) return

  const deletingMessage = 'Excluindo...'
  message.value = deletingMessage
  messageType.value = 'success'

  try {
    const complex = complexes.value.find((c) => c.id === id)
    if (complex) {
      const { count, error: countError } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true })
        .eq('complex_name', complex.name)
        .eq('is_active', true)

      if (countError) {
        console.error('Erro ao verificar profissionais:', countError)
      }

      if (count && count > 0) {
        const confirmDelete = confirm(
          `Este complexo tem ${count} profissional(is) vinculado(s). Deseja realmente excluir?`,
        )
        if (!confirmDelete) {
          message.value = ''
          return
        }
      }
    }

    const { data, error } = await supabase.from('complexes').delete().eq('id', id).select()

    if (error) {
      console.error('❌ Erro ao excluir:', error)
      throw error
    }

    message.value = 'Complexo excluído com sucesso!'
    messageType.value = 'success'

    complexes.value = complexes.value.filter((c) => c.id !== id)

    await loadComplexes()

    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('💥 Erro ao excluir complexo:', err)

    let errorMessage = 'Erro ao excluir complexo'

    if (err.code === '23503') {
      errorMessage = 'Não é possível excluir: existem profissionais vinculados a este complexo'
    } else if (err.code === '42501') {
      errorMessage = 'Sem permissão para excluir. Verifique as políticas RLS no Supabase'
    } else if (err.message) {
      errorMessage = err.message
    }

    message.value = errorMessage
    messageType.value = 'error'
  }
}

function resetForm() {
  editingComplex.value = null
  form.value = {
    name: '',
    city: 'Fortaleza',
    address: '',
    neighborhood: '',
    photo_url: null,
    description: '',
    is_active: true,
  }
  complexLocation.value = {
    latitude: null,
    longitude: null,
  }
  message.value = ''
  setTimeout(() => {
    mapKey.value++
  }, 50)
}

onMounted(() => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  if (!isAuthorized.value) {
    return
  }

  loadComplexes()
})
</script>

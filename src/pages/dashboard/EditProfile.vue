<!-- src/pages/dashboard/EditProfile.vue -->
<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <Button variant="ghost" @click="$router.push('/dashboard')" class="mb-4">
        ← Voltar para Dashboard
      </Button>

      <h1 class="text-3xl font-bold mb-2">Editar Perfil</h1>
      <p class="text-muted-foreground">Mantenha suas informações sempre atualizadas</p>
    </div>

    <div class="max-w-2xl mx-auto space-y-8">
      <!-- Informações Básicas -->
      <Card class="p-6">
        <h2 class="text-xl font-semibold mb-4">Informações Básicas</h2>

        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium block mb-1">Nome Completo</label>
              <Input v-model="profileForm.name" placeholder="Seu nome completo" required />
            </div>

            <div>
              <label class="text-sm font-medium block mb-1">Telefone</label>
              <Input v-model="profileForm.phone" placeholder="(85) 99999-9999" required />
            </div>
          </div>

          <div>
            <label class="text-sm font-medium block mb-1">Categoria</label>
            <Select v-model="profileForm.category">
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua profissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dentista">Dentista</SelectItem>
                <SelectItem value="advogado">Advogado</SelectItem>
                <SelectItem value="psicologo">Psicólogo</SelectItem>
                <SelectItem value="contador">Contador</SelectItem>
                <SelectItem value="arquiteto">Arquiteto</SelectItem>
                <SelectItem value="medico">Médico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label class="text-sm font-medium block mb-1">Especialidade (opcional)</label>
            <Input
              v-model="profileForm.specialty"
              placeholder="Ex: Ortodontia, Direito Civil, etc."
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-1">Descrição</label>
            <textarea
              v-model="profileForm.description"
              class="w-full p-3 border rounded-lg resize-none"
              rows="4"
              placeholder="Conte um pouco sobre você e seus serviços..."
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-1">Endereço da Sala</label>
            <Input v-model="profileForm.address" placeholder="Rua, número, bairro" required />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium block mb-1">Cidade</label>
              <Input v-model="profileForm.city" placeholder="Fortaleza" required />
            </div>

            <div>
              <label class="text-sm font-medium block mb-1">Faixa de Preço</label>
              <Select v-model="profileForm.price_range">
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

          <Button type="submit" class="w-full" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar Informações' }}
          </Button>
        </form>
      </Card>

      <!-- Fotos da Sala -->
      <Card class="p-6">
        <h2 class="text-xl font-semibold mb-4">Fotos da Sala</h2>
        <p class="text-muted-foreground mb-4">
          Adicione fotos da sua sala comercial. A primeira foto será a principal.
        </p>

        <!-- Upload de Fotos -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
          <Upload class="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p class="text-muted-foreground mb-2">Clique para adicionar fotos ou arraste aqui</p>
          <input
            type="file"
            multiple
            accept="image/*"
            @change="handleFileUpload"
            class="hidden"
            ref="fileInputRef"
          />
          <Button @click="triggerFileInput" variant="outline"> Escolher Fotos </Button>
        </div>

        <!-- Grid de Fotos -->
        <div v-if="photos.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="(photo, index) in photos" :key="photo.id || index" class="relative group">
            <img
              :src="photo.photo_url"
              :alt="`Foto ${index + 1}`"
              class="w-full aspect-video object-cover rounded-lg"
            />
            <div
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button size="sm" variant="destructive" @click="removePhoto(index)">
                <X class="w-4 h-4" />
              </Button>
            </div>
            <div v-if="index === 0" class="absolute bottom-2 left-2">
              <Badge>Foto Principal</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, X } from 'lucide-vue-next'
import { onMounted, reactive, ref } from 'vue'

const saving = ref(false)
const photos = ref<any[]>([])
const fileInputRef = ref<HTMLInputElement>()

const profileForm = reactive({
  name: '',
  phone: '',
  category: '',
  specialty: '',
  description: '',
  address: '',
  city: '',
  price_range: '',
})

async function saveProfile() {
  saving.value = true

  try {
    // Implementar salvamento do perfil
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Mock
    console.log('Perfil salvo:', profileForm)
  } catch (error) {
    console.error('Erro ao salvar perfil:', error)
  } finally {
    saving.value = false
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  Array.from(files).forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      photos.value.push({
        file,
        photo_url: e.target?.result as string,
        is_primary: photos.value.length === 0,
      })
    }
    reader.readAsDataURL(file)
  })
}

function removePhoto(index: number) {
  photos.value.splice(index, 1)
}

onMounted(() => {
  // Carregar dados do perfil atual
  loadCurrentProfile()
})

function loadCurrentProfile() {
  // Mock data - implementar busca real depois
  Object.assign(profileForm, {
    name: 'Dr. João Silva',
    phone: '85987654321',
    category: 'dentista',
    specialty: 'Ortodontia',
    description: 'Dentista com 10 anos de experiência...',
    address: 'Rua das Flores, 123 - Centro',
    city: 'Fortaleza',
    price_range: '100-200',
  })
}
</script>

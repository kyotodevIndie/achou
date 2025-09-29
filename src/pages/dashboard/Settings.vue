<!-- src/pages/dashboard/Settings.vue -->
<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <Button variant="ghost" @click="$router.push('/dashboard')" class="mb-4">
        ← Voltar para Dashboard
      </Button>

      <h1 class="text-3xl font-bold mb-2">Configurações</h1>
      <p class="text-gray-600">Gerencie sua conta e preferências</p>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Informações da Conta -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-6">Informações da Conta</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">Email</label>
            <div class="flex items-center gap-3">
              <Input :value="userEmail" disabled class="flex-1 bg-gray-50" />
              <div class="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle class="w-4 h-4" />
                Verificado
              </div>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">Membro desde</label>
            <Input :value="formatDate(memberSince)" disabled class="bg-gray-50" />
          </div>
        </div>
      </div>

      <!-- Alterar Senha -->
      <ChangePassword />

      <!-- Preferências de Notificação -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-6">Notificações</h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Novos clientes</h4>
              <p class="text-sm text-gray-600">Receber email quando alguém visualizar seu perfil</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="notifications.newViews" type="checkbox" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"
              ></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Contatos via WhatsApp</h4>
              <p class="text-sm text-gray-600">Receber resumo semanal de contatos recebidos</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="notifications.whatsappSummary" type="checkbox" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"
              ></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Atualizações da plataforma</h4>
              <p class="text-sm text-gray-600">Novidades e melhorias do ACHOU</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="notifications.platformUpdates" type="checkbox" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"
              ></div>
            </label>
          </div>
        </div>

        <div class="pt-4">
          <Button @click="saveNotifications" :disabled="savingNotifications" variant="outline">
            {{ savingNotifications ? 'Salvando...' : 'Salvar preferências' }}
          </Button>
        </div>
      </div>

      <!-- Privacidade -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-6">Privacidade</h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Perfil público</h4>
              <p class="text-sm text-gray-600">Aparecer nas buscas e ser encontrado por clientes</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="privacy.publicProfile" type="checkbox" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"
              ></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Mostrar telefone</h4>
              <p class="text-sm text-gray-600">Exibir número de WhatsApp no seu perfil</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="privacy.showPhone" type="checkbox" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"
              ></div>
            </label>
          </div>
        </div>

        <div class="pt-4">
          <Button @click="savePrivacy" :disabled="savingPrivacy" variant="outline">
            {{ savingPrivacy ? 'Salvando...' : 'Salvar configurações' }}
          </Button>
        </div>
      </div>

      <!-- Zona de Perigo -->
      <div class="bg-white rounded-xl border border-red-200 p-6">
        <h3 class="text-lg font-semibold text-red-700 mb-6">Zona de Perigo</h3>

        <div class="space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 class="font-medium text-red-800 mb-2">Excluir conta</h4>
            <p class="text-sm text-red-700 mb-3">
              Ao excluir sua conta, todos os seus dados serão removidos permanentemente. Esta ação
              não pode ser desfeita.
            </p>
            <Button @click="showDeleteModal = true" variant="destructive" size="sm">
              <Trash2 class="w-4 h-4 mr-2" />
              Excluir conta
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full">
        <div class="text-center mb-6">
          <div class="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 class="text-lg font-semibold mb-2">Excluir conta permanentemente?</h3>
          <p class="text-gray-600 text-sm">
            Esta ação não pode ser desfeita. Todos os seus dados, incluindo perfil, fotos e
            histórico serão removidos permanentemente.
          </p>
        </div>

        <div class="space-y-3">
          <Input
            v-model="deleteConfirmation"
            placeholder="Digite 'EXCLUIR' para confirmar"
            class="text-center"
          />

          <div class="flex gap-3">
            <Button
              @click="
                () => {
                  showDeleteModal = false
                  deleteConfirmation = ''
                }
              "
              variant="outline"
              class="flex-1"
            >
              Cancelar
            </Button>
            <Button
              @click="handleDeleteAccount"
              :disabled="deleteConfirmation !== 'EXCLUIR' || deletingAccount"
              variant="destructive"
              class="flex-1"
            >
              {{ deletingAccount ? 'Excluindo...' : 'Excluir conta' }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePassword from '@/components/auth/ChangePassword.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Trash2 } from 'lucide-vue-next'
import { reactive, ref } from 'vue'

// Mock data - em produção, pegar do auth store
const userEmail = ref('usuario@exemplo.com')
const memberSince = ref('2024-01-15')

const savingNotifications = ref(false)
const savingPrivacy = ref(false)
const showDeleteModal = ref(false)
const deleteConfirmation = ref('')
const deletingAccount = ref(false)

const notifications = reactive({
  newViews: true,
  whatsappSummary: true,
  platformUpdates: false,
})

const privacy = reactive({
  publicProfile: true,
  showPhone: true,
})

async function saveNotifications() {
  savingNotifications.value = true

  try {
    // Simular chamada API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // TODO: Salvar no backend
    console.log('Notificações salvas:', notifications)

    // Feedback visual
    alert('Preferências salvas com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar notificações:', error)
    alert('Erro ao salvar. Tente novamente.')
  } finally {
    savingNotifications.value = false
  }
}

async function savePrivacy() {
  savingPrivacy.value = true

  try {
    // Simular chamada API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // TODO: Salvar no backend
    console.log('Configurações de privacidade salvas:', privacy)

    // Feedback visual
    alert('Configurações salvas com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar privacidade:', error)
    alert('Erro ao salvar. Tente novamente.')
  } finally {
    savingPrivacy.value = false
  }
}

async function handleDeleteAccount() {
  deletingAccount.value = true

  try {
    // Simular exclusão
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // TODO: Chamar API de exclusão
    console.log('Conta excluída')

    // Redirecionar para home
    alert('Conta excluída com sucesso. Sentiremos sua falta!')
    // router.push('/')
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    alert('Erro ao excluir conta. Tente novamente.')
  } finally {
    deletingAccount.value = false
    showDeleteModal.value = false
    deleteConfirmation.value = ''
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}
</script>

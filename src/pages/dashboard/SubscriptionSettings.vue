<!-- src/pages/dashboard/SubscriptionSettings.vue - UI MELHORADA -->
<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <Button variant="ghost" @click="$router.push('/dashboard')" class="mb-4">
        ← Voltar para Dashboard
      </Button>

      <h1 class="text-3xl font-bold mb-2">Assinatura</h1>
      <p class="text-gray-600">Gerencie seu plano e pagamentos</p>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Status da Assinatura -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">Status da Assinatura</h2>
          <div v-if="currentSubscription" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :class="getStatusColor()"></div>
            <span class="text-sm font-medium" :class="getStatusTextColor()">
              {{ getStatusLabel() }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2"
          ></div>
          <p class="text-gray-600 text-sm">Carregando assinatura...</p>
        </div>

        <!-- Sem assinatura -->
        <div v-else-if="!currentSubscription" class="text-center py-8">
          <div class="text-4xl mb-4">💳</div>
          <h3 class="text-lg font-semibold mb-2">Nenhuma assinatura ativa</h3>
          <p class="text-gray-600 mb-6">Assine agora para aparecer nas buscas</p>
          <Button @click="$router.push('/assinar')" class="bg-rose-500 hover:bg-rose-600">
            Escolher plano
          </Button>
        </div>

        <!-- Com assinatura -->
        <div v-else class="space-y-6">
          <!-- AVISO DE CANCELAMENTO -->
          <div
            v-if="currentSubscription.cancel_at_period_end"
            class="bg-red-50 border-2 border-red-200 rounded-xl p-5"
          >
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <AlertCircle class="w-6 h-6 text-red-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-red-900 mb-2">Assinatura Cancelada</h3>
                <p class="text-red-800 mb-3">
                  Sua assinatura foi cancelada e não será renovada. Você ainda tem acesso até o
                  final do período pago.
                </p>
                <div class="bg-white/50 rounded-lg p-3 mb-3">
                  <p class="text-sm text-red-900 font-medium mb-1">
                    ⏰ Acesso até: {{ formatDate(currentSubscription.current_period_end) }}
                  </p>
                  <p class="text-sm text-red-700">
                    Após esta data, seu perfil sairá das buscas automaticamente.
                  </p>
                </div>
                <Button
                  @click="handleReactivate"
                  :disabled="reactivating"
                  class="bg-green-600 hover:bg-green-700"
                >
                  <RotateCcw class="w-4 h-4 mr-2" />
                  {{ reactivating ? 'Reativando...' : 'Reativar assinatura' }}
                </Button>
              </div>
            </div>
          </div>

          <!-- Card do plano atual -->
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 class="font-semibold text-gray-900">
                {{ currentSubscription.plan?.name || 'Plano Profissional' }}
              </h4>
              <p class="text-sm text-gray-600">
                {{
                  subscriptionStore.formatPrice(currentSubscription.plan?.price_cents || 1999)
                }}/mês
              </p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600">Status</div>
              <div class="font-medium" :class="getStatusTextColor()">
                {{ getStatusLabel() }}
              </div>
            </div>
          </div>

          <!-- Informações do período - APENAS SE NÃO ESTIVER CANCELADA -->
          <div
            v-if="!currentSubscription.cancel_at_period_end"
            class="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <!-- Período de teste -->
            <div v-if="isOnTrial" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-center gap-3 mb-2">
                <Gift class="w-5 h-5 text-yellow-600" />
                <h4 class="font-medium text-yellow-800">Período de Teste</h4>
              </div>
              <p class="text-sm text-yellow-700 mb-3">
                Você tem {{ trialDaysLeft }} dias restantes no seu teste gratuito
              </p>
              <div class="text-xs text-yellow-600">
                Expira em: {{ formatDate(currentSubscription.trial_end) }}
              </div>
            </div>

            <!-- Próximo pagamento -->
            <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center gap-3 mb-2">
                <Calendar class="w-5 h-5 text-green-600" />
                <h4 class="font-medium text-green-800">Próximo Pagamento</h4>
              </div>
              <p class="text-sm text-green-700 mb-1">
                {{ subscriptionStore.formatPrice(currentSubscription.plan?.price_cents || 1999) }}
              </p>
              <div class="text-xs text-green-600">
                Em: {{ formatDate(currentSubscription.current_period_end) }}
              </div>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex flex-wrap gap-3">
            <!-- Cancelar assinatura -->
            <Button
              v-if="isSubscribed && !currentSubscription.cancel_at_period_end"
              @click="showCancelModal = true"
              variant="outline"
              class="border-red-300 text-red-700 hover:bg-red-50"
            >
              <X class="w-4 h-4 mr-2" />
              Cancelar assinatura
            </Button>

            <!-- Atualizar método de pagamento -->
            <Button variant="outline" v-if="!currentSubscription.cancel_at_period_end">
              <CreditCard class="w-4 h-4 mr-2" />
              Atualizar cartão
            </Button>
          </div>
        </div>
      </div>

      <!-- Histórico de Pagamentos -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-6">Histórico de Pagamentos</h2>

        <div v-if="transactions.length === 0" class="text-center py-8">
          <div class="text-4xl mb-4">🧾</div>
          <p class="text-gray-600">Nenhuma transação encontrada</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-2 font-medium text-gray-700">Data</th>
                <th class="text-left py-3 px-2 font-medium text-gray-700">Valor</th>
                <th class="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                <th class="text-left py-3 px-2 font-medium text-gray-700">Método</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="transaction in transactions"
                :key="transaction.id"
                class="border-b border-gray-100"
              >
                <td class="py-3 px-2 text-sm">
                  {{ formatDate(transaction.processed_at || transaction.created_at) }}
                </td>
                <td class="py-3 px-2 text-sm font-medium">
                  {{ subscriptionStore.formatPrice(transaction.amount_cents) }}
                </td>
                <td class="py-3 px-2">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': transaction.status === 'succeeded',
                      'bg-red-100 text-red-800': transaction.status === 'failed',
                      'bg-yellow-100 text-yellow-800': transaction.status === 'pending',
                      'bg-gray-100 text-gray-800': transaction.status === 'canceled',
                    }"
                  >
                    {{ getTransactionStatus(transaction.status) }}
                  </span>
                </td>
                <td class="py-3 px-2 text-sm text-gray-600">
                  {{ transaction.payment_method || 'Cartão' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Cancelamento -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 max-w-md mx-4">
        <div class="text-center mb-6">
          <div class="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 class="text-lg font-semibold mb-2">Cancelar assinatura?</h3>
          <p class="text-gray-600 text-sm mb-4">
            Seu perfil continuará ativo até
            <strong>{{ formatDate(currentSubscription?.current_period_end) }}</strong
            >.
          </p>
          <p class="text-gray-600 text-sm">
            Após esta data, seu perfil sairá das buscas automaticamente. Você pode reativar a
            qualquer momento antes disso.
          </p>
        </div>

        <div class="flex gap-3">
          <Button @click="showCancelModal = false" variant="outline" class="flex-1">
            Manter ativo
          </Button>
          <Button
            @click="handleCancel"
            :disabled="canceling"
            class="flex-1 bg-red-600 hover:bg-red-700"
          >
            {{ canceling ? 'Cancelando...' : 'Sim, cancelar' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { supabase } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import { AlertCircle, Calendar, CreditCard, Gift, RotateCcw, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const { currentSubscription, transactions, loading, isSubscribed, isOnTrial, trialDaysLeft } =
  storeToRefs(subscriptionStore)

const showCancelModal = ref(false)
const canceling = ref(false)
const reactivating = ref(false)
const professionalId = ref<string | null>(null)

// Computed para status mais claro
const getStatusLabel = () => {
  if (!currentSubscription.value) return 'Inativa'

  if (currentSubscription.value.cancel_at_period_end) {
    return 'Cancelada (ativa até o fim do período)'
  }

  return subscriptionStore.getStatusText(currentSubscription.value.status)
}

const getStatusColor = () => {
  if (!currentSubscription.value) return 'bg-gray-500'

  if (currentSubscription.value.cancel_at_period_end) {
    return 'bg-red-500'
  }

  if (isSubscribed.value) return 'bg-green-500'
  if (isOnTrial.value) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getStatusTextColor = () => {
  if (!currentSubscription.value) return 'text-gray-700'

  if (currentSubscription.value.cancel_at_period_end) {
    return 'text-red-700'
  }

  if (isSubscribed.value) return 'text-green-700'
  if (isOnTrial.value) return 'text-yellow-700'
  return 'text-red-700'
}

async function handleCancel() {
  if (!currentSubscription.value) return

  canceling.value = true
  try {
    await subscriptionStore.cancelSubscription(currentSubscription.value.id)
    showCancelModal.value = false
  } catch (err) {
    alert('Erro ao cancelar assinatura')
  } finally {
    canceling.value = false
  }
}

async function handleReactivate() {
  if (!currentSubscription.value) return

  reactivating.value = true
  try {
    await subscriptionStore.reactivateSubscription(currentSubscription.value.id)
  } catch (err) {
    alert('Erro ao reativar assinatura')
  } finally {
    reactivating.value = false
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getTransactionStatus(status: string) {
  const statusMap: Record<string, string> = {
    succeeded: 'Pago',
    failed: 'Falhou',
    pending: 'Pendente',
    canceled: 'Cancelado',
  }
  return statusMap[status] || status
}

onMounted(async () => {
  // Buscar ID do profissional pelo user_id
  if (!authStore.user?.id) {
    router.push('/login')
    return
  }

  try {
    const { data: professional, error } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', authStore.user.id)
      .single()

    if (error || !professional) {
      console.error('Profissional não encontrado:', error)
      router.push('/dashboard/perfil?first=true')
      return
    }

    professionalId.value = professional.id

    // Carregar dados da assinatura
    await Promise.all([
      subscriptionStore.loadCurrentSubscription(professional.id),
      subscriptionStore.loadTransactions(professional.id),
    ])
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
  }
})
</script>

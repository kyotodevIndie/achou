<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">Escolha seu plano</h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Apareça nas buscas e receba contatos de clientes interessados. Teste grátis por 7 dias,
        cancele quando quiser.
      </p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
      <p class="text-gray-600">Carregando planos...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="bg-red-50 border border-red-200 p-6 rounded-lg max-w-md mx-auto">
        <h3 class="font-bold text-red-800 mb-2">Erro ao carregar planos</h3>
        <p class="text-red-600 text-sm mb-4">{{ error }}</p>
        <Button @click="subscriptionStore.loadPlans()" variant="outline"> Tentar novamente </Button>
      </div>
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <div class="grid grid-cols-1 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="relative bg-white border-2 border-rose-500 rounded-2xl shadow-lg overflow-hidden"
        >
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span class="bg-rose-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Mais Popular
            </span>
          </div>

          <div class="p-8">
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
              <p class="text-gray-600 mb-6">{{ plan.description }}</p>

              <div class="flex items-center justify-center mb-2">
                <span class="text-4xl font-bold text-gray-900">
                  {{ subscriptionStore.formatPrice(plan.price_cents) }}
                </span>
                <span class="text-gray-500 ml-2">/mês</span>
              </div>

              <p class="text-sm text-rose-600">
                {{ plan.trial_period_days }} dias grátis para testar
              </p>
            </div>

            <div class="space-y-4 mb-8">
              <div class="flex items-start gap-3">
                <Check class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-900">Apareça nas buscas</p>
                  <p class="text-sm text-gray-600">Seus clientes te encontram facilmente</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Check class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-900">Perfil completo</p>
                  <p class="text-sm text-gray-600">Fotos, descrição e informações de contato</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Check class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-900">Contato direto</p>
                  <p class="text-sm text-gray-600">WhatsApp integrado para receber clientes</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Check class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-900">Analytics</p>
                  <p class="text-sm text-gray-600">Veja quantos clientes visualizaram seu perfil</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Check class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-gray-900">Suporte prioritário</p>
                  <p class="text-sm text-gray-600">Ajuda rápida quando você precisar</p>
                </div>
              </div>
            </div>

            <Button
              @click="handleSubscribe(plan.id)"
              :disabled="subscribing"
              class="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 text-lg font-semibold"
              size="lg"
            >
              <div v-if="subscribing" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </div>
              <div v-else class="flex items-center justify-center gap-2">
                <CreditCard class="w-5 h-5" />
                Começar teste grátis
              </div>
            </Button>

            <p class="text-center text-xs text-gray-500 mt-3">
              Cancele a qualquer momento. Sem taxa de cancelamento.
            </p>
          </div>
        </div>
      </div>

      <div class="mt-12 bg-gray-50 rounded-xl p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Shield class="w-6 h-6 text-green-600" />
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">Teste grátis</h4>
            <p class="text-sm text-gray-600">7 dias para experimentar sem compromisso</p>
          </div>

          <div class="flex flex-col items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <RefreshCw class="w-6 h-6 text-blue-600" />
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">Cancele quando quiser</h4>
            <p class="text-sm text-gray-600">Sem fidelidade ou taxa de cancelamento</p>
          </div>

          <div class="flex flex-col items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <HeadphonesIcon class="w-6 h-6 text-purple-600" />
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">Suporte dedicado</h4>
            <p class="text-sm text-gray-600">Ajuda rápida via WhatsApp</p>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <h3 class="text-xl font-bold text-gray-900 mb-6 text-center">Perguntas frequentes</h3>

        <div class="space-y-4 max-w-2xl mx-auto">
          <details class="bg-white border rounded-lg p-4">
            <summary class="font-medium cursor-pointer">Como funciona o teste grátis?</summary>
            <p class="mt-2 text-gray-600 text-sm">
              Você tem 7 dias para usar todas as funcionalidades sem pagar nada. Após o período,
              será cobrado R$ 9,99/mês automaticamente.
            </p>
          </details>

          <details class="bg-white border rounded-lg p-4">
            <summary class="font-medium cursor-pointer">Posso cancelar a qualquer momento?</summary>
            <p class="mt-2 text-gray-600 text-sm">
              Sim! Você pode cancelar quando quiser no seu dashboard. Seu perfil continuará ativo
              até o final do período pago.
            </p>
          </details>

          <details class="bg-white border rounded-lg p-4">
            <summary class="font-medium cursor-pointer">O que acontece se eu não pagar?</summary>
            <p class="mt-2 text-gray-600 text-sm">
              Seu perfil sairá das buscas temporariamente. Você pode reativar a qualquer momento
              pagando a mensalidade.
            </p>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useSubscriptionStore } from '@/stores/subscription'
import { Check, CreditCard, HeadphonesIcon, RefreshCw, Shield } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

defineProps<{
  professionalId?: string
}>()

const subscriptionStore = useSubscriptionStore()
const { plans, loading, error } = storeToRefs(subscriptionStore)

const subscribing = ref(false)

async function handleSubscribe(planId: string) {
  const professionalId = 'professional-id'

  subscribing.value = true

  try {
    await subscriptionStore.createCheckoutSession(professionalId, planId)
  } catch (err) {
    console.error('Erro ao iniciar pagamento:', err)
    alert('Erro ao processar pagamento. Tente novamente.')
  } finally {
    subscribing.value = false
  }
}

onMounted(() => {
  subscriptionStore.loadPlans()
})
</script>

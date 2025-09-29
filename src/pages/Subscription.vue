<!-- src/pages/Subscription.vue - Página de assinatura -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Escolha seu plano no ACHOU</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Apareça nas buscas e conecte-se com clientes que procuram seus serviços profissionais
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Carregando planos...</p>
      </div>

      <!-- Planos -->
      <div v-else class="max-w-4xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="bg-white rounded-2xl shadow-lg p-8 relative border-2"
            :class="
              plan.id === selectedPlan?.id
                ? 'border-rose-500 ring-2 ring-rose-200'
                : 'border-gray-200'
            "
          >
            <!-- Badge Popular -->
            <div
              v-if="plan.name.includes('Profissional')"
              class="absolute -top-4 left-1/2 transform -translate-x-1/2"
            >
              <span class="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-full">
                Mais Popular
              </span>
            </div>

            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
              <div class="mb-4">
                <span class="text-4xl font-bold text-gray-900">
                  {{ formatPrice(plan.price_cents) }}
                </span>
                <span class="text-gray-600">/mês</span>
              </div>
              <p class="text-gray-600">{{ plan.description }}</p>
            </div>

            <!-- Features -->
            <div class="space-y-4 mb-8">
              <div class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-green-500" />
                <span class="text-gray-700">Perfil nas buscas</span>
              </div>
              <div class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-green-500" />
                <span class="text-gray-700">Upload de fotos</span>
              </div>
              <div class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-green-500" />
                <span class="text-gray-700">Analytics básico</span>
              </div>
              <div class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-green-500" />
                <span class="text-gray-700">Contato direto WhatsApp</span>
              </div>
              <div class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-green-500" />
                <span class="text-gray-700">{{ plan.trial_period_days }} dias grátis</span>
              </div>
            </div>

            <!-- Botão -->
            <Button
              @click="selectPlan(plan)"
              :disabled="subscribing"
              class="w-full py-3 text-lg"
              :class="
                plan.id === selectedPlan?.id
                  ? 'bg-rose-500 hover:bg-rose-600'
                  : 'bg-gray-800 hover:bg-gray-900'
              "
            >
              {{
                subscribing && selectedPlan?.id === plan.id
                  ? 'Processando...'
                  : `Começar teste grátis`
              }}
            </Button>

            <p class="text-xs text-gray-500 text-center mt-3">Cancele a qualquer momento</p>
          </div>
        </div>

        <!-- FAQ -->
        <div class="bg-white rounded-2xl p-8 shadow-lg">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Perguntas Frequentes</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Como funciona o período gratuito?</h3>
              <p class="text-gray-600 text-sm">
                Você tem 7 dias totalmente grátis. Se cancelar antes, não será cobrado nada.
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3>
              <p class="text-gray-600 text-sm">
                Sim, você pode cancelar a qualquer momento no seu dashboard. Sem multas ou taxas.
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">O que acontece se eu cancelar?</h3>
              <p class="text-gray-600 text-sm">
                Seu perfil sai das buscas no final do período pago. Você pode reativar quando
                quiser.
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Aceita quais formas de pagamento?</h3>
              <p class="text-gray-600 text-sm">
                Cartão de crédito, débito e PIX. Pagamento seguro processado pelo Stripe.
              </p>
            </div>
          </div>
        </div>

        <!-- CTA Bottom -->
        <div class="text-center mt-12">
          <p class="text-gray-600 mb-6">Pronto para aumentar sua clientela?</p>
          <Button
            v-if="!selectedPlan"
            @click="selectPlan(mainPlan)"
            :disabled="!mainPlan"
            size="lg"
            class="bg-rose-500 hover:bg-rose-600 px-8 py-4 text-lg"
          >
            Começar agora - 7 dias grátis
          </Button>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div
        v-if="subscribing"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-8 text-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">Redirecionando para pagamento...</p>
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
import { CheckCircle } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const { plans, loading, mainPlan } = storeToRefs(subscriptionStore)

const selectedPlan = ref<any>(null)
const subscribing = ref(false)

// Computed para formatar preço
const formatPrice = computed(() => {
  return (priceCents: number) => subscriptionStore.formatPrice(priceCents)
})

// Selecionar plano
function selectPlan(plan: any) {
  selectedPlan.value = plan
  startSubscription(plan)
}

// Iniciar processo de assinatura
async function startSubscription(plan: any) {
  if (!authStore.isAuthenticated) {
    // Salvar plano escolhido e redirecionar para login
    localStorage.setItem('selectedPlan', JSON.stringify(plan))
    router.push('/login?redirect=subscribe')
    return
  }

  subscribing.value = true

  try {
    // Buscar ID do profissional
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', authStore.user.id)
      .single()

    if (!professional) {
      // Criar perfil primeiro
      router.push('/dashboard/perfil?first=true')
      return
    }

    // Criar checkout session
    await subscriptionStore.createCheckoutSession(professional.id, plan.id)
  } catch (error) {
    console.error('Erro ao iniciar assinatura:', error)
    alert('Erro ao processar assinatura. Tente novamente.')
  } finally {
    subscribing.value = false
  }
}

onMounted(async () => {
  // Carregar planos
  await subscriptionStore.loadPlans()

  // Verificar se há plano salvo (após login)
  const savedPlan = localStorage.getItem('selectedPlan')
  if (savedPlan && authStore.isAuthenticated) {
    const plan = JSON.parse(savedPlan)
    localStorage.removeItem('selectedPlan')
    await startSubscription(plan)
  }
})
</script>

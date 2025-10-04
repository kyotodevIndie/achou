// src/stores/subscription.ts - Store para pagamentos
import { supabase } from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price_cents: number
  currency: string
  interval_type: string
  interval_count: number
  trial_period_days: number
  stripe_price_id?: string
  is_active: boolean
}

export interface Subscription {
  id: string
  professional_id: string
  plan_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'unpaid'
  current_period_start?: string
  current_period_end?: string
  trial_start?: string
  trial_end?: string
  canceled_at?: string
  cancel_at_period_end: boolean
  created_at: string
  plan?: SubscriptionPlan
}

export interface PaymentTransaction {
  id: string
  subscription_id: string
  professional_id: string
  amount_cents: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending' | 'canceled'
  payment_method?: string
  failure_reason?: string
  processed_at?: string
  created_at: string
}

export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  const plans = ref<SubscriptionPlan[]>([])
  const currentSubscription = ref<Subscription | null>(null)
  const transactions = ref<PaymentTransaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isSubscribed = computed(
    () =>
      currentSubscription.value?.status === 'active' ||
      currentSubscription.value?.status === 'trialing',
  )

  const isOnTrial = computed(() => currentSubscription.value?.status === 'trialing')

  const trialDaysLeft = computed(() => {
    if (!currentSubscription.value?.trial_end) return 0

    const trialEnd = new Date(currentSubscription.value.trial_end)
    const now = new Date()
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  })

  const subscriptionExpiresAt = computed(() => {
    if (!currentSubscription.value?.current_period_end) return null
    return new Date(currentSubscription.value.current_period_end)
  })

  const mainPlan = computed(() => {
    return plans.value.find((plan) => plan.is_active) || null
  })

  // Actions
  async function loadPlans() {
    loading.value = true
    error.value = null

    try {
      const { data, error: apiError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true })

      if (apiError) throw new Error(apiError.message)

      plans.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar planos'
      console.error('Erro ao carregar planos:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadCurrentSubscription(professionalId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: apiError } = await supabase
        .from('subscriptions')
        .select(
          `
          *,
          plan:subscription_plans(*)
        `,
        )
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (apiError) throw new Error(apiError.message)

      currentSubscription.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar assinatura'
      console.error('Erro ao carregar assinatura:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadTransactions(professionalId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: apiError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })

      if (apiError) throw new Error(apiError.message)

      transactions.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar transações'
      console.error('Erro ao carregar transações:', err)
    } finally {
      loading.value = false
    }
  }

  // Formatação de preço
  function formatPrice(priceCents: number, currency = 'BRL') {
    const price = priceCents / 100
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: currency,
    })
  }

  // Status em português
  function getStatusText(status: string) {
    const statusMap: Record<string, string> = {
      active: 'Ativo',
      trialing: 'Período de teste',
      past_due: 'Pagamento em atraso',
      canceled: 'Cancelado',
      incomplete: 'Incompleto',
      unpaid: 'Não pago',
    }
    return statusMap[status] || status
  }

  async function createCheckoutSession(professionalId: string, planId: string) {
    loading.value = true
    error.value = null

    try {
      const { data: session } = await supabase.auth.getSession()

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          professional_id: professionalId,
          plan_id: planId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar sessão de checkout')
      }

      const { checkout_url } = await response.json()

      // Redirecionar para o Stripe
      window.location.href = checkout_url
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao iniciar pagamento'
      console.error('Erro no checkout:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Cancelar assinatura
  async function cancelSubscription(subscriptionId: string) {
    loading.value = true
    error.value = null

    try {
      const { data: session } = await supabase.auth.getSession()

      const response = await fetch('/.netlify/functions/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao cancelar assinatura')
      }

      // Recarregar dados
      if (currentSubscription.value) {
        await loadCurrentSubscription(currentSubscription.value.professional_id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao cancelar assinatura'
      console.error('Erro ao cancelar:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reativar assinatura
  async function reactivateSubscription(subscriptionId: string) {
    loading.value = true
    error.value = null

    try {
      const { data: session } = await supabase.auth.getSession()

      const response = await fetch('/.netlify/functions/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao reativar assinatura')
      }

      // Recarregar dados
      if (currentSubscription.value) {
        await loadCurrentSubscription(currentSubscription.value.professional_id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao reativar assinatura'
      console.error('Erro ao reativar:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPortalSession(subscriptionId: string) {
    loading.value = true
    error.value = null

    try {
      const { data: session } = await supabase.auth.getSession()

      const response = await fetch('/.netlify/functions/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar sessão do portal')
      }

      const { url } = await response.json()

      // Redirecionar para o Customer Portal do Stripe
      window.location.href = url
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao abrir portal de pagamento'
      console.error('Erro ao criar portal session:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    plans,
    currentSubscription,
    transactions,
    loading,
    error,

    // Getters
    isSubscribed,
    isOnTrial,
    trialDaysLeft,
    subscriptionExpiresAt,
    mainPlan,

    // Actions
    loadPlans,
    loadCurrentSubscription,
    loadTransactions,
    createCheckoutSession,
    cancelSubscription,
    reactivateSubscription,
    formatPrice,
    getStatusText,
    createPortalSession,
  }
})

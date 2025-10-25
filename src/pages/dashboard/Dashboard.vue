<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-4">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600">Bem-vindo de volta, {{ displayName }}!</p>
      </div>

      <div v-if="loadingProfile" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Carregando dashboard...</p>
      </div>

      <div v-else>
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div class="flex items-center justify-between flex-col md:flex-row gap-3">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="isReallyActive ? 'bg-green-100' : 'bg-yellow-100'"
              >
                <CheckCircle v-if="isReallyActive" class="w-6 h-6 text-green-600" />
                <AlertTriangle v-else class="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ isReallyActive ? 'Perfil Ativo' : 'Perfil Inativo' }}
                </h3>
                <p class="text-gray-600">
                  {{
                    isReallyActive
                      ? 'Sua conta está ativa e aparecendo nas buscas'
                      : 'Complete seu perfil e assine o plano para aparecer nas buscas'
                  }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="text-sm font-medium px-3 py-1 rounded-full"
                :class="
                  professional?.verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                "
              >
                {{ professional?.verified ? '✓ Verificado' : 'Não verificado' }}
              </span>
              <Button variant="outline" @click="$router.push('/dashboard/perfil')">
                Editar Perfil
              </Button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye class="w-6 h-6 text-blue-600" />
              </div>
              <span
                class="text-sm font-medium"
                :class="viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ viewsGrowth >= 0 ? '+' : '' }}{{ viewsGrowth }}%
              </span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ analytics.views }}</h3>
            <p class="text-gray-600 text-sm">Visualizações</p>
            <p class="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle class="w-6 h-6 text-green-600" />
              </div>
              <span
                class="text-sm font-medium"
                :class="clicksGrowth >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ clicksGrowth >= 0 ? '+' : '' }}{{ clicksGrowth }}%
              </span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ analytics.clicks }}</h3>
            <p class="text-gray-600 text-sm">Cliques WhatsApp</p>
            <p class="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp class="w-6 h-6 text-purple-600" />
              </div>
              <span class="text-purple-600 text-sm font-medium">{{ conversionRate }}%</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ conversionRate }}%</h3>
            <p class="text-gray-600 text-sm">Taxa de Conversão</p>
            <p class="text-xs text-gray-500 mt-1">Cliques/Visualizações</p>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar class="w-6 h-6 text-orange-600" />
              </div>
              <span class="text-orange-600 text-sm font-medium">{{ daysSinceCreated }} dias</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ daysSinceCreated }}</h3>
            <p class="text-gray-600 text-sm">Dias Ativo</p>
            <p class="text-xs text-gray-500 mt-1">Desde o cadastro</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
            <div class="space-y-4">
              <div
                @click="$router.push('/dashboard/perfil')"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Edit class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p class="font-medium">Editar Perfil</p>
                    <p class="text-sm text-gray-600">Atualize suas informações</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-blue-600" />
              </div>

              <div
                @click="openBugReport"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Bug class="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p class="font-medium">Reportar Bugs</p>
                    <p class="text-sm text-gray-600">Encontrou algum problema?</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-red-600" />
              </div>

              <div
                @click="$router.push('/dashboard/analytics')"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"
                  >
                    <BarChart3 class="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p class="font-medium">Ver Analytics</p>
                    <p class="text-sm text-gray-600">Estatísticas detalhadas</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-purple-600" />
              </div>

              <div
                @click="$router.push('/dashboard/configuracoes')"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center"
                  >
                    <Settings class="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p class="font-medium">Configurações</p>
                    <p class="text-sm text-gray-600">Conta e privacidade</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Assinatura</h3>
              <Button
                v-if="subscription"
                variant="outline"
                size="sm"
                @click="$router.push('/dashboard/assinatura')"
              >
                Gerenciar
              </Button>
            </div>

            <div v-if="loadingSubscription" class="text-center py-8">
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2"
              ></div>
              <p class="text-gray-600 text-sm">Carregando...</p>
            </div>

            <div v-else-if="!subscription" class="text-center py-8">
              <div class="text-4xl mb-4">💳</div>
              <h4 class="text-lg font-semibold mb-2">Nenhuma assinatura ativa</h4>
              <p class="text-gray-600 text-sm mb-6">Assine agora para aparecer nas buscas</p>
              <Button @click="$router.push('/assinar')" class="bg-rose-500 hover:bg-rose-600">
                Ver planos
              </Button>
            </div>

            <div v-else class="space-y-4">
              <div
                v-if="subscription.cancel_at_period_end"
                class="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div class="flex items-start gap-3">
                  <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-sm font-medium text-red-900 mb-1">Assinatura Cancelada</p>
                    <p class="text-xs text-red-700">
                      Acesso até {{ formatDate(subscription.current_period_end) }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 class="font-semibold text-gray-900">
                    {{ subscription.plan?.name || 'Plano Profissional' }}
                  </h4>
                  <p class="text-sm text-gray-600">
                    {{ formatPrice(subscription.plan?.price_cents || 2999) }}/mês
                  </p>
                </div>
                <span
                  class="text-xs font-medium px-3 py-1 rounded-full"
                  :class="getSubscriptionBadgeClass(subscription)"
                >
                  {{ getSubscriptionBadgeText(subscription) }}
                </span>
              </div>

              <div v-if="isOnTrial" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <Gift class="w-5 h-5 text-yellow-600" />
                  <div>
                    <p class="text-sm font-medium text-yellow-800">Período de Teste</p>
                    <p class="text-xs text-yellow-700">
                      {{ trialDaysLeft }} dias restantes • Expira em
                      {{ formatDate(subscription.trial_end) }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-else-if="!subscription.cancel_at_period_end"
                class="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div class="flex items-center gap-3">
                  <Calendar class="w-5 h-5 text-green-600" />
                  <div>
                    <p class="text-sm font-medium text-green-800">Próximo Pagamento</p>
                    <p class="text-xs text-green-700">
                      {{ formatPrice(subscription.plan?.price_cents || 2999) }} em
                      {{ formatDate(subscription.current_period_end) }}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                @click="$router.push('/dashboard/assinatura')"
                variant="outline"
                class="w-full"
              >
                Ver detalhes completos
              </Button>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl p-6 text-white">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Lightbulb class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-semibold">Dica do Dia</h3>
              <p class="text-rose-100 text-sm">Maximize sua visibilidade no ACHOU</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <CheckCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-rose-50">
                <strong>Adicione fotos de qualidade:</strong> Perfis com fotos recebem 3x mais
                visualizações
              </p>
            </div>
            <div class="flex items-start gap-3">
              <CheckCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-rose-50">
                <strong>Complete sua descrição:</strong> Conte mais sobre seus serviços e
                experiência
              </p>
            </div>
            <div class="flex items-start gap-3">
              <CheckCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-rose-50">
                <strong>Mantenha-se ativo:</strong> Atualize suas informações regularmente
              </p>
            </div>
          </div>
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
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bug,
  Calendar,
  CheckCircle,
  ChevronRight,
  Edit,
  Eye,
  Gift,
  Lightbulb,
  MessageCircle,
  Settings,
  TrendingUp,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const { currentSubscription, isSubscribed, isOnTrial, trialDaysLeft } =
  storeToRefs(subscriptionStore)

const professional = ref<any>(null)
const loadingProfile = ref(true)
const loadingSubscription = ref(false)
const subscription = ref<any>(null)
const photos = ref<any[]>([])

const analytics = ref({
  views: 0,
  clicks: 0,
  previousViews: 0,
  previousClicks: 0,
})

const isReallyActive = computed(() => {
  return (
    professional.value?.is_active === true &&
    (professional.value?.subscription_status === 'active' ||
      professional.value?.subscription_status === 'trialing')
  )
})

const displayName = computed(() => {
  return (
    professional.value?.name ||
    authStore.user?.user_metadata?.name ||
    authStore.user?.email?.split('@')[0] ||
    'Profissional'
  )
})

const conversionRate = computed(() => {
  if (analytics.value.views === 0) return 0
  return Math.round((analytics.value.clicks / analytics.value.views) * 100)
})

const viewsGrowth = computed(() => {
  if (analytics.value.previousViews === 0) return 0
  return Math.round(
    ((analytics.value.views - analytics.value.previousViews) / analytics.value.previousViews) * 100,
  )
})

const clicksGrowth = computed(() => {
  if (analytics.value.previousClicks === 0) return 0
  return Math.round(
    ((analytics.value.clicks - analytics.value.previousClicks) / analytics.value.previousClicks) *
      100,
  )
})

const daysSinceCreated = computed(() => {
  if (!professional.value?.created_at) return 0
  const created = new Date(professional.value.created_at)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
})

function getSubscriptionBadgeClass(sub: any) {
  if (sub.cancel_at_period_end) {
    return 'bg-red-100 text-red-800'
  }

  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    trialing: 'bg-yellow-100 text-yellow-800',
    past_due: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
    incomplete: 'bg-orange-100 text-orange-800',
    unpaid: 'bg-red-100 text-red-800',
  }

  return classes[sub.status] || 'bg-gray-100 text-gray-800'
}

function getSubscriptionBadgeText(sub: any) {
  if (sub.cancel_at_period_end) {
    return 'Cancelada'
  }

  return getSubscriptionStatusText(sub.status)
}

function getSubscriptionStatusText(status: string) {
  return subscriptionStore.getStatusText(status)
}

function openBugReport() {
  window.open(
    'https://docs.google.com/forms/d/e/1FAIpQLSctdJqj1KXPzjQ78rIoFadtR90et9gkJJ4B6caquTGrZVKyaA/viewform?usp=publish-editor',
    '_blank',
  )
}

async function loadProfessionalData() {
  if (!authStore.user?.id) {
    router.push('/login')
    return
  }

  loadingProfile.value = true

  try {
    const { data: professionalData, error: profError } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', authStore.user.id)
      .maybeSingle()

    if (profError) {
      throw profError
    }

    if (!professionalData) {
      professional.value = null
      console.log('Nenhum profissional encontrado para este usuário')
      return
    }

    professional.value = professionalData

    await Promise.all([
      loadAnalytics(professionalData.id),
      loadPhotos(professionalData.id),
      loadSubscription(professionalData.id),
    ])
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
  } finally {
    loadingProfile.value = false
  }
}

async function loadAnalytics(professionalId: string) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const { data: currentViews, error: viewsError } = await supabase
      .from('profile_views')
      .select('id')
      .eq('professional_id', professionalId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (viewsError) throw viewsError

    const { data: previousViews } = await supabase
      .from('profile_views')
      .select('id')
      .eq('professional_id', professionalId)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())

    const { data: currentClicks, error: clicksError } = await supabase
      .from('whatsapp_clicks')
      .select('id')
      .eq('professional_id', professionalId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (clicksError) throw clicksError

    const { data: previousClicks } = await supabase
      .from('whatsapp_clicks')
      .select('id')
      .eq('professional_id', professionalId)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())

    analytics.value = {
      views: currentViews?.length || 0,
      clicks: currentClicks?.length || 0,
      previousViews: previousViews?.length || 0,
      previousClicks: previousClicks?.length || 0,
    }
  } catch (err) {
    console.error('Erro ao carregar analytics:', err)
    analytics.value = {
      views: 0,
      clicks: 0,
      previousViews: 0,
      previousClicks: 0,
    }
  }
}

async function loadPhotos(professionalId: string) {
  try {
    const { data, error } = await supabase
      .from('professional_photos')
      .select('id, photo_url, is_primary')
      .eq('professional_id', professionalId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw error

    photos.value = data || []
  } catch (err) {
    console.error('Erro ao carregar fotos:', err)
  }
}

async function loadSubscription(professionalId: string) {
  loadingSubscription.value = true
  try {
    await subscriptionStore.loadCurrentSubscription(professionalId)
    subscription.value = currentSubscription.value
  } catch (err) {
    console.error('Erro ao carregar assinatura:', err)
  } finally {
    loadingSubscription.value = false
  }
}

function formatPrice(priceCents: number) {
  return subscriptionStore.formatPrice(priceCents)
}

function formatDate(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(() => {
  loadProfessionalData()
})
</script>

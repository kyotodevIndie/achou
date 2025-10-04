<!-- src/pages/dashboard/Dashboard.vue - VERSÃO COMPLETA CORRIGIDA -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-600">Bem-vindo de volta, {{ displayName }}!</p>
      </div>

      <!-- Loading inicial -->
      <div v-if="loadingProfile" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Carregando dashboard...</p>
      </div>

      <div v-else>
        <!-- Status da Conta -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="professional?.is_active ? 'bg-green-100' : 'bg-yellow-100'"
              >
                <CheckCircle v-if="professional?.is_active" class="w-6 h-6 text-green-600" />
                <AlertTriangle v-else class="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ professional?.is_active ? 'Perfil Ativo' : 'Perfil Inativo' }}
                </h3>
                <p class="text-gray-600">
                  {{
                    professional?.is_active
                      ? 'Sua conta está ativa e aparecendo nas buscas'
                      : 'Complete seu perfil para aparecer nas buscas'
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

        <!-- Métricas Principais -->
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

        <!-- Grid de Ações e Informações -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Ações Rápidas -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                <Button
                  variant="ghost"
                  @click="$router.push('/dashboard/perfil')"
                  class="text-blue-600 hover:text-blue-700"
                >
                  <ChevronRight class="w-4 h-4" />
                </Button>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Camera class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p class="font-medium">Gerenciar Fotos ({{ photos.length }})</p>
                    <p class="text-sm text-gray-600">
                      {{
                        photos.length > 0
                          ? 'Editar fotos da sua sala'
                          : 'Adicione fotos da sua sala'
                      }}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  @click="$router.push('/dashboard/perfil')"
                  class="text-green-600 hover:text-green-700"
                >
                  <ChevronRight class="w-4 h-4" />
                </Button>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                <Button
                  variant="ghost"
                  @click="$router.push('/dashboard/analytics')"
                  class="text-purple-600 hover:text-purple-700"
                >
                  <ChevronRight class="w-4 h-4" />
                </Button>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                <Button
                  variant="ghost"
                  @click="$router.push('/dashboard/configuracoes')"
                  class="text-indigo-600 hover:text-indigo-700"
                >
                  <ChevronRight class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Assinatura -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Assinatura</h3>

            <div v-if="loadingSubscription" class="text-center py-8">
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2"
              ></div>
              <p class="text-sm text-gray-600">Carregando assinatura...</p>
            </div>

            <div v-else-if="subscription" class="space-y-4">
              <!-- AVISO DE CANCELAMENTO -->
              <div
                v-if="subscription.cancel_at_period_end"
                class="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4"
              >
                <div class="flex items-start gap-3">
                  <AlertCircle class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 class="font-semibold text-red-900 mb-1">Assinatura Cancelada</h4>
                    <p class="text-sm text-red-800 mb-2">
                      Seu plano foi cancelado e não será renovado.
                    </p>
                    <p class="text-xs text-red-700">
                      Acesso até: <strong>{{ formatDate(subscription.current_period_end) }}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">
                    {{ subscription.plan?.name || 'Plano Profissional' }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ formatPrice(subscription.plan?.price_cents || 1999) }}/mês
                  </p>
                </div>
                <span
                  class="text-sm font-medium px-3 py-1 rounded-full"
                  :class="getSubscriptionBadgeClass(subscription)"
                >
                  {{ getSubscriptionBadgeText(subscription) }}
                </span>
              </div>

              <div class="border-t pt-4">
                <div
                  v-if="subscription.status === 'trialing' && !subscription.cancel_at_period_end"
                  class="flex items-center gap-2 text-sm text-yellow-600 mb-2"
                >
                  <Gift class="w-4 h-4" />
                  <span>Período de teste: {{ trialDaysLeft }} dias restantes</span>
                </div>
                <div
                  v-else-if="subscription.status === 'active' && !subscription.cancel_at_period_end"
                  class="flex items-center gap-2 text-sm text-gray-600 mb-2"
                >
                  <Calendar class="w-4 h-4" />
                  <span>Próxima cobrança: {{ formatDate(subscription.current_period_end) }}</span>
                </div>
                <div
                  v-if="subscription.cancel_at_period_end"
                  class="flex items-center gap-2 text-sm text-red-600 mb-2"
                >
                  <Calendar class="w-4 h-4" />
                  <span>Acesso até: {{ formatDate(subscription.current_period_end) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard class="w-4 h-4" />
                  <span>**** **** **** 1234</span>
                </div>
              </div>

              <Button
                variant="outline"
                @click="$router.push('/dashboard/assinatura')"
                class="w-full mt-4"
              >
                Gerenciar Assinatura
              </Button>
            </div>

            <div v-else class="text-center py-8">
              <div class="text-4xl mb-4">💳</div>
              <h4 class="text-lg font-semibold mb-2">Nenhuma assinatura ativa</h4>
              <p class="text-gray-600 mb-6">Assine para aparecer nas buscas</p>
              <Button @click="$router.push('/assinar')" class="bg-rose-500 hover:bg-rose-600">
                Escolher plano
              </Button>
            </div>
          </div>
        </div>

        <!-- Resumo de Performance -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Resumo dos Últimos 30 Dias</h3>
            <Button variant="outline" size="sm" @click="$router.push('/dashboard/analytics')">
              Ver detalhes
            </Button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ analytics.views }}</div>
              <div class="text-sm text-gray-600">Visualizações</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ analytics.clicks }}</div>
              <div class="text-sm text-gray-600">Contatos</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ conversionRate }}%</div>
              <div class="text-sm text-gray-600">Conversão</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ photos.length }}</div>
              <div class="text-sm text-gray-600">Fotos</div>
            </div>
          </div>
        </div>

        <!-- Gráfico de Performance (Placeholder melhorado) -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Performance dos Últimos 30 Dias</h3>
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm" class="text-gray-600">
                <Filter class="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          <div
            class="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200"
          >
            <div class="text-center">
              <BarChart3 class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-600 font-medium">Gráfico de performance</p>
              <p class="text-gray-500 text-sm">
                Em breve: visualizações e cliques ao longo do tempo
              </p>
              <Button
                variant="outline"
                size="sm"
                class="mt-4"
                @click="$router.push('/dashboard/analytics')"
              >
                Ver analytics detalhado
              </Button>
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
import type { Professional, ProfessionalPhoto } from '@/types'
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Camera,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Edit,
  Eye,
  Filter,
  Gift,
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

// Estados
const loadingProfile = ref(true)
const loadingSubscription = ref(false)
const professional = ref<Professional | null>(null)
const photos = ref<ProfessionalPhoto[]>([])

const analytics = ref({
  views: 0,
  clicks: 0,
  previousViews: 0,
  previousClicks: 0,
})

const subscription = ref<any>(null)

// Getters do subscription store
const { currentSubscription, trialDaysLeft } = storeToRefs(subscriptionStore)

// Computed
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

// Funções auxiliares para assinatura
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

// Carregar dados do profissional
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
      .gte('viewed_at', thirtyDaysAgo.toISOString())

    if (viewsError) throw viewsError

    const { data: previousViews } = await supabase
      .from('profile_views')
      .select('id')
      .eq('professional_id', professionalId)
      .gte('viewed_at', sixtyDaysAgo.toISOString())
      .lt('viewed_at', thirtyDaysAgo.toISOString())

    const { data: currentClicks, error: clicksError } = await supabase
      .from('whatsapp_clicks')
      .select('id')
      .eq('professional_id', professionalId)
      .gte('clicked_at', thirtyDaysAgo.toISOString())

    if (clicksError) throw clicksError

    const { data: previousClicks } = await supabase
      .from('whatsapp_clicks')
      .select('id')
      .eq('professional_id', professionalId)
      .gte('clicked_at', sixtyDaysAgo.toISOString())
      .lt('clicked_at', thirtyDaysAgo.toISOString())

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

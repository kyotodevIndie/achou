<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <Button variant="ghost" @click="$router.push('/dashboard')" class="mb-4">
        ← Voltar para Dashboard
      </Button>

      <h1 class="text-3xl font-bold mb-2">Analytics</h1>
      <p class="text-muted-foreground">Acompanhe o desempenho do seu perfil</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
      <p class="text-gray-600">Carregando analytics...</p>
    </div>

    <div v-else class="space-y-6">
      <div class="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
        <h3 class="font-semibold">Período:</h3>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            :class="selectedPeriod === 7 ? 'bg-rose-50 border-rose-300' : ''"
            @click="changePeriod(7)"
            :disabled="loadingPeriod"
          >
            7 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            :class="selectedPeriod === 30 ? 'bg-rose-50 border-rose-300' : ''"
            @click="changePeriod(30)"
            :disabled="loadingPeriod"
          >
            30 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            :class="selectedPeriod === 90 ? 'bg-rose-50 border-rose-300' : ''"
            @click="changePeriod(90)"
            :disabled="loadingPeriod"
          >
            90 dias
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card class="p-6 relative">
          <div
            v-if="loadingPeriod"
            class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10"
          >
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
          <div :class="{ 'opacity-50': loadingPeriod }">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold">Total de Visualizações</h3>
              <Eye class="w-5 h-5 text-blue-600" />
            </div>
            <p class="text-3xl font-bold text-blue-600 mb-1">{{ analytics.currentPeriod.views }}</p>
            <div class="flex items-center gap-2 text-sm">
              <span
                class="font-medium"
                :class="viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ viewsGrowth >= 0 ? '+' : '' }}{{ viewsGrowth }}%
              </span>
              <span class="text-muted-foreground">vs período anterior</span>
            </div>
          </div>
        </Card>

        <Card class="p-6 relative">
          <div
            v-if="loadingPeriod"
            class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10"
          >
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
          <div :class="{ 'opacity-50': loadingPeriod }">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold">Cliques no WhatsApp</h3>
              <MessageCircle class="w-5 h-5 text-green-600" />
            </div>
            <p class="text-3xl font-bold text-green-600 mb-1">
              {{ analytics.currentPeriod.clicks }}
            </p>
            <div class="flex items-center gap-2 text-sm">
              <span
                class="font-medium"
                :class="clicksGrowth >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ clicksGrowth >= 0 ? '+' : '' }}{{ clicksGrowth }}%
              </span>
              <span class="text-muted-foreground">vs período anterior</span>
            </div>
          </div>
        </Card>

        <Card class="p-6 relative">
          <div
            v-if="loadingPeriod"
            class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10"
          >
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
          <div :class="{ 'opacity-50': loadingPeriod }">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold">Taxa de Conversão</h3>
              <TrendingUp class="w-5 h-5 text-purple-600" />
            </div>
            <p class="text-3xl font-bold text-purple-600 mb-1">{{ conversionRate }}%</p>
            <div class="flex items-center gap-2 text-sm">
              <span
                class="font-medium"
                :class="conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ conversionGrowth >= 0 ? '+' : '' }}{{ Math.abs(conversionGrowth) }}pp
              </span>
              <span class="text-muted-foreground">vs período anterior</span>
            </div>
          </div>
        </Card>

        <Card class="p-6 relative">
          <div
            v-if="loadingPeriod"
            class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10"
          >
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          </div>
          <div :class="{ 'opacity-50': loadingPeriod }">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold">Média Diária</h3>
              <Calendar class="w-5 h-5 text-orange-600" />
            </div>
            <p class="text-3xl font-bold text-orange-600 mb-1">{{ dailyAverage }}</p>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-muted-foreground">visualizações por dia</span>
            </div>
          </div>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card class="p-6">
          <h3 class="font-semibold mb-4">Visualizações por Período</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium">Últimos 7 dias</span>
              <span class="text-lg font-bold text-blue-600">{{ analytics.last7Days.views }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium">Últimos 30 dias</span>
              <span class="text-lg font-bold text-blue-600">{{ analytics.last30Days.views }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium">Últimos 90 dias</span>
              <span class="text-lg font-bold text-blue-600">{{ analytics.last90Days.views }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium">Total (desde o início)</span>
              <span class="text-lg font-bold text-blue-600">{{ analytics.total.views }}</span>
            </div>
          </div>
        </Card>

        <Card class="p-6">
          <h3 class="font-semibold mb-4">Contatos WhatsApp por Período</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium">Últimos 7 dias</span>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600">{{ analytics.last7Days.clicks }}</div>
                <div class="text-xs text-gray-500">
                  {{ getConversionRate(analytics.last7Days.clicks, analytics.last7Days.views) }}%
                  conversão
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium">Últimos 30 dias</span>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600">
                  {{ analytics.last30Days.clicks }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ getConversionRate(analytics.last30Days.clicks, analytics.last30Days.views) }}%
                  conversão
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium">Últimos 90 dias</span>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600">
                  {{ analytics.last90Days.clicks }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ getConversionRate(analytics.last90Days.clicks, analytics.last90Days.views) }}%
                  conversão
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium">Total (desde o início)</span>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600">{{ analytics.total.clicks }}</div>
                <div class="text-xs text-gray-500">
                  {{ getConversionRate(analytics.total.clicks, analytics.total.views) }}% conversão
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card class="p-6">
        <h3 class="font-semibold mb-4">Horários de Maior Visualização</h3>
        <div v-if="peakHours.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="hour in peakHours"
            :key="hour.hour"
            class="text-center p-4 bg-blue-50 rounded-lg"
          >
            <div class="text-2xl font-bold text-blue-600">{{ hour.hour }}h</div>
            <div class="text-sm text-gray-600">{{ hour.count }} visualizações</div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          Dados insuficientes para análise de horários
        </div>
      </Card>

      <Card class="p-6">
        <h3 class="font-semibold mb-4">Insights e Recomendações</h3>
        <div class="space-y-4">
          <div v-if="insights.length > 0">
            <div
              v-for="(insight, index) in insights"
              :key="index"
              class="flex items-start gap-3 p-4 rounded-lg"
              :class="
                insight.type === 'positive'
                  ? 'bg-green-50 border border-green-200'
                  : insight.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-blue-50 border border-blue-200'
              "
            >
              <div class="text-2xl">{{ insight.emoji }}</div>
              <div>
                <h4 class="font-medium mb-1">{{ insight.title }}</h4>
                <p class="text-sm text-gray-600">{{ insight.description }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            Continue usando a plataforma para receber insights personalizados
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <h3 class="font-semibold mb-4">Evolução ao Longo do Tempo</h3>
        <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div class="text-center">
            <BarChart3 class="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-600 font-medium">Gráfico será implementado em breve</p>
            <p class="text-gray-500 text-sm">Visualizações e cliques ao longo do tempo</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { BarChart3, Calendar, Eye, MessageCircle, TrendingUp } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const loadingPeriod = ref(false)
const selectedPeriod = ref(30)
const professionalId = ref<string | null>(null)

const analytics = ref({
  currentPeriod: { views: 0, clicks: 0 },
  previousPeriod: { views: 0, clicks: 0 },
  last7Days: { views: 0, clicks: 0 },
  last30Days: { views: 0, clicks: 0 },
  last90Days: { views: 0, clicks: 0 },
  total: { views: 0, clicks: 0 },
})

const peakHours = ref<Array<{ hour: number; count: number }>>([])

const conversionRate = computed(() => {
  if (analytics.value.currentPeriod.views === 0) return 0
  return Math.round(
    (analytics.value.currentPeriod.clicks / analytics.value.currentPeriod.views) * 100,
  )
})

const previousConversionRate = computed(() => {
  if (analytics.value.previousPeriod.views === 0) return 0
  return Math.round(
    (analytics.value.previousPeriod.clicks / analytics.value.previousPeriod.views) * 100,
  )
})

const viewsGrowth = computed(() => {
  if (analytics.value.previousPeriod.views === 0) return 0
  return Math.round(
    ((analytics.value.currentPeriod.views - analytics.value.previousPeriod.views) /
      analytics.value.previousPeriod.views) *
      100,
  )
})

const clicksGrowth = computed(() => {
  if (analytics.value.previousPeriod.clicks === 0) return 0
  return Math.round(
    ((analytics.value.currentPeriod.clicks - analytics.value.previousPeriod.clicks) /
      analytics.value.previousPeriod.clicks) *
      100,
  )
})

const conversionGrowth = computed(() => {
  return conversionRate.value - previousConversionRate.value
})

const dailyAverage = computed(() => {
  if (selectedPeriod.value === 0) return 0
  return Math.round(analytics.value.currentPeriod.views / selectedPeriod.value)
})

const insights = computed(() => {
  const insightsList = []

  if (conversionRate.value > 25) {
    insightsList.push({
      type: 'positive',
      emoji: '🎯',
      title: 'Ótima taxa de conversão!',
      description: `Sua taxa de conversão de ${conversionRate.value}% está acima da média. Continue assim!`,
    })
  } else if (conversionRate.value < 15) {
    insightsList.push({
      type: 'warning',
      emoji: '📈',
      title: 'Melhore sua taxa de conversão',
      description: 'Adicione mais fotos e melhore sua descrição para aumentar os contatos.',
    })
  }

  if (viewsGrowth.value > 20) {
    insightsList.push({
      type: 'positive',
      emoji: '🚀',
      title: 'Crescimento acelerado!',
      description: `Suas visualizações cresceram ${viewsGrowth.value}% no período. Ótimo trabalho!`,
    })
  } else if (viewsGrowth.value < 0) {
    insightsList.push({
      type: 'info',
      emoji: '💡',
      title: 'Dica para mais visibilidade',
      description:
        'Atualize seu perfil regularmente e adicione fotos para aparecer mais nas buscas.',
    })
  }

  if (analytics.value.total.views > 50 && conversionRate.value < 20) {
    insightsList.push({
      type: 'info',
      emoji: '📸',
      title: 'Adicione mais fotos',
      description: 'Profissionais com mais fotos têm até 3x mais contatos via WhatsApp.',
    })
  }

  return insightsList
})

async function loadProfessionalId() {
  if (!authStore.user?.id) {
    router.push('/login')
    return false
  }

  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', authStore.user.id)
      .single()

    if (error) throw error

    professionalId.value = data.id
    return true
  } catch (err) {
    console.error('Erro ao carregar profissional:', err)
    return false
  }
}

async function loadAnalyticsByPeriod(days: number) {
  if (!professionalId.value) return { views: 0, clicks: 0 }

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: views, error: viewsError } = await supabase
      .from('profile_views')
      .select('id')
      .eq('professional_id', professionalId.value)
      .gte('created_at', startDate.toISOString())

    if (viewsError) throw viewsError

    const { data: clicks, error: clicksError } = await supabase
      .from('whatsapp_clicks')
      .select('id')
      .eq('professional_id', professionalId.value)
      .gte('created_at', startDate.toISOString())

    if (clicksError) throw clicksError

    return {
      views: views?.length || 0,
      clicks: clicks?.length || 0,
    }
  } catch (err) {
    console.error(`Erro ao carregar analytics de ${days} dias:`, err)
    return { views: 0, clicks: 0 }
  }
}

async function loadTotalAnalytics() {
  if (!professionalId.value) return { views: 0, clicks: 0 }

  try {
    const { data: views, error: viewsError } = await supabase
      .from('profile_views')
      .select('id')
      .eq('professional_id', professionalId.value)

    if (viewsError) throw viewsError

    const { data: clicks, error: clicksError } = await supabase
      .from('whatsapp_clicks')
      .select('id')
      .eq('professional_id', professionalId.value)

    if (clicksError) throw clicksError

    return {
      views: views?.length || 0,
      clicks: clicks?.length || 0,
    }
  } catch (err) {
    console.error('Erro ao carregar analytics totais:', err)
    return { views: 0, clicks: 0 }
  }
}

async function loadPeakHours() {
  if (!professionalId.value) return

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('profile_views')
      .select('created_at')
      .eq('professional_id', professionalId.value)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (error) throw error

    const hourCounts: Record<number, number> = {}

    data?.forEach((view) => {
      const hour = new Date(view.created_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })

    peakHours.value = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  } catch (err) {
    console.error('Erro ao carregar horários de pico:', err)
  }
}

async function loadAllAnalytics() {
  loading.value = true

  try {
    const hasValidProfessional = await loadProfessionalId()
    if (!hasValidProfessional) return

    const [last7DaysData, last30DaysData, last90DaysData, totalData] = await Promise.all([
      loadAnalyticsByPeriod(7),
      loadAnalyticsByPeriod(30),
      loadAnalyticsByPeriod(90),
      loadTotalAnalytics(),
    ])

    analytics.value.last7Days = last7DaysData
    analytics.value.last30Days = last30DaysData
    analytics.value.last90Days = last90DaysData
    analytics.value.total = totalData

    await loadPeakHours()

    await updateCurrentPeriod()
  } catch (err) {
    console.error('Erro ao carregar analytics:', err)
  } finally {
    loading.value = false
  }
}

async function updateCurrentPeriod() {
  if (!professionalId.value) return

  loadingPeriod.value = true

  try {
    const currentStart = new Date()
    currentStart.setDate(currentStart.getDate() - selectedPeriod.value)

    const previousStart = new Date()
    previousStart.setDate(previousStart.getDate() - selectedPeriod.value * 2)
    const previousEnd = new Date()
    previousEnd.setDate(previousEnd.getDate() - selectedPeriod.value)

    const currentPeriodData = await loadAnalyticsByPeriod(selectedPeriod.value)

    const { data: previousViews } = await supabase
      .from('profile_views')
      .select('id')
      .eq('professional_id', professionalId.value)
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', previousEnd.toISOString())

    const { data: previousClicks } = await supabase
      .from('whatsapp_clicks')
      .select('id')
      .eq('professional_id', professionalId.value)
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', previousEnd.toISOString())

    analytics.value.currentPeriod = currentPeriodData
    analytics.value.previousPeriod = {
      views: previousViews?.length || 0,
      clicks: previousClicks?.length || 0,
    }
  } catch (err) {
    console.error('Erro ao atualizar período atual:', err)
  } finally {
    loadingPeriod.value = false
  }
}

async function changePeriod(days: number) {
  selectedPeriod.value = days
  await updateCurrentPeriod()
}

function getConversionRate(clicks: number, views: number): number {
  if (views === 0) return 0
  return Math.round((clicks / views) * 100)
}

onMounted(() => {
  loadAllAnalytics()
})
</script>

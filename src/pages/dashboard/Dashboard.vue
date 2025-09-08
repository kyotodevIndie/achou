<template>
  <div class="container mx-auto p-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
      <p class="text-muted-foreground">
        Bem-vindo de volta, {{ authStore.user?.user_metadata?.name || 'Profissional' }}!
      </p>
    </div>

    <!-- Métricas Principais -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card class="p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-100 rounded-lg">
            <Eye class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 class="font-semibold text-sm text-muted-foreground">Visualizações</h3>
            <p class="text-2xl font-bold">{{ analytics.views }}</p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-green-100 rounded-lg">
            <MessageCircle class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 class="font-semibold text-sm text-muted-foreground">Cliques WhatsApp</h3>
            <p class="text-2xl font-bold">{{ analytics.clicks }}</p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-purple-100 rounded-lg">
            <TrendingUp class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 class="font-semibold text-sm text-muted-foreground">Taxa de Conversão</h3>
            <p class="text-2xl font-bold">
              {{
                analytics.views > 0 ? Math.round((analytics.clicks / analytics.views) * 100) : 0
              }}%
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-orange-100 rounded-lg">
            <Calendar class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 class="font-semibold text-sm text-muted-foreground">Dias Ativo</h3>
            <p class="text-2xl font-bold">{{ daysSinceCreated }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Ações Rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card class="p-6">
        <h3 class="font-semibold mb-4">Perfil</h3>
        <p class="text-muted-foreground mb-4">Edite suas informações e fotos da sala</p>
        <Button @click="$router.push('/dashboard/perfil')" class="w-full">
          <Edit class="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
      </Card>

      <Card class="p-6">
        <h3 class="font-semibold mb-4">Analytics</h3>
        <p class="text-muted-foreground mb-4">Veja estatísticas detalhadas</p>
        <Button @click="$router.push('/dashboard/analytics')" variant="outline" class="w-full">
          <BarChart3 class="w-4 h-4 mr-2" />
          Ver Analytics
        </Button>
      </Card>

      <Card class="p-6">
        <h3 class="font-semibold mb-4">Configurações</h3>
        <p class="text-muted-foreground mb-4">Gerencie sua conta e assinatura</p>
        <Button @click="$router.push('/dashboard/configuracoes')" variant="outline" class="w-full">
          <Settings class="w-4 h-4 mr-2" />
          Configurações
        </Button>
      </Card>
    </div>

    <!-- Status da Conta -->
    <Card class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold mb-1">Status da Assinatura</h3>
          <p class="text-muted-foreground">Sua conta está ativa e aparecendo nas buscas</p>
        </div>
        <Badge variant="default" class="bg-green-100 text-green-800"> Ativo </Badge>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import {
  BarChart3,
  Calendar,
  Edit,
  Eye,
  MessageCircle,
  Settings,
  TrendingUp,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

const authStore = useAuthStore()

const analytics = ref({
  views: 0,
  clicks: 0,
})

const daysSinceCreated = computed(() => {
  if (!authStore.user?.created_at) return 0
  const created = new Date(authStore.user.created_at)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
})

onMounted(() => {
  // Carregar analytics do profissional
  loadAnalytics()
})

async function loadAnalytics() {
  // Implementar busca de analytics
  // Por enquanto, dados mock
  analytics.value = {
    views: 47,
    clicks: 12,
  }
}
</script>

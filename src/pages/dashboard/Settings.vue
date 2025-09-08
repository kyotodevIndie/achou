<!-- src/pages/dashboard/Settings.vue -->
<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <Button variant="ghost" @click="$router.push('/dashboard')" class="mb-4">
        ← Voltar para Dashboard
      </Button>

      <h1 class="text-3xl font-bold mb-2">Configurações</h1>
      <p class="text-muted-foreground">Gerencie sua conta e assinatura</p>
    </div>

    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Assinatura -->
      <Card class="p-6">
        <h2 class="text-xl font-semibold mb-4">Assinatura</h2>
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="font-medium">Plano Profissional</p>
            <p class="text-sm text-muted-foreground">R$ 9,99/mês</p>
          </div>
          <Badge variant="default" class="bg-green-100 text-green-800"> Ativo </Badge>
        </div>
        <p class="text-sm text-muted-foreground mb-4">Próxima cobrança: 15 de outubro de 2025</p>
        <Button variant="outline" class="w-full"> Gerenciar Assinatura </Button>
      </Card>

      <!-- Conta -->
      <Card class="p-6">
        <h2 class="text-xl font-semibold mb-4">Conta</h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium block mb-1">Email</label>
            <Input value="joao@email.com" disabled />
          </div>
          <Button variant="outline"> Alterar Senha </Button>
        </div>
      </Card>

      <!-- Zona de Perigo -->
      <Card class="p-6 border-red-200">
        <h2 class="text-xl font-semibold mb-4 text-red-600">Zona de Perigo</h2>
        <p class="text-sm text-muted-foreground mb-4">
          Estas ações são irreversíveis. Tenha certeza antes de prosseguir.
        </p>
        <div class="space-y-2">
          <Button variant="outline" class="w-full"> Pausar Conta </Button>
          <Button variant="destructive" class="w-full" @click="logout"> Sair da Conta </Button>
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
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

async function logout() {
  await authStore.signOut()
  router.push('/')
}
</script>

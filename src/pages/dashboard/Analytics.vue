<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <Button variant="ghost" @click="$router.push('/dashboard')" class="mb-4">
        ← Voltar para Dashboard
      </Button>

      <h1 class="text-3xl font-bold mb-2">Analytics</h1>
      <p class="text-muted-foreground">Acompanhe o desempenho do seu perfil</p>
    </div>

    <div class="space-y-6">
      <!-- Métricas Principais -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card class="p-6">
          <h3 class="font-semibold mb-2">Total de Visualizações</h3>
          <p class="text-3xl font-bold text-blue-600">127</p>
          <p class="text-sm text-muted-foreground">+23% este mês</p>
        </Card>

        <Card class="p-6">
          <h3 class="font-semibold mb-2">Cliques no WhatsApp</h3>
          <p class="text-3xl font-bold text-green-600">34</p>
          <p class="text-sm text-muted-foreground">+15% este mês</p>
        </Card>

        <Card class="p-6">
          <h3 class="font-semibold mb-2">Taxa de Conversão</h3>
          <p class="text-3xl font-bold text-purple-600">26.8%</p>
          <p class="text-sm text-muted-foreground">-2% este mês</p>
        </Card>
      </div>

      <!-- Gráfico Placeholder -->
      <Card class="p-6">
        <h3 class="font-semibold mb-4">Visualizações nos Últimos 30 Dias</h3>
        <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p class="text-muted-foreground">Gráfico será implementado em breve</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
</script>

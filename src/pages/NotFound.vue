<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-400 mb-4">404</h1>
      <h2 class="text-2xl font-bold mb-4">Página não encontrada</h2>
      <p class="text-muted-foreground mb-8">A página que você está procurando não existe.</p>
      <div class="space-x-4">
        <Button @click="$router.push('/')"> Ir para Home </Button>
        <Button variant="outline" @click="$router.back()"> Voltar </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

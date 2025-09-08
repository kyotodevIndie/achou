<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <Button variant="ghost" @click="$router.push('/dashboard')" class="mb-4">
        ← Voltar para Dashboard
      </Button>

      <h1 class="text-2xl font-bold">Editar Perfil</h1>
    </div>

    <Card class="max-w-2xl mx-auto p-6">
      <p class="text-center text-muted-foreground">
        Formulário de edição será implementado em breve...
      </p>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
</script>

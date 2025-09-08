AppHeader.vue// src/components/layout/AppHeader.vue
<template>
  <header class="border-b bg-white sticky top-0 z-50">
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="text-2xl font-bold text-primary"> Achou </router-link>

        <!-- Navegação -->
        <nav class="hidden md:flex items-center gap-6">
          <router-link to="/" class="text-muted-foreground hover:text-foreground transition-colors">
            Início
          </router-link>
          <router-link
            to="/busca"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            Buscar
          </router-link>
        </nav>

        <!-- Auth -->
        <div class="flex items-center gap-3">
          <template v-if="authStore.isAuthenticated">
            <Button variant="ghost" @click="$router.push('/dashboard')"> Dashboard </Button>
            <Button variant="outline" @click="logout"> Sair </Button>
          </template>
          <template v-else>
            <Button variant="outline" @click="$router.push('/login')"> Sou Profissional </Button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

async function logout() {
  await authStore.signOut()
  router.push('/')
}
</script>

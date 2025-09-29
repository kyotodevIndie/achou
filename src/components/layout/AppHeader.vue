<!-- src/components/layout/AppHeader.vue - Versão original -->
<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo e navegação -->
        <div class="flex items-center space-x-8">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">A</span>
            </div>
            <span class="text-xl font-bold text-gray-900">ACHOU</span>
          </router-link>

          <!-- Navegação principal -->
          <nav class="hidden md:flex space-x-6">
            <router-link
              to="/"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-rose-600': $route.path === '/' }"
            >
              Início
            </router-link>
            <router-link
              to="/buscar"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-rose-600': $route.path === '/buscar' }"
            >
              Buscar
            </router-link>
            <a
              href="#como-funciona"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Como funciona
            </a>
          </nav>
        </div>

        <!-- Ações do usuário -->
        <div class="flex items-center space-x-3">
          <!-- Autenticação -->
          <div v-if="isAuthenticated" class="flex items-center space-x-3">
            <!-- Dashboard -->
            <router-link
              to="/dashboard"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </router-link>

            <!-- Logout -->
            <button
              @click="handleLogout"
              class="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut class="w-4 h-4" />
              Sair
            </button>
          </div>

          <div v-else class="flex items-center space-x-3">
            <!-- Login -->
            <router-link
              to="/login"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Entrar
            </router-link>

            <!-- CTA para profissionais -->
            <button
              @click="$router.push('/login')"
              class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sou profissional
            </button>
          </div>

          <!-- Menu mobile -->
          <button @click="toggleMobileMenu" class="md:hidden p-2 text-gray-600">
            <Menu class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Menu mobile expandido -->
      <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 py-4">
        <nav class="flex flex-col space-y-2">
          <router-link
            to="/"
            @click="toggleMobileMenu"
            class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-rose-600 bg-rose-50': $route.path === '/' }"
          >
            Início
          </router-link>
          <router-link
            to="/buscar"
            @click="toggleMobileMenu"
            class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-rose-600 bg-rose-50': $route.path === '/buscar' }"
          >
            Buscar
          </router-link>
          <a
            href="#como-funciona"
            @click="toggleMobileMenu"
            class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Como funciona
          </a>

          <div class="border-t border-gray-200 pt-3 mt-3">
            <div v-if="isAuthenticated" class="flex flex-col space-y-2">
              <router-link
                to="/dashboard"
                @click="toggleMobileMenu"
                class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </router-link>
              <button
                @click="handleLogout"
                class="text-left text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sair
              </button>
            </div>
            <div v-else class="flex flex-col space-y-2">
              <router-link
                to="/login"
                @click="toggleMobileMenu"
                class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </router-link>
              <button
                @click="
                  () => {
                    $router.push('/login')
                    toggleMobileMenu()
                  }
                "
                class="text-left bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sou profissional
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { LogOut, Menu } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const showMobileMenu = ref(false)

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

async function handleLogout() {
  try {
    await authStore.signOut()
    router.push('/')
    showMobileMenu.value = false
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
</script>

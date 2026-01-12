<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8">
          <router-link to="/" class="flex items-center space-x-2">
            <img src="@/assets/images/achou-dark-logo.png" alt="Logo" class="w-30" />
          </router-link>

          <nav class="hidden md:flex space-x-6">
            <router-link
              to="/"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Início
            </router-link>
            <router-link
              to="/buscar"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Buscar
            </router-link>
            <router-link
              to="/salas-disponiveis"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Salas Disponíveis
            </router-link>
          </nav>
        </div>

        <div class="flex items-center space-x-3">
          <div v-if="isAuthenticated" class="flex items-center space-x-3">
            <router-link
              to="/dashboard"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </router-link>

            <button
              @click="handleLogout"
              class="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut class="w-4 h-4" />
              Sair
            </button>
          </div>

          <div v-else class="flex items-center space-x-3">
            <router-link
              to="/login?mode=login"
              class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Entrar
            </router-link>

            <router-link
              to="/login?mode=signup"
              class="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sou profissional
            </router-link>
          </div>

          <button @click="toggleMobileMenu" class="md:hidden p-2 text-gray-600">
            <Menu class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 py-4">
        <nav class="flex flex-col space-y-2">
          <router-link
            to="/"
            @click="toggleMobileMenu"
            class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Início
          </router-link>
          <router-link
            to="/buscar"
            @click="toggleMobileMenu"
            class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Buscar
          </router-link>
          <router-link
            to="/salas-disponiveis"
            @click="toggleMobileMenu"
            class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Salas Disponíveis
          </router-link>

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
                to="/login?mode=login"
                @click="toggleMobileMenu"
                class="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </router-link>
              <router-link
                to="/login?mode=signup"
                @click="toggleMobileMenu"
                class="text-left bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sou profissional
              </router-link>
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

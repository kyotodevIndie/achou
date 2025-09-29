<!-- src/pages/Home.vue - Dark mode com Tailwind 4 -->
<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Hero Section -->
    <section class="hero-gradient py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Encontre profissionais com <span class="text-rose-500">sala comercial</span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Conectamos você com profissionais sérios que possuem estrutura física adequada para
          atendê-lo
        </p>

        <!-- Barra de Busca -->
        <div class="max-w-2xl mx-auto mb-8">
          <div class="flex gap-2 theme-card rounded-lg shadow-lg p-2">
            <Input
              v-model="searchQuery"
              placeholder="Buscar profissional, complexo, categoria..."
              class="flex-1 border-0 text-lg theme-input"
              @keyup.enter="handleSearch"
            />
            <Button
              size="lg"
              @click="handleSearch"
              :disabled="loading"
              class="px-8 theme-button text-white"
            >
              <Search class="w-5 h-5 mr-2" />
              Buscar
            </Button>
          </div>
          <p class="text-sm text-muted-foreground mt-2">
            Busque por nome, profissão, complexo ou endereço
          </p>
        </div>

        <!-- Categorias Rápidas -->
        <div class="flex justify-center gap-3 flex-wrap max-w-4xl mx-auto">
          <Button
            v-for="category in popularCategories"
            :key="category.value"
            variant="outline"
            @click="searchByCategory(category.value)"
            class="mb-2 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            {{ category.icon }} {{ category.label }}
          </Button>
        </div>
      </div>
    </section>

    <!-- Profissionais em Destaque -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Profissionais em Destaque
        </h2>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"
          ></div>
          <p class="text-muted-foreground">Carregando profissionais...</p>
        </div>

        <!-- Erro -->
        <div v-else-if="error" class="text-center py-8">
          <div class="theme-card p-6 rounded-lg max-w-md mx-auto">
            <h3 class="font-bold text-red-600 dark:text-red-400 mb-2">⚠️ Erro de Conexão</h3>
            <p class="text-red-600 dark:text-red-400 text-sm mb-4">{{ error }}</p>
            <Button
              @click="retryLoad"
              variant="outline"
              class="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400"
            >
              Tentar novamente
            </Button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="featuredProfessionals.length === 0" class="text-center py-8">
          <div class="text-6xl mb-4">🏢</div>
          <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Nenhum profissional encontrado
          </h3>
          <p class="text-muted-foreground mb-6">Seja o primeiro a se cadastrar na sua região!</p>
          <Button class="theme-button text-white"> Cadastre-se como profissional </Button>
        </div>

        <!-- Grid de Profissionais -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProfessionalCard
            v-for="professional in featuredProfessionals"
            :key="professional.id"
            :professional="professional"
            @view-profile="goToProfile"
          />
        </div>

        <div class="text-center mt-12">
          <Button size="lg" @click="$router.push('/buscar')" class="theme-button text-white">
            Ver Todos os Profissionais
          </Button>
        </div>
      </div>
    </section>

    <!-- Seção Como Funciona -->
    <section id="como-funciona" class="py-16 bg-muted">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Como funciona
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div class="text-center">
            <div
              class="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Search class="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. Busque</h3>
            <p class="text-muted-foreground">
              Encontre profissionais por categoria, nome, complexo ou localização
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Eye class="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. Conheça</h3>
            <p class="text-muted-foreground">
              Veja o perfil completo, fotos da sala comercial e informações detalhadas
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <MessageCircle class="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">3. Conecte</h3>
            <p class="text-muted-foreground">
              Entre em contato direto via WhatsApp e agende seu atendimento
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ProfessionalCard from '@/components/professional/ProfessionalCard.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfessionalsStore } from '@/stores/professionals'
import { Eye, MessageCircle, Search } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const professionalStore = useProfessionalsStore()
const { professionals: featuredProfessionals, loading, error } = storeToRefs(professionalStore)

const searchQuery = ref('')

// Categorias mais populares
const popularCategories = [
  { label: 'Dentista', value: 'dentista', icon: '🦷' },
  { label: 'Médico', value: 'medico', icon: '👨‍⚕️' },
  { label: 'Psicólogo', value: 'psicologo', icon: '🧠' },
  { label: 'Advogado', value: 'advogado', icon: '⚖️' },
  { label: 'Contador', value: 'contador', icon: '💼' },
  { label: 'Arquiteto', value: 'arquiteto', icon: '🏗️' },
  { label: 'Consultor TI', value: 'consultor-ti', icon: '💻' },
  { label: 'Esteticista', value: 'esteticista', icon: '💅' },
]

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: searchQuery.value },
    })
  } else {
    router.push('/buscar')
  }
}

function searchByCategory(category: string) {
  router.push({
    name: 'Search',
    query: { categoria: category },
  })
}

function goToProfile(id: string) {
  router.push({ name: 'ProfessionalProfile', params: { id } })
}

function retryLoad() {
  professionalStore.searchProfessionals()
}

onMounted(() => {
  professionalStore.searchProfessionals()
})
</script>

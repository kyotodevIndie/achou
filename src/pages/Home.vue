<!-- src/pages/Home.vue -->
<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold text-gray-900 mb-6">
          Encontre profissionais com <span class="text-blue-600">sala comercial</span>
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Conectamos você com profissionais sérios que possuem estrutura física adequada
        </p>

        <!-- Barra de Busca Principal -->
        <div class="max-w-2xl mx-auto mb-8">
          <div class="flex gap-2 bg-white rounded-lg shadow-lg p-2">
            <Input
              v-model="searchQuery"
              placeholder="Buscar dentista, advogado, psicólogo..."
              class="flex-1 border-0 text-lg"
              @keyup.enter="handleSearch"
            />
            <Button size="lg" @click="handleSearch" :disabled="loading" class="px-8">
              <LucideSearch class="w-5 h-5 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        <!-- Categorias Rápidas -->
        <div class="flex justify-center gap-4 flex-wrap">
          <Button
            v-for="category in popularCategories"
            :key="category.value"
            variant="outline"
            @click="searchByCategory(category.value)"
            class="mb-2"
          >
            {{ category.icon }} {{ category.label }}
          </Button>
        </div>
      </div>
    </section>

    <!-- Profissionais em Destaque -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Profissionais em Destaque</h2>

        <div v-if="loading" class="text-center py-8">
          <p class="text-muted-foreground">Carregando profissionais...</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProfessionalCard
            v-for="professional in featuredProfessionals"
            :key="professional.id"
            :professional="professional"
            @view-profile="goToProfile"
          />
        </div>

        <div class="text-center mt-12">
          <Button size="lg" @click="$router.push('/buscar')"> Ver Todos os Profissionais </Button>
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
import { Search as LucideSearch } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const professionalStore = useProfessionalsStore()
const { professionals: featuredProfessionals, loading } = storeToRefs(professionalStore)

const searchQuery = ref('')

const popularCategories = [
  { label: 'Dentista', value: 'dentista', icon: '🦷' },
  { label: 'Advogado', value: 'advogado', icon: '⚖️' },
  { label: 'Psicólogo', value: 'psicologo', icon: '🧠' },
  { label: 'Contador', value: 'contador', icon: '💼' },
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

onMounted(() => {
  // Carregar profissionais em destaque (primeiros 6)
  professionalStore.searchProfessionals()
})
</script>

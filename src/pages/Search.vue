<!-- src/pages/Search.vue -->
<template>
  <div class="container mx-auto p-4">
    <!-- Header de Busca -->
    <div class="bg-white sticky top-16 z-40 py-4 border-b mb-6">
      <div class="flex gap-4 flex-wrap items-center">
        <Input
          v-model="searchQuery"
          placeholder="Buscar profissional..."
          class="flex-1 min-w-64"
          @input="debouncedSearch"
        />

        <Select v-model="selectedCategory" @update:model-value="handleSearch">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="dentista">Dentista</SelectItem>
            <SelectItem value="advogado">Advogado</SelectItem>
            <SelectItem value="psicologo">Psicólogo</SelectItem>
            <SelectItem value="contador">Contador</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedCity" @update:model-value="handleSearch">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            <SelectItem value="Fortaleza">Fortaleza</SelectItem>
            <SelectItem value="Caucaia">Caucaia</SelectItem>
            <SelectItem value="Maracanaú">Maracanaú</SelectItem>
          </SelectContent>
        </Select>

        <Button v-if="hasActiveFilters" variant="outline" @click="clearFilters">
          Limpar Filtros
        </Button>
      </div>
    </div>

    <!-- Resultados -->
    <div class="mb-6">
      <p class="text-muted-foreground">
        {{ totalProfessionals }} profissionais encontrados
        <span v-if="searchQuery">para "{{ searchQuery }}"</span>
      </p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-muted-foreground">Buscando profissionais...</p>
    </div>

    <div v-else-if="professionals.length === 0" class="text-center py-16">
      <p class="text-xl text-muted-foreground mb-4">Nenhum profissional encontrado</p>
      <Button @click="clearFilters">Ver todos os profissionais</Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProfessionalCard
        v-for="professional in professionals"
        :key="professional.id"
        :professional="professional"
        @viewProfile="goToProfile"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfessionalCard from '@/components/professional/ProfessionalCard.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProfessionalsStore } from '@/stores/professionals'
import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const professionalStore = useProfessionalsStore()
const { professionals, loading, totalProfessionals } = storeToRefs(professionalStore)

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedCity = ref('all')

const hasActiveFilters = computed(() =>
  Boolean(selectedCategory.value !== 'all' || selectedCity.value !== 'all'),
)

const debouncedSearch = useDebounceFn(() => {
  handleSearch()
}, 500)

async function handleSearch() {
  const searchParams = {
    query: searchQuery.value,
    category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
    city: selectedCity.value !== 'all' ? selectedCity.value : undefined,
  }

  await professionalStore.searchProfessionals(searchParams)

  // Atualizar URL
  const query: Record<string, string> = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedCategory.value !== 'all') query.categoria = selectedCategory.value
  if (selectedCity.value !== 'all') query.cidade = selectedCity.value

  router.replace({ query })
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  selectedCity.value = 'all'
  handleSearch()
}

function goToProfile(id: string) {
  router.push({ name: 'ProfessionalProfile', params: { id } })
}

onMounted(() => {
  // Pegar filtros da URL
  const query = route.query.q as string
  const category = route.query.categoria as string
  const city = route.query.cidade as string

  if (query) searchQuery.value = query
  if (category) selectedCategory.value = category
  if (city) selectedCity.value = city

  handleSearch()
})
</script>

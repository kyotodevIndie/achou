// src/stores/search.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  // State
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const selectedCity = ref('')
  const priceRange = ref('')

  // Getters
  const hasActiveFilters = computed(() =>
    Boolean(selectedCategory.value || selectedCity.value || priceRange.value),
  )

  const searchParams = computed(() => ({
    query: searchQuery.value,
    category: selectedCategory.value,
    city: selectedCity.value,
    priceRange: priceRange.value,
  }))

  // Actions
  function clearFilters() {
    selectedCategory.value = ''
    selectedCity.value = ''
    priceRange.value = ''
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  function setCategory(category: string) {
    selectedCategory.value = category
  }

  return {
    // State
    searchQuery,
    selectedCategory,
    selectedCity,
    priceRange,

    // Getters
    hasActiveFilters,
    searchParams,

    // Actions
    clearFilters,
    setSearch,
    setCategory,
  }
})

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
    <section class="relative overflow-hidden min-h-[600px] flex items-center">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
          alt="Business Building"
          class="w-full h-full object-cover"
          :style="{ transform: `translateY(${scrollY * 0.3}px)` }"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/70"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/50"
        ></div>
      </div>

      <div class="relative container mx-auto px-4 py-24">
        <div class="text-center space-y-8 animate-fade-in max-w-4xl mx-auto">
          <h1 class="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
            Conecte-se aos
            <span
              class="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent"
            >
              melhores profissionais
            </span>
            em um só lugar
          </h1>

          <p
            class="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
          >
            Uma plataforma intuitiva que conecta você aos melhores profissionais nos empreendimentos
            comerciais, facilitando sua busca e economizando seu tempo
          </p>

          <div class="max-w-2xl mx-auto mt-8">
            <div class="relative group">
              <div
                class="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"
              ></div>
              <div
                class="relative flex items-center gap-3 bg-white rounded-2xl shadow-2xl p-3 border border-gray-200 hover:border-rose-300 transition-all"
              >
                <Search class="w-6 h-6 text-gray-400 ml-2" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar profissional, complexo, categoria..."
                  class="flex-1 text-lg outline-none px-2 bg-transparent"
                  @keyup.enter="handleSearch"
                />
                <button
                  @click="handleSearch"
                  :disabled="loading"
                  class="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span>Buscar</span>
                  <ArrowRight class="w-5 h-5" />
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-300 mt-3 mb-4">
              Busque por nome, profissão, complexo ou endereço
            </p>

            <div v-if="loadingFilters" class="flex justify-center mt-6">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
            <div
              v-else-if="quickFilters.length > 0"
              class="flex flex-wrap justify-center gap-3 mt-6"
            >
              <button
                v-for="filter in quickFilters"
                :key="filter.search_term"
                @click="searchByCategory(filter.search_term)"
                class="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 hover:border-white/40 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                <span>{{ filter.search_term }}</span>
                <!-- <span
                  v-if="filter.total_searches > 0"
                  class="text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-full"
                >
                  {{ filter.total_searches }}
                </span> -->
              </button>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-6 mt-12">
            <div
              v-for="(feature, i) in features"
              :key="i"
              class="flex items-center gap-2 text-gray-200"
            >
              <component :is="feature.icon" class="w-5 h-5 text-rose-400" />
              <span class="text-sm font-medium">{{ feature.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-12">
          <div>
            <h2 class="text-4xl font-bold text-gray-900 mb-2">Complexos em Destaque</h2>
            <p class="text-gray-600">Estruturas profissionais de alta qualidade</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="scrollCarousel('left')"
              :disabled="!canScrollLeft"
              class="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <ChevronLeft class="w-6 h-6 text-gray-700" />
            </button>
            <button
              @click="scrollCarousel('right')"
              :disabled="!canScrollRight"
              class="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <ChevronRight class="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        <div v-if="loadingComplexes" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"
          ></div>
          <p class="text-muted-foreground">Carregando complexos...</p>
        </div>

        <div v-else-if="featuredComplexes.length === 0" class="text-center py-8">
          <div class="text-6xl mb-4">🏢</div>
          <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Nenhum complexo cadastrado ainda
          </h3>
          <p class="text-muted-foreground">Em breve teremos complexos comerciais cadastrados!</p>
        </div>

        <div v-else class="relative">
          <div
            ref="carouselRef"
            class="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
            @scroll="updateScrollButtons"
          >
            <div
              v-for="(complex, i) in featuredComplexes"
              :key="complex.id"
              @click="searchByComplex(complex.name)"
              class="flex-shrink-0 w-80 snap-start group cursor-pointer"
              :style="{ animation: `slideUp 0.5s ease-out ${i * 0.1}s both` }"
            >
              <div
                class="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 group-hover:border-rose-300 h-full group-hover:-translate-y-2"
              >
                <div
                  class="relative h-52 bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 overflow-hidden"
                >
                  <img
                    v-if="complex.photo_url"
                    :src="complex.photo_url"
                    :alt="complex.name"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"
                  ></div>
                  <div
                    v-if="!complex.photo_url"
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <span
                      class="text-white text-7xl font-bold opacity-50 group-hover:scale-110 transition-transform"
                    >
                      {{ complex.name.charAt(0) }}
                    </span>
                  </div>

                  <div class="absolute top-4 right-4">
                    <div class="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl">
                      <span
                        class="text-sm font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent"
                      >
                        {{ complex.count }}
                        {{ complex.count === 1 ? 'profissional' : 'profissionais' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="p-6">
                  <h3
                    class="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors"
                  >
                    {{ complex.name }}
                  </h3>
                  <div class="flex items-center gap-2 text-gray-600">
                    <MapPin class="w-4 h-4 text-rose-500" />
                    <span class="text-sm font-medium">{{ complex.city }}</span>
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-500">Ver profissionais</span>
                      <ArrowRight
                        class="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-8">
          <button
            @click="$router.push('/buscar')"
            class="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 text-lg"
          >
            Ver Todos os Complexos
          </button>
        </div>
      </div>
    </section>

    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-3">Profissionais em Destaque</h2>
          <p class="text-xl text-gray-600">Os melhores avaliados pela comunidade</p>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"
          ></div>
          <p class="text-muted-foreground">Carregando profissionais...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <div class="theme-card p-6 rounded-lg max-w-md mx-auto">
            <h3 class="font-bold text-red-600 dark:text-red-400 mb-2">⚠️ Erro de Conexão</h3>
            <p class="text-red-600 dark:text-red-400 text-sm mb-4">{{ error }}</p>
            <button
              @click="retryLoad"
              class="border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg"
            >
              Tentar novamente
            </button>
          </div>
        </div>

        <div v-else-if="featuredProfessionals.length === 0" class="text-center py-8">
          <div class="text-6xl mb-4">🏢</div>
          <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Nenhum profissional encontrado
          </h3>
          <p class="text-muted-foreground mb-6">Seja o primeiro a se cadastrar na sua região!</p>
          <button
            @click="$router.push('/cadastro')"
            class="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Cadastre-se como profissional
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(prof, i) in limitedProfessionals"
            :key="prof.id"
            class="group cursor-pointer"
            :style="{ animation: `slideUp 0.6s ease-out ${i * 0.15}s both` }"
            @click="goToProfile(prof.id)"
          >
            <div
              class="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 group-hover:border-rose-300 group-hover:-translate-y-3"
            >
              <div
                class="relative h-40 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 overflow-hidden"
              >
                <div class="absolute inset-0 opacity-10">
                  <div class="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-600"></div>
                </div>
              </div>

              <div class="relative px-6 -mt-16 mb-4">
                <div
                  class="w-32 h-32 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-white group-hover:scale-105 transition-transform"
                >
                  <img
                    v-if="prof.photos && prof.photos.length > 0"
                    :src="
                      prof.photos.find((p) => p.is_primary)?.photo_url || prof.photos[0].photo_url
                    "
                    :alt="prof.name"
                    class="w-full h-full object-cover rounded-2xl"
                  />
                  <span v-else>{{
                    prof.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                  }}</span>
                </div>
              </div>

              <div class="px-6 pb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-1">{{ prof.name }}</h3>
                <p class="text-rose-600 font-medium mb-4">{{ prof.category }}</p>

                <div class="flex items-center gap-2 mb-4">
                  <div class="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                    <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span class="font-bold text-gray-900">{{ prof.rating || 'N/A' }}</span>
                  </div>
                  <span class="text-sm text-gray-500"
                    >({{ prof.review_count || 0 }} avaliações)</span
                  >
                </div>

                <div class="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <Building2 class="w-4 h-4 text-gray-400" />
                  <span>{{ prof.complex_name }}</span>
                </div>

                <button
                  class="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Ver Perfil
                  <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-16">
          <button
            @click="$router.push('/buscar')"
            class="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 text-lg"
          >
            Ver Todos os Profissionais
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { supabase } from '@/services/api'
import { getPopularSearches, trackSearch } from '@/services/searchAnalytics'
import { useProfessionalsStore } from '@/stores/professionals'
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Star,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const professionalStore = useProfessionalsStore()
const { professionals: featuredProfessionals, loading, error } = storeToRefs(professionalStore)

const searchQuery = ref('')
const loadingComplexes = ref(true)
const featuredComplexes = ref<
  Array<{ id: string; name: string; city: string; count: number; photo_url: string | null }>
>([])
const carouselRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const autoScrollInterval = ref<number | null>(null)
const scrollY = ref(0)
const quickFilters = ref<
  Array<{ search_term: string; search_type: string; total_searches: number }>
>([])
const loadingFilters = ref(true)

const features = [
  { icon: CheckCircle2, text: 'Profissionais Verificados' },
  { icon: Clock, text: 'Resposta Rápida' },
  { icon: Award, text: 'Avaliações Reais' },
]

const limitedProfessionals = computed(() => {
  const sorted = [...featuredProfessionals.value].sort((a, b) => {
    if ((b.rating || 0) !== (a.rating || 0)) {
      return (b.rating || 0) - (a.rating || 0)
    }
    return (b.review_count || 0) - (a.review_count || 0)
  })

  return sorted.slice(0, 3)
})

// ============================================
// SUBSTITUIR A FUNÇÃO loadFeaturedComplexes NO Home.vue
// ============================================

async function loadFeaturedComplexes() {
  loadingComplexes.value = true
  try {
    // Buscar complexos cadastrados
    const { data: complexesData, error: complexError } = await supabase
      .from('complexes')
      .select('id, name, city, photo_url')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (complexError) {
      console.error('❌ Erro ao buscar complexos:', complexError)
      throw complexError
    }

    if (!complexesData || complexesData.length === 0) {
      featuredComplexes.value = []
      return
    }

    // Contar profissionais em cada complexo (APENAS COM PERFIL COMPLETO E ASSINATURA ATIVA)
    const complexesWithCount = await Promise.all(
      complexesData.map(async (complex) => {
        // Buscar profissionais com join na tabela subscriptions
        const { data: profsData, error: countError } = await supabase
          .from('professionals')
          .select(
            `
            id,
            subscriptions!inner(
              status,
              current_period_end,
              trial_end
            )
          `,
            { count: 'exact', head: false },
          )
          .eq('complex_name', complex.name)
          .eq('is_active', true)
          .eq('profile_completed', true) // ✅ NOVO
          .in('subscriptions.status', ['active', 'trialing']) // ✅ NOVO

        if (countError) {
          console.error('❌ Erro ao contar profissionais:', countError)
          return { ...complex, count: 0 }
        }

        // Filtrar apenas assinaturas válidas (não expiradas)
        const validProfs = (profsData || []).filter((prof) => {
          const subscription = Array.isArray(prof.subscriptions)
            ? prof.subscriptions[0]
            : prof.subscriptions

          if (!subscription) return false

          const status = subscription.status
          const currentPeriodEnd = subscription.current_period_end
          const trialEnd = subscription.trial_end

          // ✅ VERIFICAR SE ASSINATURA NÃO EXPIROU
          if (status === 'trialing' && trialEnd) {
            return new Date(trialEnd) > new Date()
          }

          if (status === 'active' && currentPeriodEnd) {
            return new Date(currentPeriodEnd) > new Date()
          }

          return false
        })

        return {
          ...complex,
          count: validProfs.length,
        }
      }),
    )

    // Mostrar complexos ordenados por número de profissionais
    featuredComplexes.value = complexesWithCount
      .filter((c) => c.count > 0) // Apenas complexos com profissionais válidos
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  } catch (err) {
    console.error('💥 Erro ao carregar complexos:', err)
  } finally {
    loadingComplexes.value = false
  }
}
async function loadQuickFilters() {
  loadingFilters.value = true
  try {
    const popularSearches = await getPopularSearches(6)
    quickFilters.value = popularSearches
  } catch (err) {
    console.error('💥 Erro ao carregar filtros rápidos:', err)
    quickFilters.value = []
  } finally {
    loadingFilters.value = false
  }
}

function updateScrollButtons() {
  if (!carouselRef.value) return

  const el = carouselRef.value
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 10
}

function scrollCarousel(direction: 'left' | 'right') {
  if (!carouselRef.value) return

  const scrollAmount = 340
  const newScrollPos =
    direction === 'left'
      ? carouselRef.value.scrollLeft - scrollAmount
      : carouselRef.value.scrollLeft + scrollAmount

  carouselRef.value.scrollTo({
    left: newScrollPos,
    behavior: 'smooth',
  })
}

function startAutoScroll() {
  autoScrollInterval.value = window.setInterval(() => {
    if (!carouselRef.value) return

    if (canScrollRight.value) {
      scrollCarousel('right')
    } else {
      carouselRef.value.scrollTo({
        left: 0,
        behavior: 'smooth',
      })
    }
  }, 5000)
}

function stopAutoScroll() {
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
    autoScrollInterval.value = null
  }
}

function handleScroll() {
  scrollY.value = window.scrollY
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    trackSearch(searchQuery.value.trim(), 'general', 0)

    router.push({
      name: 'Search',
      query: { q: searchQuery.value },
    })
  } else {
    router.push('/buscar')
  }
}

function searchByComplex(complexName: string) {
  trackSearch(complexName, 'complex', 0)

  router.push({
    name: 'Search',
    query: { complexo: complexName },
  })
}

function searchByCategory(searchTerm: string) {
  const filter = quickFilters.value.find((f) => f.search_term === searchTerm)
  const searchType = filter?.search_type || 'general'

  trackSearch(searchTerm, searchType as 'category' | 'complex' | 'general', 0)

  router.push({
    name: 'Search',
    query: { q: searchTerm },
  })
}

function goToProfile(id: string) {
  router.push({ name: 'ProfessionalProfile', params: { id } })
}

function retryLoad() {
  professionalStore.searchProfessionalsAdvanced({
    query: '',
    categories: [],
    specialties: [],
    priceMin: 0,
    priceMax: 1000,
    cities: [],
    neighborhoods: [],
    hasPhotos: false,
    responseTime: [],
    acceptsUrgent: false,
    verified: false,
    sortBy: 'relevance',
  })
  loadFeaturedComplexes()
}

onMounted(() => {
  professionalStore.searchProfessionalsAdvanced({
    query: '',
    categories: [],
    specialties: [],
    priceMin: 0,
    priceMax: 1000,
    cities: [],
    neighborhoods: [],
    hasPhotos: false,
    responseTime: [],
    acceptsUrgent: false,
    verified: false,
    sortBy: 'relevance',
  })
  loadFeaturedComplexes()
  loadQuickFilters()

  window.addEventListener('scroll', handleScroll)

  setTimeout(() => {
    startAutoScroll()
  }, 3000)
})

onUnmounted(() => {
  stopAutoScroll()
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

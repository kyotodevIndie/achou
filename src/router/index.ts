// src/router/index.ts
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // Página inicial
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: {
      title: 'Achou - Encontre profissionais com sala comercial',
    },
  },

  // Busca de profissionais
  {
    path: '/buscar',
    name: 'Search',
    component: () => import('@/pages/Search.vue'),
    meta: {
      title: 'Buscar Profissionais - Achou',
    },
  },

  // Perfil do profissional
  {
    path: '/profissional/:id',
    name: 'ProfessionalProfile',
    component: () => import('@/pages/Profile.vue'),
    meta: {
      title: 'Perfil Profissional - Achou',
    },
    props: true,
  },

  // Login/Cadastro profissional
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/Login.vue'),
    meta: {
      title: 'Login - Achou',
      guest: true,
    },
  },

  // Dashboard do profissional
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/dashboard/Dashboard.vue'),
    meta: {
      title: 'Dashboard - Achou',
      requiresAuth: true,
    },
  },

  // Editar perfil profissional
  {
    path: '/dashboard/perfil',
    name: 'EditProfile',
    component: () => import('../pages/dashboard/EditProfile.vue'),
    meta: {
      title: 'Editar Perfil - Achou',
      requiresAuth: true,
    },
  },

  // Configurações do profissional
  {
    path: '/dashboard/configuracoes',
    name: 'Settings',
    component: () => import('@/pages/dashboard/Settings.vue'),
    meta: {
      title: 'Configurações - Achou',
      requiresAuth: true,
    },
  },

  // Analytics do profissional
  {
    path: '/dashboard/analytics',
    name: 'Analytics',
    component: () => import('@/pages/dashboard/Analytics.vue'),
    meta: {
      title: 'Analytics - Achou',
      requiresAuth: true,
    },
  },

  // 404 - Página não encontrada
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: 'Página não encontrada - Achou',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Se tem posição salva (botão voltar), usar ela
    if (savedPosition) {
      return savedPosition
    }

    // Se tem hash (#section), rolar para ele
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // Senão, rolar para o topo
    return { top: 0 }
  },
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  // Atualizar título da página
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // Verificar autenticação
  if (to.meta.requiresAuth) {
    const { useAuthStore } = await import('../stores/auth')
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return next({
        name: 'Login',
        query: { redirect: to.fullPath },
      })
    }
  }

  // Redirecionar usuários logados para dashboard se tentarem acessar login
  if (to.meta.guest) {
    const { useAuthStore } = await import('../stores/auth')
    const authStore = useAuthStore()

    if (authStore.isAuthenticated) {
      return next({ name: 'Dashboard' })
    }
  }

  next()
})

// Loading state global
router.beforeResolve((to, from, next) => {
  // Aqui você pode adicionar loading global se quiser
  next()
})

export default router

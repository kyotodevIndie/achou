// src/router/index.ts - Router com rotas de assinatura
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/Home.vue'),
    },
    {
      path: '/buscar',
      name: 'Search',
      component: () => import('@/pages/Search.vue'),
    },
    {
      path: '/profissional/:id',
      name: 'ProfessionalProfile',
      component: () => import('@/pages/Profile.vue'),
    },
    // Rotas de autenticação
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/auth/Login.vue'),
    },
    {
      path: '/confirmar-email',
      name: 'EmailConfirmation',
      component: () => import('@/pages/auth/EmailConfirmation.vue'),
    },
    {
      path: '/esqueci-senha',
      name: 'ForgotPassword',
      component: () => import('@/pages/auth/ForgotPassword.vue'),
    },
    {
      path: '/redefinir-senha',
      name: 'ResetPassword',
      component: () => import('@/pages/auth/ResetPassword.vue'),
    },
    // Rotas de assinatura
    {
      path: '/assinar',
      name: 'Subscription',
      component: () => import('@/pages/Subscription.vue'),
    },
    {
      path: '/payment/success',
      name: 'PaymentSuccess',
      component: () => import('@/pages/payment/PaymentSuccess.vue'),
    },
    {
      path: '/payment/cancelled',
      name: 'PaymentCancelled',
      component: () => import('@/pages/payment/PaymentCancelled.vue'),
    },
    // Rotas protegidas do dashboard
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/pages/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/perfil',
      name: 'EditProfile',
      component: () => import('@/pages/dashboard/EditProfile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/configuracoes',
      name: 'DashboardSettings',
      component: () => import('@/pages/dashboard/Settings.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/analytics',
      name: 'DashboardAnalytics',
      component: () => import('@/pages/dashboard/Analytics.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/assinatura',
      name: 'SubscriptionSettings',
      component: () => import('@/pages/dashboard/SubscriptionSettings.vue'),
      meta: { requiresAuth: true },
    },
    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFound.vue'),
    },
  ],
})

// Guard para rotas protegidas
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth) {
    const authStore = useAuthStore()

    // Aguardar inicialização do auth se necessário
    if (!authStore.user) {
      await authStore.initialize()
    }

    // Verificar se usuário está autenticado
    if (!authStore.isAuthenticated) {
      console.log('Usuário não autenticado, redirecionando para login')
      // Salvar a rota que tentou acessar para redirecionar depois do login
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }

    // Verificar se email foi confirmado
    const user = authStore.user
    if (user && !user.email_confirmed_at) {
      console.log('Email não confirmado, redirecionando para confirmação')
      next({
        path: '/confirmar-email',
        query: { email: user.email },
      })
      return
    }
  }

  next()
})

export default router

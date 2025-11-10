// src/stores/auth.ts - Atualizado com redirect
import { supabase } from '@/services/api'
import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)

  // Actions
  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw new Error(authError.message)

      user.value = data.user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao fazer login'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirecionar para dashboard após confirmação
          emailRedirectTo: `${window.location.origin}/dashboard?confirmed=true`,
        },
      })

      if (authError) throw new Error(authError.message)

      user.value = data.user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar conta'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true

    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw new Error(error.message)

      user.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao fazer logout'
      console.error('Erro no logout:', err)
    } finally {
      loading.value = false
    }
  }

  // Verificar se usuário está logado ao inicializar
  async function initialize() {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      user.value = currentUser
    } catch (err) {
      console.error('Erro ao verificar usuário:', err)
    }
  }

  // Escutar mudanças de autenticação
  function setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null

      // Só redirecionar em casos específicos, não sempre
      if (event === 'SIGNED_IN' && session?.user) {
        const url = new URL(window.location.href)

        // Só redirecionar se veio da página de confirmação ou tem parâmetro confirmed
        if (url.pathname === '/confirmar-email' || url.searchParams.get('confirmed') === 'true') {
          window.location.href = '/dashboard'
        }
      }
    })
  }

  return {
    // State
    user,
    loading,
    error,

    // Getters
    isAuthenticated,

    // Actions
    signIn,
    signUp,
    signOut,
    initialize,
    setupAuthListener,
  }
})

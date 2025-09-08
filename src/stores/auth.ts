// src/stores/auth.ts
import { supabase } from '@/services/api'
import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface SignUpData {
  email: string
  password: string
  name: string
  phone: string
  category: string
}

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

  async function signUp(signUpData: SignUpData) {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            name: signUpData.name,
            phone: signUpData.phone,
            category: signUpData.category,
          },
        },
      })

      if (authError) throw new Error(authError.message)

      user.value = data.user

      // Criar perfil profissional na tabela professionals
      if (data.user) {
        await createProfessionalProfile(data.user, signUpData)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar conta'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProfessionalProfile(user: User, signUpData: SignUpData) {
    try {
      const { error } = await supabase.from('professionals').insert({
        id: user.id,
        email: signUpData.email,
        name: signUpData.name,
        phone: signUpData.phone,
        category: signUpData.category,
        address: '',
        city: '',
        price_range: '',
        is_active: false, // Ativo apenas após pagamento
      })

      if (error) throw error
    } catch (err) {
      console.error('Erro ao criar perfil profissional:', err)
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

      if (event === 'SIGNED_OUT') {
        // Limpar dados do usuário
        error.value = null
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

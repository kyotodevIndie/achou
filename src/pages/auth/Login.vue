<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div class="mx-auto w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center mb-4">
          <span class="text-white font-bold text-xl">A</span>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">ACHOU</h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ isLogin ? 'Entre na sua conta' : 'Crie sua conta profissional' }}
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="!isLogin">
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nome completo
            </label>
            <div class="mt-1">
              <Input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="w-full"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"> Email </label>
            <div class="mt-1">
              <Input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700"> Senha </label>
            <div class="mt-1">
              <Input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="w-full"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 p-3 rounded-md">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <div>
            <Button type="submit" :disabled="loading" class="w-full bg-rose-500 hover:bg-rose-600">
              <div v-if="loading" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {{ isLogin ? 'Entrando...' : 'Criando conta...' }}
              </div>
              <span v-else>
                {{ isLogin ? 'Entrar' : 'Criar conta' }}
              </span>
            </Button>
          </div>

          <div v-if="isLogin" class="text-center">
            <router-link to="/esqueci-senha" class="text-sm text-gray-600 hover:text-gray-500">
              Esqueceu sua senha?
            </router-link>
          </div>

          <div class="text-center">
            <button
              type="button"
              @click="toggleMode"
              class="text-sm text-rose-600 hover:text-rose-500"
            >
              {{ isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre aqui' }}
            </button>
          </div>
        </form>

        <div v-if="!isLogin" class="mt-6 border-t border-gray-200 pt-6">
          <div class="text-sm text-gray-600 space-y-2">
            <p class="font-medium">✓ 7 dias grátis para testar</p>
            <p>✓ Apareça nas buscas</p>
            <p>✓ Receba contatos de clientes</p>
            <p>✓ Cancele quando quiser</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
})

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = ''
  form.name = ''
  form.email = ''
  form.password = ''

  // Atualizar URL
  router.replace({ query: { mode: isLogin.value ? 'login' : 'signup' } })
}

// Observar mudanças na query da URL
watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode === 'signup') {
      isLogin.value = false
    } else if (newMode === 'login') {
      isLogin.value = true
    }
    // Limpar formulário ao trocar de modo
    error.value = ''
    form.name = ''
    form.email = ''
    form.password = ''
  },
)

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    if (!form.email || !form.password) {
      throw new Error('Email e senha são obrigatórios')
    }

    if (form.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres')
    }

    if (!isLogin.value && !form.name) {
      throw new Error('Nome é obrigatório para cadastro')
    }

    if (isLogin.value) {
      await authStore.signIn(form.email.trim(), form.password)
      router.push('/dashboard')
    } else {
      await authStore.signUp(form.email.trim(), form.password)

      router.push({
        path: '/confirmar-email',
        query: { email: form.email.trim() },
      })
    }
  } catch (err) {
    console.error('Erro na autenticação:', err)

    if (err instanceof Error) {
      if (
        err.message.includes('Email not confirmed') ||
        err.message.includes('email_not_confirmed') ||
        err.message.includes('not confirmed')
      ) {
        router.push({
          path: '/confirmar-email',
          query: { email: form.email.trim() },
        })
        return
      }

      if (err.message.includes('Invalid login credentials')) {
        error.value = 'Email ou senha incorretos'
      } else if (err.message.includes('User already registered')) {
        error.value = 'Este email já está cadastrado. Tente fazer login.'
      } else if (err.message.includes('Password should be at least 6 characters')) {
        error.value = 'A senha deve ter pelo menos 6 caracteres'
      } else if (err.message.includes('Unable to validate email address')) {
        error.value = 'Email inválido'
      } else if (err.message.includes('signup is disabled')) {
        error.value = 'Cadastros temporariamente desabilitados'
      } else {
        error.value = err.message
      }
    } else {
      error.value = 'Erro desconhecido'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Detectar modo pela URL
  const mode = route.query.mode as string
  if (mode === 'signup') {
    isLogin.value = false
  }
})
</script>

<!-- src/pages/auth/Login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <Card class="w-full max-w-md">
      <div class="p-6">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold">{{ isLogin ? 'Entrar' : 'Cadastrar' }}</h1>
          <p class="text-muted-foreground mt-2">
            {{ isLogin ? 'Acesse sua conta profissional' : 'Crie sua conta profissional' }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="text-sm font-medium block mb-1">Email</label>
            <Input
              v-model="form.email"
              type="email"
              required
              placeholder="seu@email.com"
              :disabled="loading"
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-1">Senha</label>
            <Input
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>

          <div v-if="!isLogin" class="space-y-4">
            <div>
              <label class="text-sm font-medium block mb-1">Nome Completo</label>
              <Input
                v-model="form.name"
                type="text"
                required
                placeholder="Seu nome completo"
                :disabled="loading"
              />
            </div>

            <div>
              <label class="text-sm font-medium block mb-1">Telefone</label>
              <Input
                v-model="form.phone"
                type="tel"
                required
                placeholder="(85) 99999-9999"
                :disabled="loading"
              />
            </div>

            <div>
              <label class="text-sm font-medium block mb-1">Categoria</label>
              <Select v-model="form.category" :disabled="loading">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua profissão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dentista">Dentista</SelectItem>
                  <SelectItem value="advogado">Advogado</SelectItem>
                  <SelectItem value="psicologo">Psicólogo</SelectItem>
                  <SelectItem value="contador">Contador</SelectItem>
                  <SelectItem value="arquiteto">Arquiteto</SelectItem>
                  <SelectItem value="medico">Médico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar' }}
          </Button>

          <div v-if="error" class="text-red-600 text-sm text-center">
            {{ error }}
          </div>
        </form>

        <div class="text-center mt-6">
          <button
            @click="toggleMode"
            class="text-sm text-muted-foreground hover:underline"
            :disabled="loading"
          >
            {{ isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre' }}
          </button>
        </div>

        <div class="mt-6 pt-6 border-t text-center">
          <p class="text-xs text-muted-foreground">
            Ao se cadastrar, você concorda que possui uma sala comercial e aceita pagar R$ 9,99/mês
            após o período de teste.
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SignUpData } from '@/stores/auth'
import { useAuthStore } from '@/stores/auth'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  name: '',
  phone: '',
  category: '',
})

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = ''
  // Limpar campos específicos do cadastro
  if (isLogin.value) {
    form.name = ''
    form.phone = ''
    form.category = ''
  }
}

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    if (isLogin.value) {
      // LOGIN: usa email e password
      await authStore.signIn(form.email, form.password)
    } else {
      // CADASTRO: valida campos obrigatórios
      if (!form.name || !form.phone || !form.category) {
        throw new Error('Todos os campos são obrigatórios')
      }

      // Criar objeto SignUpData
      const signUpData: SignUpData = {
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        category: form.category,
      }

      await authStore.signUp(signUpData)
    }

    // Redirecionar para onde estava tentando ir ou dashboard
    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Erro ao processar solicitação'
    console.error('Erro na autenticação:', err)
  } finally {
    loading.value = false
  }
}
</script>

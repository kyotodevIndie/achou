<!-- src/pages/auth/ForgotPassword.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div
          class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
        >
          <Key class="w-8 h-8 text-blue-600" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Esqueceu sua senha?</h2>
        <p class="text-gray-600">Digite seu email para receber o link de redefinição</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Sucesso -->
        <div v-if="emailSent" class="text-center space-y-4">
          <div
            class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Email enviado!</h3>
          <p class="text-gray-600">
            Enviamos um link para redefinir sua senha para:
            <br />
            <strong>{{ email }}</strong>
          </p>

          <div class="bg-blue-50 border border-blue-200 rounded-md p-4 text-left">
            <h4 class="font-medium text-blue-900 mb-2">Próximos passos:</h4>
            <ol class="text-sm text-blue-800 space-y-1">
              <li>1. Verifique sua caixa de entrada</li>
              <li>2. Clique no link "Redefinir senha"</li>
              <li>3. Digite sua nova senha</li>
              <li>4. Faça login com a nova senha</li>
            </ol>
          </div>

          <div class="flex gap-3">
            <Button @click="resetForm" variant="outline" class="flex-1">
              Tentar outro email
            </Button>
            <Button @click="$router.push('/login')" class="flex-1 bg-rose-500 hover:bg-rose-600">
              Voltar ao login
            </Button>
          </div>
        </div>

        <!-- Formulário -->
        <form v-else @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email da sua conta
            </label>
            <Input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full"
              placeholder="seu@email.com"
              :disabled="loading"
            />
          </div>

          <!-- Erro -->
          <div v-if="error" class="bg-red-50 border border-red-200 p-3 rounded-md">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Submit -->
          <div>
            <Button
              type="submit"
              :disabled="loading || !email.trim()"
              class="w-full bg-blue-600 hover:bg-blue-700"
            >
              <div v-if="loading" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando...
              </div>
              <div v-else class="flex items-center justify-center gap-2">
                <Mail class="w-4 h-4" />
                Enviar link de redefinição
              </div>
            </Button>
          </div>

          <!-- Links -->
          <div class="text-center space-y-2">
            <button
              type="button"
              @click="$router.push('/login')"
              class="text-sm text-gray-600 hover:text-gray-500"
            >
              ← Voltar para o login
            </button>
            <br />
            <button
              type="button"
              @click="$router.push('/cadastro')"
              class="text-sm text-rose-600 hover:text-rose-500"
            >
              Não tem conta? Cadastre-se aqui
            </button>
          </div>
        </form>

        <!-- Dicas -->
        <div class="mt-6 border-t border-gray-200 pt-6">
          <div class="text-sm text-gray-600">
            <h4 class="font-medium text-gray-900 mb-2">Não recebeu o email?</h4>
            <ul class="space-y-1">
              <li>• Verifique a pasta de spam/lixo eletrônico</li>
              <li>• Aguarde alguns minutos (pode demorar)</li>
              <li>• Confirme se o email está correto</li>
              <li>• Tente adicionar noreply@achou.com aos contatos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/services/api'
import { CheckCircle, Key, Mail } from 'lucide-vue-next'
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)
const error = ref('')
const emailSent = ref(false)

async function handleResetPassword() {
  if (!email.value.trim()) {
    error.value = 'Digite seu email'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    if (supabaseError) {
      if (supabaseError.message.includes('not found')) {
        error.value = 'Email não encontrado. Verifique se digitou corretamente.'
      } else if (supabaseError.message.includes('too many requests')) {
        error.value = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
      } else {
        error.value = supabaseError.message
      }
      return
    }

    emailSent.value = true
  } catch (err) {
    console.error('Erro ao solicitar reset de senha:', err)
    error.value = 'Erro interno. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  email.value = ''
  emailSent.value = false
  error.value = ''
}
</script>

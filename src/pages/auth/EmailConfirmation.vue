<!-- src/pages/auth/EmailConfirmation.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div
          class="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4"
        >
          <Mail class="w-8 h-8 text-yellow-600" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Confirme seu email</h2>
        <p class="text-gray-600">Enviamos um link de confirmação para seu email</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Sucesso no envio -->
        <div
          v-if="emailSent || initialEmailSent"
          class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md"
        >
          <div class="flex">
            <CheckCircle class="w-5 h-5 text-green-400 mt-0.5 mr-3" />
            <div>
              <h3 class="text-sm font-medium text-green-800">
                {{
                  initialEmailSent && !emailSent
                    ? 'Email enviado automaticamente!'
                    : 'Email reenviado!'
                }}
              </h3>
              <p class="mt-1 text-sm text-green-700">Verifique sua caixa de entrada e spam.</p>
            </div>
          </div>
        </div>

        <!-- Instruções -->
        <div class="space-y-4 mb-6">
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 class="font-medium text-blue-900 mb-2">Como confirmar:</h3>
            <ol class="text-sm text-blue-800 space-y-1">
              <li>1. Verifique sua caixa de entrada</li>
              <li>2. Procure email do ACHOU</li>
              <li>3. Clique no link de confirmação</li>
              <li>4. Você será redirecionado automaticamente</li>
            </ol>
          </div>

          <div class="text-sm text-gray-600">
            <p class="mb-2">Não recebeu o email?</p>
            <ul class="space-y-1 text-xs">
              <li>• Verifique a pasta de spam/lixo eletrônico</li>
              <li>• Aguarde alguns minutos (pode demorar)</li>
              <li>• Confirme se digitou o email corretamente</li>
            </ul>
          </div>
        </div>

        <!-- Email para reenvio -->
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Seu email
            </label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              class="w-full"
              :disabled="loading"
            />
          </div>

          <!-- Erro -->
          <div v-if="error" class="bg-red-50 border border-red-200 p-3 rounded-md">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Botões -->
          <div class="space-y-3">
            <Button
              @click="resendConfirmation"
              :disabled="loading || !email.trim() || countdown > 0"
              class="w-full bg-rose-500 hover:bg-rose-600"
            >
              <div v-if="loading" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando...
              </div>
              <div v-else-if="countdown > 0" class="flex items-center justify-center gap-2">
                <Clock class="w-4 h-4" />
                Aguarde {{ countdown }}s para reenviar
              </div>
              <div v-else class="flex items-center justify-center gap-2">
                <Mail class="w-4 h-4" />
                {{ emailSent ? 'Reenviar email' : 'Enviar confirmação' }}
              </div>
            </Button>

            <Button @click="$router.push('/login')" variant="outline" class="w-full">
              Voltar para login
            </Button>
          </div>
        </div>

        <!-- Ajuda -->
        <div class="mt-6 border-t border-gray-200 pt-6">
          <div class="text-center text-sm text-gray-600">
            <p class="mb-2">Ainda com problemas?</p>
            <button @click="showHelp = true" class="text-rose-600 hover:text-rose-500 underline">
              Ver soluções alternativas
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Ajuda -->
    <div
      v-if="showHelp"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl p-6 max-w-lg w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Precisa de ajuda?</h3>
          <button @click="showHelp = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 text-sm">
          <div>
            <h4 class="font-medium text-gray-900 mb-1">Email não chega:</h4>
            <ul class="text-gray-600 space-y-1">
              <li>• Aguarde até 10 minutos</li>
              <li>• Verifique todas as pastas (spam, promoções)</li>
              <li>• Adicione noreply@achou.com aos contatos</li>
            </ul>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-1">Link não funciona:</h4>
            <ul class="text-gray-600 space-y-1">
              <li>• Copie e cole o link no navegador</li>
              <li>• Tente em navegador diferente</li>
              <li>• Limpe cache e cookies</li>
            </ul>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 mb-1">Conta já confirmada:</h4>
            <p class="text-gray-600">Se já confirmou, tente fazer login normalmente.</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600 text-center">
            Ainda com problemas? Entre em contato:
            <br />
            <a href="mailto:suporte@achou.com" class="text-rose-600 hover:text-rose-500">
              suporte@achou.com
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/services/api'
import { CheckCircle, Clock, Mail, X } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const email = ref('')
const loading = ref(false)
const error = ref('')
const emailSent = ref(false)
const initialEmailSent = ref(false)
const showHelp = ref(false)
const countdown = ref(0)

let countdownInterval: number | null = null

async function resendConfirmation() {
  if (!email.value.trim()) {
    error.value = 'Digite seu email'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { error: supabaseError } = await supabase.auth.resend({
      type: 'signup',
      email: email.value.trim(),
    })

    if (supabaseError) {
      if (supabaseError.message.includes('already confirmed')) {
        error.value = 'Este email já foi confirmado. Tente fazer login.'
      } else if (supabaseError.message.includes('not found')) {
        error.value =
          'Email não encontrado. Verifique se digitou corretamente ou crie uma nova conta.'
      } else {
        error.value = supabaseError.message
      }
      return
    }

    emailSent.value = true
    startCountdown()
  } catch (err) {
    console.error('Erro ao reenviar confirmação:', err)
    error.value = 'Erro interno. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function startCountdown() {
  countdown.value = 60 // 60 segundos

  countdownInterval = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval!)
      countdownInterval = null
    }
  }, 1000)
}

// Enviar email automaticamente ao montar o componente
onMounted(async () => {
  // Pegar email da URL ou do localStorage se disponível
  const urlEmail = route.query.email as string
  if (urlEmail) {
    email.value = urlEmail
  }

  // Se tem email, enviar automaticamente
  if (email.value) {
    await sendInitialEmail()
  }
})

async function sendInitialEmail() {
  if (!email.value.trim()) return

  try {
    const { error: supabaseError } = await supabase.auth.resend({
      type: 'signup',
      email: email.value.trim(),
    })

    if (!supabaseError) {
      initialEmailSent.value = true
      startCountdown()
    }
  } catch (err) {
    console.error('Erro ao enviar email inicial:', err)
  }
}

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

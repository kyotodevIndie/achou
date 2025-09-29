<!-- src/pages/auth/ResetPassword.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div
          class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
        >
          <Lock class="w-8 h-8 text-green-600" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Nova senha</h2>
        <p class="text-gray-600">Digite sua nova senha abaixo</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Sucesso -->
        <div v-if="passwordUpdated" class="text-center space-y-4">
          <div
            class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Senha redefinida!</h3>
          <p class="text-gray-600">Sua senha foi alterada com sucesso.</p>

          <Button @click="$router.push('/login')" class="w-full bg-rose-500 hover:bg-rose-600">
            Fazer login agora
          </Button>
        </div>

        <!-- Formulário -->
        <form v-else @submit.prevent="handleUpdatePassword" class="space-y-6">
          <!-- Nova senha -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Nova senha
            </label>
            <div class="relative">
              <Input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pr-10"
                placeholder="Mínimo 6 caracteres"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye v-if="!showPassword" class="w-4 h-4 text-gray-400" />
                <EyeOff v-else class="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div class="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</div>
          </div>

          <!-- Confirmar senha -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmar nova senha
            </label>
            <div class="relative">
              <Input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full pr-10"
                placeholder="Digite a senha novamente"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye v-if="!showConfirmPassword" class="w-4 h-4 text-gray-400" />
                <EyeOff v-else class="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <!-- Força da senha -->
          <div v-if="form.password" class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">Força da senha:</span>
              <span :class="passwordStrengthColor">{{ passwordStrengthText }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="passwordStrengthColor.replace('text-', 'bg-')"
                :style="{ width: passwordStrengthPercentage }"
              ></div>
            </div>
          </div>

          <!-- Erro -->
          <div v-if="error" class="bg-red-50 border border-red-200 p-3 rounded-md">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Submit -->
          <div>
            <Button
              type="submit"
              :disabled="loading || !isPasswordValid"
              class="w-full bg-green-600 hover:bg-green-700"
            >
              <div v-if="loading" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Atualizando...
              </div>
              <div v-else class="flex items-center justify-center gap-2">
                <Lock class="w-4 h-4" />
                Atualizar senha
              </div>
            </Button>
          </div>

          <!-- Link para voltar -->
          <div class="text-center">
            <button
              type="button"
              @click="$router.push('/login')"
              class="text-sm text-gray-600 hover:text-gray-500"
            >
              ← Voltar para o login
            </button>
          </div>
        </form>

        <!-- Dicas de segurança -->
        <div class="mt-6 border-t border-gray-200 pt-6">
          <div class="text-sm text-gray-600">
            <h4 class="font-medium text-gray-900 mb-2">Dicas para uma senha segura:</h4>
            <ul class="space-y-1 text-xs">
              <li>• Use pelo menos 8 caracteres</li>
              <li>• Misture letras maiúsculas e minúsculas</li>
              <li>• Inclua números e símbolos</li>
              <li>• Evite informações pessoais</li>
              <li>• Não reutilize senhas de outras contas</li>
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
import { CheckCircle, Eye, EyeOff, Lock } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const error = ref('')
const passwordUpdated = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  password: '',
  confirmPassword: '',
})

// Computed para validação de senha
const isPasswordValid = computed(() => {
  return form.password.length >= 6 && form.password === form.confirmPassword
})

// Força da senha
const passwordStrength = computed(() => {
  const password = form.password
  let score = 0

  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

  return score
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'Muito fraca'
  if (strength <= 2) return 'Fraca'
  if (strength <= 3) return 'Média'
  if (strength <= 4) return 'Forte'
  return 'Muito forte'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'text-red-500'
  if (strength <= 2) return 'text-orange-500'
  if (strength <= 3) return 'text-yellow-500'
  if (strength <= 4) return 'text-green-500'
  return 'text-green-600'
})

const passwordStrengthPercentage = computed(() => {
  return `${(passwordStrength.value / 5) * 100}%`
})

async function handleUpdatePassword() {
  // Validações
  if (form.password.length < 6) {
    error.value = 'A senha deve ter pelo menos 6 caracteres'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'As senhas não coincidem'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { error: supabaseError } = await supabase.auth.updateUser({
      password: form.password,
    })

    if (supabaseError) {
      error.value = supabaseError.message
      return
    }

    passwordUpdated.value = true
  } catch (err) {
    console.error('Erro ao atualizar senha:', err)
    error.value = 'Erro interno. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Verificar se o usuário chegou aqui através do link de reset
onMounted(() => {
  // Verificar se há um hash de reset password na URL
  const hash = window.location.hash
  if (!hash || !hash.includes('type=recovery')) {
    // Se não tem o hash correto, redirecionar para forgot password
    // router.push('/esqueci-senha')
  }
})
</script>

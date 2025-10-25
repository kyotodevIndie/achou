<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <h3 class="text-lg font-semibold mb-6">Alterar Senha</h3>

    <div v-if="passwordChanged" class="bg-green-50 border border-green-200 p-4 rounded-md mb-6">
      <div class="flex">
        <CheckCircle class="w-5 h-5 text-green-400 mt-0.5 mr-3" />
        <div>
          <h4 class="text-sm font-medium text-green-800">Senha alterada!</h4>
          <p class="mt-1 text-sm text-green-700">Sua senha foi atualizada com sucesso.</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleChangePassword" class="space-y-4">
      <div>
        <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
          Senha atual
        </label>
        <div class="relative">
          <Input
            id="currentPassword"
            v-model="form.currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            required
            class="w-full pr-10"
            placeholder="Digite sua senha atual"
            :disabled="loading"
          />
          <button
            type="button"
            @click="showCurrentPassword = !showCurrentPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabindex="-1"
          >
            <Eye v-if="!showCurrentPassword" class="w-4 h-4 text-gray-400" />
            <EyeOff v-else class="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div>
        <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
          Nova senha
        </label>
        <div class="relative">
          <Input
            id="newPassword"
            v-model="form.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            required
            class="w-full pr-10"
            placeholder="Mínimo 6 caracteres"
            :disabled="loading"
          />
          <button
            type="button"
            @click="showNewPassword = !showNewPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabindex="-1"
          >
            <Eye v-if="!showNewPassword" class="w-4 h-4 text-gray-400" />
            <EyeOff v-else class="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div>
        <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 mb-2">
          Confirmar nova senha
        </label>
        <div class="relative">
          <Input
            id="confirmNewPassword"
            v-model="form.confirmNewPassword"
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
            tabindex="-1"
          >
            <Eye v-if="!showConfirmPassword" class="w-4 h-4 text-gray-400" />
            <EyeOff v-else class="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div v-if="form.newPassword" class="space-y-2">
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

      <div v-if="error" class="bg-red-50 border border-red-200 p-3 rounded-md">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <div class="flex gap-3 pt-2">
        <Button type="button" @click="resetForm" variant="outline" :disabled="loading">
          Cancelar
        </Button>
        <Button
          type="submit"
          :disabled="loading || !isFormValid"
          class="bg-blue-600 hover:bg-blue-700"
        >
          <div v-if="loading" class="flex items-center gap-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Alterando...
          </div>
          <div v-else class="flex items-center gap-2">
            <Lock class="w-4 h-4" />
            Alterar senha
          </div>
        </Button>
      </div>
    </form>

    <div class="mt-6 border-t border-gray-200 pt-4">
      <div class="text-sm text-gray-600">
        <h4 class="font-medium text-gray-900 mb-2">Dicas de segurança:</h4>
        <ul class="space-y-1 text-xs">
          <li>• Use uma senha única que não usa em outras contas</li>
          <li>• Misture letras, números e símbolos</li>
          <li>• Evite informações pessoais óbvias</li>
          <li>• Considere usar um gerenciador de senhas</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/services/api'
import { CheckCircle, Eye, EyeOff, Lock } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'

const loading = ref(false)
const error = ref('')
const passwordChanged = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const isFormValid = computed(() => {
  return (
    form.currentPassword.length >= 6 &&
    form.newPassword.length >= 6 &&
    form.newPassword === form.confirmNewPassword &&
    form.currentPassword !== form.newPassword
  )
})

const passwordStrength = computed(() => {
  const password = form.newPassword
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

async function handleChangePassword() {
  // Validações
  if (!form.currentPassword) {
    error.value = 'Digite sua senha atual'
    return
  }

  if (form.newPassword.length < 6) {
    error.value = 'A nova senha deve ter pelo menos 6 caracteres'
    return
  }

  if (form.newPassword !== form.confirmNewPassword) {
    error.value = 'As senhas não coincidem'
    return
  }

  if (form.currentPassword === form.newPassword) {
    error.value = 'A nova senha deve ser diferente da atual'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Atualizar senha diretamente - Supabase verifica automaticamente a senha atual
    const { error: updateError } = await supabase.auth.updateUser({
      password: form.newPassword,
    })

    if (updateError) {
      // Tratar erros específicos
      if (updateError.message.includes('New password should be different')) {
        error.value = 'A nova senha deve ser diferente da atual'
      } else if (updateError.message.includes('Password should be at least')) {
        error.value = 'A senha deve ter pelo menos 6 caracteres'
      } else {
        error.value = 'Erro ao alterar senha. Verifique sua senha atual.'
      }
      return
    }

    passwordChanged.value = true
    resetForm()

    // Reset success message after 5 seconds
    setTimeout(() => {
      passwordChanged.value = false
    }, 5000)
  } catch (err) {
    console.error('Erro ao alterar senha:', err)
    error.value = 'Erro interno. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmNewPassword = ''
  error.value = ''

  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}
</script>

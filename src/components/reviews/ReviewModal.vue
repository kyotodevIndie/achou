<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    @click="handleClose"
  >
    <div
      class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Deixar avaliação</h2>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
          <User class="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <p class="font-semibold text-gray-900">{{ professionalName }}</p>
          <p class="text-sm text-gray-600">{{ category }}</p>
        </div>
      </div>

      <div v-if="generalError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">{{ generalError }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2"> Sua avaliação * </label>
          <ReviewStars v-model="form.rating" />
          <p v-if="errors.rating" class="text-sm text-red-600 mt-1">
            {{ errors.rating }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2"> Seu nome * </label>
          <input
            v-model="form.userName"
            type="text"
            placeholder="Digite seu nome completo"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            maxlength="100"
          />
          <p v-if="errors.userName" class="text-sm text-red-600 mt-1">
            {{ errors.userName }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2"> Email (opcional) </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="seu@email.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">
            Apenas para contato caso necessário. Não será exibido publicamente.
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Comentário (opcional)
          </label>
          <textarea
            v-model="form.comment"
            rows="4"
            placeholder="Conte como foi sua experiência..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            maxlength="500"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ form.comment.length }}/500 caracteres</p>
        </div>

        <div>
          <div ref="captchaContainer" class="flex justify-center"></div>
          <p v-if="errors.captcha" class="text-sm text-red-600 mt-1">
            {{ errors.captcha }}
          </p>
        </div>

        <div class="flex items-start gap-2">
          <input v-model="form.acceptTerms" type="checkbox" id="terms" class="mt-1" />
          <label for="terms" class="text-sm text-gray-600">
            Confirmo que utilizei os serviços deste profissional e esta avaliação é genuína *
          </label>
        </div>
        <p v-if="errors.terms" class="text-sm text-red-600 -mt-4">
          {{ errors.terms }}
        </p>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="handleClose"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Enviando...' : 'Enviar avaliação' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, X } from 'lucide-vue-next'
import { onMounted, reactive, ref, watch } from 'vue'
import ReviewStars from './ReviewStars.vue'

const props = defineProps<{
  isOpen: boolean
  professionalId: string
  professionalName: string
  category: string
}>()

const emit = defineEmits<{
  close: []
  submit: [
    review: {
      rating: number
      userName: string
      email: string
      comment: string
      captchaToken: string
    },
  ]
}>()

const loading = ref(false)
const generalError = ref('')
const captchaContainer = ref<HTMLElement | null>(null)
const captchaWidgetId = ref<string | null>(null)
const captchaToken = ref('')

const form = reactive({
  rating: 0,
  userName: '',
  email: '',
  comment: '',
  acceptTerms: false,
})

const errors = reactive({
  rating: '',
  userName: '',
  captcha: '',
  terms: '',
})

function loadHCaptchaScript() {
  if (document.getElementById('hcaptcha-script')) return

  const script = document.createElement('script')
  script.id = 'hcaptcha-script'
  script.src = 'https://js.hcaptcha.com/1/api.js'
  script.async = true
  script.defer = true
  document.head.appendChild(script)
}

function renderCaptcha() {
  if (!captchaContainer.value || !window.hcaptcha) return

  const interval = setInterval(() => {
    if (window.hcaptcha && window.hcaptcha.render) {
      clearInterval(interval)

      captchaWidgetId.value = window.hcaptcha.render(captchaContainer.value, {
        sitekey: import.meta.env.VITE_HCAPTCHA_SITE_KEY,
        callback: (token: string) => {
          captchaToken.value = token
          errors.captcha = ''
        },
        'expired-callback': () => {
          captchaToken.value = ''
        },
      })
    }
  }, 100)
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      form.rating = 0
      form.userName = ''
      form.email = ''
      form.comment = ''
      form.acceptTerms = false
      captchaToken.value = ''
      generalError.value = ''
      errors.rating = ''
      errors.userName = ''
      errors.captcha = ''
      errors.terms = ''

      setTimeout(renderCaptcha, 100)
    } else {
      if (captchaWidgetId.value !== null && window.hcaptcha) {
        window.hcaptcha.reset(captchaWidgetId.value)
      }
    }
  },
)

function validateForm(): boolean {
  errors.rating = ''
  errors.userName = ''
  errors.captcha = ''
  errors.terms = ''

  let isValid = true

  if (form.rating === 0) {
    errors.rating = 'Por favor, selecione uma avaliação'
    isValid = false
  }

  if (!form.userName.trim()) {
    errors.userName = 'Por favor, digite seu nome'
    isValid = false
  } else if (form.userName.trim().length < 3) {
    errors.userName = 'Nome deve ter pelo menos 3 caracteres'
    isValid = false
  }

  if (!captchaToken.value) {
    errors.captcha = 'Por favor, complete o captcha'
    isValid = false
  }

  if (!form.acceptTerms) {
    errors.terms = 'Você deve confirmar os termos'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return

  loading.value = true
  generalError.value = ''

  try {
    emit('submit', {
      rating: form.rating,
      userName: form.userName.trim(),
      email: form.email.trim(),
      comment: form.comment.trim(),
      captchaToken: captchaToken.value,
    })
  } catch (err) {
    generalError.value = 'Erro ao enviar avaliação. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function handleClose() {
  if (!loading.value) {
    emit('close')
  }
}

onMounted(() => {
  loadHCaptchaScript()
})

declare global {
  interface Window {
    hcaptcha: any
  }
}
</script>

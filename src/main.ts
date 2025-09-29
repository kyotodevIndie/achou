// src/main.ts - Inicialização corrigida
import '@/assets/styles/main.css' // ou seu arquivo CSS
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import do auth store
import { useAuthStore } from './stores/auth'

async function initializeApp() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  // Inicializar autenticação ANTES do router
  const authStore = useAuthStore()
  await authStore.initialize()
  authStore.setupAuthListener()

  app.use(router)

  app.mount('#app')
}

// Inicializar app
initializeApp().catch(console.error)

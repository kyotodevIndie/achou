<!-- src/pages/payment/PaymentSuccess.vue - VERSÃO CORRIGIDA -->
<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <!-- Ícone de sucesso -->
      <div
        class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle class="w-8 h-8 text-green-600" />
      </div>

      <!-- Título -->
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Pagamento Confirmado!</h1>

      <!-- Descrição -->
      <p class="text-gray-600 mb-6">
        Sua assinatura foi ativada com sucesso. Você já pode começar a receber contatos de clientes
        interessados nos seus serviços.
      </p>

      <!-- Detalhes -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 class="font-semibold text-gray-900 mb-2">O que acontece agora:</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
            Seu perfil já aparece nas buscas
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
            Assinatura ativa por R$ 19,99/mês
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
            Próximo pagamento em 30 dias
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
            Cancele quando quiser, sem multas
          </li>
        </ul>
      </div>

      <!-- Botões de ação -->
      <div class="space-y-3">
        <Button @click="$router.push('/dashboard')" class="w-full bg-rose-500 hover:bg-rose-600">
          Ir para o Dashboard
        </Button>

        <Button @click="$router.push('/dashboard/perfil')" variant="outline" class="w-full">
          Completar Perfil
        </Button>
      </div>

      <!-- Link para home -->
      <p class="text-sm text-gray-500 mt-6">
        <router-link to="/" class="text-rose-500 hover:text-rose-600">
          Voltar para o site
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-vue-next'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  // Pegar session_id se necessário para futuras integrações
  const sessionId = route.query.session_id
  if (sessionId) {
    console.log('Stripe session ID:', sessionId)
    // Você pode fazer uma chamada aqui para verificar o status da sessão
    // se precisar de mais informações
  }
})
</script>

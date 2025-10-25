<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div
        class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <XCircle class="w-8 h-8 text-orange-600" />
      </div>

      <h1 class="text-2xl font-bold text-gray-900 mb-4">Pagamento Cancelado</h1>

      <p class="text-gray-600 mb-6">
        Não se preocupe! Nenhum valor foi cobrado. Você pode tentar novamente quando quiser.
      </p>

      <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 class="font-semibold text-gray-900 mb-2">Motivos comuns para cancelamento:</h3>
        <ul class="space-y-1 text-sm text-gray-600">
          <li>• Mudou de ideia sobre o plano</li>
          <li>• Problema com o cartão de crédito</li>
          <li>• Quer consultar antes de assinar</li>
          <li>• Fechou a página por engano</li>
        </ul>
      </div>

      <div class="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
        <p class="text-sm text-rose-800">
          <strong>Lembre-se:</strong> O teste é gratuito por 7 dias. Você só paga após o período de
          teste.
        </p>
      </div>

      <div class="space-y-3">
        <Button @click="$router.push('/assinar')" class="w-full bg-rose-500 hover:bg-rose-600">
          Tentar Novamente
        </Button>

        <Button @click="$router.push('/')" variant="outline" class="w-full">
          Voltar ao Início
        </Button>
      </div>

      <div class="mt-6 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-500 mb-2">Ainda com dúvidas?</p>
        <p class="text-sm">
          <a href="mailto:suporte@achou.com" class="text-rose-500 hover:text-rose-600">
            Entre em contato conosco
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-vue-next'
</script>

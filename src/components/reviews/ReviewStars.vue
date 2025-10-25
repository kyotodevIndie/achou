<template>
  <div class="flex items-center gap-1">
    <button
      v-for="star in 5"
      :key="star"
      type="button"
      @click="handleClick(star)"
      @mouseenter="handleHover(star)"
      @mouseleave="handleHover(0)"
      :disabled="readonly"
      :class="['transition-colors', readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110']"
    >
      <Star
        :class="[
          'w-5 h-5',
          star <= (hoverRating || modelValue) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
        ]"
      />
    </button>
    <span v-if="showCount && count !== undefined" class="text-sm text-gray-600 ml-2">
      ({{ count }})
    </span>
  </div>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    readonly?: boolean
    showCount?: boolean
    count?: number
  }>(),
  {
    readonly: false,
    showCount: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoverRating = ref(0)

function handleClick(rating: number) {
  if (!props.readonly) {
    emit('update:modelValue', rating)
  }
}

function handleHover(rating: number) {
  if (!props.readonly) {
    hoverRating.value = rating
  }
}
</script>

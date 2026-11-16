<!-- Reusable na - [qty] + control na may stock limit (kasama ang ibang size ng parehong product) -->
<template>
  <div class="d-flex align-center">
    <v-btn icon="mdi-minus" size="x-small" variant="tonal" :disabled="item.quantity <= 1"
           aria-label="Decrease quantity" @click="change(item.quantity - 1)" />
    <span class="mx-3 font-weight-bold" style="min-width: 20px; text-align: center">{{ item.quantity }}</span>
    <v-btn icon="mdi-plus" size="x-small" variant="tonal" :disabled="item.quantity >= maxFor(item)"
           aria-label="Increase quantity" @click="change(item.quantity + 1)" />
  </div>
</template>

<script setup lang="ts">
import type { CartItem } from '~/types'

const props = defineProps<{ item: CartItem }>()
const { updateQuantity, maxFor } = useCart()
const { notify } = useNotify()

function change(qty: number) {
  const res = updateQuantity(props.item.key, qty)
  if (!res.ok) notify(res.message, 'warning')
}
</script>

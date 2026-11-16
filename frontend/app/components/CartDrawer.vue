<template>
  <v-navigation-drawer v-model="drawer" location="right" temporary :width="mdAndUp ? 400 : 330">
    <div class="d-flex flex-column h-100">
      <div class="d-flex align-center pa-4">
        <span class="text-h6 font-weight-bold">Your cart</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" aria-label="Close cart" @click="drawer = false" />
      </div>
      <v-divider />

      <div v-if="!items.length" class="flex-grow-1 d-flex flex-column align-center justify-center pa-6 text-center">
        <v-icon icon="mdi-cart-outline" size="56" color="grey" class="mb-3" />
        <p class="text-medium-emphasis mb-4">Your cart is empty. Add products from the store.</p>
        <v-btn color="primary" to="/" @click="drawer = false">Browse products</v-btn>
      </div>

      <div v-else class="flex-grow-1 overflow-y-auto">
        <div v-for="item in items" :key="item.key" class="d-flex pa-4 ga-3 border-b">
          <v-img v-if="item.imageUrl" :src="item.imageUrl" width="64" height="64" cover class="rounded-lg flex-grow-0" />
          <v-sheet v-else width="64" height="64" color="grey-lighten-3" class="rounded-lg d-flex align-center justify-center">
            <v-icon icon="mdi-image-off-outline" color="grey" />
          </v-sheet>
          <div class="flex-grow-1">
            <div class="d-flex">
              <span class="font-weight-bold text-body-2">{{ item.name }}</span>
              <v-spacer />
              <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error"
                     aria-label="Remove item" @click="removeItem(item.key)" />
            </div>
            <div v-if="item.variant" class="text-caption mb-1">
              <span class="text-medium-emphasis">Size:</span> <b>{{ item.variant }}</b>
            </div>
            <div class="text-caption text-medium-emphasis mb-2">
              {{ formatPrice(item.price) }} · {{ item.stock }} available
            </div>
            <div class="d-flex align-center justify-space-between">
              <CartQuantity :item="item" />
              <span class="font-weight-bold">{{ formatPrice(lineSubtotal(item)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="items.length" class="pa-4 border-t">
        <div class="d-flex justify-space-between text-body-2 mb-1">
          <span>Total items</span><span>{{ totalItems }}</span>
        </div>
        <div class="d-flex justify-space-between text-h6 font-weight-bold mb-1">
          <span>Subtotal</span><span>{{ formatPrice(totalAmount) }}</span>
        </div>
        <div class="text-caption text-medium-emphasis mb-4">
          {{ totalAmount >= FREE_DELIVERY_MIN
            ? 'You get complimentary delivery.'
            : `Add ${formatPrice(FREE_DELIVERY_MIN - totalAmount)} more for free delivery.` }}
        </div>
        <v-btn block color="primary" size="large" to="/checkout" class="mb-2" @click="drawer = false">
          Checkout All
        </v-btn>
        <v-btn block variant="text" color="error" @click="clearCart">Clear cart</v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const { items, drawer, totalItems, totalAmount, lineSubtotal, removeItem, clearCart } = useCart()
</script>

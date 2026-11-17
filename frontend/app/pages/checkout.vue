<template>
  <div class="wrap checkout">
    <div class="head">
      <v-btn icon="mdi-arrow-left" variant="text" to="/" aria-label="Back to store" />
      <h1 class="text-h4 ml-2">Checkout</h1>
    </div>

    <ClientOnly>
      <!-- Empty cart -->
      <div v-if="!items.length" class="empty">
        <v-icon icon="mdi-shopping-outline" size="56" class="mb-3" />
        <p class="mb-4">Your cart is empty. Add products before checking out.</p>
        <v-btn color="primary" to="/shop">Go to the shop</v-btn>
      </div>

      <v-row v-else>
        <!-- ORDER SUMMARY -->
        <v-col cols="12" md="7">
          <v-card border elevation="0">
            <v-card-title class="text-h6 pt-4">Order summary</v-card-title>
            <v-divider />
            <div class="overflow-x-auto">
              <v-table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th class="text-right">Price</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Subtotal</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in items" :key="item.key">
                    <td class="py-3">
                      <div class="font-weight-medium">{{ item.name }}</div>
                      <div v-if="item.variant" class="text-caption">Size: <b>{{ item.variant }}</b></div>
                      <div class="text-caption" :class="quantityOf(item.documentId) > item.stock ? 'text-error' : 'text-medium-emphasis'">
                        {{ quantityOf(item.documentId) > item.stock ? `Only ${item.stock} left — lower the quantity` : `${item.stock} available` }}
                      </div>
                    </td>
                    <td class="text-right">{{ formatPrice(item.price) }}</td>
                    <td><div class="d-flex justify-center"><CartQuantity :item="item" /></div></td>
                    <td class="text-right font-weight-bold">{{ formatPrice(lineSubtotal(item)) }}</td>
                    <td>
                      <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error"
                             aria-label="Remove item" @click="removeItem(item.key)" />
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <v-divider />
            <v-card-text>
              <div class="d-flex justify-space-between mb-1"><span>Total items</span><span>{{ totalItems }}</span></div>
              <div class="d-flex justify-space-between mb-1"><span>Subtotal</span><span>{{ formatPrice(totalAmount) }}</span></div>
              <div class="d-flex justify-space-between mb-3">
                <span>Delivery</span>
                <span>{{ deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee) }}</span>
              </div>
              <div class="d-flex justify-space-between text-h6">
                <span>Total amount</span><span class="text-primary">{{ formatPrice(grandTotal) }}</span>
              </div>
              <p v-if="deliveryFee > 0" class="text-caption text-medium-emphasis mt-2 mb-0">
                Add {{ formatPrice(FREE_DELIVERY_MIN - totalAmount) }} more for free delivery.
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- CUSTOMER FORM -->
        <v-col cols="12" md="5">
          <v-card border elevation="0">
            <v-card-title class="text-h6 pt-4">Delivery details</v-card-title>
            <v-divider />
            <v-card-text>
              <v-form ref="formRef" @submit.prevent="placeOrder">
                <v-text-field v-model="form.fullName" label="Full name" :rules="[rules.required]" class="mb-2" />
                <v-text-field v-model="form.contactNumber" label="Contact number" placeholder="09XX XXX XXXX"
                              :rules="[rules.required, rules.phone]" class="mb-2" />
                <v-textarea v-model="form.address" label="Delivery address" rows="3" auto-grow
                            :rules="[rules.required, rules.address]" class="mb-2" />
                <div class="text-subtitle-2 font-weight-bold mb-1">Payment method</div>
                <v-radio-group v-model="form.paymentMethod" :rules="[rules.required]">
                  <v-radio v-for="m in paymentMethods" :key="m" :label="m" :value="m" color="primary" />
                </v-radio-group>

                <v-btn type="submit" block size="x-large" color="primary" :loading="processing" :disabled="!items.length">
                  Place order · {{ formatPrice(grandTotal) }}
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </ClientOnly>

    <!-- RECEIPT -->
    <v-dialog v-model="receiptDialog" max-width="520" persistent scrollable>
      <v-card class="receipt-shell" elevation="0">
        <v-card-text class="pa-0">
          <div id="receipt" class="receipt">
            <div class="r-top">
              <v-icon icon="mdi-check-circle" color="#3F6B4E" size="40" />
              <div class="r-brand"><AppLogo :size="26" /> Drip <span class="amp">&amp;</span> Scents</div>
              <div class="r-sub">Perfume · Shoes · Bags · Clothes</div>
              <div class="r-sub">Official receipt</div>
            </div>

            <div class="r-meta">
              <div><span>Order no.</span><b>{{ receipt.orderNo }}</b></div>
              <div><span>Date</span><b>{{ receipt.date }}</b></div>
              <div><span>Payment</span><b>{{ receipt.paymentMethod }}</b></div>
            </div>

            <div class="r-sep" />

            <div class="r-section">
              <div class="r-label">Deliver to</div>
              <div class="r-strong">{{ receipt.fullName }}</div>
              <div>{{ receipt.contactNumber }}</div>
              <div class="r-addr">{{ receipt.address }}</div>
            </div>

            <div class="r-sep" />

            <table class="r-items">
              <thead>
                <tr><th>Item</th><th class="num">Qty</th><th class="num">Amount</th></tr>
              </thead>
              <tbody>
                <tr v-for="i in receipt.items" :key="i.key">
                  <td>
                    <div class="r-strong">{{ i.name }}</div>
                    <div class="r-small">
                      <template v-if="i.variant">Size {{ i.variant }} · </template>{{ formatPrice(i.price) }} each
                    </div>
                  </td>
                  <td class="num">{{ i.quantity }}</td>
                  <td class="num">{{ formatPrice(i.price * i.quantity) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="r-sep" />

            <div class="r-totals">
              <div><span>Total items</span><span>{{ receipt.totalItems }}</span></div>
              <div><span>Subtotal</span><span>{{ formatPrice(receipt.subtotal) }}</span></div>
              <div><span>Delivery</span><span>{{ receipt.deliveryFee === 0 ? 'Free' : formatPrice(receipt.deliveryFee) }}</span></div>
              <div class="r-grand"><span>Total paid</span><span>{{ formatPrice(receipt.total) }}</span></div>
            </div>

            <p class="r-thanks">Thank you for shopping with us. This is a demo receipt for academic use.</p>
          </div>
        </v-card-text>
        <v-card-actions class="r-actions">
          <v-btn variant="outlined" color="primary" prepend-icon="mdi-printer-outline" @click="printReceipt">Print</v-btn>
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="finish">Continue shopping</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { CartItem, Product } from '~/types'

const { items, totalItems, totalAmount, lineSubtotal, removeItem, clearCart, syncStock, quantityOf } = useCart()
const { getProduct, errorMessage } = useStrapi()
const { notify } = useNotify()

const formRef = ref()
const processing = ref(false)
const receiptDialog = ref(false)

const form = reactive({ fullName: '', contactNumber: '', address: '', paymentMethod: '' })
const paymentMethods = ['Cash on Delivery', 'GCash', 'Credit / Debit Card', 'Bank Transfer']

const rules = {
  required: (v: string) => !!(v && String(v).trim()) || 'This field is required.',
  phone: (v: string) => /^(\+?\d[\d\s-]{8,14}\d)$/.test(v || '') || 'Enter a valid contact number.',
  address: (v: string) => (v || '').trim().length >= 10 || 'Enter a complete address.'
}

// Delivery fee: libre kapag ₱5,000 pataas
const deliveryFee = computed(() => deliveryFeeFor(totalAmount.value))
const grandTotal = computed(() => totalAmount.value + deliveryFee.value)

interface Receipt {
  orderNo: string; date: string; paymentMethod: string
  fullName: string; contactNumber: string; address: string
  items: CartItem[]; totalItems: number; subtotal: number; deliveryFee: number; total: number
}
const receipt = ref<Receipt>({
  orderNo: '', date: '', paymentMethod: '', fullName: '', contactNumber: '', address: '',
  items: [], totalItems: 0, subtotal: 0, deliveryFee: 0, total: 0
})

async function placeOrder() {
  if (!items.value.length) return notify('Your cart is empty.', 'error')

  // 1) Validate ang form
  const { valid } = await formRef.value.validate()
  if (!valid) return notify('Complete the required fields before placing your order.', 'error')

  processing.value = true
  try {
    // 2) Ipasa sa server ng Nuxt: susuriin ulit ang stock at babawasan ito sa Strapi
    try {
      await $fetch('/api/checkout', {
        method: 'POST',
        body: { items: items.value.map((i) => ({ documentId: i.documentId, quantity: i.quantity })) }
      })
    } catch (err: any) {
      if (err?.statusCode === 409) {
        // Kulang ang stock o hindi na available: i-update ang cart at HUWAG i-clear
        const fresh = await Promise.all(
          [...new Set(items.value.map((i) => i.documentId))].map((id) =>
            getProduct(id).then((r) => r.data).catch(() => null)
          )
        )
        syncStock(fresh.filter((p): p is Product => !!p))
      }
      notify(errorMessage(err), 'error')
      return
    }

    // 3) Gumawa ng resibo BAGO i-clear ang cart at form
    receipt.value = {
      orderNo: 'DS-' + Date.now().toString().slice(-8),
      date: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
      paymentMethod: form.paymentMethod,
      fullName: form.fullName.trim(),
      contactNumber: form.contactNumber.trim(),
      address: form.address.trim(),
      items: items.value.map((i) => ({ ...i })),
      totalItems: totalItems.value,
      subtotal: totalAmount.value,
      deliveryFee: deliveryFee.value,
      total: grandTotal.value
    }

    // 4) Success: ipakita ang resibo, i-clear ang cart, i-refresh ang product data
    receiptDialog.value = true
    clearCart()
    formRef.value?.reset()
    await refreshNuxtData(['products', 'admin-products'])
  } catch (err) {
    notify(`Checkout failed: ${errorMessage(err)}`, 'error')
  } finally {
    processing.value = false
  }
}

function printReceipt() {
  window.print()
}

function finish() {
  receiptDialog.value = false
  navigateTo('/shop')
}
</script>

<style scoped>
.checkout { padding-top: 40px; padding-bottom: 24px; }
.head { display: flex; align-items: center; margin-bottom: 28px; }
.empty { text-align: center; padding: 72px 0; border: 1px solid var(--line); }
</style>

<!-- Hindi scoped: ang dialog ay nasa labas ng page sa DOM -->
<style>
.receipt-shell { background: transparent !important; }
.receipt {
  background: #FBF8F3;
  color: #231F1C;
  padding: 32px 32px 24px;
  font-family: var(--font-ui);
  font-variant-numeric: lining-nums tabular-nums;
}
.receipt .r-top { text-align: center; margin-bottom: 20px; }
.receipt .r-brand { font-family: var(--font-display); font-size: 2rem; font-weight: 600; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 10px; }
.receipt .amp { font-style: italic; color: #A07D49; font-weight: 500; }
.receipt .r-sub { font-size: 0.8rem; color: #6F6863; }
.receipt .r-meta > div,
.receipt .r-totals > div { display: flex; justify-content: space-between; gap: 16px; padding: 3px 0; font-size: 0.9rem; }
.receipt .r-meta span,
.receipt .r-totals span:first-child { color: #6F6863; }
.receipt .r-sep { border-top: 1px dashed #CFC6BB; margin: 16px 0; }
.receipt .r-label { font-size: 0.75rem; color: #6F6863; margin-bottom: 4px; }
.receipt .r-strong { font-weight: 600; }
.receipt .r-small { font-size: 0.78rem; color: #6F6863; }
.receipt .r-addr { white-space: pre-line; font-size: 0.9rem; }
.receipt .r-section { font-size: 0.9rem; line-height: 1.5; }
.receipt .r-items { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.receipt .r-items th { text-align: left; font-size: 0.75rem; color: #6F6863; font-weight: 500; padding-bottom: 6px; }
.receipt .r-items td { padding: 8px 0; vertical-align: top; border-top: 1px solid #ECE6DF; }
.receipt .r-items .num { text-align: right; white-space: nowrap; padding-left: 12px; }
.receipt .r-grand { margin-top: 8px; padding-top: 10px !important; border-top: 1px solid #231F1C; font-size: 1.15rem !important; font-weight: 700; }
.receipt .r-grand span { color: #231F1C !important; }
.receipt .r-thanks { text-align: center; font-size: 0.78rem; color: #6F6863; margin: 22px 0 0; }
.r-actions { background: #1C1513; padding: 14px 16px !important; }

/* Kapag pinindot ang Print, resibo lang ang lalabas sa papel */
@media print {
  body * { visibility: hidden !important; }
  #receipt, #receipt * { visibility: visible !important; }
  #receipt { position: fixed; left: 0; top: 0; width: 100%; padding: 24px; }
}
</style>

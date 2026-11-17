<template>
  <div class="wrap pdp">
    <nav class="crumbs" aria-label="Breadcrumb">
      <NuxtLink to="/">Home</NuxtLink><span>/</span>
      <NuxtLink to="/shop">Shop</NuxtLink><span>/</span>
      <template v-if="product">
        <NuxtLink :to="{ path: '/shop', query: { category: product.category } }">{{ product.category }}</NuxtLink><span>/</span>
        <span aria-current="page">{{ product.name }}</span>
      </template>
    </nav>

    <!-- Loading -->
    <v-row v-if="pending">
      <v-col cols="12" md="6"><v-skeleton-loader type="image" height="520" /></v-col>
      <v-col cols="12" md="6"><v-skeleton-loader type="article, paragraph, button" /></v-col>
    </v-row>

    <!-- Hindi mahanap / hindi available -->
    <div v-else-if="!product || !product.isActive" class="missing">
      <h1 class="page-title">This piece is no longer available</h1>
      <p class="page-lede">It may have sold out or been removed from the collection.</p>
      <v-btn color="primary" size="large" to="/shop">Back to the shop</v-btn>
    </div>

    <!-- PRODUCT -->
    <div v-else class="pdp-grid">
      <div class="media">
        <div v-if="imageUrl" class="media-blur" :style="{ backgroundImage: `url('${imageUrl}')` }" aria-hidden="true" />
        <img v-if="imageUrl" :src="imageUrl" :alt="product.name" class="media-img">
        <div v-else class="media-empty"><v-icon icon="mdi-image-off-outline" size="56" /></div>
        <span v-if="product.stock <= 0" class="tag">Sold out</span>
        <span v-else-if="product.stock <= 5" class="tag low">Only {{ product.stock }} left</span>
      </div>

      <div class="info">
        <p class="cat">{{ product.category }}</p>
        <h1 class="name">{{ product.name }}</h1>
        <div class="price">
          <span v-if="config && !selected && hasPriceRange(config.options)" class="from">From </span>{{ formatPrice(displayPrice) }}
        </div>

        <p class="desc">{{ product.description || 'A standout piece from the Drip & Scents collection.' }}</p>

        <!-- Size -->
        <div v-if="config" class="sizes" role="radiogroup" :aria-label="config.label">
          <div class="sizes-top">
            <span class="sizes-label">{{ config.label }}</span>
            <span v-if="selected" class="sizes-chosen">Selected: {{ selected }}</span>
          </div>
          <div class="sizes-row">
            <button
              v-for="opt in config.options" :key="opt" type="button" role="radio"
              class="size" :class="{ active: selected === opt }" :aria-checked="selected === opt"
              :disabled="product.stock <= 0" @click="selected = opt"
            >
              <span>{{ opt }}</span>
              <small v-if="hasPriceRange(config.options)">{{ formatPrice(priceFor(product.price, opt)) }}</small>
            </button>
          </div>
        </div>

        <div class="actions">
          <v-btn color="primary" size="x-large" class="flex-grow-1" :disabled="remaining <= 0" @click="onAdd">
            {{ buttonText }}
          </v-btn>
          <v-btn
            size="x-large" variant="outlined" :color="wished ? 'primary' : undefined"
            :icon="wished ? 'mdi-heart' : 'mdi-heart-outline'"
            :aria-label="wished ? 'Remove from wishlist' : 'Add to wishlist'" @click="onWishlist"
          />
        </div>
        <p class="stock">{{ product.stock > 0 ? `${product.stock} in stock` : 'Currently sold out' }}</p>

        <ul class="perks">
          <li><v-icon icon="mdi-truck-fast-outline" size="20" /> Free delivery on orders over {{ formatPrice(FREE_DELIVERY_MIN) }}</li>
          <li><v-icon icon="mdi-shield-check-outline" size="20" /> Authentic, checked before it ships</li>
          <li><v-icon icon="mdi-lock-outline" size="20" /> Stock is confirmed again at checkout</li>
        </ul>
      </div>
    </div>

    <!-- YOU MAY ALSO LIKE -->
    <section v-if="product && related.length" class="related">
      <div class="related-head">
        <h2 class="related-title">You may also like</h2>
        <NuxtLink :to="{ path: '/shop', query: { category: product.category } }" class="link-gold">
          More {{ product.category }} <v-icon icon="mdi-arrow-right" size="16" />
        </NuxtLink>
      </div>
      <v-row class="collection">
        <v-col v-for="p in related" :key="p.documentId" cols="12" sm="6" md="3">
          <ProductCard :product="p" />
        </v-col>
      </v-row>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => String(route.params.id))

const { getProduct, getActiveProducts, mediaUrl } = useStrapi()
const { addToCart, quantityOf } = useCart()
const { isWished, toggleWishlist } = useWishlist()
const { notify } = useNotify()

// Isang product (GET /api/products/:documentId?populate=image)
const { data, pending } = await useAsyncData(
  () => `product-${id.value}`,
  () => getProduct(id.value).catch(() => null),
  { watch: [id] }
)
const product = computed(() => data.value?.data ?? null)

// Para sa "You may also like"
const { data: all } = await useAsyncData('products', () => getActiveProducts())
const related = computed(() =>
  (all.value?.data ?? [])
    .filter((p) => p.isActive && p.category === product.value?.category && p.documentId !== product.value?.documentId)
    .slice(0, 4)
)

useHead(() => ({ title: product.value ? `${product.value.name} · Drip & Scents` : 'Drip & Scents' }))

const imageUrl = computed(() => mediaUrl(product.value?.image))
const config = computed(() => variantConfig(product.value?.category))
const selected = ref<string | null>(null)
watch(id, () => { selected.value = null })

const displayPrice = computed(() => priceFor(product.value?.price ?? 0, selected.value))
const remaining = computed(() => (product.value ? product.value.stock - quantityOf(product.value.documentId) : 0))
const wished = computed(() => (product.value ? isWished(product.value.documentId) : false))

const buttonText = computed(() => {
  if (!product.value || product.value.stock <= 0) return 'Sold out'
  if (remaining.value <= 0) return 'All stock in your cart'
  if (config.value && !selected.value) return 'Select size'
  return `Add to cart · ${formatPrice(displayPrice.value)}`
})

function onAdd() {
  if (!product.value) return
  if (config.value && !selected.value) {
    notify('Please choose a size first.', 'warning')
    return
  }
  const res = addToCart(product.value, 1, selected.value)
  notify(res.message, res.ok ? 'success' : 'error')
}

function onWishlist() {
  if (!product.value) return
  const added = toggleWishlist(product.value)
  notify(added ? 'Added to wishlist.' : 'Removed from wishlist.', 'info')
}
</script>

<style scoped>
.pdp { padding-top: 36px; }
.pdp-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 64px; align-items: start; margin-top: 24px; }

.media { position: relative; aspect-ratio: 1; overflow: hidden; background: #F4F2EF; outline: 1px solid rgba(196,160,106,.45); outline-offset: 12px; }
.media-blur { position: absolute; inset: -30px; background-size: cover; background-position: center; filter: blur(28px); opacity: .85; }
.media-img { position: relative; width: 100%; height: 100%; object-fit: contain; padding: 6%; display: block; }
.media-empty { height: 100%; display: flex; align-items: center; justify-content: center; color: var(--muted); background: var(--sand); }
.tag { position: absolute; top: 16px; left: 16px; z-index: 1; background: var(--gold); color: var(--night); font-size: .8rem; font-weight: 700; padding: 5px 12px; }
.tag.low { background: var(--night); color: var(--gold); }

.info { position: sticky; top: 108px; }
.cat { color: var(--gold); font-weight: 600; margin: 0 0 8px; }
.name { font-family: var(--font-display); font-size: clamp(2.4rem, 4.4vw, 3.6rem); font-weight: 600; line-height: 1.02; margin: 0 0 14px; }
.price { font-family: var(--font-display); font-size: 2rem; font-weight: 600; margin-bottom: 22px; }
.from { font-family: var(--font-ui); font-size: 1rem; color: var(--muted); font-weight: 500; }
.desc { color: #D9CFC5; line-height: 1.8; margin: 0 0 30px; max-width: 56ch; }

.sizes { margin-bottom: 26px; }
.sizes-top { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: .88rem; }
.sizes-label { color: var(--muted); }
.sizes-chosen { color: var(--gold); font-weight: 600; }
.sizes-row { display: flex; flex-wrap: wrap; gap: 8px; }
.size {
  min-width: 64px; padding: 10px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: transparent; color: var(--ink);
  border: 1px solid var(--line); border-radius: 2px;
  font: inherit; font-weight: 600; cursor: pointer;
}
.size small { font-weight: 500; font-size: .72rem; color: var(--muted); }
.size:hover:not(:disabled) { border-color: var(--gold); }
.size.active { background: var(--gold); border-color: var(--gold); color: var(--night); }
.size.active small { color: var(--night); }
.size:disabled { opacity: .4; cursor: not-allowed; }

.actions { display: flex; gap: 12px; }
.stock { color: var(--muted); font-size: .88rem; margin: 12px 0 28px; }
.perks { list-style: none; padding: 22px 0 0; margin: 0; border-top: 1px solid var(--line); display: grid; gap: 12px; color: #D9CFC5; font-size: .92rem; }
.perks li { display: flex; align-items: center; gap: 12px; }
.perks .v-icon { color: var(--gold); }

.missing { text-align: center; padding: 96px 0; }

.related { margin-top: 120px; }
.related-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding-bottom: 14px; margin-bottom: 24px; border-bottom: 1px solid rgba(196,160,106,.35); }
.related-title { font-family: var(--font-display); font-size: 2.2rem; font-weight: 600; margin: 0; }
.link-gold { color: var(--gold); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }

@media (max-width: 960px) {
  .pdp-grid { grid-template-columns: 1fr; gap: 40px; }
  .info { position: static; }
}
</style>

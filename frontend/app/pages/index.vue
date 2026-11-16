<template>
  <div>
    <!-- HERO (dark, full-bleed) -->
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <h1 class="hero-title">Dressed in<br>every detail.</h1>
          <p class="hero-lede">
            Fragrance, footwear, bags and clothing, curated to be worn together.
            Every order checks live stock before it is confirmed.
          </p>
          <div class="hero-actions">
            <v-btn size="x-large" class="btn-gold" @click="scrollToProducts">Shop the collection</v-btn>
            <v-btn size="x-large" variant="outlined" class="btn-ghost" to="/products">Manage products</v-btn>
          </div>
          <dl class="hero-facts">
            <div><dt>{{ activeProducts.length }}</dt><dd>pieces available</dd></div>
            <div><dt>{{ categories.length }}</dt><dd>{{ categories.length === 1 ? 'category' : 'categories' }}</dd></div>
            <div><dt>2–3</dt><dd>days delivery</dd></div>
          </dl>
        </div>

        <!-- Stacked product photos galing Strapi -->
        <div class="stack" aria-hidden="true">
          <div v-if="heroImages[1]" class="tile tile-left"><img :src="heroImages[1]" alt=""></div>
          <div v-if="heroImages[2]" class="tile tile-right"><img :src="heroImages[2]" alt=""></div>
          <div class="arch"><img v-if="heroImages[0]" :src="heroImages[0]" alt=""></div>
          <div v-if="heroProducts[0]" class="hero-caption">
            <span class="cap-name">{{ heroProducts[0].name }}</span>
            <span class="cap-price">{{ formatPrice(heroProducts[0].price) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SIGNATURE PICK -->
    <section v-if="signature" class="wrap signature">
      <div class="sig-media">
        <template v-if="mediaUrl(signature.image)">
          <div class="sig-blur" :style="{ backgroundImage: `url('${mediaUrl(signature.image)}')` }" aria-hidden="true" />
          <img :src="mediaUrl(signature.image)" :alt="signature.name">
        </template>
      </div>
      <div class="sig-copy">
        <h2 class="sig-label">This week’s signature</h2>
        <p class="sig-cat">{{ signature.category }}</p>
        <h3 class="sig-name">{{ signature.name }}</h3>
        <p class="sig-desc">{{ signature.description || 'A standout piece from the collection.' }}</p>
        <div class="sig-price">
          <span v-if="sigConfig && !sigSize && hasPriceRange(sigConfig.options)" class="sig-from">From </span>{{ formatPrice(priceFor(signature.price, sigSize)) }}
        </div>
        <div v-if="sigConfig" class="sig-sizes" role="radiogroup" :aria-label="sigConfig.label">
          <span class="sig-sizes-label">{{ sigConfig.label }}</span>
          <div class="sig-sizes-row">
            <button
              v-for="opt in sigConfig.options" :key="opt" type="button" role="radio"
              class="sig-size" :class="{ active: sigSize === opt }" :aria-checked="sigSize === opt"
              @click="sigSize = opt"
            >{{ opt }}</button>
          </div>
        </div>
        <div class="sig-actions">
          <v-btn color="primary" size="x-large" :disabled="signatureRemaining <= 0" @click="addSignature">
            {{ signatureRemaining <= 0 ? 'All stock in your cart'
              : sigConfig && !sigSize ? 'Select size'
              : sigSize ? `Add to cart · ${sigSize}` : 'Add to cart' }}
          </v-btn>
          <span class="sig-stock">{{ signature.stock }} in stock</span>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="wrap cats">
      <h2 class="section-title">Shop by category</h2>
      <div class="cat-list" role="tablist">
        <button
          v-for="cat in ['All Categories', ...categories]" :key="cat" type="button" role="tab"
          class="cat" :class="{ active: selectedCategory === cat }" :aria-selected="selectedCategory === cat"
          @click="pickCategory(cat)"
        >
          {{ cat === 'All Categories' ? 'All' : cat }}
        </button>
      </div>
    </section>

    <!-- PROMO -->
    <section class="promo">
      <div class="wrap promo-inner">
        <div>
          <h2 class="promo-title">Complimentary delivery on orders over ₱5,000</h2>
          <p class="promo-text">Pair a scent with a bag, a fit, or a fresh pair. Applied automatically at checkout.</p>
        </div>
        <v-btn size="large" class="btn-gold" @click="scrollToProducts">Start shopping</v-btn>
      </div>
    </section>

    <!-- PRODUCTS -->
    <section id="products" class="wrap collection">
      <div class="collection-head">
        <div>
          <h2 class="section-title mb-1">The collection</h2>
          <p class="count">{{ filteredProducts.length }} of {{ activeProducts.length }} pieces</p>
        </div>
        <div class="filters">
          <v-text-field
            v-model="search" placeholder="Search name, description, category"
            prepend-inner-icon="mdi-magnify" clearable hide-details bg-color="surface"
            style="min-width: 260px"
          />
          <v-select
            v-model="selectedCategory" :items="['All Categories', ...categories]"
            hide-details bg-color="surface" style="min-width: 200px"
          />
        </div>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-6">
        Could not load products: {{ errorMessage(error) }}
        <template #append><v-btn variant="text" @click="refresh()">Try again</v-btn></template>
      </v-alert>

      <v-row v-if="pending">
        <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="image, article" />
        </v-col>
      </v-row>

      <template v-else-if="filteredProducts.length">
        <!-- All categories: naka-grupo bawat category -->
        <div v-if="showGroups">
          <section v-for="g in groups" :key="g.category" class="group">
            <div class="group-head">
              <div class="group-left">
                <h3 class="group-title">{{ g.category }}</h3>
                <span class="group-count">{{ g.products.length }} {{ g.products.length === 1 ? 'piece' : 'pieces' }}</span>
              </div>
              <button type="button" class="group-link" @click="selectedCategory = g.category">
                View only {{ g.category }} <v-icon icon="mdi-arrow-right" size="16" />
              </button>
            </div>
            <v-row class="grid">
              <v-col v-for="p in g.products" :key="p.documentId" cols="12" sm="6" md="4" lg="3">
                <ProductCard :product="p" />
              </v-col>
            </v-row>
          </section>
        </div>

        <!-- Isang category lang -->
        <v-row v-else class="grid">
          <v-col v-for="p in filteredProducts" :key="p.documentId" cols="12" sm="6" md="4" lg="3">
            <ProductCard :product="p" />
          </v-col>
        </v-row>
      </template>

      <div v-else-if="!error" class="empty">
        <p class="empty-title">No pieces match your search.</p>
        <v-btn color="primary" variant="outlined" @click="resetFilters">Show the full collection</v-btn>
      </div>
    </section>

    <!-- NEWSLETTER -->
    <section class="wrap newsletter">
      <h2 class="news-title">First to know about new arrivals</h2>
      <p class="news-text">One short email a week with new scents, soles, bags and fits, plus private offers.</p>
      <v-form ref="newsletterForm" class="news-form" @submit.prevent="subscribe">
        <v-text-field
          v-model="email" :rules="[emailRule]" placeholder="you@example.com"
          bg-color="surface" class="flex-grow-1"
        />
        <v-btn type="submit" color="primary" size="x-large">Subscribe</v-btn>
      </v-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const { getActiveProducts, errorMessage, mediaUrl } = useStrapi()
const { syncStock, addToCart, quantityOf } = useCart()
const { notify } = useNotify()

// Kinukuha ang active products sa Strapi (key 'products' para ma-refresh pagkatapos ng checkout)
const { data, pending, error, refresh } = await useAsyncData('products', () => getActiveProducts())

const activeProducts = computed(() => (data.value?.data ?? []).filter((p) => p.isActive))

// Hanggang 3 products na may image para sa hero
const heroProducts = computed(() => activeProducts.value.filter((p) => p.image?.url).slice(0, 3))
const heroImages = computed(() => heroProducts.value.map((p) => mediaUrl(p.image)))

// Signature pick: pinakamahal na product na may stock pa
const signature = computed(() =>
  [...activeProducts.value].filter((p) => p.stock > 0).sort((a, b) => Number(b.price) - Number(a.price))[0]
)
const signatureRemaining = computed(() =>
  signature.value ? signature.value.stock - quantityOf(signature.value.documentId) : 0
)
const sigConfig = computed(() => variantConfig(signature.value?.category))
const sigSize = ref<string | null>(null)
watch(() => signature.value?.documentId, () => { sigSize.value = null })

function addSignature() {
  if (!signature.value) return
  if (sigConfig.value && !sigSize.value) {
    notify('Please choose a size first.', 'warning')
    return
  }
  const res = addToCart(signature.value, 1, sigSize.value)
  notify(res.message, res.ok ? 'success' : 'error')
}

// Unique na categories galing mismo sa products (hindi hardcoded)
const categories = computed(() =>
  [...new Set(activeProducts.value.map((p) => p.category).filter(Boolean))].sort()
)

const search = ref('')
const selectedCategory = ref('All Categories')

// Search (name / description / category) + category filter
const filteredProducts = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  return activeProducts.value.filter((p) => {
    const matchesCategory = selectedCategory.value === 'All Categories' || p.category === selectedCategory.value
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })
})

// Kapag "All Categories": i-grupo ang products ayon sa category
const showGroups = computed(() => selectedCategory.value === 'All Categories')
const groups = computed(() => {
  const map = new Map<string, Product[]>()
  for (const p of filteredProducts.value) {
    const list = map.get(p.category) || []
    list.push(p)
    map.set(p.category, list)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, products]) => ({ category, products }))
})

// Pag may bagong product data, i-sync ang stock ng nasa cart
watch(activeProducts, (list) => syncStock(list), { immediate: true })

function scrollToProducts() {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
}
function pickCategory(cat: string) {
  selectedCategory.value = cat
  scrollToProducts()
}
function resetFilters() {
  search.value = ''
  selectedCategory.value = 'All Categories'
}

// Newsletter (front-end validation lang)
const email = ref('')
const newsletterForm = ref()
const emailRule = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') || 'Enter a valid email address.'
async function subscribe() {
  const { valid } = await newsletterForm.value.validate()
  if (!valid) return
  notify('Subscribed. Watch your inbox for new arrivals.')
  newsletterForm.value.reset()
}
</script>

<style scoped>
/* ---------- Buttons ---------- */
.btn-gold { background: var(--gold) !important; color: var(--night) !important; }
.btn-gold:hover { background: #D3B07A !important; }
.btn-ghost { color: var(--ivory) !important; border-color: rgba(244, 237, 230, 0.4) !important; }

/* ---------- HERO ---------- */
.hero {
  background:
    radial-gradient(ellipse 60% 70% at 78% 45%, rgba(91, 30, 45, 0.55), transparent 70%),
    var(--night);
  border-bottom: 1px solid rgba(196, 160, 106, 0.2);
  color: var(--ivory);
  padding: 80px 0 96px;
  overflow: hidden;
}
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.hero-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(3rem, 6.4vw, 5.6rem);
  line-height: 0.98;
  margin: 0 0 28px;
  color: var(--ivory);
}
.hero-lede { font-size: 1.1rem; line-height: 1.7; color: var(--ivory-muted); max-width: 44ch; margin: 0 0 36px; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 56px; }
.hero-facts { display: flex; gap: 48px; margin: 0; padding-top: 28px; border-top: 1px solid rgba(176, 141, 87, 0.45); }
.hero-facts dt { font-family: var(--font-display); font-size: 2.4rem; font-weight: 600; line-height: 1; color: var(--gold); }
.hero-facts dd { margin: 6px 0 0; font-size: 0.85rem; color: var(--ivory-muted); }

/* Photo stack */
.stack { position: relative; height: 580px; }
.stack img { width: 100%; height: 100%; object-fit: cover; display: block; }
.arch {
  position: absolute; left: 50%; top: 0; transform: translateX(-50%);
  width: 62%; height: 100%;
  border-radius: 999px 999px 0 0;
  overflow: hidden;
  background: #2A1F1C;
  outline: 1px solid rgba(176, 141, 87, 0.6);
  outline-offset: 10px;
  z-index: 2;
}
.tile {
  position: absolute; width: 38%; aspect-ratio: 3 / 4;
  overflow: hidden; background: #2A1F1C;
  border: 1px solid rgba(244, 237, 230, 0.12);
  z-index: 1; opacity: 0.9;
}
.tile-left { left: 0; top: 18%; transform: rotate(-5deg); }
.tile-right { right: 0; top: 34%; transform: rotate(5deg); }
.hero-caption {
  position: absolute; left: 8%; bottom: 28px; z-index: 3;
  background: var(--ivory); color: var(--paper);
  padding: 14px 20px;
  display: flex; flex-direction: column; gap: 2px;
}
.cap-name { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; }
.cap-price { font-size: 0.85rem; color: #6F6863; }

/* ---------- SIGNATURE ---------- */
.signature {
  display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
  padding-top: 112px; padding-bottom: 96px;
}
.sig-media { aspect-ratio: 1; background: #F4F2EF; overflow: hidden; outline: 1px solid rgba(196, 160, 106, 0.45); outline-offset: 12px; }
.sig-media { position: relative; }
.sig-blur { position: absolute; inset: -30px; background-size: cover; background-position: center; filter: blur(28px); opacity: 0.85; }
.sig-media img { position: relative; width: 100%; height: 100%; object-fit: contain; display: block; }
.sig-label { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 600; color: var(--gold); margin: 0 0 24px; }
.sig-cat { color: var(--gold); font-weight: 600; font-size: 0.9rem; margin: 0 0 6px; }
.sig-name { font-family: var(--font-display); font-size: clamp(2.4rem, 4vw, 3.6rem); font-weight: 600; line-height: 1.02; margin: 0 0 20px; }
.sig-desc { color: var(--muted); line-height: 1.75; max-width: 52ch; margin: 0 0 28px; }
.sig-price { font-family: var(--font-display); font-size: 2rem; font-weight: 600; margin-bottom: 24px; }
.sig-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.sig-sizes { margin: -4px 0 24px; }
.sig-from { font-family: var(--font-ui); font-size: 1rem; color: var(--muted); font-weight: 500; }
.sig-sizes-label { display: block; font-size: 0.85rem; color: var(--muted); margin-bottom: 8px; }
.sig-sizes-row { display: flex; flex-wrap: wrap; gap: 8px; }
.sig-size {
  min-width: 56px; height: 42px; padding: 0 14px;
  background: transparent; color: var(--ink);
  border: 1px solid var(--line); border-radius: 2px;
  font: inherit; font-weight: 500; cursor: pointer;
}
.sig-size:hover { border-color: var(--gold); }
.sig-size.active { background: var(--gold); border-color: var(--gold); color: var(--night); font-weight: 700; }
.sig-stock { color: var(--muted); font-size: 0.9rem; }

/* ---------- CATEGORIES ---------- */
.section-title { font-family: var(--font-display); font-size: 2.4rem; font-weight: 600; margin: 0 0 20px; line-height: 1.1; }
.cats { padding-bottom: 56px; }
.cat-list { display: flex; flex-wrap: wrap; gap: 30px; border-bottom: 1px solid var(--line); }
.cat {
  background: none; border: 0; cursor: pointer;
  padding: 0 0 12px; margin-bottom: -1px;
  font: inherit; font-size: 1rem; font-weight: 500;
  color: var(--muted);
  border-bottom: 2px solid transparent;
}
.cat:hover { color: var(--ink); }
.cat.active { color: var(--ink); border-bottom-color: var(--gold); }

/* ---------- PROMO ---------- */
.promo { background: linear-gradient(100deg, #4A1724, #5B1E2D 55%, #3A121C); color: #F3E9E4; border-top: 1px solid rgba(196,160,106,.25); border-bottom: 1px solid rgba(196,160,106,.25); }
.promo-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-top: 44px; padding-bottom: 44px; flex-wrap: wrap; }
.promo-title { font-family: var(--font-display); font-size: 2.1rem; font-weight: 600; color: #fff; margin: 0 0 6px; line-height: 1.15; }
.promo-text { margin: 0; opacity: .85; }

/* ---------- COLLECTION ---------- */
.collection { padding-top: 88px; }
.collection-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 32px; }
.count { color: var(--muted); margin: 0; font-size: 0.9rem; }
.filters { display: flex; flex-wrap: wrap; gap: 12px; }
.grid { row-gap: 28px; }
.group + .group { margin-top: 72px; }
.group-head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  padding-bottom: 14px; margin-bottom: 24px;
  border-bottom: 1px solid rgba(196, 160, 106, 0.35);
}
.group-left { display: flex; align-items: baseline; gap: 14px; }
.group-title { font-family: var(--font-display); font-size: 2rem; font-weight: 600; margin: 0; line-height: 1; }
.group-count { color: var(--muted); font-size: 0.9rem; }
.group-link {
  background: none; border: 0; cursor: pointer; font: inherit;
  color: var(--gold); font-weight: 600; font-size: 0.9rem;
  display: inline-flex; align-items: center; gap: 6px;
}
.group-link:hover { color: #D3B07A; }
.empty { text-align: center; padding: 64px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.empty-title { font-family: var(--font-display); font-size: 1.6rem; margin: 0 0 16px; }

/* ---------- NEWSLETTER ---------- */
.newsletter { text-align: center; padding-top: 112px; max-width: 720px; }
.news-title { font-family: var(--font-display); font-size: 2.6rem; font-weight: 600; margin: 0 0 10px; line-height: 1.1; }
.news-text { color: var(--muted); margin: 0 0 28px; }
.news-form { display: flex; gap: 12px; align-items: flex-start; text-align: left; }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 960px) {
  .hero { padding: 48px 0 64px; }
  .hero-grid, .signature { grid-template-columns: 1fr; gap: 48px; }
  .stack { height: 440px; max-width: 460px; width: 100%; margin: 0 auto; }
  .signature { padding-top: 72px; padding-bottom: 64px; }
}
@media (max-width: 600px) {
  .hero-facts { gap: 28px; }
  .stack { height: 360px; }
  .news-form { flex-direction: column; align-items: stretch; }
  .filters { width: 100%; }
  .filters > * { flex: 1 1 100%; }
}
</style>

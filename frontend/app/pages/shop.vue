<template>
  <div>
    <!-- PAGE HEADER -->
    <section class="page-head">
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <NuxtLink to="/">Home</NuxtLink><span>/</span><span aria-current="page">Shop</span>
        </nav>
        <h1 class="page-title">The collection</h1>
        <p class="page-lede">Every piece below is live from our inventory. Search, filter by category, and tap a product to see it up close.</p>
      </div>
    </section>

    <section class="wrap collection">
      <!-- CATEGORY TABS -->
      <div class="cat-list" role="tablist" aria-label="Categories">
        <button
          v-for="cat in ['All Categories', ...categories]" :key="cat" type="button" role="tab"
          class="cat" :class="{ active: selectedCategory === cat }" :aria-selected="selectedCategory === cat"
          @click="selectedCategory = cat"
        >
          {{ cat === 'All Categories' ? 'All' : cat }}
        </button>
      </div>

      <!-- SEARCH + FILTER -->
      <div class="collection-head">
        <p class="count">{{ filteredProducts.length }} of {{ activeProducts.length }} pieces</p>
        <div class="filters">
          <v-text-field
            v-model="search" placeholder="Search name, description, category"
            prepend-inner-icon="mdi-magnify" clearable hide-details bg-color="surface"
            style="min-width: 280px"
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
                <h2 class="group-title">{{ g.category }}</h2>
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
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const route = useRoute()
const router = useRouter()
const { getActiveProducts, errorMessage } = useStrapi()
const { syncStock } = useCart()

useHead({ title: 'Shop · Drip & Scents' })

// Kinukuha ang active products sa Strapi (key 'products' para ma-refresh pagkatapos ng checkout)
const { data, pending, error, refresh } = await useAsyncData('products', () => getActiveProducts())
const activeProducts = computed(() => (data.value?.data ?? []).filter((p) => p.isActive))

// Unique na categories galing mismo sa products (hindi hardcoded)
const categories = computed(() =>
  [...new Set(activeProducts.value.map((p) => p.category).filter(Boolean))].sort()
)

// Search at category: galing sa link (hal. /shop?category=Shoes o /shop?q=nike)
const search = ref(String(route.query.q || ''))
const selectedCategory = ref(String(route.query.category || 'All Categories'))

// I-update ang link habang nagbabago ang filter (para pwedeng i-share o i-bookmark)
watch([search, selectedCategory], ([q, cat]) => {
  const query: Record<string, string> = {}
  if (q) query.q = q
  if (cat && cat !== 'All Categories') query.category = cat
  router.replace({ query })
})
// Kapag pumunta rito galing sa ibang page na may bagong query
watch(() => route.query, (q) => {
  search.value = String(q.q || '')
  selectedCategory.value = String(q.category || 'All Categories')
})

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

// Kapag "All Categories": i-grupo ayon sa category
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

watch(activeProducts, (list) => syncStock(list), { immediate: true })

function resetFilters() {
  search.value = ''
  selectedCategory.value = 'All Categories'
}
</script>

<style scoped>
.collection { padding-top: 8px; }
.cat-list { display: flex; flex-wrap: wrap; gap: 30px; border-bottom: 1px solid var(--line); margin-bottom: 28px; }
.cat {
  background: none; border: 0; cursor: pointer;
  padding: 0 0 12px; margin-bottom: -1px;
  font: inherit; font-size: 1rem; font-weight: 500;
  color: var(--muted); border-bottom: 2px solid transparent;
}
.cat:hover { color: var(--ink); }
.cat.active { color: var(--ink); border-bottom-color: var(--gold); }
.collection-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 36px; }
.count { color: var(--muted); margin: 0; font-size: 0.9rem; }
.filters { display: flex; flex-wrap: wrap; gap: 12px; }
.grid { row-gap: 28px; }
.group + .group { margin-top: 80px; }
.group-head {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  padding-bottom: 14px; margin-bottom: 24px; border-bottom: 1px solid rgba(196, 160, 106, 0.35);
}
.group-left { display: flex; align-items: baseline; gap: 14px; }
.group-title { font-family: var(--font-display); font-size: 2rem; font-weight: 600; margin: 0; line-height: 1; }
.group-count { color: var(--muted); font-size: 0.9rem; }
.group-link {
  background: none; border: 0; cursor: pointer; font: inherit;
  color: var(--gold); font-weight: 600; font-size: 0.9rem;
  display: inline-flex; align-items: center; gap: 6px;
}
.empty { text-align: center; padding: 64px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.empty-title { font-family: var(--font-display); font-size: 1.6rem; margin: 0 0 16px; }
@media (max-width: 600px) {
  .filters { width: 100%; }
  .filters > * { flex: 1 1 100%; }
}
</style>

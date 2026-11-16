<template>
  <v-app-bar flat height="76" class="site-bar" color="transparent">
    <div class="wrap bar-inner">
      <NuxtLink to="/" class="brand" aria-label="Drip & Scents home">
        <AppLogo :size="28" />
        <span class="lockup">
          <span class="wordmark">Drip <em class="q">&amp;</em> Scents</span>
          <span class="tagline">Perfume · Shoes · Bags · Clothes</span>
        </span>
      </NuxtLink>

      <nav class="nav d-none d-sm-flex">
        <NuxtLink to="/" class="nav-link" exact-active-class="is-active">Shop</NuxtLink>
        <NuxtLink to="/products" class="nav-link" active-class="is-active">Manage products</NuxtLink>
      </nav>

      <div class="actions">
        <v-btn class="d-sm-none" to="/products" icon="mdi-cog-outline" variant="text" color="#F4EDE6" aria-label="Manage products" />

        <!-- Wishlist -->
        <v-menu location="bottom end" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text" color="#F4EDE6" aria-label="Wishlist">
              <ClientOnly>
                <v-badge :content="wishlist.length" :model-value="wishlist.length > 0" color="secondary">
                  <v-icon icon="mdi-heart-outline" />
                </v-badge>
                <template #fallback><v-icon icon="mdi-heart-outline" /></template>
              </ClientOnly>
            </v-btn>
          </template>
          <v-card min-width="320" max-width="380" class="pa-2">
            <div class="menu-title">Wishlist</div>
            <v-list v-if="wishlist.length" density="compact">
              <v-list-item v-for="p in wishlist" :key="p.documentId" :title="p.name" :subtitle="formatPrice(p.price)">
                <template #append>
                  <v-btn icon="mdi-shopping-outline" size="small" variant="text" color="primary"
                         aria-label="Add to cart" @click="moveToCart(p)" />
                  <v-btn icon="mdi-close" size="small" variant="text" aria-label="Remove"
                         @click="removeFromWishlist(p.documentId)" />
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="menu-empty">Tap the heart on a product to save it here.</p>
          </v-card>
        </v-menu>

        <!-- Cart -->
        <v-btn icon variant="text" color="#F4EDE6" aria-label="Open cart" @click="drawer = !drawer">
          <ClientOnly>
            <v-badge :content="totalItems" :model-value="totalItems > 0" color="secondary">
              <v-icon icon="mdi-shopping-outline" />
            </v-badge>
            <template #fallback><v-icon icon="mdi-shopping-outline" /></template>
          </ClientOnly>
        </v-btn>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const { drawer, totalItems, addToCart } = useCart()
const { wishlist, removeFromWishlist } = useWishlist()
const { getProduct } = useStrapi()
const { notify } = useNotify()

// Kinukuha muna ang latest stock bago idagdag sa cart
async function moveToCart(p: Product) {
  const config = variantConfig(p.category)
  if (config) {
    notify('Choose a size on the product card first.', 'info')
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  try {
    const { data } = await getProduct(p.documentId)
    const res = addToCart(data)
    notify(res.message, res.ok ? 'success' : 'error')
  } catch {
    notify(`${p.name} is no longer available.`, 'error')
  }
}
</script>

<style scoped>
.site-bar {
  background: var(--night) !important;
  border-bottom: 1px solid rgba(244, 237, 230, 0.08) !important;
}
.bar-inner { width: 100%; display: flex; align-items: center; gap: 36px; }
.brand {
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 600;
  color: var(--ivory);
  text-decoration: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 12px;
}
.lockup { display: flex; flex-direction: column; line-height: 1; }
.wordmark { font-size: 1.7rem; }
.q { font-style: italic; color: var(--gold); font-weight: 500; }
.tagline { font-family: var(--font-ui); font-size: 0.64rem; letter-spacing: 0.08em; color: var(--ivory-muted); margin-top: 4px; }
.nav { gap: 30px; margin-right: auto; }
.nav-link {
  color: var(--ivory-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 6px 0;
  border-bottom: 1px solid transparent;
}
.nav-link:hover { color: var(--ivory); }
.nav-link.is-active { color: var(--ivory); border-bottom-color: var(--gold); }
.actions { display: flex; align-items: center; margin-left: auto; }
.menu-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; padding: 8px 12px 4px; }
.menu-empty { color: var(--muted); font-size: 0.9rem; padding: 4px 12px 12px; margin: 0; }
</style>

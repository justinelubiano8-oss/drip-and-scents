<template>
  <article ref="cardEl" class="pcard" :class="`side-${side}`" @mouseenter="pickSide">
    <!-- Description panel sa GILID ng card (lumalabas lang kapag hover) -->
    <aside class="pcard-side" aria-hidden="true">
      <p class="side-label">{{ detailLabel }}</p>
      <h4 class="side-name">{{ product.name }}</h4>
      <div class="side-rule" />
      <p class="side-desc">{{ product.description || 'No description yet.' }}</p>
    </aside>

    <div class="pcard-media">
      <!-- Pag-click sa picture: papunta sa product page -->
      <NuxtLink :to="`/product/${product.documentId}`" class="pcard-link" :aria-label="`View ${product.name}`">
        <template v-if="imageUrl">
          <!-- Malabong kopya ng picture sa likod, para walang puting gilid -->
          <div class="pcard-blur" :style="{ backgroundImage: `url('${imageUrl}')` }" aria-hidden="true" />
          <div class="pcard-frame">
            <v-img :src="imageUrl" :alt="product.name" :aspect-ratio="1" :cover="false" class="pcard-img" />
          </div>
        </template>
        <div v-else class="pcard-empty"><v-icon icon="mdi-image-off-outline" size="40" /></div>
      </NuxtLink>

      <button
        type="button" class="pcard-heart" :class="{ on: wished }"
        :aria-label="wished ? 'Remove from wishlist' : 'Add to wishlist'"
        :aria-pressed="wished" @click="onWishlist"
      >
        <v-icon :icon="wished ? 'mdi-heart' : 'mdi-heart-outline'" size="20" />
      </button>

      <span v-if="product.stock <= 0" class="pcard-tag">Sold out</span>
      <span v-else-if="product.stock <= 5" class="pcard-tag low">Only {{ product.stock }} left</span>
    </div>

    <div class="pcard-body">
      <p class="pcard-cat">{{ product.category }}</p>
      <h3 class="pcard-name"><NuxtLink :to="`/product/${product.documentId}`" class="pcard-name-link">{{ product.name }}</NuxtLink></h3>
      <p class="pcard-desc line-clamp-2">{{ product.description || 'No description.' }}</p>
      <span class="sr-only">{{ product.description }}</span>

      <!-- Size selector: 50/100 ml para sa perfume, 40–45 para sa shoes -->
      <div v-if="config" class="sizes" role="radiogroup" :aria-label="config.label">
        <span class="sizes-label">{{ config.label }}</span>
        <div class="sizes-row">
          <button
            v-for="opt in config.options" :key="opt" type="button" role="radio"
            class="size" :class="{ active: selected === opt }" :aria-checked="selected === opt"
            :disabled="product.stock <= 0" @click="selected = opt"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <div class="pcard-row">
        <span class="pcard-price">
          <span v-if="showFrom" class="from">From </span>{{ formatPrice(displayPrice) }}
        </span>
        <span class="pcard-stock">{{ product.stock }} in stock</span>
      </div>
      <v-btn
        block variant="outlined" color="primary" size="large" class="mt-4"
        :disabled="remaining <= 0" @click="onAdd"
      >
        {{ buttonText }}
      </v-btn>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const props = defineProps<{ product: Product }>()

const { mediaUrl } = useStrapi()
const { addToCart, quantityOf } = useCart()
const { isWished, toggleWishlist } = useWishlist()
const { notify } = useNotify()

const imageUrl = computed(() => mediaUrl(props.product.image))
const wished = computed(() => isWished(props.product.documentId))
// Ilan pa ang pwedeng idagdag (stock - nasa cart na, lahat ng size)
const remaining = computed(() => props.product.stock - quantityOf(props.product.documentId))

// Variant (size) ayon sa category
const config = computed(() => variantConfig(props.product.category))

// Saang gilid lalabas ang description: kanan, o kaliwa kung kulang ang espasyo sa kanan
const cardEl = ref<HTMLElement | null>(null)
const side = ref<'right' | 'left'>('right')
function pickSide() {
  const r = cardEl.value?.getBoundingClientRect()
  if (!r) return
  side.value = r.right + r.width * 1.25 > window.innerWidth - 16 ? 'left' : 'right'
}
const detailLabel = computed(() => {
  const c = (props.product.category || '').toLowerCase()
  if (c.includes('perfume')) return 'Scent notes'
  if (c.includes('shoe')) return 'About this pair'
  if (c.includes('bag')) return 'About this bag'
  if (c.includes('cloth') || c.includes('apparel')) return 'About this piece'
  return 'Details'
})
const selected = ref<string | null>(null)

// Presyo ayon sa napiling size (mas mahal ang 100 ml)
const displayPrice = computed(() => priceFor(props.product.price, selected.value))
const showFrom = computed(() => !!config.value && !selected.value && hasPriceRange(config.value.options))

const buttonText = computed(() => {
  if (props.product.stock <= 0) return 'Sold out'
  if (remaining.value <= 0) return 'All stock in your cart'
  if (config.value && !selected.value) return 'Select size'
  return selected.value ? `Add to cart · ${selected.value}` : 'Add to cart'
})

function onAdd() {
  if (config.value && !selected.value) {
    notify('Please choose a size first.', 'warning')
    return
  }
  const res = addToCart(props.product, 1, selected.value)
  notify(res.message, res.ok ? 'success' : 'error')
}

function onWishlist() {
  const added = toggleWishlist(props.product)
  notify(added ? 'Added to wishlist.' : 'Removed from wishlist.', 'info')
}
</script>

<style scoped>
/* Card na umaangat (pop up) kapag tinutukan ng mouse */
.pcard {
  position: relative;
  display: flex; flex-direction: column; height: 100%;
  padding: 12px 12px 16px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--line);
  transition:
    transform 0.45s cubic-bezier(.2,.7,.2,1),
    box-shadow 0.45s ease, border-color 0.45s ease, background 0.45s ease,
    opacity 0.45s ease, filter 0.45s ease;
  will-change: transform;
}
.pcard:hover,
.pcard:focus-within {
  transform: scale(1.22);
  z-index: 5;
  background: rgba(30, 22, 19, 0.96);
  border-color: rgba(196, 160, 106, 0.55);
  box-shadow:
    0 28px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(196, 160, 106, 0.25),
    0 0 40px rgba(196, 160, 106, 0.12);
}
.pcard-media { position: relative; background: #F4F2EF; overflow: hidden; }
.pcard-link { display: block; position: relative; color: inherit; }
.pcard-name-link { color: inherit; text-decoration: none; }
.pcard-name-link:hover { color: var(--gold); }
.pcard-blur {
  position: absolute; inset: -20px;
  background-size: cover; background-position: center;
  filter: blur(22px) saturate(1.1);
  opacity: 0.85;
}
/* May espasyo sa paligid ng picture para buo at hindi mukhang naka-zoom */
.pcard-frame { position: relative; padding: 9%; }
.pcard-img { position: relative; transition: transform 0.6s cubic-bezier(.2,.7,.2,1); }
.pcard-img :deep(.v-img__img) { object-fit: contain !important; }
.pcard:hover .pcard-img { transform: scale(1.05); }

/* Description panel sa gilid */
.pcard-side {
  position: absolute; top: -1px; bottom: -1px;
  width: 92%;
  padding: 22px 22px 20px;
  background: rgba(24, 17, 15, 0.98);
  border: 1px solid rgba(196, 160, 106, 0.55);
  color: var(--ivory);
  display: flex; flex-direction: column;
  opacity: 0; visibility: hidden;
  transition: opacity 0.35s ease, transform 0.45s cubic-bezier(.2,.7,.2,1), visibility 0s linear 0.45s;
  pointer-events: none;
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.55);
}
.side-right .pcard-side { left: 100%; border-left-color: rgba(196, 160, 106, 0.2); transform: translateX(-16px); }
.side-left .pcard-side { right: 100%; border-right-color: rgba(196, 160, 106, 0.2); transform: translateX(16px); }
.pcard:hover .pcard-side,
.pcard:focus-within .pcard-side {
  opacity: 1; visibility: visible; transform: none;
  transition: opacity 0.35s ease 0.08s, transform 0.45s cubic-bezier(.2,.7,.2,1) 0.08s, visibility 0s;
}
.side-label { margin: 0 0 8px; font-size: 0.72rem; font-weight: 600; color: var(--gold); }
.side-name { margin: 0; font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; line-height: 1.15; }
.side-rule { width: 36px; height: 1px; background: var(--gold); margin: 14px 0; }
.side-desc { margin: 0; font-size: 0.8rem; line-height: 1.65; color: #D9CFC5; overflow-y: auto; }

/* Sa desktop (may mouse): nakatago ang description sa card hanggang i-hover */
@media (hover: hover) {
  .pcard-desc { display: none; }
}
/* Sa phone/tablet (walang hover): normal na description, walang overlay */
@media (hover: none) {
  .pcard-side { display: none; }
  .pcard:hover { transform: none; }
}
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.pcard-empty { background: var(--sand); }
.pcard-empty { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; color: var(--muted); }
.pcard-heart {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(14, 10, 9, 0.72); color: var(--ivory);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  border: 0; cursor: pointer;
}
.pcard-heart.on { color: var(--gold); }
.pcard-tag {
  position: absolute; left: 12px; top: 12px; z-index: 2;
  background: var(--gold); color: var(--night);
  font-size: 0.75rem; font-weight: 600; padding: 4px 10px;
}
.pcard-tag.low { background: var(--night); color: var(--gold); }
.pcard-body { display: flex; flex-direction: column; flex: 1; padding-top: 16px; }
.pcard-cat { margin: 0 0 4px; font-size: 0.8rem; color: var(--gold); font-weight: 600; }
.pcard-name {
  margin: 0 0 6px; font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; line-height: 1.15;
  min-height: 2.3em;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.pcard-desc { margin: 0 0 12px; font-size: 0.9rem; color: var(--muted); line-height: 1.5; }

.sizes { margin: 0 0 14px; }
.sizes-label { display: block; font-size: 0.75rem; color: var(--muted); margin-bottom: 6px; }
.sizes-row { display: flex; flex-wrap: nowrap; gap: 6px; }
.size {
  flex: 1 1 0; min-width: 0; height: 36px; padding: 0 2px;
  white-space: nowrap;
  background: transparent; color: var(--ink);
  border: 1px solid var(--line); border-radius: 2px;
  font: inherit; font-size: 0.85rem; font-weight: 500;
  cursor: pointer;
}
.size:hover:not(:disabled) { border-color: var(--gold); }
.size.active { background: var(--gold); border-color: var(--gold); color: var(--night); font-weight: 700; }
.size:disabled { opacity: 0.4; cursor: not-allowed; }

.pcard-row { margin-top: auto; display: flex; align-items: baseline; justify-content: space-between; }
.pcard-price { font-size: 1.05rem; font-weight: 700; }
.from { font-weight: 500; color: var(--muted); font-size: 0.85rem; }
.pcard-stock { font-size: 0.8rem; color: var(--muted); }
</style>

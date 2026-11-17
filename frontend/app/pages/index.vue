<template>
  <div>
    <!-- HERO: welcome lang, walang products -->
    <section class="hero">
      <div class="hero-frame" aria-hidden="true">
        <span class="corner tl" /><span class="corner tr" /><span class="corner bl" /><span class="corner br" />
      </div>

      <div class="wrap hero-inner">
        <div class="hero-mark" aria-hidden="true"><AppLogo :size="58" /></div>
        <p class="hero-welcome">Welcome to Drip &amp; Scents</p>
        <h1 class="hero-title">Find your signature,<br>from scent to sole.</h1>
        <div class="ornament" aria-hidden="true"><span /><i /><span /></div>
        <p class="hero-lede">
          Hand-picked perfumes, shoes, bags and clothes for people who notice the details.
          Take your time, look around, and make it yours.
        </p>
        <div class="hero-actions">
          <v-btn size="x-large" class="btn-gold" to="/shop" append-icon="mdi-arrow-right">Go to products</v-btn>
          <v-btn size="x-large" variant="outlined" class="btn-ghost" to="/about">Our story</v-btn>
        </div>
      </div>

      <a href="#discover" class="scroll-hint">Discover more <v-icon icon="mdi-chevron-down" size="18" /></a>
    </section>

    <!-- PROMISES -->
    <section id="discover" class="promises">
      <div class="wrap promises-grid">
        <div v-for="p in promises" :key="p.title" class="promise">
          <v-icon :icon="p.icon" size="26" />
          <div>
            <div class="promise-title">{{ p.title }}</div>
            <div class="promise-text">{{ p.text }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHAT WE CARRY: categories lang (walang product listing) -->
    <section class="wrap block">
      <div class="block-head">
        <p class="eyebrow-gold">What we carry</p>
        <h2 class="block-title">Four houses, one look</h2>
        <p class="block-lede">Everything is chosen to be worn together. Pick a world to begin.</p>
      </div>

      <div class="houses">
        <NuxtLink
          v-for="c in houses" :key="c.name"
          :to="c.count ? { path: '/shop', query: { category: c.name } } : '/shop'" class="house"
        >
          <span class="house-icon"><v-icon :icon="c.icon" size="30" /></span>
          <span class="house-name">{{ c.name }}</span>
          <span class="house-text">{{ c.text }}</span>
          <span class="house-link">
            {{ c.count ? `Explore ${c.count} ${c.count === 1 ? 'piece' : 'pieces'}` : 'Explore' }}
            <v-icon icon="mdi-arrow-right" size="16" />
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- QUOTE -->
    <section class="wrap quote">
      <p class="quote-text">“Style is what people see first. Scent is what they remember.”</p>
      <p class="quote-by">The Drip &amp; Scents promise</p>
    </section>

    <!-- CLOSING CTA -->
    <section class="closing">
      <div class="wrap closing-inner">
        <h2 class="closing-title">Ready when you are.</h2>
        <p class="closing-text">Free delivery on orders over ₱5,000, applied automatically at checkout.</p>
        <v-btn size="x-large" class="btn-gold" to="/shop" append-icon="mdi-arrow-right">Go to products</v-btn>
      </div>
    </section>

    <!-- NEWSLETTER -->
    <section class="wrap newsletter">
      <h2 class="news-title">First to know about new arrivals</h2>
      <p class="news-text">One short email a week with new scents, soles, bags and fits, plus private offers.</p>
      <v-form ref="newsletterForm" class="news-form" @submit.prevent="subscribe">
        <v-text-field v-model="email" :rules="[emailRule]" placeholder="you@example.com" bg-color="surface" class="flex-grow-1" />
        <v-btn type="submit" color="primary" size="x-large">Subscribe</v-btn>
      </v-form>
    </section>
  </div>
</template>

<script setup lang="ts">
const { getActiveProducts } = useStrapi()
const { notify } = useNotify()

useHead({ title: 'Drip & Scents — Perfume · Shoes · Bags · Clothes' })

// Kinukuha pa rin sa Strapi para sa bilang ng pieces bawat category (hindi ipinapakita ang products)
const { data } = await useAsyncData('products', () => getActiveProducts())
const activeProducts = computed(() => (data.value?.data ?? []).filter((p) => p.isActive))

const promises = [
  { icon: 'mdi-diamond-stone', title: 'Hand-picked pieces', text: 'A small, curated collection' },
  { icon: 'mdi-truck-fast-outline', title: 'Free delivery', text: 'On orders over ₱5,000' },
  { icon: 'mdi-shield-check-outline', title: 'Secure checkout', text: 'Live stock, confirmed at order' }
]

// Ang apat na "house" ng tindahan; ikinakabit sa totoong category sa Strapi
const houseDefs = [
  { key: 'perfume', name: 'Perfume', icon: 'mdi-spray-bottle', text: 'Signature scents in 50 ml and 100 ml.' },
  { key: 'shoe', name: 'Shoes', icon: 'mdi-shoe-sneaker', text: 'Fresh pairs, EU sizes 40 to 45.' },
  { key: 'bag', name: 'Bag', icon: 'mdi-bag-personal-outline', text: 'Everyday carry, made to last.' },
  { key: 'cloth', name: 'Clothes', icon: 'mdi-tshirt-crew-outline', text: 'Tees and hoodies, S to XL.' }
]
const houses = computed(() =>
  houseDefs.map((h) => {
    const match = activeProducts.value.filter((p) => (p.category || '').toLowerCase().includes(h.key))
    return { ...h, name: match[0]?.category || h.name, count: match.length }
  })
)

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
.btn-gold { background: var(--gold) !important; color: var(--night) !important; }
.btn-gold:hover { background: #D3B07A !important; }
.btn-ghost { color: var(--ivory) !important; border-color: rgba(244, 237, 230, 0.4) !important; }

/* HERO: buong screen, nakagitna */
.hero {
  position: relative;
  min-height: calc(100vh - 76px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 0 96px;
  text-align: center;
  overflow: hidden;
}
.hero-frame { position: absolute; inset: 28px; border: 1px solid rgba(196, 160, 106, 0.28); pointer-events: none; }
.hero-frame::after { content: ""; position: absolute; inset: 8px; border: 1px solid rgba(196, 160, 106, 0.12); }
.corner { position: absolute; width: 26px; height: 26px; border-color: var(--gold); border-style: solid; border-width: 0; }
.corner.tl { top: -1px; left: -1px; border-top-width: 2px; border-left-width: 2px; }
.corner.tr { top: -1px; right: -1px; border-top-width: 2px; border-right-width: 2px; }
.corner.bl { bottom: -1px; left: -1px; border-bottom-width: 2px; border-left-width: 2px; }
.corner.br { bottom: -1px; right: -1px; border-bottom-width: 2px; border-right-width: 2px; }

.hero-inner { position: relative; max-width: 900px; }
.hero-mark { display: inline-flex; margin-bottom: 18px; }
.hero-welcome { color: var(--gold); font-weight: 600; letter-spacing: 0.04em; margin: 0 0 18px; }
.hero-title {
  font-family: var(--font-display); font-weight: 600;
  font-size: clamp(3rem, 7vw, 6rem); line-height: 0.98;
  margin: 0; color: var(--ivory);
}
.ornament { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 30px auto; }
.ornament span { width: 70px; height: 1px; background: linear-gradient(90deg, transparent, var(--gold)); }
.ornament span:last-child { transform: scaleX(-1); }
.ornament i { width: 8px; height: 8px; background: var(--gold); transform: rotate(45deg); }
.hero-lede { font-size: 1.15rem; line-height: 1.8; color: var(--ivory-muted); max-width: 52ch; margin: 0 auto 38px; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
.scroll-hint {
  position: absolute; bottom: 44px; left: 50%; transform: translateX(-50%);
  color: var(--ivory-muted); text-decoration: none; font-size: 0.85rem;
  display: inline-flex; align-items: center; gap: 4px;
}
.scroll-hint:hover { color: var(--gold); }

/* PROMISES */
.promises { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: rgba(14, 10, 9, 0.55); backdrop-filter: blur(2px); }
.promises-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding-top: 30px; padding-bottom: 30px; }
.promise { display: flex; align-items: center; justify-content: center; gap: 14px; }
.promise .v-icon { color: var(--gold); }
.promise-title { font-weight: 700; }
.promise-text { color: var(--muted); font-size: 0.88rem; }

/* HOUSES (categories) */
.block { padding-top: 120px; }
.block-head { text-align: center; max-width: 640px; margin: 0 auto 48px; }
.eyebrow-gold { color: var(--gold); font-weight: 600; margin: 0 0 10px; }
.block-title { font-family: var(--font-display); font-size: clamp(2.4rem, 4.4vw, 3.4rem); font-weight: 600; margin: 0 0 12px; line-height: 1.02; }
.block-lede { color: var(--muted); margin: 0; }
.houses { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.house {
  position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
  padding: 34px 28px 30px; min-height: 280px;
  text-decoration: none; color: var(--ink);
  background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01));
  border: 1px solid var(--line);
  transition: border-color 0.35s ease, transform 0.35s cubic-bezier(.2,.7,.2,1), background 0.35s ease;
}
.house:hover { border-color: rgba(196, 160, 106, 0.6); transform: translateY(-6px); background: linear-gradient(180deg, rgba(196,160,106,0.08), rgba(255,255,255,0.01)); }
.house:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.house-icon {
  width: 60px; height: 60px; display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid rgba(196, 160, 106, 0.5); border-radius: 999px 999px 0 0; color: var(--gold); margin-bottom: 8px;
}
.house-name { font-family: var(--font-display); font-size: 1.9rem; font-weight: 600; line-height: 1; }
.house-text { color: var(--muted); line-height: 1.6; flex: 1; }
.house-link { color: var(--gold); font-weight: 600; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 6px; }

/* QUOTE */
.quote { text-align: center; padding-top: 128px; max-width: 860px; }
.quote-text { font-family: var(--font-display); font-style: italic; font-size: clamp(1.8rem, 3.4vw, 2.6rem); line-height: 1.3; margin: 0 0 16px; color: var(--ivory); }
.quote-by { color: var(--gold); font-weight: 600; margin: 0; }

/* CLOSING */
.closing {
  margin-top: 128px;
  background: linear-gradient(100deg, #3E1420, #5B1E2D 50%, #35101A);
  border-top: 1px solid rgba(196,160,106,.3); border-bottom: 1px solid rgba(196,160,106,.3);
}
.closing-inner { text-align: center; padding-top: 72px; padding-bottom: 72px; }
.closing-title { font-family: var(--font-display); font-size: clamp(2.4rem, 4.4vw, 3.4rem); font-weight: 600; color: #fff; margin: 0 0 10px; }
.closing-text { color: #F3E9E4; opacity: 0.85; margin: 0 0 28px; }

/* NEWSLETTER */
.newsletter { text-align: center; padding-top: 112px; max-width: 720px; }
.news-title { font-family: var(--font-display); font-size: 2.6rem; font-weight: 600; margin: 0 0 10px; line-height: 1.1; }
.news-text { color: var(--muted); margin: 0 0 28px; }
.news-form { display: flex; gap: 12px; align-items: flex-start; text-align: left; }

@media (max-width: 1000px) { .houses { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 700px) {
  .hero-frame { inset: 12px; }
  .promises-grid { grid-template-columns: 1fr; gap: 14px; }
  .promise { justify-content: flex-start; }
  .houses { grid-template-columns: 1fr; }
  .block { padding-top: 80px; }
  .news-form { flex-direction: column; align-items: stretch; }
}
</style>

<template>
  <div>
    <section class="page-head">
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <NuxtLink to="/">Home</NuxtLink><span>/</span><span aria-current="page">Our story</span>
        </nav>
        <h1 class="page-title">Our story</h1>
        <p class="page-lede">Drip & Scents started with a simple idea: the way you dress and the way you smell tell the same story.</p>
      </div>
    </section>

    <section class="wrap story">
      <div class="story-mark" aria-hidden="true"><AppLogo :size="120" /></div>
      <div class="story-copy">
        <h2 class="story-title">Scent, sole, bag and fit, chosen together</h2>
        <p>
          Most shops sell fragrance in one place and footwear in another. We put them side by side, along with bags and
          clothes, so you can build a look that feels complete, from the first spray in the morning to the last step at night.
        </p>
        <p>
          Every piece in the collection is picked by hand. We keep the range small on purpose, so each item earns its place,
          and our stock updates the moment you check out, so what you see is what we have.
        </p>
      </div>
    </section>

    <section class="wrap values">
      <div v-for="v in values" :key="v.title" class="value">
        <v-icon :icon="v.icon" size="28" />
        <h3>{{ v.title }}</h3>
        <p>{{ v.text }}</p>
      </div>
    </section>

    <section class="wrap cta">
      <h2 class="cta-title">Ready to find your signature?</h2>
      <div class="cta-actions">
        <v-btn color="primary" size="x-large" to="/shop">Explore the shop</v-btn>
        <v-btn variant="outlined" size="x-large" to="/">Back to home</v-btn>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Our story · Drip & Scents' })

const values = [
  { icon: 'mdi-diamond-stone', title: 'Curated, not crowded', text: 'A focused collection of perfumes, shoes, bags and clothes, each chosen to be worn with the rest.' },
  { icon: 'mdi-shield-check-outline', title: 'Authentic pieces', text: 'Every item is checked before it ships, so you only receive what you ordered.' },
  { icon: 'mdi-truck-fast-outline', title: 'Delivered with care', text: 'Most orders arrive in 2–3 days, with free delivery on orders over ₱5,000.' }
]
</script>

<style scoped>
.story { display: grid; grid-template-columns: 0.7fr 1.3fr; gap: 64px; align-items: center; padding-top: 24px; padding-bottom: 96px; }
.story-mark {
  aspect-ratio: 4 / 5; display: flex; align-items: center; justify-content: center;
  border-radius: 999px 999px 0 0;
  background: radial-gradient(ellipse at 50% 40%, rgba(91,30,45,.55), transparent 70%), var(--night);
  outline: 1px solid rgba(196,160,106,.5); outline-offset: 12px;
}
.story-title { font-family: var(--font-display); font-size: clamp(2rem, 3.6vw, 2.8rem); font-weight: 600; line-height: 1.1; margin: 0 0 22px; }
.story-copy p { color: #D9CFC5; line-height: 1.85; margin: 0 0 18px; max-width: 62ch; }
.values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding-bottom: 96px; }
.value { padding: 32px 28px; border: 1px solid var(--line); background: rgba(255,255,255,.02); }
.value .v-icon { color: var(--gold); margin-bottom: 14px; }
.value h3 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
.value p { color: var(--muted); line-height: 1.7; margin: 0; }
.cta { text-align: center; padding-bottom: 24px; }
.cta-title { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); font-weight: 600; margin: 0 0 24px; }
.cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
@media (max-width: 900px) {
  .story { grid-template-columns: 1fr; gap: 40px; }
  .story-mark { max-width: 320px; margin: 0 auto; width: 100%; }
  .values { grid-template-columns: 1fr; }
}
</style>

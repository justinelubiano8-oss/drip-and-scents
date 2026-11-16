<template>
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <div class="f-brand"><AppLogo :size="38" /><span>Drip <em class="amp">&amp;</em> Scents</span></div>
        <p class="f-text">Perfume, shoes, bags and clothes. Everything you need to look and smell the part, under one roof.</p>
      </div>
      <div>
        <div class="f-head">Shop</div>
        <NuxtLink to="/" class="f-link">The collection</NuxtLink>
        <NuxtLink to="/checkout" class="f-link">Checkout</NuxtLink>
      </div>
      <div>
        <div class="f-head">Admin</div>
        <NuxtLink to="/products" class="f-link">Manage products</NuxtLink>
      </div>
    </div>
    <div class="wrap f-bottom">© {{ year }} Drip &amp; Scents. For academic use only.</div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.site-footer { background: var(--night); color: #D9D3CC; margin-top: 96px; padding-top: 64px; border-top: 1px solid rgba(196, 160, 106, 0.25); }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; padding-bottom: 48px; }
.f-brand { font-family: var(--font-display); font-size: 2rem; font-weight: 600; color: #fff; margin-bottom: 12px; display: flex; align-items: center; gap: 14px; }
.amp { font-style: italic; color: var(--gold); font-weight: 500; }
.f-text { max-width: 36ch; margin: 0; line-height: 1.6; }
.f-head { color: #fff; font-weight: 600; margin-bottom: 12px; }
.f-link { display: block; color: #D9D3CC; text-decoration: none; margin-bottom: 8px; font-size: 0.95rem; }
.f-link:hover { color: #fff; }
.f-bottom { border-top: 1px solid rgba(255,255,255,.12); padding-top: 20px; padding-bottom: 28px; font-size: 0.8rem; color: #A39C95; }
@media (max-width: 700px) { .footer-grid { grid-template-columns: 1fr 1fr; } .footer-grid > :first-child { grid-column: 1 / -1; } }
</style>

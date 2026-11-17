// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.css', '~/assets/css/main.css'],

  build: { transpile: ['vuetify'] },
  vite: { ssr: { noExternal: ['vuetify'] } },

  // Ang mga hindi "public" ay nasa SERVER lang — hindi makikita sa browser.
  // Palitan gamit ang environment variables (.env sa local, Settings sa Vercel):
  //   NUXT_STRAPI_TOKEN, NUXT_ADMIN_PASSWORD, NUXT_SESSION_SECRET, NUXT_PUBLIC_STRAPI_URL
  runtimeConfig: {
    strapiToken: '',
    adminPassword: '',
    sessionSecret: '',
    public: {
      strapiUrl: 'http://localhost:1337'
    }
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Drip & Scents — Perfume · Shoes · Bags · Clothes',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Manrope:wght@400;500;600;700&display=swap'
        }
      ]
    }
  }
})

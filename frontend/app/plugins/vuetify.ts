import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: 'scentsole',
      themes: {
        scentsole: {
          dark: true,
          colors: {
            primary: '#C4A06A',   // gold
            'on-primary': '#120D0C',
            secondary: '#5B1E2D', // wine
            'on-secondary': '#F4EDE6',
            accent: '#C4A06A',
            background: '#140F0D',
            surface: '#1C1513',
            'surface-variant': '#2A201D',
            'on-background': '#F2EBE3',
            'on-surface': '#F2EBE3',
            success: '#7FB08C',
            error: '#E5735F',
            warning: '#E0A85A',
            info: '#8FB3D1'
          }
        }
      }
    },
    defaults: {
      VBtn: { rounded: 'sm', elevation: 0 },
      VCard: { rounded: 'sm' },
      VSheet: { rounded: 'sm' },
      VTextField: { variant: 'outlined', density: 'comfortable', rounded: 'sm', color: 'primary' },
      VTextarea: { variant: 'outlined', density: 'comfortable', rounded: 'sm', color: 'primary' },
      VSelect: { variant: 'outlined', density: 'comfortable', rounded: 'sm', color: 'primary' },
      VCombobox: { variant: 'outlined', density: 'comfortable', rounded: 'sm', color: 'primary' },
      VFileInput: { variant: 'outlined', density: 'comfortable', rounded: 'sm', color: 'primary' },
      VChip: { rounded: 'sm' }
    }
  })
  nuxtApp.vueApp.use(vuetify)
})

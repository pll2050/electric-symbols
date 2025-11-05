// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  build: {
    transpile: ['@joint/core', '@joint/plus']
  },

  vite: {
    optimizeDeps: {
      include: ['@joint/core', '@joint/plus']
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true
      }
    }
  }
})

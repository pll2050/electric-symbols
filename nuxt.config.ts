// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  build: {
    transpile: ['@joint/core', '@joint/plus']
  },

  experimental: {
    // Windows 경로 문제 해결을 위한 실험적 옵션
    appManifest: false
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
  },

  hooks: {
    'components:extend'(components: any) {
      // 가상 모듈 필터링 (null 문자로 시작하는 모듈 제외)
      return components.filter((component: any) => {
        return !component.filePath?.includes('\0')
      })
    }
  }
})

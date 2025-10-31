// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  
  devtools: { enabled: true },

  runtimeConfig: {
    booksApiKey: process.env.BOOKS_API_KEY || '',
  },

  srcDir: 'app/',

  modules: ['@nuxtjs/supabase'],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
  },

  app: {
    baseURL: '/read-mind-ai/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'ReadMind AI - Персональный литературный ассистент',
      meta: [
        { name: 'description', content: 'AI-powered платформа для персонализированных книжных рекомендаций' },
      ],
    },
  },

  // Оптимизация для production
  nitro: {
    compressPublicAssets: true,
  },

  // TypeScript строгие проверки
  typescript: {
    strict: true,
    typeCheck: false, // Отключаем type-check при каждой сборке для скорости
  },
});

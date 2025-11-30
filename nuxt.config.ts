// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  
  devtools: { enabled: true },

  runtimeConfig: {
    booksApiKey: process.env.BOOKS_API_KEY || '',
    openRouterApiKey: process.env.DEEP_SEEK_API_KEY || '', // Используем существующий ключ для OpenRouter
    public: {
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      siteName: 'ReadMind AI',
    },
  },

  srcDir: 'app/',

  modules: ['@nuxtjs/supabase', '@nuxt/image'],

  supabase: {
    redirect: false,
  },

  image: {
    quality: 90,
    format: ['webp', 'jpeg'],
    screens: {
      'xs': 320,
      'sm': 640,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      'xxl': 1536,
    },
    domains: ['books.google.com', 'books.googleusercontent.com'],
    providers: {
      google: {
        provider: '~/providers/google-books.ts',
        options: {}
      }
    }
  },

  app: {
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
    cors: {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    },
  },

  // TypeScript строгие проверки
  typescript: {
    strict: true,
    typeCheck: false, // Отключаем type-check при каждой сборке для скорости
  },
});

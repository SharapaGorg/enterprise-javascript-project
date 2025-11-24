// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  runtimeConfig: {
    booksApiKey: process.env.BOOKS_API_KEY || "",
    openRouterApiKey: process.env.DEEP_SEEK_API_KEY || "", // Используем существующий ключ для OpenRouter
    public: {
      siteUrl: process.env.SITE_URL || "http://localhost:3000",
      siteName: "ReadMind AI",
    },
  },

  srcDir: "app/",
  ssr: false,

  modules: ["@nuxtjs/supabase", "@nuxt/image"],

  supabase: {
    redirect: false,
  },
  experimental: {
    externalVue: false, // Важно! Включает Vue в bundle
  },

  imports: {
    autoImport: true,
    global: true, // Делает auto-imports глобальными
  },

  image: {
    quality: 90,
    format: ["webp", "jpeg"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    domains: ["books.google.com", "books.googleusercontent.com"],
    providers: {
      google: {
        provider: "~/providers/google-books.ts",
        options: {},
      },
    },
  },

  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "ReadMind AI - Персональный литературный ассистент",
      meta: [
        {
          name: "description",
          content:
            "AI-powered платформа для персонализированных книжных рекомендаций",
        },
      ],
    },
  },

  // Конфигурация для Single-SPA микрофронтенда
  vite: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    },
    optimizeDeps: {
      include: ["@supabase/supabase-js"]
    }
  },

  // Переопределяем сборку для brojs микрофронтенда
  builder: "@nuxt/vite-builder",

  // Оптимизация для production
  nitro: {
    compressPublicAssets: true,
    // prerender: {
    //   routes: ["/read-mind-ai"], // Предрендер главной страницы для быстрой загрузки
    //   crawlLinks: false, // Отключаем автоматический crawling для SPA
    // },
    cors: {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    },
    // Решение проблемы с ESM модулями
    experimental: {
      wasm: true
    },
    moduleSideEffects: ["@supabase/supabase-js"],
    replace: {
      "@supabase/supabase-js/dist/main/lib/constants": "@supabase/supabase-js/dist/main/lib/constants.js"
    }
  },

  // TypeScript строгие проверки
  typescript: {
    strict: true,
    typeCheck: false, // Отключаем type-check при каждой сборке для скорости
  },
});

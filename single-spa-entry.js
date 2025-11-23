import singleSpaVue from 'single-spa-vue'
import { createApp, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './app/app.vue'

// Импорт страниц
import IndexPage from './app/pages/index.vue'
import BooksPage from './app/pages/books.vue' 
import ChatPage from './app/pages/chat.vue'
import LoginPage from './app/pages/auth/login.vue'
import RegisterPage from './app/pages/auth/register.vue'
import ProfilePage from './app/pages/profile/index.vue'
import OnboardingPage from './app/pages/profile/onboarding.vue'

// Определение маршрутов
const routes = [
  { path: '/', component: IndexPage },
  { path: '/books', component: BooksPage },
  { path: '/chat', component: ChatPage },
  { path: '/auth/login', component: LoginPage },
  { path: '/auth/register', component: RegisterPage },
  { path: '/profile', component: ProfilePage },
  { path: '/profile/onboarding', component: OnboardingPage }
]

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App)
    }
  },
  handleInstance: (app, info) => {
    // Создаем роутер для SPA
    const router = createRouter({
      history: createWebHistory('/'),
      routes
    })
    
    app.use(router)
    
    // Эмулируем некоторые Nuxt провайдеры для композаблов
    app.provide('$router', router)
    
    // Для рабочих композаблов можно добавить заглушки
    const runtimeConfig = {
      public: {
        siteUrl: process.env.SITE_URL || "http://localhost:3000",
        siteName: "ReadMind AI",
      }
    }
    app.provide('$config', runtimeConfig)
  }
})

export const { bootstrap, mount, unmount } = vueLifecycles
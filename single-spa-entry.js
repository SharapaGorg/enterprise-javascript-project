import singleSpaVue from "single-spa-vue";
import {
  createApp,
  h,
  ref,
  computed,
  watch,
  watchEffect,
  reactive,
  readonly,
  toRef,
  toRefs,
  unref,
  isRef,
  onMounted,
  onUnmounted,
  onBeforeMount,
  onBeforeUnmount,
  onUpdated,
  onBeforeUpdate,
  nextTick,
  provide,
  inject,
} from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createClient } from "@supabase/supabase-js";
import * as composables from "./app/composables";
import App from "./app/MicrofrontendApp.vue";

// Импорт страниц
import IndexPage from "./app/pages/index.vue";
import BooksPage from "./app/pages/books.vue";
import ChatPage from "./app/pages/chat.vue";
import LoginPage from "./app/pages/auth/login.vue";
import RegisterPage from "./app/pages/auth/register.vue";
import ProfilePage from "./app/pages/profile/index.vue";
import OnboardingPage from "./app/pages/profile/onboarding.vue";

// Отладка импорта компонентов
console.log('Components loaded:', {
  IndexPage: !!IndexPage,
  BooksPage: !!BooksPage, 
  ChatPage: !!ChatPage,
  LoginPage: !!LoginPage,
  RegisterPage: !!RegisterPage,
  ProfilePage: !!ProfilePage,
  OnboardingPage: !!OnboardingPage
});

// Глобальные middleware
const authMiddleware = (to, from, next) => {
  console.log('Auth middleware for:', to.path);
  
  // Если пользователь не авторизован, редирект на страницу входа
  if (!globalUser.value) {
    if (to.path !== '/auth/login' && to.path !== '/auth/register' && to.path !== '/') {
      next('/auth/login');
      return;
    }
  }
  next();
};

const onboardingMiddleware = (to, from, next) => {
  console.log('Onboarding middleware for:', to.path);
  
  // Если пользователь на странице онбординга, пропускаем проверку
  if (to.path === '/profile/onboarding') {
    next();
    return;
  }

  // Проверяем авторизацию
  if (!globalUser.value) {
    next();
    return;
  }

  // Проверяем, пройден ли онбординг (только на клиенте)
  if (typeof window !== 'undefined') {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    
    if (!onboardingCompleted) {
      // Редирект на онбординг, если не пройден
      next('/profile/onboarding');
      return;
    }
  }
  next();
};

// Определение маршрутов с именами
const routes = [
  { 
    name: "index",
    path: "/", 
    component: IndexPage,
    beforeEnter: [onboardingMiddleware]
  },
  { 
    name: "books",
    path: "/books", 
    component: BooksPage,
    beforeEnter: [authMiddleware, onboardingMiddleware]
  },
  { 
    name: "chat",
    path: "/chat", 
    component: ChatPage,
    beforeEnter: [authMiddleware, onboardingMiddleware]
  },
  { 
    name: "auth-login",
    path: "/auth/login", 
    component: LoginPage 
  },
  { 
    name: "auth-register",
    path: "/auth/register", 
    component: RegisterPage 
  },
  { 
    name: "profile",
    path: "/profile", 
    component: ProfilePage,
    beforeEnter: [authMiddleware, onboardingMiddleware]
  },
  { 
    name: "profile-onboarding",
    path: "/profile/onboarding", 
    component: OnboardingPage,
    beforeEnter: [authMiddleware]
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

// Создаем Supabase один раз глобально
const supabase = createClient(
  "https://tvtzkvcfmawzcrfrjofd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dHprdmNmbWF3emNyZnJqb2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQyNjgsImV4cCI6MjA3NjgwMDI2OH0.HaLutY42f_aN_XQfu8TaztY-Ru19diwLb2rVaahw9jc",
);

// Глобальный user state
const globalUser = ref(null);

// Инициализируем пользователя сразу
supabase.auth.getUser().then(({ data }) => {
  globalUser.value = data.user;
  console.log('Initial user loaded:', data.user?.email);
});

supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  globalUser.value = session?.user ?? null;
});

const createNuxtMocks = (app, router) => {
  // Supabase composables
  window.useSupabaseClient = () => supabase;
  window.useSupabaseUser = () => globalUser;

  // Vue API глобально
  const vueApi = {
    ref,
    computed,
    watch,
    watchEffect,
    reactive,
    readonly,
    toRef,
    toRefs,
    unref,
    isRef,
    onMounted,
    onUnmounted,
    onBeforeMount,
    onBeforeUnmount,
    onUpdated,
    onBeforeUpdate,
    nextTick,
    provide,
    inject,
  };
  Object.assign(window, vueApi);

  // Nuxt composables заглушки
  const nuxtMocks = {
    definePageMeta: (meta) => {
      // Обрабатываем middleware в definePageMeta
      console.log('definePageMeta called with:', meta);
    },
    navigateTo: (to) => router.push(to),
    useRoute: () => router.currentRoute.value,
    useRouter: () => router,
    useFetch: async (url, opts = {}) => {
      console.log('useFetch called:', url, opts);
      
      const data = ref(null);
      const error = ref(null);
      const pending = ref(true);

      const refresh = async () => {
        pending.value = true;
        try {
          const response = await fetch(url, opts);
          const result = await response.json();
          data.value = result;
          console.log('useFetch success, data.value:', result);
        } catch (e) {
          error.value = e;
          console.error('useFetch error:', e);
        } finally {
          pending.value = false;
        }
      };

      await refresh();

      const returnValue = { data, error, pending, refresh };
      console.log('useFetch returning object with data.value:', returnValue.data.value);
      return returnValue;
    },
    useRuntimeConfig: () => ({
      public: {
        siteUrl: process.env.SITE_URL || "http://localhost:3000",
        siteName: "ReadMind AI",
      },
    }),
    useState: (key, init) => {
      const state = app.config.globalProperties.$nuxtState || {};
      if (!state[key] && init) state[key] = init();
      app.config.globalProperties.$nuxtState = state;
      return ref(state[key]);
    },
    useCookie: (name) => ({ value: null }),
    useHead: () => {},
    useSeoMeta: () => {},
  };

  Object.assign(window, nuxtMocks);

  // Composables
  Object.assign(window, composables);

  app.provide("$router", router);
};

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App);
    },
  },
  handleInstance: (app) => {
    const router = createRouter({
      history: createWebHistory("/read-mind-ai"),
      routes,
    });

    // Добавляем отладку роутера
    router.beforeEach((to, from, next) => {
      console.log('Router navigation:', { 
        from: from.path, 
        to: to.path, 
        toName: to.name,
        matched: to.matched.length,
        component: to.matched[0]?.components?.default 
      });
      next();
    });

    router.afterEach((to, from) => {
      console.log('Router navigation complete:', { 
        from: from.path, 
        to: to.path,
        toName: to.name,
        matched: to.matched.length 
      });
    });

    app.use(router);
    createNuxtMocks(app, router);
  },
});

export const bootstrap = (props = {}) => {
  console.log("Bootstrap called with:", props);
  return vueLifecycles.bootstrap(props);
};

export const mount = (props = {}) => {
  console.log("Mount called with:", props);

  if (typeof props === "string" || props instanceof HTMLElement) {
    props = { domElement: props };
  }
  if (!props.domElement) {
    props.domElement =
      document.querySelector("#single-spa-application\\:read-mind-ai") ||
      document.querySelector('[data-name="read-mind-ai"]') ||
      document.body;
  }
  if (!props.name) props.name = "read-mind-ai";
  if (!props.singleSpa) props.singleSpa = {};
  if (!props.mountParcel) props.mountParcel = () => {};

  return vueLifecycles.mount(props);
};

export const unmount = (props = {}) => {
  console.log("Unmount called with:", props);
  if (!props.name) props.name = "read-mind-ai";
  return vueLifecycles.unmount(props);
};

if (typeof window !== "undefined") {
  window.ReadMindAI = { bootstrap, mount, unmount };
  window.bootstrap = bootstrap;
  window.mount = mount;
  window.unmount = unmount;
  mount();
}

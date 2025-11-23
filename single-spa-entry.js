import singleSpaVue from "single-spa-vue";
import { createApp, h, ref } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import * as composables from "./app/composables/";
import App from "./app/MicrofrontendApp.vue";
import { createClient } from "@supabase/supabase-js";
// Импорт страниц
import IndexPage from "./app/pages/index.vue";
import BooksPage from "./app/pages/books.vue";
import ChatPage from "./app/pages/chat.vue";
import LoginPage from "./app/pages/auth/login.vue";
import RegisterPage from "./app/pages/auth/register.vue";
import ProfilePage from "./app/pages/profile/index.vue";
import OnboardingPage from "./app/pages/profile/onboarding.vue";

const createSupabaseApp = (app) => {
  const supabase = createClient(
    "https://tvtzkvcfmawzcrfrjofd.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dHprdmNmbWF3emNyZnJqb2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQyNjgsImV4cCI6MjA3NjgwMDI2OH0.HaLutY42f_aN_XQfu8TaztY-Ru19diwLb2rVaahw9jc",
  );

  // Mock Nuxt Supabase composables
  window.useSupabaseClient = () => supabase;
  window.useSupabaseUser = () => {
    const user = ref(null);
    supabase.auth.getUser().then(({ data }) => {
      user.value = data.user;
    });
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null;
    });
    return user;
  };

  app.config.globalProperties.$useSupabaseClient = window.useSupabaseClient;
  app.config.globalProperties.$useSupabaseUser = window.useSupabaseUser;
};

const createNuxtMocks = (app, router) => {
  // definePageMeta - просто заглушка, мета уже в routes
  app.config.globalProperties.definePageMeta = () => {};

  // Глобальные функции для auto-import
  const nuxtMocks = {
    definePageMeta: () => {},
    navigateTo: (to) => router.push(to),
    useRoute: () => router.currentRoute.value,
    useRouter: () => router,
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
      return { value: state[key] };
    },
    useCookie: (name) => ({ value: null }), // заглушка
    useHead: () => {},
    useSeoMeta: () => {},
  };

  // Делаем их глобальными
  Object.keys(nuxtMocks).forEach((key) => {
    window[key] = nuxtMocks[key];
    app.config.globalProperties[`$${key}`] = nuxtMocks[key];
  });

  // делаем глобальными свои кастомные компосаблы
  Object.assign(window, composables);
  Object.keys(composables).forEach((key) => {
    app.config.globalProperties[`$${key}`] = composables[key];
  });
};

// Определение маршрутов
const routes = [
  { path: "/", component: IndexPage },
  { path: "/books", component: BooksPage },
  { path: "/chat", component: ChatPage },
  { path: "/auth/login", component: LoginPage },
  { path: "/auth/register", component: RegisterPage },
  { path: "/profile", component: ProfilePage },
  { path: "/profile/onboarding", component: OnboardingPage },
  // Redirect для несуществующих маршрутов
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App);
    },
  },
  handleInstance: (app, info) => {
    // Создаем роутер для SPA
    const router = createRouter({
      history: createWebHistory("/read-mind-ai"),
      routes,
    });

    app.use(router);

    createSupabaseApp(app);
    createNuxtMocks(app, router);

    // Эмулируем некоторые Nuxt провайдеры для композаблов
    app.provide("$router", router);

    // Для рабочих композаблов можно добавить заглушки
    const runtimeConfig = {
      public: {
        siteUrl: process.env.SITE_URL || "http://localhost:3000",
        siteName: "ReadMind AI",
      },
    };
    app.provide("$config", runtimeConfig);

    // Добавляем глобальные заглушки для Nuxt композаблов
    app.config.globalProperties.$definePageMeta = () => {};
  },
});

// Wrapper функции для совместимости с brojs
export const bootstrap = (props = {}) => {
  console.log("Bootstrap called with:", props);
  return vueLifecycles.bootstrap(props);
};

export const mount = (props = {}) => {
  console.log("Mount called with:", props);

  // Если props это элемент DOM или строка, создаем правильную структуру
  if (typeof props === "string" || props instanceof HTMLElement) {
    props = { domElement: props };
  }
  // Если domElement отсутствует, но есть другие способы его получить
  if (!props.domElement) {
    // Попробуем найти элемент по стандартным селекторам
    props.domElement =
      document.querySelector("#single-spa-application\\:read-mind-ai") ||
      document.querySelector('[data-name="read-mind-ai"]') ||
      document.body;
  }
  // Добавляем недостающие поля single-spa
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

// Экспортируем в глобальный объект для совместимости
if (typeof window !== "undefined") {
  // Для UMD модуля
  window.ReadMindAI = { bootstrap, mount, unmount };

  // Для brojs - функции должны быть доступны глобально
  window.bootstrap = bootstrap;
  window.mount = mount;
  window.unmount = unmount;

  // todo: поскольку brojs не хочет сам запускать mount, пока что буду это делать сам
  mount();
}

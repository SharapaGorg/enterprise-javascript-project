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
import * as composables from "./composables";
import App from "./app/MicrofrontendApp.vue";

// Импорт страниц
import IndexPage from "./app/pages/index.vue";
import BooksPage from "./app/pages/books.vue";
import ChatPage from "./app/pages/chat.vue";
import LoginPage from "./app/pages/auth/login.vue";
import RegisterPage from "./app/pages/auth/register.vue";
import ProfilePage from "./app/pages/profile/index.vue";
import OnboardingPage from "./app/pages/profile/onboarding.vue";

// Определение маршрутов
const routes = [
  { path: "/", component: IndexPage },
  { path: "/books", component: BooksPage },
  { path: "/chat", component: ChatPage },
  { path: "/auth/login", component: LoginPage },
  { path: "/auth/register", component: RegisterPage },
  { path: "/profile", component: ProfilePage },
  { path: "/profile/onboarding", component: OnboardingPage },
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
});

supabase.auth.onAuthStateChange((event, session) => {
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
    definePageMeta: () => {},
    navigateTo: (to) => router.push(to),
    useRoute: () => router.currentRoute.value,
    useRouter: () => router,
    useFetch: async (url, opts = {}) => {
      const data = ref(null);
      const error = ref(null);
      const pending = ref(true);

      try {
        const response = await fetch(url, opts);
        data.value = await response.json();
      } catch (e) {
        error.value = e;
      } finally {
        pending.value = false;
      }

      return { data, error, pending };
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

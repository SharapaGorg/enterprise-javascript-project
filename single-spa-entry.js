import singleSpaVue from "single-spa-vue";
import { createApp, h, ref, computed } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./app/MicrofrontendApp.vue";
import * as nuxtCompat from "./app/utils/nuxt-compat";

// Экспортируем Nuxt-совместимые функции глобально
if (typeof window !== "undefined") {
  Object.assign(window, nuxtCompat);

  // Также добавляем импорты композаблов
  window.useAuth = () => {
    const user = nuxtCompat.useSupabaseUser();
    const client = nuxtCompat.useSupabaseClient();
    const router = nuxtCompat.useRouter();

    return {
      user,
      login: async (email, password) =>
        client.auth.signInWithPassword({ email, password }),
      register: async (email, password) =>
        client.auth.signUp({ email, password }),
      logout: async () => {
        await client.auth.signOut();
        router.push("/read-mind-ai");
      },
      isAuthenticated: computed(() => !!user.value),
    };
  };

  window.useBooks = () => {
    return {
      getBooks: async (params = {}) =>
        nuxtCompat.$fetch("/api/books", { query: params }),
      getBookById: async (id) => nuxtCompat.$fetch(`/api/books/${id}`),
      searchBooks: (params) =>
        nuxtCompat.useFetch("/api/books", { query: params }),
      fetchBook: (id) => nuxtCompat.useFetch(`/api/books/${id}`),
    };
  };
}

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
  { path: "/read-mind-ai/", component: IndexPage },
  { path: "/read-mind-ai/books", component: BooksPage },
  { path: "/read-mind-ai/chat", component: ChatPage },
  { path: "/read-mind-ai/auth/login", component: LoginPage },
  { path: "/read-mind-ai/auth/register", component: RegisterPage },
  { path: "/read-mind-ai/profile", component: ProfilePage },
  { path: "/read-mind-ai/profile/onboarding", component: OnboardingPage },
  // Redirect для несуществующих маршрутов
  { path: "/:pathMatch(.*)*", redirect: "/read-mind-ai" },
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

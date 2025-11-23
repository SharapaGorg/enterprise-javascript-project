import { App } from 'vue';
import { ref, computed } from 'vue';

// Создаем глобальный store для микрофронтенда
const globalStore = {
  user: ref(null),
  bookmarks: ref([]),
  profile: ref(null),
  onboardingCompleted: ref(false),
  chatHistory: ref([]),
};

// Настраиваем все композаблы для работы в микрофронтенде
export function setupMicrofrontend(app: App, router: any) {
  // Supabase заглушки (потом можно подключить реальный Supabase)
  const supabaseClient = {
    auth: {
      signInWithPassword: async ({ email, password }: any) => {
        // Эмуляция авторизации
        console.log('Login attempt:', email);
        globalStore.user.value = { id: '1', email };
        return { data: { user: globalStore.user.value }, error: null };
      },
      signUp: async ({ email, password }: any) => {
        console.log('Signup attempt:', email);
        globalStore.user.value = { id: '1', email };
        return { data: { user: globalStore.user.value }, error: null };
      },
      signOut: async () => {
        globalStore.user.value = null;
        return { error: null };
      },
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          execute: async () => ({ data: [], error: null }),
        }),
        order: () => ({
          limit: () => ({
            execute: async () => ({ data: [], error: null }),
          }),
        }),
      }),
      insert: () => ({
        single: async () => ({ data: null, error: null }),
      }),
      update: () => ({
        eq: () => ({
          execute: async () => ({ data: null, error: null }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          execute: async () => ({ error: null }),
        }),
      }),
    }),
  };

  // Глобальные композаблы
  app.config.globalProperties.$supabase = supabaseClient;
  app.config.globalProperties.$router = router;
  app.config.globalProperties.$route = router.currentRoute;

  // Provide для композаблов
  app.provide('supabase', supabaseClient);
  app.provide('globalStore', globalStore);
  app.provide('router', router);

  // Настройка window объектов для композаблов
  if (typeof window !== 'undefined') {
    // Nuxt-like функции
    window.useSupabaseClient = () => supabaseClient;
    window.useSupabaseUser = () => globalStore.user;
    window.useRouter = () => router;
    window.useRoute = () => router.currentRoute.value;
    window.computed = computed;
    window.ref = ref;
    
    // Утилиты
    window.$fetch = async (url: string, options?: any) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    };

    window.useFetch = (url: string, options?: any) => {
      const data = ref(null);
      const error = ref(null);
      const pending = ref(true);
      
      const execute = async () => {
        try {
          pending.value = true;
          data.value = await window.$fetch(url, options);
        } catch (e) {
          error.value = e;
        } finally {
          pending.value = false;
        }
      };
      
      execute();
      
      return {
        data,
        error,
        pending,
        refresh: execute,
      };
    };

    // Заглушки для других Nuxt функций
    window.definePageMeta = () => {};
    window.useHead = () => {};
    window.unref = (value: any) => value?.value !== undefined ? value.value : value;
  }

  return {
    supabaseClient,
    globalStore,
  };
}
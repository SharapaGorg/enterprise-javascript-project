import { ref, computed } from 'vue';
import { useRouter as useVueRouter, useRoute as useVueRoute } from 'vue-router';

// Адаптеры для Nuxt функций в микрофронтенде

// Эмуляция $fetch для API вызовов
export const $fetch = async (url: string, options?: any) => {
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

// Эмуляция useFetch
export const useFetch = (url: string, options?: any) => {
  const data = ref(null);
  const error = ref(null);
  const pending = ref(true);
  
  const execute = async () => {
    try {
      pending.value = true;
      data.value = await $fetch(url, options);
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

// Композаблы
export const useRouter = () => useVueRouter();
export const useRoute = () => useVueRoute();

// Заглушки для Supabase (потом можно заменить на реальную интеграцию)
export const useSupabaseClient = () => ({
  auth: {
    signInWithPassword: async (credentials: any) => {
      console.log('Mock login:', credentials);
      return { data: null, error: { message: 'Auth not configured in microfrontend' } };
    },
    signUp: async (credentials: any) => {
      console.log('Mock signup:', credentials);
      return { data: null, error: { message: 'Auth not configured in microfrontend' } };
    },
    signOut: async () => {
      console.log('Mock logout');
      return { error: null };
    },
  }
});

export const useSupabaseUser = () => ref(null);

// Заглушки для других Nuxt функций
export const definePageMeta = () => {};
export const useHead = () => {};
export const unref = (value: any) => value?.value !== undefined ? value.value : value;
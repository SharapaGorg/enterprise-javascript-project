// Экспортируем все композаблы для микрофронтенда
export { useAuth } from './useAuth';
export { useBooks } from './useBooks';
export { useBookmarks } from './useBookmarks';
export { useChat } from './useChat';
export { useProfile } from './useProfile';
export { useOnboarding } from './useOnboarding';
export { useBookImage } from './useBookImage';

// Также экспортируем Nuxt-совместимые функции
export { 
  $fetch, 
  useFetch, 
  useRouter, 
  useRoute,
  useSupabaseClient,
  useSupabaseUser,
  definePageMeta,
  useHead,
  unref
} from '../utils/nuxt-compat';
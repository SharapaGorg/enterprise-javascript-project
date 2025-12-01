import { createClient } from '@supabase/supabase-js';
import type { H3Event } from 'h3';

/**
 * Получаем токен из заголовка Authorization
 */
export const getBearerToken = (event: H3Event): string | null => {
  const authHeader = getHeader(event, 'authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Убираем "Bearer " prefix
};

/**
 * Создаем Supabase клиент с токеном из заголовка
 */
export const createServerSupabaseClient = async (event: H3Event) => {
  const config = useRuntimeConfig();
  
  // Получаем токен из заголовка
  const token = getBearerToken(event);
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Отсутствует токен авторизации',
    });
  }
  
  // Создаем клиент с токеном
  const supabase = createClient(
    config.public.supabase.url,
    config.public.supabase.key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
  
  // Проверяем токен
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Недействительный токен авторизации',
    });
  }
  
  return { supabase, user };
};
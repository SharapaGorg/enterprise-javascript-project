/**
 * Хелпер для получения токена авторизации из Supabase сессии
 */
export const getAuthToken = async () => {
  const supabase = useSupabaseClient();
  
  // Получаем текущую сессию
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Нет активной сессии');
  }
  
  return session.access_token;
};

/**
 * Создаем конфигурацию для fetch с токеном авторизации
 */
export const createAuthHeaders = async () => {
  try {
    const token = await getAuthToken();
    
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };
  } catch (error) {
    console.error('Не удалось получить токен авторизации:', error);
    return {
      headers: {
        'Content-Type': 'application/json',
      }
    };
  }
};
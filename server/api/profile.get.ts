import { createServerSupabaseClient } from '~/server/utils/auth';
import type { UserProfile } from '~~/types/profile';

/**
 * Получение профиля текущего пользователя
 * GET /api/profile
 */
export default defineEventHandler(async (event): Promise<any> => {
  try {
    // Получаем Supabase клиент с проверкой токена из заголовка
    const { supabase, user } = await createServerSupabaseClient(event);

    // Получаем профиль из таблицы profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ
    console.log('=== DEBUG profile.get.ts ===');
    console.log('User ID:', user.id);
    console.log('Profile data:', profile);
    console.log('Error:', error);
    console.log('Error code:', error?.code);
    console.log('Error message:', error?.message);
    console.log('===========================');

    if (error) {
      // Если профиль не найден, создаем базовый
      if (error.code === 'PGRST116') {
        const newProfile: any = {
          id: user.id,
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: createdProfile, error: createError } = await (supabase
          .from('profiles') as any)
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          throw new Error('Ошибка при создании профиля');
        }

        return {
          profile: createdProfile as UserProfile,
          success: true,
        };
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Ошибка при получении профиля',
      });
    }

    return {
      profile: profile as UserProfile,
      success: true,
    };
  } catch (error: any) {
    console.error('Ошибка в /api/profile:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Внутренняя ошибка сервера',
    });
  }
});


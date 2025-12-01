import { createServerSupabaseClient } from "../utils/auth";
import type { UpdateProfileData, UserProfile } from "~~/types/profile";

/**
 * Обновление профиля текущего пользователя
 * PATCH /api/profile
 */
export default defineEventHandler(async (event): Promise<any> => {
  try {
    // Получаем Supabase клиент с проверкой токена из заголовка
    const { supabase, user } = await createServerSupabaseClient(event);

    // Читаем body запроса
    const body = await readBody<UpdateProfileData>(event);

    // Валидация данных
    if (!body || Object.keys(body).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Необходимо указать данные для обновления",
      });
    }

    // Валидация reading_goal
    if (body.reading_goal !== undefined) {
      if (body.reading_goal < 0 || body.reading_goal > 1000) {
        throw createError({
          statusCode: 400,
          statusMessage: "Цель чтения должна быть от 0 до 1000 книг",
        });
      }
    }

    // Валидация favorite_genres
    if (body.favorite_genres !== undefined) {
      if (!Array.isArray(body.favorite_genres)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Любимые жанры должны быть массивом",
        });
      }
      if (body.favorite_genres.length > 10) {
        throw createError({
          statusCode: 400,
          statusMessage: "Максимум 10 любимых жанров",
        });
      }
    }

    // Обновляем профиль
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error } = await (
      supabase.from("profiles") as any
    )
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Ошибка при обновлении профиля:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Ошибка при обновлении профиля",
      });
    }

    return {
      profile: updatedProfile as UserProfile,
      success: true,
      message: "Профиль успешно обновлен",
    };
  } catch (error: any) {
    console.error("Ошибка в PATCH /api/profile:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера",
    });
  }
});

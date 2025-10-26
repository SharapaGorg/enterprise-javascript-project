import type { GoogleBookVolume, Book } from '~~/types/books';

/**
 * Получение информации о конкретной книге по ID
 * GET /api/books/:id
 */
export default defineEventHandler(async (event): Promise<Book> => {
  try {
    // Получаем ID из параметров роута
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID книги обязателен',
      });
    }

    // Получаем API ключ
    const apiKey = process.env.BOOKS_API_KEY;

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'BOOKS_API_KEY не настроен',
      });
    }

    // Запрос к Google Books API
    const volume = await $fetch<GoogleBookVolume>(
      `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    // Парсим и возвращаем книгу
    return parseGoogleBook(volume);

  } catch (error: any) {
    console.error('Ошибка при получении книги:', error);

    if (error.response?.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Книга не найдена',
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении информации о книге',
    });
  }
});


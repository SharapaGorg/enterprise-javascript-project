import type { GoogleBooksResponse, BooksApiResponse } from '~~/types/books';

export default defineEventHandler(async (event): Promise<BooksApiResponse> => {
  try {
    // Получаем query параметры
    const query = getQuery(event);
    
    const {
      query: searchQuery,
      author,
      category,
      language = 'ru',
      orderBy = 'relevance',
    } = query;

    // Нормализуем пагинацию
    const { page, limit, maxResults, startIndex } = normalizePaginationParams({
      page: query.page,
      limit: query.limit,
      maxResults: query.maxResults,
    });

    // Получаем API ключ из окружения
    const apiKey = process.env.BOOKS_API_KEY;

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'BOOKS_API_KEY не настроен',
      });
    }

    // Строим поисковый запрос
    const searchString = buildGoogleBooksQuery({
      query: searchQuery as string,
      author: author as string,
      category: category as string,
    });

    // Параметры для Google Books API
    const params = new URLSearchParams({
      q: searchString,
      key: apiKey,
      startIndex: startIndex.toString(),
      maxResults: maxResults.toString(),
      orderBy: orderBy as string,
      langRestrict: language as string,
      printType: 'books',
    });

    // Запрос к Google Books API
    const response = await $fetch<GoogleBooksResponse>(
      `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    // Парсим книги
    const books = (response.items || []).map(parseGoogleBook);

    // Рассчитываем пагинацию
    const total = response.totalItems || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      books,
      total,
      page,
      limit,
      totalPages,
      hasMore,
    };

  } catch (error: any) {
    console.error('Ошибка при получении книг:', error);

    // Обрабатываем ошибки Google Books API
    if (error.response) {
      throw createError({
        statusCode: error.response.status || 500,
        statusMessage: error.response._data?.error?.message || 'Ошибка Google Books API',
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении книг',
    });
  }
});


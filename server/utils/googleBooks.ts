import type { GoogleBookVolume, Book } from '~~/types/books';

/**
 * Парсит данные из Google Books API в наш упрощенный формат
 */
export function parseGoogleBook(volume: GoogleBookVolume): Book {
  const { volumeInfo, saleInfo } = volume;

  return {
    id: volume.id,
    title: volumeInfo.title || 'Без названия',
    subtitle: volumeInfo.subtitle,
    authors: volumeInfo.authors || [],
    publisher: volumeInfo.publisher,
    publishedDate: volumeInfo.publishedDate,
    description: volumeInfo.description,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories || [],
    rating: volumeInfo.averageRating,
    ratingsCount: volumeInfo.ratingsCount,
    thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://').replace('&edge=curl', ''),
    cover: volumeInfo.imageLinks?.extraLarge?.replace('http://', 'https://').replace('&edge=curl', '') || 
           volumeInfo.imageLinks?.large?.replace('http://', 'https://').replace('&edge=curl', '') || 
           volumeInfo.imageLinks?.medium?.replace('http://', 'https://').replace('&edge=curl', '') || 
           volumeInfo.imageLinks?.small?.replace('http://', 'https://').replace('&edge=curl', '') ||
           volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://').replace('&edge=curl', ''),
    language: volumeInfo.language,
    previewLink: volumeInfo.previewLink,
    infoLink: volumeInfo.infoLink,
    price: saleInfo?.retailPrice ? {
      amount: saleInfo.retailPrice.amount,
      currency: saleInfo.retailPrice.currencyCode,
    } : undefined,
  };
}

/**
 * Строит query string для Google Books API
 */
export function buildGoogleBooksQuery(params: {
  query?: string;
  author?: string;
  category?: string;
}): string {
  const parts: string[] = [];

  if (params.query) {
    parts.push(params.query);
  }

  if (params.author) {
    parts.push(`inauthor:${params.author}`);
  }

  if (params.category) {
    parts.push(`subject:${params.category}`);
  }

  return parts.join('+') || 'fiction'; // По умолчанию - художественная литература
}

/**
 * Валидация и нормализация параметров пагинации
 */
export function normalizePaginationParams(params: {
  page?: number | string;
  limit?: number | string;
  maxResults?: number | string;
}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(40, Math.max(1, Number(params.limit) || 20));
  const maxResults = Number(params.maxResults) || limit;
  const startIndex = (page - 1) * limit;

  return {
    page,
    limit,
    maxResults: Math.min(40, maxResults), // Google Books API лимит
    startIndex,
  };
}


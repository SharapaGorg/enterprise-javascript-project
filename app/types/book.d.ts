// types/book.ts
/**
 * Основной интерфейс книги
 */
export interface Book {
  id: string | number;
  title: string;
  author: string;
  cover: string; // URL обложки
  description: string;
  reason?: string; // Причина рекомендации от AI
  status?: BookStatus;
  isbn?: string;
  publishedYear?: number;
  genres?: string[];
  rating?: number;
}

/**
 * Возможные статусы книги
 */
export type BookStatus = 
  | 'reading'    // Читаю
  | 'planned'    // В планах
  | 'read'       // Прочитано
  | 'postponed'  // Отложено
  | 'dropped'    // Брошено
  | 'favorite';  // Любимое

/**
 * Информация о статусе с отображением
 */
export interface StatusInfo {
  value: BookStatus;
  label: string;
  emoji: string;
}

/**
 * API ответ с книгами (пример для Google Books API)
 */
export interface BooksApiResponse {
  items: Book[];
  totalItems: number;
}

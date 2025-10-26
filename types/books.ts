// Google Books API типы
export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
  saleInfo?: {
    saleability?: string;
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
  };
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBookVolume[];
}

// Наш упрощенный формат книги
export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories: string[];
  rating?: number;
  ratingsCount?: number;
  thumbnail?: string;
  cover?: string;
  language?: string;
  previewLink?: string;
  infoLink?: string;
  price?: {
    amount: number;
    currency: string;
  };
}

// Параметры запроса книг
export interface BooksQueryParams {
  query?: string;
  author?: string;
  category?: string;
  language?: string;
  orderBy?: 'relevance' | 'newest';
  page?: number;
  limit?: number;
  maxResults?: number;
}

// Ответ от нашего API
export interface BooksApiResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}


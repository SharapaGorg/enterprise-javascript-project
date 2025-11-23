# 📡 API Endpoints Documentation

## Books API

### `GET /api/books`

Поиск книг с фильтрацией, сортировкой и пагинацией.

**Query Parameters:**

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|----------|-----|--------------|--------------|----------|
| `query` | string | Нет | - | Поисковый запрос (название, автор) |
| `author` | string | Нет | - | Фильтр по автору |
| `category` | string | Нет | - | Фильтр по категории/жанру |
| `language` | string | Нет | `'ru'` | Язык книг (ru, en, de, fr, es, it) |
| `orderBy` | enum | Нет | `'relevance'` | Сортировка: `'relevance'` \| `'newest'` |
| `page` | number | Нет | `1` | Номер страницы |
| `limit` | number | Нет | `20` | Книг на странице (макс. 40) |

**Response:**

```typescript
{
  books: Book[];        // Массив книг
  total: number;        // Всего найдено книг
  page: number;         // Текущая страница
  limit: number;        // Книг на странице
  totalPages: number;   // Всего страниц
  hasMore: boolean;     // Есть ли еще страницы
}
```

**Примеры запросов:**

```bash
# Простой поиск
GET /api/books?query=harry+potter

# Поиск по автору
GET /api/books?author=Толстой&language=ru

# С пагинацией
GET /api/books?query=javascript&page=2&limit=10

# С фильтрами
GET /api/books?query=programming&category=computers&orderBy=newest&language=en
```

**Пример ответа:**

```json
{
  "books": [
    {
      "id": "abc123",
      "title": "Гарри Поттер и философский камень",
      "subtitle": "Книга 1",
      "authors": ["Дж. К. Роулинг"],
      "publisher": "Росмэн",
      "publishedDate": "2000",
      "description": "История о мальчике-волшебнике...",
      "pageCount": 432,
      "categories": ["Фэнтези", "Детская литература"],
      "rating": 4.8,
      "ratingsCount": 15234,
      "thumbnail": "https://books.google.com/...",
      "cover": "https://books.google.com/...",
      "language": "ru",
      "previewLink": "https://books.google.com/...",
      "infoLink": "https://books.google.com/..."
    }
  ],
  "total": 1523,
  "page": 1,
  "limit": 20,
  "totalPages": 77,
  "hasMore": true
}
```

---

### `GET /api/books/:id`

Получить детальную информацию о конкретной книге.

**Path Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | string | ID книги из Google Books |

**Response:**

```typescript
Book {
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
```

**Примеры запросов:**

```bash
GET /api/books/zvQYDwAAQBAJ
GET /api/books/wrOQLV6xB-wC
```

**Пример ответа:**

```json
{
  "id": "zvQYDwAAQBAJ",
  "title": "Гарри Поттер и узник Азкабана",
  "authors": ["Дж. К. Роулинг"],
  "publisher": "Pottermore Publishing",
  "publishedDate": "2015-12-08",
  "description": "Третья книга о Гарри Поттере...",
  "pageCount": 464,
  "categories": ["Fiction"],
  "rating": 4.6,
  "ratingsCount": 3456,
  "thumbnail": "https://...",
  "cover": "https://...",
  "language": "ru"
}
```

---

## Error Responses

Все эндпоинты могут вернуть следующие ошибки:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "statusMessage": "ID книги обязателен"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "statusMessage": "Книга не найдена"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "statusMessage": "BOOKS_API_KEY не настроен"
}
```

```json
{
  "statusCode": 500,
  "statusMessage": "Ошибка при получении книг"
}
```

---

## Использование в коде

### Через composable (рекомендуется)

```vue
<script setup>
const { getBooks, getBookById, searchBooks, fetchBook } = useBooks();

// 1. Прямой запрос (await)
const searchResults = await getBooks({
  query: 'harry potter',
  language: 'ru',
  page: 1,
  limit: 20,
});

// 2. Реактивный поиск (auto-refresh при изменении параметров)
const searchParams = ref({
  query: 'javascript',
  language: 'en',
  page: 1,
});

const { data, pending, error, refresh } = searchBooks(searchParams);

// 3. Получение конкретной книги
const bookId = ref('abc123');
const { data: book } = fetchBook(bookId);

// 4. Прямой запрос книги по ID
const book = await getBookById('abc123');
</script>
```

### Через $fetch

```typescript
// GET запрос
const books = await $fetch('/api/books', {
  query: {
    query: 'programming',
    language: 'en',
    page: 1,
    limit: 10,
  },
});

// Получение книги по ID
const book = await $fetch(`/api/books/${bookId}`);
```

---

## Типы

Все типы доступны в `~/types/books.ts`:

```typescript
import type { 
  Book,
  BooksApiResponse,
  BooksQueryParams,
  GoogleBookVolume,
  GoogleBooksResponse,
} from '~/types/books';
```

---

## Rate Limits & Best Practices

### Google Books API лимиты:
- **Бесплатный tier:** 1000 запросов/день
- **Максимум результатов:** 40 книг за запрос  
- **Rate limit:** ~10 запросов/секунду

### Рекомендации:
1. ✅ Используйте кеширование результатов
2. ✅ Добавляйте debounce для поиска в реальном времени
3. ✅ Не делайте запросы на каждый keystroke
4. ✅ Используйте пагинацию вместо загрузки всех результатов

### Пример с debounce:

```vue
<script setup>
import { useDebounceFn } from '@vueuse/core';

const searchQuery = ref('');
const debouncedSearch = useDebounceFn(() => {
  // Выполнить поиск
  refresh();
}, 500); // 500ms задержка

watch(searchQuery, debouncedSearch);
</script>
```

---

## Testing

```bash
# Тестовый запрос через curl
curl "http://localhost:3000/api/books?query=test&language=ru"

# С параметрами
curl "http://localhost:3000/api/books?query=python&author=lutz&page=1&limit=5"

# Конкретная книга
curl "http://localhost:3000/api/books/zvQYDwAAQBAJ"
```

---

## См. также

- [BOOKS_API_SETUP.md](../../BOOKS_API_SETUP.md) - Настройка Google Books API
- [Google Books API Docs](https://developers.google.com/books/docs/v1/using)
- Demo страница: http://localhost:3000/books


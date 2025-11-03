<template>
  <div class="books-page">
    <div class="container">
      <header class="page-header">
        <h1>📚 Поиск книг</h1>
        <p class="subtitle">Поиск книг через Google Books API</p>
        <NuxtLink to="/" class="back-link">← На главную</NuxtLink>
      </header>

      <div class="search-section">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Введите название книги или автора..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-button" :disabled="pending" @click="handleSearch">
            {{ pending ? 'Поиск...' : '🔍 Искать' }}
          </button>
        </div>

        <div class="filters">
          <select v-model="language" class="filter-select">
            <option value="ru">Русский</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>

          <select v-model="orderBy" class="filter-select">
            <option value="relevance">По релевантности</option>
            <option value="newest">Новые сначала</option>
          </select>

          <input
            v-model="author"
            type="text"
            placeholder="Автор..."
            class="filter-input"
          />

          <input
            v-model="category"
            type="text"
            placeholder="Жанр..."
            class="filter-input"
          />
        </div>
      </div>

      <div v-if="error" class="error-message">
        ❌ {{ error.message || 'Произошла ошибка при загрузке книг' }}
      </div>

      <div v-if="pending" class="loading">
        <div class="spinner"></div>
        <p>Загрузка книг...</p>
      </div>

      <div v-else-if="books && books.length > 0" class="books-grid">
        <div v-for="book in books" :key="book.id" class="book-card">
          <div class="book-card-content">
            <div class="book-cover">
              <img
                v-if="book.cover || book.thumbnail"
                :src="getHighQualityImageUrl(book)"
                :alt="book.title"
                loading="lazy"
                class="book-cover-image"
              />
              <div v-else class="no-cover">📖</div>
            </div>
            
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p v-if="book.subtitle" class="book-subtitle">{{ book.subtitle }}</p>
              <p class="book-authors">{{ book.authors.join(', ') || 'Автор неизвестен' }}</p>
              
              <div v-if="book.rating" class="book-rating">
                ⭐ {{ book.rating }} ({{ book.ratingsCount }} отзывов)
              </div>

              <p v-if="book.description" class="book-description">
                {{ truncateText(book.description, 200) }}
              </p>

              <div class="book-meta">
                <span v-if="book.publishedDate" class="meta-item">
                  📅 {{ book.publishedDate }}
                </span>
                <span v-if="book.pageCount" class="meta-item">
                  📄 {{ book.pageCount }} стр.
                </span>
              </div>

              <div class="book-categories">
                <span
                  v-for="cat in book.categories.slice(0, 3)"
                  :key="cat"
                  class="category-tag"
                >
                  {{ cat }}
                </span>
              </div>
            </div>
          </div>

          <div class="book-actions">
              <button
                v-if="isBookmarked(book.id)"
                class="btn-bookmark active"
                @click="handleRemoveBookmark(book)"
                title="Удалить из закладок"
              >
                ⭐ В закладках
              </button>
              <div v-else class="bookmark-dropdown">
                <button
                  class="btn-bookmark"
                  @click="showBookmarkMenu = showBookmarkMenu === book.id ? null : book.id"
                  title="Добавить в закладки"
                >
                  ➕ В закладки
                </button>
                <div
                  v-if="showBookmarkMenu === book.id"
                  class="bookmark-menu"
                  @click.stop
                >
                  <button
                    v-for="statusOption in statusOptions"
                    :key="statusOption.value"
                    class="bookmark-menu-item"
                    @click="handleAddBookmark(book, statusOption.value)"
                  >
                    {{ statusOption.emoji }} {{ statusOption.label }}
                  </button>
                </div>
              </div>
              <a
                v-if="book.previewLink"
                :href="book.previewLink"
                target="_blank"
                class="btn-preview"
              >
                👁️ Предпросмотр
              </a>
              <a
                v-if="book.infoLink"
                :href="book.infoLink"
                target="_blank"
                class="btn-info"
              >
                ℹ️ Подробнее
              </a>
          </div>
        </div>
      </div>

      <div v-else-if="!pending && searchQuery" class="no-results">
        <p>📚 Книги не найдены</p>
        <p class="hint">Попробуйте изменить поисковый запрос</p>
      </div>

      <div v-else class="welcome-message">
        <h2>🔍 Начните поиск</h2>
        <p>Введите название книги, автора или жанр</p>
        <div class="suggestions">
          <button class="suggestion-btn" @click="searchExample('Harry Potter')">
            Harry Potter
          </button>
          <button class="suggestion-btn" @click="searchExample('Толстой')">
            Толстой
          </button>
          <button class="suggestion-btn" @click="searchExample('JavaScript')">
            JavaScript
          </button>
        </div>
      </div>

      <div v-if="booksData && booksData.total > 0" class="pagination">
        <div class="pagination-info">
          Найдено: {{ booksData.total }} книг | Страница {{ booksData.page }} из {{ booksData.totalPages }}
        </div>
        
        <div class="pagination-controls">
          <button
            :disabled="currentPage <= 1 || pending"
            class="pagination-btn"
            @click="prevPage"
          >
            ← Предыдущая
          </button>
          
          <span class="page-number">{{ currentPage }}</span>
          
          <button
            :disabled="!booksData.hasMore || pending"
            class="pagination-btn"
            @click="nextPage"
          >
            Следующая →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useBookmarks, type BookStatus } from '@/composables/useBookmarks';
import type { Book } from '~~/types/books';

const { searchBooks } = useBooks();
const {
  addBookmark,
  removeBookmark,
  isBookmarked,
  updateBookStatus,
} = useBookmarks();

const showBookmarkMenu = ref<string | null>(null);

const statusOptions = [
  { value: 'reading' as BookStatus, label: 'Читаю', emoji: '📖' },
  { value: 'planned' as BookStatus, label: 'В планах', emoji: '📝' },
  { value: 'finished' as BookStatus, label: 'Прочитано', emoji: '✅' },
  { value: 'shelved' as BookStatus, label: 'Отложено', emoji: '⏸️' },
  { value: 'dropped' as BookStatus, label: 'Брошено', emoji: '❌' },
  { value: 'favourite' as BookStatus, label: 'Любимые', emoji: '💖' },
];

const handleAddBookmark = (book: Book, status: BookStatus) => {
  addBookmark(book, status);
  showBookmarkMenu.value = null;
};

// Optimize Google Books image URL for higher quality
const getHighQualityImageUrl = (book: Book): string => {
  const imageUrl = book.cover || book.thumbnail;
  if (!imageUrl) return '';
  
  let url = imageUrl;
  
  // For Google Books images, we can add parameters for better quality
  if (url.includes('books.google.com') || url.includes('googleusercontent.com')) {
    // Remove any existing zoom parameter
    url = url.replace(/&zoom=\d/, '');
    // Add high zoom level
    url += '&zoom=2';
    
    // Remove edge curl effect if present
    url = url.replace('&edge=curl', '');
    
    // Add printsec parameter for better quality
    if (!url.includes('printsec=')) {
      url += '&printsec=frontcover';
    }
    
    // Add img=1 parameter
    if (!url.includes('img=')) {
      url += '&img=1';
    }
  }
  
  return url;
};

const handleRemoveBookmark = (book: Book) => {
  if (confirm('Удалить книгу из закладок?')) {
    removeBookmark(book.id);
  }
};

// Закрываем меню при клике вне его
onMounted(() => {
  if (process.client) {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.bookmark-dropdown')) {
        showBookmarkMenu.value = null;
      }
    });
  }
});

// SEO
useHead({
  title: 'Поиск книг - ReadMind AI',
  meta: [
    { name: 'description', content: 'Поиск книг через Google Books API' },
  ],
});

// Поисковые параметры
const searchQuery = ref('');
const author = ref('');
const category = ref('');
const language = ref('ru');
const orderBy = ref<'relevance' | 'newest'>('relevance');
const currentPage = ref(1);

// Реактивный поиск
const searchParams = computed(() => ({
  query: searchQuery.value,
  author: author.value,
  category: category.value,
  language: language.value,
  orderBy: orderBy.value,
  page: currentPage.value,
  limit: 20,
}));

const { data: booksData, pending, error, refresh } = searchBooks(searchParams);

const books = computed(() => booksData.value?.books || []);

// Методы
const handleSearch = () => {
  currentPage.value = 1;
  refresh();
};

const searchExample = (query: string) => {
  searchQuery.value = query;
  handleSearch();
};

const nextPage = () => {
  currentPage.value++;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
</script>

<style scoped>
.books-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  position: relative;
}

.page-header h1 {
  font-size: 48px;
  margin: 0 0 12px 0;
}

.subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.back-link {
  position: absolute;
  left: 0;
  top: 0;
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.back-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.search-section {
  background: white;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-button {
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.filter-input {
  min-width: 150px;
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
}

.book-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.book-card-content {
  display: flex;
  flex-direction: row;
  padding: 24px;
  gap: 24px;
  flex: 1;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.book-cover {
  width: 200px;
  height: 300px;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.book-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.book-card:hover .book-cover-image {
  transform: scale(1.05);
}

.no-cover {
  font-size: 64px;
  color: #cbd5e0;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.book-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.3;
}

.book-subtitle {
  margin: 0;
  font-size: 16px;
  color: #718096;
  font-style: italic;
}

.book-authors {
  margin: 0;
  font-size: 16px;
  color: #4a5568;
  font-weight: 600;
}

.book-rating {
  font-size: 16px;
  color: #d69e2e;
}

.book-description {
  margin: 0;
  font-size: 14px;
  color: #718096;
  line-height: 1.6;
}

.book-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 12px;
  color: #718096;
}

.book-categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tag {
  padding: 4px 12px;
  background: #edf2f7;
  color: #4a5568;
  font-size: 12px;
  border-radius: 12px;
}

.book-actions {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  justify-content: center;
  position: relative;
}

.bookmark-dropdown {
  position: relative;
}

.btn-bookmark {
  padding: 10px 14px;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  cursor: pointer;
  white-space: nowrap;
}

.btn-bookmark:hover {
  background: #edf2f7;
}

.btn-bookmark.active {
  background: #fbd38d;
  border-color: #f6ad55;
  color: #744210;
}

.bookmark-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 160px;
  overflow: hidden;
}

.bookmark-menu-item {
  display: block;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  border: none;
  background: white;
  color: #1a202c;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.bookmark-menu-item:hover {
  background: #f7fafc;
}

.bookmark-menu-item:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
}

.btn-preview,
.btn-info {
  padding: 12px 24px;
  text-align: center;
  text-decoration: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  min-width: 140px;
}

.btn-preview {
  background: #667eea;
  color: white;
}

.btn-preview:hover {
  background: #5568d3;
}

.btn-info {
  background: #f7fafc;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-info:hover {
  background: #edf2f7;
}

.no-results,
.welcome-message {
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.no-results p,
.welcome-message p {
  margin: 12px 0;
  font-size: 18px;
}

.hint {
  opacity: 0.8;
  font-size: 14px;
}

.welcome-message h2 {
  font-size: 36px;
  margin: 0 0 16px 0;
}

.suggestions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
  flex-wrap: wrap;
}

.suggestion-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.pagination {
  background: white;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #4a5568;
}

.pagination-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pagination-btn {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.page-number {
  padding: 10px 16px;
  background: #edf2f7;
  border-radius: 8px;
  font-weight: 700;
  color: #1a202c;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 32px;
  }

  .back-link {
    position: static;
    display: inline-block;
    margin-bottom: 20px;
  }

  .search-box {
    flex-direction: column;
  }
  
  .books-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .book-card-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 16px;
  }
  
  .book-cover {
    width: 150px;
    height: 225px;
  }
  
  .book-actions {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  .book-actions > * {
    width: 100%;
    min-width: unset;
  }

  .filters {
    flex-direction: column;
  }

  .filter-select,
  .filter-input {
    width: 100%;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    text-align: center;
  }
}
</style>


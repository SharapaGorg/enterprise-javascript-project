<template>
  <div class="book-details-page">
    <div class="container">
      <button class="back-button" @click="$router.back()">
        ← Назад к поиску
      </button>
      
      <div class="book-details-content">
        <!-- inlined BookCard -->
        <div class="book-card" v-if="book">
          <div class="book-card-image">
            <div v-if="(book.cover || book.thumbnail) && !imageError" class="image-container">
              <div class="image-skeleton" :class="{ 'loaded': imageLoaded }"></div>
              <img
                :src="getOptimizedImageUrl()"
                :alt="book.title"
                loading="lazy"
                class="book-image"
                @error="handleImageError"
                @load="handleImageLoad"
              />
            </div>
            <div v-else class="book-card-placeholder">
              <span class="placeholder-icon">📚</span>
              <span class="placeholder-text">{{ (book.title || '').substring(0, 1).toUpperCase() }}</span>
            </div>
          </div>
        </div>
        <!-- end inlined BookCard -->
        
        <div class="book-info-section">
          
          <div class="book-card-content">
            <div class="book-card-header">
              <h3 class="book-card-title">{{ book?.title }}</h3>

              <div class="right-controls">
                <button
                  class="bookmark-btn"
                  :class="{ 'bookmark-btn--active': isBookmarkedValue }"
                  @click.stop="handleBookmarkClick"
                  aria-label="bookmark"
                  title="Добавить в закладки"
                >
                  <span v-if="isBookmarkedValue">★</span>
                  <span v-else>☆</span>
                </button>
              </div>
            </div>

            <div class="meta-item" v-if="book?.authors && book?.authors.length">
              <strong>Authors:</strong> {{ book.authors?.join(', ') }}
            </div>

            <div class="book-card-rating" v-if="book?.rating || book?.ratingsCount">
              <span>⭐ {{ book?.rating ?? '—' }}</span>
              <span v-if="book?.ratingsCount"> · {{ book.ratingsCount }}</span>
            </div>

            <div class="book-card-status" v-if="book?.status">
              {{ getStatusLabel(book?.status) }}
            </div>
          </div>
          
          <div class="book-description-section">
            <h2>Описание</h2>
            <p class="book-description">
              {{ book?.description || 'Описание отсутствует' }}
            </p>  
          </div>
          
          <h2>Информация о книге</h2>
          <div class="book-meta">
            <div class="meta-item" v-if="book?.publisher">
              <strong>Издательство:</strong> {{ book.publisher }}
            </div>
            <div class="meta-item" v-if="book?.publishedDate">
              <strong>Дата публикации:</strong> {{ book.publishedDate }}
            </div>
            <div class="meta-item" v-if="book?.pageCount">
              <strong>Количество страниц:</strong> {{ book.pageCount }}
            </div>
            <div class="meta-item" v-if="book?.language">
              <strong>Язык:</strong> {{ book.language }}
            </div>
          </div>

          <div v-if="book?.categories?.length" class="book-categories">
            <h2>Категории</h2>
            <div class="categories-list">
              <span 
                v-for="category in book.categories" 
                :key="category" 
                class="category-tag"
              >
                {{ category }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <SummaryAiSection :book="book" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useBooks } from '@/composables/useBooks';
import { useBookmarks, type BookStatus } from '@/composables/useBookmarks';
import { useBookImage } from '@/composables/useBookImage';
import type { Book } from '~~/types/books';
import SummaryAiSection from '@/components/SummaryAiSection.vue';

const route = useRoute();
const { getBookById } = useBooks();
const id = computed(() => route.params.id as string);

// useAsyncData с реактивным ключом, чтобы при навигации по client-side данные обновлялись
const { data: book, refresh } = await useAsyncData<Book>(
  () => `book-${id.value}`,
  () => getBookById(id.value),
  { watch: [id] }
);

// защита: на случай, если watch не сработает, принудительно рефрешим
watch(id, () => {
  refresh().catch(() => {});
});

// SEO
useHead({
  title: book.value ? `${book.value.title} - ReadMind AI` : 'Книга - ReadMind AI',
  meta: [
    {
      name: 'description',
      content: book.value?.description?.substring(0, 160) || 'Детальная информация о книге'
    }
  ]
});

// --- Inlined BookCard logic ---
const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
const { getHighQualityImageUrl, getImageDimensions } = useBookImage();

const imageError = ref(false);
const imageLoaded = ref(false);
const imageDimensions = getImageDimensions('medium');

const isBookmarkedValue = computed(() => !!(book.value && isBookmarked(book.value.id)));

const statusLabels: Record<BookStatus, string> = {
  reading: '📖 Читаю',
  planned: '📝 В планах',
  finished: '✅ Прочитано',
  shelved: '⏸️ Отложено',
  dropped: '❌ Брошено',
  favourite: '💖 Любимые',
};

function getStatusLabel(status: BookStatus): string {
  return statusLabels[status] || status;
}

function getOptimizedImageUrl() {
  const imageUrl = book.value?.cover || book.value?.thumbnail;
  return imageUrl ? imageUrl.replace('http://', 'https://') : '';
}

function handleImageError(event: Event) {
  console.error('Image failed to load:', (event.target as HTMLImageElement).src);
  imageError.value = true;
  imageLoaded.value = true;
}

function handleImageLoad() {
  imageLoaded.value = true;
}

function handleBookmarkClick() {
  if (!book.value) return;
  if (isBookmarkedValue.value) {
    if (confirm('Удалить книгу из закладок?')) {
      removeBookmark(book.value.id);
    }
  } else {
    addBookmark(book.value, 'planned');
  }
}
</script>

<style scoped>
.book-details-page {
  padding: 24px;
  min-height: 100vh;
  background: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s;
}

.back-button:hover {
  background: #edf2f7;
  transform: translateY(-1px);
}

.book-details-content {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 32px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* unified right column styling */
.book-info-section {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: transparent;
  color: #2d3748;
}

/* make inlined BookCard image fill entire left column */
.book-card {
  background: transparent;
  border-radius: 8px;
  padding: 0;
  cursor: default;
  transition: all 0.2s;
  border: none;
  display: flex;
  gap: 0;
  margin-bottom: 0;
  align-items: stretch;
  height: 100%;
}

.book-card-image {
  width: 100%;
  height: 100%;
  min-height: 240px;
  max-height: 600px; /* ограничение высоты картинки */
  border-radius: 8px;
  overflow: hidden;
  background: #f7fafc;
  display: block;
  position: relative;
}

/* image container now fills the whole left column */
.image-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  z-index: 1;
  transition: opacity 0.3s ease;
}

.image-skeleton.loaded {
  opacity: 0;
  pointer-events: none;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ensure image covers entire container, but respect max-height */
.book-card-image img.book-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  max-height: 600px;
}

/* placeholder also fills */
.book-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e2e8f0 0%, #f7fafc 100%);
  color: #718096;
  position: relative;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.placeholder-text {
  font-size: 24px;
  font-weight: bold;
  color: #4a5568;
}

/* right column content */
.book-card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* controls container */
.right-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* bookmark button kept as before */
.bookmark-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #667eea;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bookmark-btn:hover {
  border-color: #667eea;
  background: #f0f4ff;
  transform: scale(1.05);
}

.bookmark-btn--active {
  background: #fbd38d;
  border-color: #f6ad55;
  color: #744210;
}

.book-card-author {
  margin: 0;
  font-size: 13px;
  color: #718096;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-card-rating {
  font-size: 13px;
  color: #f6ad55;
  margin-top: auto;
}

.book-card-rating span {
  color: #718096;
  font-size: 12px;
}

.book-card-status {
  margin-top: auto;
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  padding: 6px 10px;
  background: #f0f4ff;
  border-radius: 6px;
  text-align: center;
  white-space: nowrap;
}

/* description and meta keep unified spacing */
.book-info-section h2 {
  margin: 0;
  font-size: 18px;
  color: #1a202c;
}

.book-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 8px;
}

.book-meta {
  display: grid;
  gap: 12px;
  margin-bottom: 0;
}

.meta-item {
  color: #4a5568;
}

.meta-item strong {
  color: #2d3748;
  margin-right: 8px;
}

.book-categories {
  margin-top: 12px;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  padding: 4px 12px;
  background: #edf2f7;
  border-radius: 16px;
  font-size: 14px;
  color: #4a5568;
}

/* responsive */
@media (max-width: 768px) {
  .book-details-content {
    grid-template-columns: 1fr;
  }

  .book-card {
    flex-direction: column;
  }

  .book-card-image {
    width: 100%;
    min-height: 220px;
  }

  .placeholder-icon {
    font-size: 36px;
  }
}
</style>
<template>
  <div class="book-card" @click="handleClick">
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
        <span class="placeholder-text">{{ book.title.substring(0, 1).toUpperCase() }}</span>
      </div>
    </div>
    <div class="book-card-content">
      <div class="book-card-header">
        <h4 class="book-card-title">{{ book.title }}</h4>
        <button
          v-if="showBookmark"
          class="bookmark-btn"
          :class="{ 'bookmark-btn--active': isBookmarkedValue }"
          @click.stop="handleBookmarkClick"
          :title="isBookmarkedValue ? 'Удалить из закладок' : 'Добавить в закладки'"
        >
          {{ isBookmarkedValue ? '⭐' : '➕' }}
        </button>
      </div>
      <p v-if="book.authors && book.authors.length > 0" class="book-card-author">
        {{ book.authors.join(', ') }}
      </p>
      <div v-if="book.rating" class="book-card-rating">
        ⭐ {{ book.rating.toFixed(1) }}
        <span v-if="book.ratingsCount">({{ book.ratingsCount }})</span>
      </div>
      <div v-if="'status' in book && book.status" class="book-card-status">
        {{ getStatusLabel(book.status) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBookmarks, type BookStatus } from '@/composables/useBookmarks';
import { useBookImage } from '@/composables/useBookImage';
import type { Book } from '~~/types/books';
import type { BookmarkedBook } from '@/composables/useBookmarks';

interface Props {
  book: Book | BookmarkedBook;
  showBookmark?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showBookmark: false,
});

const emit = defineEmits<{
  (e: 'click', book: Book): void;
}>();

const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
const { getHighQualityImageUrl, getImageDimensions } = useBookImage();

const imageError = ref(false);
const imageLoaded = ref(false);
const imageDimensions = getImageDimensions('medium');

function getOptimizedImageUrl() {
  let imageUrl = props.book.cover || props.book.thumbnail;
  if (!imageUrl) return '';
  
  // Ensure HTTPS
  imageUrl = imageUrl.replace('http://', 'https://');
  
  // For Google Books images, optimize quality
  if (imageUrl.includes('books.google.com') || imageUrl.includes('googleusercontent.com')) {
    // Remove any existing zoom parameter
    imageUrl = imageUrl.replace(/&zoom=\d/, '');
    // Add zoom for better quality
    imageUrl += '&zoom=1';
    
    // Remove edge curl if present
    imageUrl = imageUrl.replace('&edge=curl', '');
    
    // Fix double & if present
    imageUrl = imageUrl.replace(/&&/g, '&');
  }
  
  console.log('Book image URL:', imageUrl);
  return imageUrl;
}

const isBookmarkedValue = computed(() => isBookmarked(props.book.id));

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

function handleImageError(event: Event) {
  console.error('Image failed to load:', (event.target as HTMLImageElement).src);
  imageError.value = true;
  imageLoaded.value = true; // Hide skeleton
}

function handleImageLoad() {
  imageLoaded.value = true;
}

function handleClick() {
  emit('click', props.book);
}

function handleBookmarkClick() {
  if (isBookmarkedValue.value) {
    if (confirm('Удалить книгу из закладок?')) {
      removeBookmark(props.book.id);
    }
  } else {
    // По умолчанию добавляем в "В планах"
    addBookmark(props.book, 'planned');
  }
}
</script>

<style scoped>
.book-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.book-card-image {
  width: 60px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-container {
  position: relative;
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
  border-radius: 4px;
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

.book-card-image img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
}

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
  font-size: 32px;
  margin-bottom: 4px;
}

.placeholder-text {
  font-size: 24px;
  font-weight: bold;
  color: #4a5568;
}

.book-card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.book-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.book-card-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
  min-width: 0;
}

.bookmark-btn {
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #667eea;
  font-size: 12px;
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
  transform: scale(1.1);
}

.bookmark-btn--active {
  background: #fbd38d;
  border-color: #f6ad55;
  color: #744210;
}

.bookmark-btn--active:hover {
  background: #f6ad55;
  border-color: #ed8936;
}

.book-card-author {
  margin: 0;
  font-size: 11px;
  color: #718096;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-card-rating {
  font-size: 11px;
  color: #f6ad55;
  margin-top: auto;
}

.book-card-rating span {
  color: #718096;
  font-size: 10px;
}

.book-card-status {
  margin-top: auto;
  font-size: 11px;
  color: #667eea;
  font-weight: 600;
  padding: 4px 8px;
  background: #f0f4ff;
  border-radius: 6px;
  text-align: center;
  white-space: nowrap;
}
</style>


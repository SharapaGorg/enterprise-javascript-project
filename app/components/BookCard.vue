<template>
  <div class="book-card" @click="handleClick">
    <div class="book-card-image">
      <NuxtImg
        v-if="book.cover || book.thumbnail"
        :src="getOptimizedImageUrl()"
        :alt="book.title"
        :placeholder="book.thumbnail"
        loading="lazy"
        quality="90"
        format="webp"
        :width="imageDimensions.width"
        :height="imageDimensions.height"
        fit="cover"
        class="book-image"
        @error="handleImageError"
      />
      <div v-else class="book-card-placeholder">📚</div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBookmarks, type BookStatus } from '@/composables/useBookmarks';
import { useBookImage } from '@/composables/useBookImage';
import type { Book } from '~~/types/books';

interface Props {
  book: Book;
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
const imageDimensions = getImageDimensions('medium');

function getOptimizedImageUrl() {
  const imageUrl = props.book.cover || props.book.thumbnail;
  return getHighQualityImageUrl(imageUrl);
}

const isBookmarkedValue = computed(() => isBookmarked(props.book.id));

function handleImageError() {
  imageError.value = true;
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
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.book-card-image {
  width: 80px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.book-card-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .book-card-image :deep(img) {
  transform: scale(1.05);
}

.book-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #cbd5e0;
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
</style>


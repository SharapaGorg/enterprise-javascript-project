<template>
  <div class="bookmarks-preview">
    <div class="bookmarks-header">
      <h2 class="bookmarks-title">📖 Мои закладки</h2>
      <NuxtLink to="/profile" class="bookmarks-link">
        Все закладки →
      </NuxtLink>
    </div>

    <div v-if="allBookmarks.length === 0" class="bookmarks-empty">
      <p>У вас пока нет закладок</p>
      <NuxtLink to="/books" class="empty-link">
        🔍 Найти книги
      </NuxtLink>
    </div>

    <div v-else class="bookmarks-grid">
      <BookCard
        v-for="book in displayedBookmarks"
        :key="book.id"
        :book="book"
        :show-bookmark="false"
        @click="handleBookClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBookmarks, type BookStatus } from '@/composables/useBookmarks';
import type { BookmarkedBook } from '@/composables/useBookmarks';
import BookCard from '@/components/BookCard.vue';

const { getAllBookmarks } = useBookmarks();

const allBookmarks = computed(() => getAllBookmarks());

// Показываем только последние 6 книг
const displayedBookmarks = computed(() => {
  return allBookmarks.value
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);
});

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

function handleBookClick(book: BookmarkedBook) {
  if (book.infoLink) {
    window.open(book.infoLink, '_blank');
  } else if (book.previewLink) {
    window.open(book.previewLink, '_blank');
  }
}
</script>

<style scoped>
.bookmarks-preview {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bookmarks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.bookmarks-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
}

.bookmarks-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.bookmarks-link:hover {
  color: #5568d3;
  text-decoration: underline;
}

.bookmarks-empty {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.bookmarks-empty p {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.empty-link {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.empty-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;
}

/* BookCard component handles its own styling */
.bookmarks-grid :deep(.book-card) {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .bookmarks-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .bookmarks-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>


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
      <div
        v-for="book in displayedBookmarks"
        :key="book.id"
        class="bookmark-preview-card"
        @click="handleBookClick(book)"
      >
        <div class="bookmark-preview-cover">
          <img
            v-if="book.thumbnail"
            :src="book.thumbnail"
            :alt="book.title"
          />
          <div v-else class="no-cover">📖</div>
        </div>
        <div class="bookmark-preview-info">
          <h4 class="bookmark-preview-title">{{ book.title }}</h4>
          <p class="bookmark-preview-author">
            {{ book.authors.join(', ') || 'Автор неизвестен' }}
          </p>
          <div class="bookmark-preview-status">
            {{ getStatusLabel(book.status) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBookmarks, type BookStatus } from '@/composables/useBookmarks';
import type { BookmarkedBook } from '@/composables/useBookmarks';

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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.bookmark-preview-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.bookmark-preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.bookmark-preview-cover {
  height: 180px;
  background: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bookmark-preview-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bookmark-preview-cover .no-cover {
  font-size: 48px;
  color: #cbd5e0;
}

.bookmark-preview-info {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bookmark-preview-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.bookmark-preview-author {
  margin: 0;
  font-size: 12px;
  color: #718096;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-preview-status {
  margin-top: auto;
  font-size: 11px;
  color: #667eea;
  font-weight: 600;
  padding: 4px 8px;
  background: #f0f4ff;
  border-radius: 6px;
  text-align: center;
}

@media (max-width: 768px) {
  .bookmarks-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .bookmark-preview-cover {
    height: 160px;
  }

  .bookmarks-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>


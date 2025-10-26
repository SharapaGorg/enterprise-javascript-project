<!-- pages/books.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import type { Book } from '../types/book';

// Состояние
const books = ref<Book[]>([
  {
    id: 1,
    title: 'Война и мир',
    author: 'Лев Толстой',
    cover: 'https://example.com/war-and-peace.jpg',
    description: 'Эпический роман, описывающий русское общество в эпоху войн против Наполеона.',
    reason: 'Классическое произведение, которое должен прочитать каждый любитель русской литературы.',
    status: 'reading'
  },
  {
    id: 2,
    title: 'Преступление и наказание',
    author: 'Фёдор Достоевский',
    cover: 'https://example.com/crime-and-punishment.jpg',
    description: 'Психологический роман о студенте Раскольникове, совершившем преступление.',
    reason: 'Глубокое погружение в психологию человека и моральные дилеммы.',
    status: 'planned'
  },
  {
    id: 3,
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    cover: 'https://example.com/master-and-margarita.jpg',
    description: 'Мистический роман о добре и зле, любви и верности.',
    reason: 'Уникальное сочетание сатиры, философии и мистики.',
  }
]);

// Модальное окно
const isModalOpen = ref(false);
const selectedBook = ref<Book | null>(null);

const openBookModal = (book: Book) => {
  selectedBook.value = book;
  isModalOpen.value = true;
};

const closeBookModal = () => {
  isModalOpen.value = false;
  setTimeout(() => {
    selectedBook.value = null;
  }, 300); // После анимации закрытия
};

const handleStatusChange = (bookId: string | number, status: Book['status']) => {
  const bookIndex = books.value.findIndex(b => b.id === bookId);
  if (bookIndex !== -1) {
    books.value[bookIndex].status = status;
    console.log(`Статус книги ${bookId} изменён на: ${status}`);

    // Здесь можно добавить API запрос для сохранения статуса
    // await $fetch('/api/books/status', {
    //   method: 'PATCH',
    //   body: { bookId, status }
    // });
  }
};
</script>

<template>
  <div class="books-page">
    <div class="books-page__header">
      <h1 class="books-page__title">Мои книги</h1>
      <p class="books-page__subtitle">
        Найдено книг: {{ books.length }}
      </p>
    </div>

    <!-- Сетка с карточками книг -->
    <div class="books-grid">
      <BookCard
        v-for="book in books"
        :key="book.id"
        :book="book"
        variant="mini"
        @open-modal="openBookModal"
        @status-change="handleStatusChange"
      />
    </div>

    <!-- Модальное окно с детальной информацией -->
    <BookModal
      :is-open="isModalOpen"
      :book="selectedBook"
      @close="closeBookModal"
      @status-change="handleStatusChange"
    />
  </div>
</template>

<style scoped>
.books-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.books-page__header {
  margin-bottom: 32px;
}

.books-page__title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.books-page__subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .books-page {
    padding: 24px 16px;
  }

  .books-page__title {
    font-size: 24px;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Типы данных
interface Book {
  id: string | number;
  title: string;
  author: string;
  cover: string;
  description: string;
  reason?: string; // Причина рекомендации от AI
  status?: 'reading' | 'planned' | 'read' | 'postponed' | 'dropped' | 'favorite';
}

// Props компонента
const props = defineProps<{
  book: Book;
  variant?: 'mini' | 'full'; // mini - для списка, full - для модалки
}>();

// Emits
const emit = defineEmits<{
  (e: 'openModal', book: Book): void;
  (e: 'statusChange', bookId: string | number, status: Book['status']): void;
}>();

// Локальное состояние
const isStatusDropdownOpen = ref(false);

// Методы
const handleCardClick = () => {
  if (props.variant === 'mini') {
    emit('openModal', props.book);
  }
};

const handleStatusChange = (status: Book['status']) => {
  emit('statusChange', props.book.id, status);
  isStatusDropdownOpen.value = false;
};

const toggleStatusDropdown = (event: Event) => {
  event.stopPropagation(); // Предотвращаем открытие модалки при клике на статус
  isStatusDropdownOpen.value = !isStatusDropdownOpen.value;
};

// Список статусов
const statuses = [
  { value: 'reading', label: 'Читаю', emoji: '📖' },
  { value: 'planned', label: 'В планах', emoji: '📋' },
  { value: 'read', label: 'Прочитано', emoji: '✅' },
  { value: 'postponed', label: 'Отложено', emoji: '⏸️' },
  { value: 'dropped', label: 'Брошено', emoji: '❌' },
  { value: 'favorite', label: 'Любимое', emoji: '❤️' },
] as const;

// Получение текущего статуса
const currentStatus = computed(() => {
  return statuses.find(s => s.value === props.book.status);
});
</script>

<template>
  <article 
    :class="[
      'book-card',
      `book-card--${variant || 'mini'}`,
      { 'book-card--clickable': variant === 'mini' }
    ]"
    @click="handleCardClick"
  >
    <!-- Обложка книги -->
    <div class="book-card__image-wrapper">
      <img 
        :src="book.cover" 
        :alt="book.title"
        class="book-card__image"
        loading="lazy"
      />

      <!-- Статус книги (только для mini варианта) -->
      <div v-if="variant === 'mini' && book.status" class="book-card__status-badge">
        <button 
          class="book-card__status-button"
          @click.stop="toggleStatusDropdown"
          :title="currentStatus?.label"
        >
          {{ currentStatus?.emoji }}
        </button>

        <!-- Выпадающий список статусов -->
        <div v-if="isStatusDropdownOpen" class="book-card__status-dropdown">
          <button
            v-for="status in statuses"
            :key="status.value"
            :class="[
              'book-card__status-option',
              { 'book-card__status-option--active': status.value === book.status }
            ]"
            @click.stop="handleStatusChange(status.value)"
          >
            <span class="book-card__status-emoji">{{ status.emoji }}</span>
            <span class="book-card__status-label">{{ status.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Контент карточки -->
    <div class="book-card__content">
      <h3 class="book-card__title">{{ book.title }}</h3>
      <p class="book-card__author">{{ book.author }}</p>

      <!-- Описание (только для full варианта) -->
      <p v-if="variant === 'full'" class="book-card__description">
        {{ book.description }}
      </p>

      <!-- Причина рекомендации от AI -->
      <p v-if="book.reason" class="book-card__reason">
        <span class="book-card__reason-icon">💡</span>
        {{ book.reason }}
      </p>
    </div>

    <!-- Футер (только для full варианта) -->
    <div v-if="variant === 'full'" class="book-card__footer">
      <div class="book-card__actions">
        <button
          v-for="status in statuses"
          :key="status.value"
          :class="[
            'book-card__action-button',
            { 'book-card__action-button--active': status.value === book.status }
          ]"
          @click.stop="handleStatusChange(status.value)"
          :title="status.label"
        >
          {{ status.emoji }} {{ status.label }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.book-card--mini {
  max-width: 280px;
}

.book-card--full {
  max-width: 600px;
  padding: 24px;
}

.book-card--clickable {
  cursor: pointer;
}

.book-card--clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Изображение */
.book-card__image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: #f5f5f5;
}

.book-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card--clickable:hover .book-card__image {
  transform: scale(1.05);
}

/* Статус */
.book-card__status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.book-card__status-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.book-card__status-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.book-card__status-dropdown {
  position: absolute;
  top: 44px;
  right: 0;
  min-width: 160px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  padding: 8px;
  z-index: 100;
}

.book-card__status-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
}

.book-card__status-option:hover {
  background: #f5f5f5;
}

.book-card__status-option--active {
  background: #e3f2fd;
}

.book-card__status-emoji {
  font-size: 16px;
}

.book-card__status-label {
  font-size: 14px;
  color: #333;
}

/* Контент */
.book-card__content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-card--full .book-card__content {
  padding: 0;
  gap: 12px;
}

.book-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-card--full .book-card__title {
  font-size: 24px;
  -webkit-line-clamp: unset;
}

.book-card__author {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.book-card--full .book-card__author {
  font-size: 16px;
}

.book-card__description {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
  margin: 0;
}

.book-card__reason {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin: 0;
}

.book-card--full .book-card__reason {
  font-size: 14px;
}

.book-card__reason-icon {
  font-size: 16px;
  flex-shrink: 0;
}

/* Футер */
.book-card__footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.book-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.book-card__action-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.book-card__action-button:hover {
  background: #f5f5f5;
  border-color: #999;
}

.book-card__action-button--active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

/* Responsive */
@media (max-width: 768px) {
  .book-card--full {
    padding: 16px;
  }

  .book-card__title {
    font-size: 16px;
  }

  .book-card--full .book-card__title {
    font-size: 20px;
  }
}
</style>

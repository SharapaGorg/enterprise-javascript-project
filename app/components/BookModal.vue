<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

// Типы данных
interface Book {
  id: string | number;
  title: string;
  author: string;
  cover: string;
  description: string;
  reason?: string;
  status?: 'reading' | 'planned' | 'read' | 'postponed' | 'dropped' | 'favorite';
}

// Props
const props = defineProps<{
  isOpen: boolean;
  book: Book | null;
}>();

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'statusChange', bookId: string | number, status: Book['status']): void;
}>();

// Локальное состояние
const modalRef = ref<HTMLElement | null>(null);
const isAnimating = ref(false);

// Методы
const closeModal = () => {
  isAnimating.value = true;
  setTimeout(() => {
    emit('close');
    isAnimating.value = false;
  }, 200); // Время анимации
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal();
  }
};

const handleStatusChange = (status: Book['status']) => {
  if (props.book) {
    emit('statusChange', props.book.id, status);
  }
};

// Блокировка прокрутки body при открытии модалки
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen && book"
        class="modal-overlay"
        :class="{ 'modal-overlay--closing': isAnimating }"
        @click="handleBackdropClick"
      >
        <div 
          ref="modalRef"
          class="modal-container"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`modal-title-${book.id}`"
        >
          <!-- Кнопка закрытия -->
          <button 
            class="modal-close"
            @click="closeModal"
            aria-label="Закрыть модальное окно"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Контент модального окна -->
          <div class="modal-content">
            <!-- Карточка книги в режиме full -->
            <BookCard 
              :book="book"
              variant="full"
              @status-change="handleStatusChange"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

/* Container */
.modal-container {
  position: relative;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Close button */
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modal-close:hover {
  background: white;
  transform: rotate(90deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-close svg {
  color: #333;
}

/* Content */
.modal-content {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

/* Scrollbar styling */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .modal-container {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 16px 16px 0 0;
  }

  .modal-content {
    padding: 24px 16px;
  }

  .modal-close {
    top: 12px;
    right: 12px;
  }

  .modal-enter-from .modal-container,
  .modal-leave-to .modal-container {
    transform: translateY(100%);
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 20px 12px;
  }
}
</style>

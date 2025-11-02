import { ref, watch, computed } from 'vue';
import { useSupabaseUser } from '#imports';
import type { Book } from '~~/types/books';

export type BookStatus = 
  | 'reading'    // 📖 Читаю
  | 'planned'    // 📝 В планах
  | 'finished'   // ✅ Прочитано
  | 'shelved'    // ⏸️ Отложено
  | 'dropped'    // ❌ Брошено
  | 'favourite'; // 💖 Любимые

export interface BookmarkedBook extends Book {
  status: BookStatus;
  addedAt: string;
  updatedAt: string;
}

const STORAGE_KEY_BOOKMARKS = 'userBookmarks';

export const useBookmarks = () => {
  const user = useSupabaseUser();
  const bookmarks = ref<BookmarkedBook[]>([]);

  // Получаем ключ для localStorage с учетом пользователя
  const getStorageKey = (key: string) => {
    return user.value ? `${key}_${user.value.id}` : key;
  };

  // Загрузка закладок из localStorage
  if (process.client) {
    try {
      const savedBookmarks = localStorage.getItem(getStorageKey(STORAGE_KEY_BOOKMARKS));
      if (savedBookmarks) {
        bookmarks.value = JSON.parse(savedBookmarks);
      }
    } catch (e) {
      console.error('Ошибка при загрузке закладок:', e);
    }
  }

  // Сохранение закладок в localStorage
  const saveBookmarks = () => {
    if (process.client) {
      try {
        localStorage.setItem(getStorageKey(STORAGE_KEY_BOOKMARKS), JSON.stringify(bookmarks.value));
      } catch (e) {
        console.error('Ошибка при сохранении закладок:', e);
      }
    }
  };

  // Автоматическое сохранение при изменении закладок
  watch(bookmarks, () => {
    saveBookmarks();
  }, { deep: true });

  /**
   * Добавить книгу в закладки с указанным статусом
   */
  const addBookmark = (book: Book, status: BookStatus = 'planned') => {
    // Проверяем, не добавлена ли уже эта книга
    const existingIndex = bookmarks.value.findIndex(b => b.id === book.id);
    
    const now = new Date().toISOString();
    
    if (existingIndex > -1) {
      // Обновляем существующую закладку
      bookmarks.value[existingIndex] = {
        ...bookmarks.value[existingIndex],
        ...book,
        status,
        updatedAt: now,
      };
    } else {
      // Добавляем новую закладку
      const bookmarkedBook: BookmarkedBook = {
        ...book,
        status,
        addedAt: now,
        updatedAt: now,
      };
      bookmarks.value.push(bookmarkedBook);
    }
  };

  /**
   * Удалить книгу из закладок
   */
  const removeBookmark = (bookId: string) => {
    const index = bookmarks.value.findIndex(b => b.id === bookId);
    if (index > -1) {
      bookmarks.value.splice(index, 1);
    }
  };

  /**
   * Изменить статус книги
   */
  const updateBookStatus = (bookId: string, status: BookStatus) => {
    const bookmark = bookmarks.value.find(b => b.id === bookId);
    if (bookmark) {
      bookmark.status = status;
      bookmark.updatedAt = new Date().toISOString();
    }
  };

  /**
   * Проверить, добавлена ли книга в закладки
   */
  const isBookmarked = (bookId: string): boolean => {
    return bookmarks.value.some(b => b.id === bookId);
  };

  /**
   * Получить статус книги в закладках
   */
  const getBookStatus = (bookId: string): BookStatus | null => {
    const bookmark = bookmarks.value.find(b => b.id === bookId);
    return bookmark ? bookmark.status : null;
  };

  /**
   * Получить книги по статусу
   */
  const getBooksByStatus = (status: BookStatus): BookmarkedBook[] => {
    return bookmarks.value.filter(b => b.status === status);
  };

  /**
   * Получить все закладки
   */
  const getAllBookmarks = (): BookmarkedBook[] => {
    return [...bookmarks.value];
  };

  /**
   * Очистить все закладки
   */
  const clearAllBookmarks = () => {
    bookmarks.value = [];
  };

  return {
    bookmarks: computed(() => bookmarks.value),
    addBookmark,
    removeBookmark,
    updateBookStatus,
    isBookmarked,
    getBookStatus,
    getBooksByStatus,
    getAllBookmarks,
    clearAllBookmarks,
  };
};


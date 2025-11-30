<template>
  <div class="chat-page">
    <div class="chat-container">
      <button
        v-if="!isChatListOpen"
        class="btn-open-chat-list"
        title="Открыть список чатов"
        @click="isChatListOpen = true"
      >
        💬
      </button>

      <div
        class="chat-list-wrapper"
        :class="{ 'chat-list-wrapper--hidden': !isChatListOpen }"
      >
        <ChatList
          :chats="chats"
          :current-chat-id="currentChatId"
          :is-open="isChatListOpen"
          @switch="handleSwitchChat"
          @create="handleCreateChat"
          @delete="handleDeleteChat"
          @rename="handleRenameChat"
          @close="isChatListOpen = false"
        />
      </div>

      <div class="chat-main">
        <header class="chat-header">
          <div class="header-left">
            <h1>🤖 {{ currentChat?.title || "Чат с ИИ" }}</h1>
            <p class="chat-subtitle">
              Задайте вопрос о книгах, получите рекомендации или обсудите
              литературу
            </p>
          </div>
          <div class="header-actions">
            <RouterLink to="/" class="btn-home" title="На главную">
              🏠 Главная
            </RouterLink>
            <button
              v-if="messages.length > 0"
              class="btn-clear"
              @click="handleClear"
            >
              🗑️ Очистить
            </button>
            <button
              class="btn-new-chat-header"
              title="Новый чат"
              @click="handleCreateChat"
            >
              ➕ Новый
            </button>
          </div>
        </header>

        <div ref="messagesContainer" class="chat-messages">
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="welcome-icon">📚</div>
            <h2>Добро пожаловать в чат с ИИ-ассистентом!</h2>
            <p>Я помогу вам:</p>
            <ul class="help-list">
              <li>Найти книги по вашим интересам</li>
              <li>Получить рекомендации для чтения</li>
              <li>Обсудить литературные произведения</li>
              <li>Узнать больше о книгах и авторах</li>
            </ul>
            <p class="hint">Начните диалог, отправив сообщение ниже 👇</p>
          </div>

          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', `message--${message.role}`]"
          >
            <div class="message-avatar">
              <span v-if="message.role === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-content">
              <div
                class="message-text"
                v-html="formatMessage(message.content)"
              ></div>
              <div v-if="message.timestamp" class="message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="message message--assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="chat-sidebar">
        <div class="sidebar-content">
          <!-- Блок с рекомендациями книг -->
          <div v-if="showBookResults" class="books-results-section">
            <div class="sidebar-header-with-close">
              <h3 class="sidebar-title">📚 Рекомендуемые книги</h3>
              <button
                class="btn-close-results"
                title="Закрыть"
                @click="closeBookResults"
              >
                ✕
              </button>
            </div>

            <div v-if="isSearchingBooks" class="books-loading">
              <div class="loading-spinner"></div>
              <p>Ищем книги...</p>
            </div>

            <div v-else-if="recommendedBooks.length > 0" class="books-list">
              <BookCard
                v-for="book in recommendedBooks"
                :key="book.id"
                :book="book"
                :show-bookmark="true"
                @click="handleBookClick"
              />
            </div>

            <div v-else class="books-empty">
              <p>Книги не найдены</p>
            </div>
          </div>

          <!-- Блок с фильтрами (показывается, когда нет результатов поиска) -->
          <div v-else>
            <h3 class="sidebar-title">🎯 Тематические фильтры</h3>

            <div class="filter-section">
              <label class="filter-label">📚 Жанры</label>
              <div class="filter-tags compact">
                <button
                  v-for="genre in availableGenres"
                  :key="genre"
                  :class="[
                    'filter-tag',
                    { active: selectedGenres.includes(genre) },
                  ]"
                  @click="toggleGenre(genre)"
                >
                  {{ genre }}
                </button>
              </div>
            </div>

            <div class="filter-section">
              <label class="filter-label">📖 Тип</label>
              <div class="filter-tags compact">
                <button
                  v-for="type in availableTypes"
                  :key="type"
                  :class="['filter-tag', { active: selectedType === type }]"
                  @click="selectedType = type"
                >
                  {{ type }}
                </button>
              </div>
            </div>

            <div class="filter-section">
              <label class="filter-label">🎭 Эпоха</label>
              <div class="filter-tags compact">
                <button
                  v-for="era in availableEras"
                  :key="era"
                  :class="['filter-tag', { active: selectedEra === era }]"
                  @click="selectedEra = era"
                >
                  {{ era }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div class="chat-input-wrapper">
      <div v-if="error" class="error-banner">
        <span>❌ {{ error }}</span>
      </div>

      <div class="chat-input-container">
        <form class="chat-form" @submit.prevent="handleSend">
          <textarea
            v-model="inputMessage"
            class="chat-input"
            placeholder="Напишите ваш вопрос или сообщение..."
            rows="2"
            :disabled="isLoading"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.enter.shift.exact="() => {}"
          ></textarea>
          <button
            type="submit"
            class="btn-send"
            :disabled="!inputMessage.trim() || isLoading"
          >
            <span v-if="!isLoading">Отправить</span>
            <span v-else>Отправка...</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted } from "vue";
import { useChat } from "@/composables/useChat";
import { useOnboarding } from "@/composables/useOnboarding";
import { useProfile } from "@/composables/useProfile";
import { useBooks } from "@/composables/useBooks";
import { parseBookRecommendations } from "@/utils/bookParser";
import type { Book } from "~~/types/books";
import BookCard from "@/components/BookCard.vue";
import ChatList from "@/components/ChatList.vue";

definePageMeta({
  middleware: "auth",
});

const {
  chats,
  currentChatId,
  currentChat,
  messages,
  isLoading,
  error,
  sendMessage,
  createChat,
  deleteChat,
  switchChat,
  renameChat,
  clearChat,
  initDefaultChat,
} = useChat();
const { answers: onboardingAnswers } = useOnboarding();
const { fetchProfile } = useProfile();
const { getBooks } = useBooks();
const inputMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const isChatListOpen = ref(true); // По умолчанию открыт

// Состояние для найденных книг
const recommendedBooks = ref<Book[]>([]);
const isSearchingBooks = ref(false);
const showBookResults = ref(false);

// Тематические фильтры
const availableGenres = [
  "Фантастика",
  "Фэнтези",
  "Детектив",
  "Роман",
  "Триллер",
  "Ужасы",
  "Научпоп",
  "Биография",
  "История",
  "Философия",
  "Поэзия",
  "Классика",
];

const availableTypes = [
  "Любой",
  "Художественная",
  "Научная",
  "Мемуары",
  "Эссе",
];

const availableEras = [
  "Любая",
  "Классическая",
  "Современная",
  "Авангард",
  "Постмодерн",
];

const selectedGenres = ref<string[]>([]);
const selectedType = ref("Любой");
const selectedEra = ref("Любая");

// Загружаем профиль для контекста
const profileData = ref(null);
fetchProfile().then(({ data }) => {
  profileData.value = data;
});

// Функция для переключения жанра
function toggleGenre(genre: string) {
  const index = selectedGenres.value.indexOf(genre);
  if (index > -1) {
    selectedGenres.value.splice(index, 1);
  } else {
    selectedGenres.value.push(genre);
  }
}

// Подготавливаем данные для контекста
const contextData = computed(() => {
  const data: {
    onboardingAnswers?: Record<string, any>;
    profileData?: any;
    literaryFilters?: {
      genres?: string[];
      type?: string;
      era?: string;
    };
  } = {};

  // Добавляем данные онбординга, если они есть
  if (onboardingAnswers.value) {
    data.onboardingAnswers = { ...onboardingAnswers.value };
  }

  // Добавляем данные профиля, если они есть
  // TODO: useFetch в нормальном режиме возвращает реактивную переменную, а в обертке single-spa обычную, поэтому тут без .value
  if (profileData?.profile) {
    data.profileData = {
      full_name: profileData.profile.full_name,
      favorite_genres: profileData.profile.favorite_genres,
      reading_goal: profileData.profile.reading_goal,
      bio: profileData.profile.bio,
    };
  }

  // Добавляем тематические фильтры
  const filters: any = {};
  if (selectedGenres.value.length > 0) {
    filters.genres = selectedGenres.value;
  }
  if (selectedType.value !== "Любой") {
    filters.type = selectedType.value;
  }
  if (selectedEra.value !== "Любая") {
    filters.era = selectedEra.value;
  }

  if (Object.keys(filters).length > 0) {
    data.literaryFilters = filters;
  }

  return data;
});

// Автоматическая прокрутка к последнему сообщению
watch(
  messages,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  },
  { deep: true },
);

// Отдельный watch для отслеживания завершения загрузки и проверки рекомендаций
watch(isLoading, async (newLoading, oldLoading) => {
  // Когда загрузка завершается (с true на false), проверяем последнее сообщение
  if (oldLoading === true && newLoading === false) {
    await nextTick();

    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1];

      if (
        lastMessage.role === "assistant" &&
        lastMessage.content &&
        lastMessage.content.trim().length > 0
      ) {
        console.log(
          "Загрузка завершена, проверяем последнее сообщение на рекомендации книг",
        );
        console.log(
          "Содержимое (первые 200 символов):",
          lastMessage.content.substring(0, 200),
        );
        await checkAndSearchBooks(lastMessage.content);
      }
    }
  }
});

// Переключаемся на новый чат при его создании
watch(currentChatId, () => {
  nextTick(() => {
    scrollToBottom();
  });
  // Сбрасываем результаты поиска при смене чата
  showBookResults.value = false;
  recommendedBooks.value = [];
});

// Инициализация первого чата при монтировании
onMounted(() => {
  initDefaultChat();
});

watch(isLoading, () => {
  if (isLoading.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function handleSend() {
  if (!inputMessage.value.trim() || isLoading.value) {
    return;
  }

  const message = inputMessage.value;
  inputMessage.value = "";

  sendMessage(message, contextData.value);
}

function handleClear() {
  if (confirm("Вы уверены, что хотите очистить историю этого чата?")) {
    clearChat();
  }
}

function handleCreateChat() {
  const title = prompt("Введите название нового чата (или оставьте пустым):");
  createChat(title || undefined);
}

function handleSwitchChat(chatId: string) {
  switchChat(chatId);
}

function handleDeleteChat(chatId: string) {
  deleteChat(chatId);
}

function handleRenameChat(chatId: string, newTitle: string) {
  renameChat(chatId, newTitle);
}

function formatMessage(content: string): string {
  // Удаляем технические метки структурированного формата книг
  let formatted = content.replace(
    /---BOOKS_START---[\s\S]*?---BOOKS_END---/g,
    "",
  );

  // Простое форматирование: заменяем переносы строк на <br>
  formatted = formatted
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  return formatted;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Проверка и поиск книг из рекомендаций ИИ
// Возвращает true, если книги были найдены и обработаны
async function checkAndSearchBooks(messageContent: string): Promise<boolean> {
  try {
    console.log("Парсинг рекомендаций книг из сообщения...");
    const parsedBooks = parseBookRecommendations(messageContent);
    console.log("Найдено книг:", parsedBooks.length, parsedBooks);

    if (parsedBooks.length === 0) {
      // Не скрываем результаты, если они уже были показаны (чтобы не мелькало)
      if (!showBookResults.value) {
        return false;
      }
      return false;
    }

    console.log("Начинаем поиск книг...");
    isSearchingBooks.value = true;
    recommendedBooks.value = [];
    showBookResults.value = true;

    // Ищем каждую книгу параллельно
    const searchPromises = parsedBooks.map(async (parsedBook) => {
      try {
        const result = await getBooks({
          query: parsedBook.query,
          limit: 3, // Берем первые 3 результата
          language: "ru",
        });

        if (result.books && result.books.length > 0) {
          // Возвращаем первый результат (наиболее релевантный)
          return result.books[0];
        }
        return null;
      } catch (error) {
        console.error("Ошибка при поиске книги:", error);
        return null;
      }
    });

    const results = await Promise.all(searchPromises);
    recommendedBooks.value = results.filter(
      (book): book is Book => book !== null,
    );

    // Если ничего не найдено, скрываем результаты
    if (recommendedBooks.value.length === 0) {
      showBookResults.value = false;
      return false;
    }

    return true;
  } catch (error) {
    console.error("Ошибка при парсинге рекомендаций:", error);
    showBookResults.value = false;
    return false;
  } finally {
    isSearchingBooks.value = false;
  }
}

function handleBookClick(book: Book) {
  // Открываем информацию о книге в новой вкладке или модальном окне
  if (book.infoLink) {
    window.open(book.infoLink, "_blank");
  } else if (book.previewLink) {
    window.open(book.previewLink, "_blank");
  }
}

function closeBookResults() {
  showBookResults.value = false;
  recommendedBooks.value = [];
}
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.chat-container {
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 40px);
  display: flex;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: visible;
  position: relative;
}

.chat-list-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 260px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border-radius: 16px;
}

.chat-list-wrapper--hidden {
  width: 0;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.chat-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-subtitle {
  display: none; /* Скрываем подзаголовок для экономии места */
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.btn-home,
.btn-new-chat-header,
.btn-clear {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-home:hover,
.btn-new-chat-header:hover,
.btn-clear:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-open-chat-list {
  position: absolute;
  left: -50px;
  top: 16px;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0 12px 12px 0;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
}

.btn-open-chat-list:hover {
  transform: translateX(4px);
  box-shadow: 4px 0 16px rgba(102, 126, 234, 0.4);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-x: hidden;
}

.welcome-message {
  text-align: center;
  padding: 60px 20px;
  color: #4a5568;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.welcome-message h2 {
  margin: 0 0 16px 0;
  color: #1a202c;
  font-size: 24px;
}

.welcome-message p {
  margin: 16px 0 8px 0;
  font-size: 16px;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
  text-align: left;
  display: inline-block;
}

.help-list li {
  padding: 8px 0;
  font-size: 15px;
}

.help-list li::before {
  content: "✓ ";
  color: #667eea;
  font-weight: bold;
  margin-right: 8px;
}

.hint {
  margin-top: 24px !important;
  font-style: italic;
  opacity: 0.8;
}

.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message--user {
  flex-direction: row-reverse;
}

.message--user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.message--assistant .message-content {
  background: #f7fafc;
  color: #1a202c;
  border-radius: 18px 18px 18px 4px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message--user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  word-wrap: break-word;
}

.message-text {
  line-height: 1.6;
  font-size: 15px;
}

.message-text :deep(strong) {
  font-weight: 600;
}

.message-text :deep(em) {
  font-style: italic;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.error-banner {
  margin: 0 24px;
  padding: 12px;
  background: #fed7d7;
  color: #c53030;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

.chat-input-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1400px;
  padding: 0 20px 20px 20px;
  z-index: 10;
  pointer-events: none;
}

.chat-input-wrapper > * {
  pointer-events: auto;
}

.chat-input-container {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.chat-sidebar {
  width: 260px;
  background: #f7fafc;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  align-self: flex-start;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  flex-shrink: 0;
  border-top-right-radius: 16px;
  border-bottom-left-radius: 16px;
}

.sidebar-content {
  padding: 16px;
}

.sidebar-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 700;
  color: #1a202c;
}

.filter-section {
  margin-bottom: 18px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #718096;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.filter-tags.compact .filter-tag {
  padding: 4px 9px;
  font-size: 11px;
}

.filter-tag {
  padding: 5px 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #4a5568;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  line-height: 1.3;
}

.filter-tag:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f0f4ff;
}

.filter-tag.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.filter-tag.active:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%);
}

/* Стили для блока с рекомендациями книг */
.books-results-section {
  width: 100%;
}

.sidebar-header-with-close {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-close-results {
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #718096;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-results:hover {
  background: #e2e8f0;
  color: #4a5568;
  border-color: #cbd5e0;
}

.books-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #718096;
  font-size: 13px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.books-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.books-empty {
  padding: 40px 20px;
  text-align: center;
  color: #718096;
  font-size: 13px;
}

.chat-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  resize: none;
  transition: border-color 0.2s;
  min-height: 50px;
  max-height: 120px;
}

.chat-input:focus {
  outline: none;
  border-color: #667eea;
}

.chat-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.btn-send {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 120px;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-page {
    padding: 0;
  }

  .chat-container {
    height: 100vh;
    border-radius: 0;
    flex-direction: column;
    overflow: hidden;
  }

  .btn-open-chat-list {
    left: 10px;
    top: 10px;
    width: 36px;
    height: 36px;
    font-size: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .btn-open-chat-list:hover {
    transform: none;
  }

  .chat-main {
    flex: 1;
    overflow: hidden;
    order: 2;
  }

  :deep(.chat-list-sidebar) {
    width: 100%;
    max-height: 200px;
    position: relative;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    order: 1;
  }

  .chat-sidebar {
    width: 100%;
    height: auto;
    max-height: 300px;
    position: relative;
    border-left: none;
    border-top: 1px solid #e2e8f0;
    order: 3;
  }

  .chat-input-wrapper {
    position: relative;
    transform: none;
    left: 0;
    padding: 0;
    width: 100%;
    order: 3;
  }

  .chat-input-container {
    border-radius: 0;
    box-shadow: none;
  }

  .chat-header {
    padding: 16px;
  }

  .chat-header h1 {
    font-size: 22px;
    padding-right: 100px;
  }

  .chat-subtitle {
    font-size: 12px;
  }

  .btn-clear {
    top: 16px;
    right: 16px;
    padding: 6px 12px;
    font-size: 12px;
  }

  .chat-messages {
    padding: 16px;
  }

  .message-content {
    max-width: 85%;
  }

  .chat-input-container {
    padding: 16px;
  }

  .chat-form {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-send {
    width: 100%;
  }
}
</style>

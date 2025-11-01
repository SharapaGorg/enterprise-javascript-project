<template>
  <div class="chat-page">
    <div class="chat-container">
      <header class="chat-header">
        <h1>🤖 Чат с ИИ</h1>
        <p class="chat-subtitle">Задайте вопрос о книгах, получите рекомендации или обсудите литературу</p>
        <button v-if="messages.length > 0" class="btn-clear" @click="handleClear">🗑️ Очистить чат</button>
      </header>

      <div class="chat-messages" ref="messagesContainer">
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
            <div class="message-text" v-html="formatMessage(message.content)"></div>
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

      <div v-if="error" class="error-banner">
        <span>❌ {{ error }}</span>
      </div>

      <div class="chat-input-container">
        <form @submit.prevent="handleSend" class="chat-form">
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
import { ref, watch, nextTick } from 'vue';
import { useChat } from '@/composables/useChat';

definePageMeta({
  middleware: 'auth',
});

// SEO
useHead({
  title: 'Чат с ИИ - ReadMind AI',
  meta: [
    { name: 'description', content: 'Чат с ИИ-ассистентом для получения рекомендаций книг и обсуждения литературы' },
  ],
});

const { messages, isLoading, error, sendMessage, clearChat } = useChat();
const inputMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

// Автоматическая прокрутка к последнему сообщению
watch(messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
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
  inputMessage.value = '';

  sendMessage(message);
}

function handleClear() {
  if (confirm('Вы уверены, что хотите очистить историю чата?')) {
    clearChat();
  }
}

function formatMessage(content: string): string {
  // Простое форматирование: заменяем переносы строк на <br>
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.chat-container {
  max-width: 1000px;
  margin: 0 auto;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.chat-header {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.chat-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
}

.chat-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.btn-clear {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  content: '✓ ';
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
  0%, 60%, 100% {
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

.chat-input-container {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: white;
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


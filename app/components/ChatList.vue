<template>
  <aside 
    :class="['chat-list-sidebar', { 'chat-list-sidebar--hidden': !isOpen }]"
  >
      <div class="chat-list-header">
        <h2>💬 Чаты</h2>
        <div class="header-buttons">
          <button class="btn-new-chat" @click="handleNewChat" title="Создать новый чат">
            ➕
          </button>
          <button class="btn-close-sidebar" @click="$emit('close')" title="Закрыть">
            ✕
          </button>
        </div>
      </div>

    <div class="chat-list-content">
      <template v-if="sortedChats.length > 0">
        <div
          v-for="chat in sortedChats"
          :key="chat.id"
          :class="['chat-item', { active: chat.id === currentChatId }]"
          @click="switchChat(chat.id)"
        >
          <div class="chat-item-content">
            <div class="chat-item-title">{{ chat.title }}</div>
            <div class="chat-item-meta">
              <span class="chat-item-date">{{ formatDate(chat.updatedAt) }}</span>
              <span class="chat-item-count">{{ chat.messages.length }} сообщ.</span>
            </div>
          </div>
          <div class="chat-item-actions" @click.stop>
            <button
              class="btn-edit-chat"
              @click="handleRename(chat)"
              title="Переименовать"
            >
              ✏️
            </button>
            <button
              class="btn-delete-chat"
              @click="handleDelete(chat.id)"
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="chat-list-empty">
          <p>Нет сохраненных чатов</p>
          <button class="btn-create-first" @click="handleNewChat">
            Создать первый чат
          </button>
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Chat } from '@/composables/useChat';

interface Props {
  chats: Chat[];
  currentChatId: string | null;
  isOpen?: boolean;
}

interface Emits {
  (e: 'switch', chatId: string): void;
  (e: 'create'): void;
  (e: 'delete', chatId: string): void;
  (e: 'rename', chatId: string, newTitle: string): void;
  (e: 'close'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: true,
});

const emit = defineEmits<Emits>();

const sortedChats = computed(() => {
  return [...props.chats].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
});

function switchChat(chatId: string) {
  emit('switch', chatId);
}

function handleNewChat() {
  emit('create');
}

function handleDelete(chatId: string) {
  if (confirm('Вы уверены, что хотите удалить этот чат?')) {
    emit('delete', chatId);
  }
}

function handleRename(chat: Chat) {
  const newTitle = prompt('Введите новое название чата:', chat.title);
  if (newTitle && newTitle.trim() && newTitle.trim() !== chat.title) {
    emit('rename', chat.id, newTitle.trim());
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Сегодня';
  } else if (days === 1) {
    return 'Вчера';
  } else if (days < 7) {
    return `${days} дн. назад`;
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  }
}
</script>

<style scoped>
.chat-list-sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: calc(100vh - 40px);
  max-height: calc(100vh - 40px);
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  z-index: 10;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
  transform: translateX(0);
  opacity: 1;
}

.chat-list-sidebar--hidden {
  transform: translateX(-100%);
  opacity: 0;
  pointer-events: none;
}

.chat-list-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  position: sticky;
  top: 0;
  z-index: 5;
}

.chat-list-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
}

.header-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-new-chat,
.btn-close-sidebar {
  width: 28px;
  height: 28px;
  border: 1.5px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-new-chat:hover {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.btn-close-sidebar {
  border-color: #e2e8f0;
  color: #718096;
}

.btn-close-sidebar:hover {
  background: #e2e8f0;
  color: #4a5568;
}

.chat-list-content {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  padding: 12px 14px;
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  border-bottom: 1px solid #f7fafc;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  position: relative;
  box-sizing: border-box;
}

.chat-item:hover {
  background: #f7fafc;
}

.chat-item.active {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-left: 3px solid #667eea;
}

.chat-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.chat-item-title {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.3;
  color: #1a202c;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-item-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  line-height: 1.2;
  color: #718096;
  margin: 0;
}

.chat-item-date {
  white-space: nowrap;
}

.chat-item-count {
  white-space: nowrap;
}

.chat-item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
  align-items: center;
}

.chat-item:hover .chat-item-actions,
.chat-item.active .chat-item-actions {
  opacity: 1;
}

.btn-edit-chat,
.btn-delete-chat {
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-edit-chat:hover {
  transform: scale(1.2);
}

.btn-delete-chat:hover {
  transform: scale(1.2);
  filter: brightness(0) saturate(100%) invert(40%) sepia(100%) saturate(3000%) hue-rotate(340deg);
}

.chat-list-empty {
  padding: 40px 20px;
  text-align: center;
  color: #718096;
}

.chat-list-empty p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.btn-create-first {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-first:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style>


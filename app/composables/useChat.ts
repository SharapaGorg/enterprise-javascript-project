import { ref, watch, computed } from "vue";
import { API_URL } from "~/constants";
import { createAuthHeaders } from "~/utils/auth";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date | string;
}

interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY_CHATS = "userChats";
const STORAGE_KEY_CURRENT_CHAT = "currentChatId";

export const useChat = () => {
  const user = useSupabaseUser();
  const chats = ref<Chat[]>([]);
  const currentChatId = ref<string | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Получаем ключ для localStorage с учетом пользователя
  const getStorageKey = (key: string) => {
    return user.value ? `${key}_${user.value.id}` : key;
  };

  // Загрузка чатов из localStorage
  if (process.client) {
    try {
      const savedChats = localStorage.getItem(getStorageKey(STORAGE_KEY_CHATS));
      if (savedChats) {
        chats.value = JSON.parse(savedChats).map((chat: Chat) => ({
          ...chat,
          messages: chat.messages.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          })),
        }));
      }

      const savedCurrentId = localStorage.getItem(
        getStorageKey(STORAGE_KEY_CURRENT_CHAT),
      );
      if (savedCurrentId && chats.value.find((c) => c.id === savedCurrentId)) {
        currentChatId.value = savedCurrentId;
      } else if (chats.value.length > 0 && chats.value[0]) {
        currentChatId.value = chats.value[0].id;
      }
    } catch (e) {
      console.error("Ошибка при загрузке чатов:", e);
    }
  }

  // Текущий активный чат
  const currentChat = computed(() => {
    return chats.value.find((c) => c.id === currentChatId.value) || null;
  });

  // Автоматическая загрузка сообщений текущего чата
  watch(
    currentChatId,
    (newId) => {
      if (newId && process.client) {
        const chat = chats.value.find((c) => c.id === newId);
        if (chat) {
          messages.value = chat.messages.map((msg) => ({
            ...msg,
            timestamp: msg.timestamp
              ? typeof msg.timestamp === "string"
                ? new Date(msg.timestamp)
                : msg.timestamp
              : undefined,
          }));
          localStorage.setItem(getStorageKey(STORAGE_KEY_CURRENT_CHAT), newId);
        } else {
          messages.value = [];
        }
      }
    },
    { immediate: true },
  );

  // Сохранение сообщений в текущий чат
  watch(
    messages,
    (newMessages) => {
      if (currentChatId.value && process.client) {
        const chat = chats.value.find((c) => c.id === currentChatId.value);
        if (chat) {
          chat.messages = newMessages.map((msg) => ({
            ...msg,
            timestamp:
              msg.timestamp instanceof Date
                ? msg.timestamp.toISOString()
                : msg.timestamp,
          }));
          chat.updatedAt = new Date().toISOString();
          saveChats();
        }
      }
    },
    { deep: true },
  );

  // Сохранение чатов в localStorage
  const saveChats = () => {
    if (process.client) {
      try {
        const chatsToSave = chats.value.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg) => ({
            ...msg,
            timestamp:
              msg.timestamp instanceof Date
                ? msg.timestamp.toISOString()
                : msg.timestamp,
          })),
        }));
        localStorage.setItem(
          getStorageKey(STORAGE_KEY_CHATS),
          JSON.stringify(chatsToSave),
        );
      } catch (e) {
        console.error("Ошибка при сохранении чатов:", e);
      }
    }
  };

  /**
   * Отправить сообщение и получить ответ от ИИ
   */
  const sendMessage = async (
    content: string,
    contextData?: {
      onboardingAnswers?: Record<string, any>;
      profileData?: any;
    },
  ) => {
    if (!content.trim()) {
      return;
    }

    // Добавляем сообщение пользователя
    const userMessage: ChatMessage = {
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    messages.value.push(userMessage);

    isLoading.value = true;
    error.value = null;

    try {
      // Подготавливаем массив сообщений для отправки (без timestamp)
      const messagesToSend = messages.value
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Отправляем запрос
      const authConfig = await createAuthHeaders();
      console.log("Отправляем сообщения:", messagesToSend);
      console.log("Контекст:", contextData);
      
      const { data: response, error: fetchError } = await useFetch<ChatResponse>(API_URL + "/chat", {
        method: "POST",
        body: {
          messages: messagesToSend,
          contextData,
        },
        ...authConfig,
      });

      console.log("Ответ сервера:", response.value);
      console.log("Ошибка запроса:", fetchError.value);

      // Добавляем ответ ассистента
      if (response.value?.message) {
        messages.value.push({
          role: "assistant",
          content: response.value.message,
          timestamp: new Date(),
        });
      } else {
        throw new Error("Не удалось получить ответ от сервера");
      }

      // Автоматическое переименование чата, если это первое сообщение
      if (currentChatId.value && messages.value.length === 2) {
        const chat = chats.value.find((c) => c.id === currentChatId.value);
        if (
          chat &&
          (chat.title.startsWith("Новый чат") ||
            chat.title === "Мой первый чат")
        ) {
          const firstUserMessage = messages.value.find(
            (m) => m.role === "user",
          );
          if (firstUserMessage) {
            const title = firstUserMessage.content.substring(0, 50).trim();
            if (title) {
              chat.title =
                title + (firstUserMessage.content.length > 50 ? "..." : "");
              chat.updatedAt = new Date().toISOString();
              saveChats();
            }
          }
        }
      }
    } catch (err: any) {
      error.value =
        err.data?.statusMessage ||
        err.message ||
        "Произошла ошибка при отправке сообщения";

      // При ошибке не нужно удалять сообщения, так как мы их не добавляли

      console.error("Ошибка при отправке сообщения:", err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Создать новый чат
   */
  const createChat = (title?: string) => {
    const newChat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || `Новый чат ${chats.value.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    chats.value.unshift(newChat);
    currentChatId.value = newChat.id;
    messages.value = [];
    error.value = null;
    saveChats();

    return newChat.id;
  };

  /**
   * Удалить чат
   */
  const deleteChat = (chatId: string) => {
    const index = chats.value.findIndex((c) => c.id === chatId);
    if (index > -1) {
      chats.value.splice(index, 1);
      saveChats();

      // Если удалили текущий чат, переключаемся на первый доступный
      if (currentChatId.value === chatId) {
        if (chats.value.length > 0 && chats.value[0]) {
          currentChatId.value = chats.value[0].id;
        } else {
          currentChatId.value = null;
          messages.value = [];
        }
      }
    }
  };

  /**
   * Переключиться на чат
   */
  const switchChat = (chatId: string) => {
    const chat = chats.value.find((c) => c.id === chatId);
    if (chat) {
      currentChatId.value = chatId;
      error.value = null;
    }
  };

  /**
   * Переименовать чат
   */
  const renameChat = (chatId: string, newTitle: string) => {
    const chat = chats.value.find((c) => c.id === chatId);
    if (chat && newTitle.trim()) {
      chat.title = newTitle.trim();
      chat.updatedAt = new Date().toISOString();
      saveChats();
    }
  };

  /**
   * Очистить историю текущего чата
   */
  const clearChat = () => {
    if (currentChatId.value) {
      const chat = chats.value.find((c) => c.id === currentChatId.value);
      if (chat) {
        chat.messages = [];
        chat.updatedAt = new Date().toISOString();
        messages.value = [];
        error.value = null;
        saveChats();
      }
    } else {
      messages.value = [];
      error.value = null;
    }
  };

  // Автоматическое создание первого чата при монтировании (вызывается из компонента)
  const initDefaultChat = () => {
    if (process.client && chats.value.length === 0 && !currentChatId.value) {
      createChat("Мой первый чат");
    }
  };

  return {
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
  };
};

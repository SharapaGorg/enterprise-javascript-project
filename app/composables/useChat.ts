interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const useChat = () => {
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Отправить сообщение и получить ответ от ИИ
   */
  const sendMessage = async (content: string) => {
    if (!content.trim()) {
      return;
    }

    // Добавляем сообщение пользователя
    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    messages.value.push(userMessage);

    // Добавляем placeholder для ответа ассистента
    const assistantMessageIndex = messages.value.length;
    messages.value.push({
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    });

    isLoading.value = true;
    error.value = null;

    try {
      // Подготавливаем массив сообщений для отправки (без timestamp)
      const messagesToSend = messages.value
        .slice(0, -1) // Убираем последний пустой элемент
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Отправляем запрос
      const response = await $fetch<ChatResponse>('/api/chat', {
        method: 'POST',
        body: {
          messages: messagesToSend,
        },
      });

      // Обновляем ответ ассистента
      messages.value[assistantMessageIndex] = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Произошла ошибка при отправке сообщения';
      
      // Удаляем сообщение ассистента при ошибке
      messages.value.pop();
      
      console.error('Ошибка при отправке сообщения:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Очистить историю чата
   */
  const clearChat = () => {
    messages.value = [];
    error.value = null;
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
};


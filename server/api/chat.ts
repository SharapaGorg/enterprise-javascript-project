interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export default defineEventHandler(async (event): Promise<{ message: string; usage?: any }> => {
  try {
    // Проверяем метод запроса
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      });
    }

    // Получаем тело запроса
    const body = await readBody<ChatRequest>(event);

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Messages array is required and cannot be empty',
      });
    }

    // Получаем API ключ и настройки из runtime config
    const config = useRuntimeConfig();
    const apiKey = config.openRouterApiKey;

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OPENROUTER_API_KEY не настроен',
      });
    }

    // Подготавливаем системный промпт для литературного ассистента
    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'Ты - персональный литературный ассистент ReadMind AI. Помогай пользователям с вопросами о книгах, рекомендациями, обсуждением литературных произведений. Будь дружелюбным, знающим и полезным.',
    };

    // Добавляем системное сообщение в начало, если его нет
    const messages: ChatMessage[] = body.messages.some(m => m.role === 'system')
      ? body.messages
      : [systemMessage, ...body.messages];

    // Запрос к OpenRouter API
    const response = await $fetch<OpenRouterResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': config.public.siteUrl,
          'X-Title': config.public.siteName,
        },
        body: {
          model: 'deepseek/deepseek-chat',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
        },
      }
    );

    // Проверяем ответ
    if (!response.choices || response.choices.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Пустой ответ от OpenRouter API',
      });
    }

    const assistantMessage = response.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';

    return {
      message: assistantMessage,
      usage: response.usage,
    };

  } catch (error: any) {
    console.error('Ошибка при запросе к OpenRouter API:', error);

    // Обрабатываем ошибки OpenRouter API
    if (error.response) {
      const status = error.response.status || 500;
      const message = error.response._data?.error?.message || 'Ошибка OpenRouter API';
      
      throw createError({
        statusCode: status,
        statusMessage: message,
      });
    }

    // Обрабатываем другие ошибки
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при обработке запроса к ИИ',
    });
  }
});


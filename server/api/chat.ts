interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  includeOnboarding?: boolean;
  includeProfile?: boolean;
  customContext?: string;
}

interface ContextData {
  onboardingAnswers?: Record<string, any>;
  profileData?: {
    full_name?: string;
    favorite_genres?: string[];
    reading_goal?: number;
    bio?: string;
  };
  literaryFilters?: {
    genres?: string[];
    type?: string;
    era?: string;
  };
}

interface ChatRequest {
  messages: ChatMessage[];
  settings?: ChatSettings;
  contextData?: ContextData;
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

    // Получаем настройки или используем значения по умолчанию
    const settings = body.settings || {
      model: 'deepseek/deepseek-chat',
      temperature: 0.7,
      maxTokens: 2000,
      includeOnboarding: true,
      includeProfile: true,
      customContext: '',
    };

    // Формируем системный промпт с контекстом
    let systemPrompt = 'Ты - персональный литературный ассистент ReadMind AI. Помогай пользователям с вопросами о книгах, рекомендациями, обсуждением литературных произведений. Будь дружелюбным, знающим и полезным.\n\n';

    // Добавляем контекст из онбординга
    if (settings.includeOnboarding && body.contextData?.onboardingAnswers) {
      const answers = body.contextData.onboardingAnswers;
      const contextParts: string[] = [];

      if (answers.languages) {
        contextParts.push(`Пользователь читает на языках: ${answers.languages}`);
      }
      if (answers.readingPurpose) {
        contextParts.push(`Цель чтения: ${answers.readingPurpose}`);
      }
      if (answers.bookPreference) {
        contextParts.push(`Предпочтения в книгах: ${answers.bookPreference}`);
      }
      if (answers.favoriteBooks) {
        contextParts.push(`Любимые книги и авторы: ${answers.favoriteBooks}`);
      }
      if (answers.readingFrequency) {
        contextParts.push(`Частота чтения: ${answers.readingFrequency}`);
      }

      if (contextParts.length > 0) {
        systemPrompt += 'Контекст о пользователе из онбординга:\n';
        contextParts.forEach(part => {
          systemPrompt += `- ${part}\n`;
        });
        systemPrompt += '\n';
      }
    }

    // Добавляем контекст из профиля
    if (settings.includeProfile && body.contextData?.profileData) {
      const profile = body.contextData.profileData;
      const profileParts: string[] = [];

      if (profile.full_name) {
        profileParts.push(`Имя: ${profile.full_name}`);
      }
      if (profile.favorite_genres && profile.favorite_genres.length > 0) {
        profileParts.push(`Любимые жанры: ${profile.favorite_genres.join(', ')}`);
      }
      if (profile.reading_goal) {
        profileParts.push(`Цель чтения: ${profile.reading_goal} книг в год`);
      }
      if (profile.bio) {
        profileParts.push(`О пользователе: ${profile.bio}`);
      }

      if (profileParts.length > 0) {
        systemPrompt += 'Информация из профиля пользователя:\n';
        profileParts.forEach(part => {
          systemPrompt += `- ${part}\n`;
        });
        systemPrompt += '\n';
      }
    }

    // Добавляем тематические фильтры
    if (body.contextData?.literaryFilters) {
      const filters = body.contextData.literaryFilters;
      const filterParts: string[] = [];

      if (filters.genres && filters.genres.length > 0) {
        filterParts.push(`Интересует пользователя: ${filters.genres.join(', ')}`);
      }
      if (filters.type) {
        filterParts.push(`Тип литературы: ${filters.type}`);
      }
      if (filters.era) {
        filterParts.push(`Эпоха/Стиль: ${filters.era}`);
      }

      if (filterParts.length > 0) {
        systemPrompt += 'Тематические предпочтения пользователя:\n';
        filterParts.forEach(part => {
          systemPrompt += `- ${part}\n`;
        });
        systemPrompt += '\n';
      }
    }

    // Добавляем кастомный контекст
    if (settings.customContext?.trim()) {
      systemPrompt += `Дополнительный контекст:\n${settings.customContext.trim()}\n\n`;
    }

    systemPrompt += 'Используй всю эту информацию для персонализации рекомендаций и ответов.';

    const systemMessage: ChatMessage = {
      role: 'system',
      content: systemPrompt,
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
          model: settings.model,
          messages: messages,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
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


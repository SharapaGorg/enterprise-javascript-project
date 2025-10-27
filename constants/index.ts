// Роуты приложения
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/profile',
} as const;

// Статусы книг (для будущей функциональности)
export const BOOK_STATUSES = {
  READING: 'reading',
  WANT_TO_READ: 'want_to_read',
  READ: 'read',
  ON_HOLD: 'on_hold',
  DROPPED: 'dropped',
  FAVORITE: 'favorite',
} as const;

// Лейблы статусов книг на русском
export const BOOK_STATUS_LABELS = {
  [BOOK_STATUSES.READING]: 'Читаю',
  [BOOK_STATUSES.WANT_TO_READ]: 'В планах',
  [BOOK_STATUSES.READ]: 'Прочитано',
  [BOOK_STATUSES.ON_HOLD]: 'Отложено',
  [BOOK_STATUSES.DROPPED]: 'Брошено',
  [BOOK_STATUSES.FAVORITE]: 'Любимое',
} as const;

// Валидация
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Настройки для книг
export const BOOKS_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 40,
  DEFAULT_LANGUAGE: 'ru',
  SUPPORTED_LANGUAGES: ['ru', 'en', 'de', 'fr', 'es', 'it'],
  ORDER_BY_OPTIONS: ['relevance', 'newest'] as const,
} as const;

// Лимиты подписок (для будущей функциональности)
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    SUMMARIES_PER_MONTH: 3,
    AI_SEARCH: false,
  },
  PRO: {
    SUMMARIES_PER_MONTH: Infinity,
    AI_SEARCH: true,
    PRICE: 15,
  },
  TEAMS: {
    SUMMARIES_PER_MONTH: Infinity,
    AI_SEARCH: true,
    CLUBS: true,
    PRICE: 49,
  },
} as const;

// Сообщения об ошибках
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Неверный email или пароль',
    PASSWORDS_DONT_MATCH: 'Пароли не совпадают',
    PASSWORD_TOO_SHORT: `Пароль должен содержать минимум ${VALIDATION.MIN_PASSWORD_LENGTH} символов`,
    EMAIL_ALREADY_EXISTS: 'Пользователь с таким email уже существует',
    GENERIC: 'Произошла ошибка. Попробуйте еще раз',
  },
  NETWORK: {
    CONNECTION_ERROR: 'Ошибка подключения к серверу',
    TIMEOUT: 'Превышено время ожидания',
  },
} as const;

// Сообщения об успехе
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Успешный вход!',
    REGISTER_SUCCESS: 'Регистрация успешна!',
    LOGOUT_SUCCESS: 'Вы вышли из аккаунта',
    EMAIL_CONFIRMATION_SENT: 'Проверьте email для подтверждения аккаунта',
  },
} as const;


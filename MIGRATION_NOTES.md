# Заметки по миграции авторизации для микрофронтенда

## Дата: 2025-11-23

### Проблема
После переезда фронтенда на микрофронтенд перестала работать авторизация при запросах к API профиля. Фронт и бэк теперь на разных хостах, и токен авторизации не передавался между ними.

### Решение

#### 1. CORS настройки (выполнено ранее)
- Создан `/server/middleware/cors.ts` - middleware для обработки CORS заголовков
- Обновлен `nuxt.config.ts` - добавлены настройки CORS в конфигурацию Nitro
- Сервер теперь принимает запросы с любых источников (`*`)

#### 2. Изменения на фронтенде
- **Создан** `/app/utils/auth.ts`:
  - `getAuthToken()` - получает токен из Supabase сессии
  - `createAuthHeaders()` - создает заголовки с токеном для fetch запросов

- **Обновлен** `/app/composables/useProfile.ts`:
  - Все методы теперь используют `createAuthHeaders()` для добавления токена
  - `getProfile()`, `updateProfile()`, `fetchProfile()` - передают токен в заголовке Authorization

- **Обновлены страницы**:
  - `/app/pages/profile/index.vue` - добавлен `await` перед `fetchProfile()`
  - `/app/pages/chat.vue` - добавлен `await` перед `fetchProfile()`

#### 3. Изменения на сервере
- **Создан** `/server/utils/auth.ts`:
  - `getBearerToken()` - извлекает токен из заголовка Authorization
  - `createServerSupabaseClient()` - создает Supabase клиент с токеном и проверяет его валидность

- **Обновлены API endpoints**:
  - `/server/api/profile.get.ts` - теперь использует `createServerSupabaseClient()`
  - `/server/api/profile.patch.ts` - теперь использует `createServerSupabaseClient()`

### Как работает сейчас
1. Пользователь логинится через Supabase на фронтенде
2. При запросе к API профиля:
   - Фронт получает токен из Supabase сессии
   - Добавляет токен в заголовок `Authorization: Bearer <token>`
   - Отправляет запрос на бэкенд
3. Бэкенд:
   - Извлекает токен из заголовка
   - Проверяет его через Supabase API
   - Если токен валидный - выполняет запрос
   - Если нет - возвращает 401

### Пример ответа от Supabase при авторизации
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsImtpZCI6ImZaUzVNamxmT05ZbEpJYWMiLCJ0eXAiOiJKV1QifQ...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "6zus4qrougu4",
    "user": {
        "id": "fe15783a-4654-4c47-9bc2-5117dc28c123",
        "email": "dushin.egor.dm@yandex.ru",
        // ... остальные данные пользователя
    }
}
```

### TODO на завтра
1. Протестировать работу авторизации в микрофронтенде
2. Проверить, что токен корректно обновляется при истечении
3. Возможно, нужно будет добавить interceptor для автоматического добавления токена ко всем запросам
4. Проверить работу других API endpoints (books, chat) - возможно, им тоже нужна авторизация
5. Рассмотреть использование `$fetch.create()` с базовыми заголовками вместо добавления их в каждый запрос
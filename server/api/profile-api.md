# 👤 Profile API Documentation

## Endpoints

### `GET /api/profile`

Получить профиль текущего авторизованного пользователя.

**Авторизация:** Требуется

**Ответ:**
\`\`\`json
{
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Иван Иванов",
    "avatar_url": "https://...",
    "bio": "Описание профиля",
    "favorite_genres": ["Фантастика", "Детективы"],
    "reading_goal": 50,
    "created_at": "2024-10-25T...",
    "updated_at": "2024-10-25T..."
  },
  "success": true
}
\`\`\`

---

### `PATCH /api/profile`

Обновить профиль текущего пользователя.

**Авторизация:** Требуется

**Body:**
\`\`\`json
{
  "full_name": "Новое имя",
  "bio": "Новое описание",
  "favorite_genres": ["Жанр 1", "Жанр 2"],
  "reading_goal": 100
}
\`\`\`

**Валидация:**
- `reading_goal`: 0-1000
- `favorite_genres`: максимум 10 жанров
- Все поля опциональны

**Ответ:**
\`\`\`json
{
  "profile": { ... },
  "success": true,
  "message": "Профиль успешно обновлен"
}
\`\`\`

---

## Использование

### В компонентах

\`\`\`vue
<script setup>
const { fetchProfile, updateProfile } = useProfile();

// Получить профиль
const { data, pending, refresh } = fetchProfile();

// Обновить профиль
const handleUpdate = async () => {
  await updateProfile({
    full_name: 'Новое имя',
    reading_goal: 50
  });
  refresh();
};
</script>
\`\`\`

### Прямые запросы

\`\`\`typescript
// Получить
const profile = await $fetch('/api/profile');

// Обновить
const updated = await $fetch('/api/profile', {
  method: 'PATCH',
  body: { full_name: 'Новое имя' }
});
\`\`\`


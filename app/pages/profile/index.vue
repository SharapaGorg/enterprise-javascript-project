<template>
  <div class="profile-page">
    <div class="container">
      <header class="page-header">
        <h1>👤 Мой профиль</h1>
        <button class="btn-logout" @click="handleLogout">Выйти</button>
      </header>

      <div v-if="pending" class="loading">
        <div class="spinner"></div>
        <p>Загрузка...</p>
      </div>

      <div v-else-if="error" class="error-card">
        <h2>Ошибка</h2>
        <p>{{ error.message || 'Не удалось загрузить профиль' }}</p>
      </div>

      <div v-else-if="profileData" class="profile-content">
        <!-- Карточка пользователя -->
        <div class="user-card">
          <div class="avatar">
            {{ profileData.email?.[0]?.toUpperCase() || '?' }}
          </div>
          <div class="user-info">
            <h2>{{ profileData.full_name || profileData.email }}</h2>
            <p class="user-email">{{ profileData.email }}</p>
            <p class="user-date">
              Дата регистрации: {{ formatDate(profileData.created_at) }}
            </p>
          </div>
        </div>

        <!-- Режим редактирования -->
        <div v-if="isEditing" class="edit-section">
          <h3>✏️ Редактирование профиля</h3>

          <form class="edit-form" @submit.prevent="handleSave">
            <div class="form-group">
              <label for="full_name">Полное имя</label>
              <input
                id="full_name"
                v-model="formData.full_name"
                type="text"
                placeholder="Иван Иванов"
                maxlength="100"
              />
            </div>

            <div class="form-group">
              <label for="bio">О себе</label>
              <textarea
                id="bio"
                v-model="formData.bio"
                rows="4"
                placeholder="Расскажите о себе..."
                maxlength="500"
              ></textarea>
              <small>{{ formData.bio?.length || 0 }} / 500</small>
            </div>

            <div class="form-group">
              <label for="reading_goal">Цель чтения (книг в год)</label>
              <input
                id="reading_goal"
                v-model.number="formData.reading_goal"
                type="number"
                min="0"
                max="1000"
                placeholder="50"
              />
            </div>

            <div class="form-group">
              <label>Любимые жанры</label>
              <div class="genres-input">
                <div class="genre-tags">
                  <span
                    v-for="(genre, index) in formData.favorite_genres"
                    :key="index"
                    class="genre-tag"
                  >
                    {{ genre }}
                    <button
                      type="button"
                      class="remove-genre"
                      @click="removeGenre(index)"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <div class="genre-input-row">
                  <input
                    v-model="newGenre"
                    type="text"
                    placeholder="Добавить жанр..."
                    maxlength="30"
                    @keyup.enter.prevent="addGenre"
                  />
                  <button
                    type="button"
                    class="btn-add"
                    :disabled="!newGenre || (formData.favorite_genres?.length || 0) >= 10"
                    @click="addGenre"
                  >
                    Добавить
                  </button>
                </div>
              </div>
              
              <div class="popular-genres">
                <small>Популярные:</small>
                <button
                  v-for="genre in popularGenres"
                  :key="genre"
                  type="button"
                  class="suggestion-btn"
                  :disabled="formData.favorite_genres?.includes(genre)"
                  @click="addGenreSuggestion(genre)"
                >
                  {{ genre }}
                </button>
              </div>
            </div>

            <div v-if="saveError" class="alert alert-error">
              {{ saveError }}
            </div>

            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>

            <div class="form-actions">
              <button type="submit" :disabled="saving" class="btn-primary">
                {{ saving ? 'Сохранение...' : '💾 Сохранить' }}
              </button>
              <button type="button" class="btn-secondary" @click="cancelEdit">
                Отмена
              </button>
            </div>
          </form>
        </div>

        <!-- Режим просмотра -->
        <div v-else class="view-section">
          <div class="info-section">
            <div class="section-header">
              <h3>📝 Основная информация</h3>
              <button class="btn-edit" @click="startEditing">✏️ Редактировать</button>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="label">Полное имя:</span>
                <span class="value">{{ profileData.full_name || 'Не указано' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">{{ profileData.email }}</span>
              </div>
              <div v-if="profileData.bio" class="info-item full-width">
                <span class="label">О себе:</span>
                <span class="value">{{ profileData.bio }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>📚 Настройки чтения</h3>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Цель на год:</span>
                <span class="value">
                  {{ profileData.reading_goal || 0 }} книг
                </span>
              </div>
            </div>

            <div v-if="profileData.favorite_genres && profileData.favorite_genres.length > 0" class="genres-display">
              <span class="label">Любимые жанры:</span>
              <div class="genre-list">
                <span
                  v-for="genre in profileData.favorite_genres"
                  :key="genre"
                  class="genre-badge"
                >
                  {{ genre }}
                </span>
              </div>
            </div>
          </div>

          <div class="actions-section">
            <h3>⚡ Действия</h3>
            <div class="action-list">
              <NuxtLink to="/" class="action-item">
                🏠 Главная страница
              </NuxtLink>
              <NuxtLink to="/books" class="action-item">
                📚 Поиск книг
              </NuxtLink>
              <div class="action-item disabled">📝 Пройти онбординг (скоро)</div>
              <div class="action-item disabled">📖 Мои книги (скоро)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const { logout } = useAuth();
const { fetchProfile, updateProfile } = useProfile();

// SEO
useHead({
  title: 'Профиль - ReadMind AI',
  meta: [
    { name: 'description', content: 'Ваш профиль в ReadMind AI' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

// Загружаем профиль
const { data: profile, pending, error, refresh } = fetchProfile();
const profileData = computed(() => profile.value?.profile);

// Состояние редактирования
const isEditing = ref(false);
const saving = ref(false);
const saveError = ref('');
const successMessage = ref('');

// Форма
const formData = ref({
  full_name: '',
  bio: '',
  reading_goal: 0,
  favorite_genres: [] as string[],
});

const newGenre = ref('');

const popularGenres = [
  'Фантастика',
  'Детективы',
  'Триллеры',
  'Романы',
  'Фэнтези',
  'Классика',
  'Бизнес',
  'Психология',
];

// Методы
const handleLogout = async () => {
  try {
    await logout();
  } catch (err) {
    console.error('Ошибка при выходе:', err);
  }
};

const formatDate = (date: string | null) => {
  if (!date) return 'Н/Д';
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const startEditing = () => {
  // Копируем текущие данные в форму
  if (profileData.value) {
    formData.value = {
      full_name: profileData.value.full_name || '',
      bio: profileData.value.bio || '',
      reading_goal: profileData.value.reading_goal || 0,
      favorite_genres: profileData.value.favorite_genres ? [...profileData.value.favorite_genres] : [],
    };
  }
  isEditing.value = true;
  saveError.value = '';
  successMessage.value = '';
};

const cancelEdit = () => {
  isEditing.value = false;
  saveError.value = '';
  successMessage.value = '';
  newGenre.value = '';
};

const addGenre = () => {
  const genre = newGenre.value.trim();
  if (!genre) return;
  
  if (!formData.value.favorite_genres) {
    formData.value.favorite_genres = [];
  }

  if (formData.value.favorite_genres.length >= 10) {
    saveError.value = 'Максимум 10 жанров';
    return;
  }

  if (formData.value.favorite_genres.includes(genre)) {
    saveError.value = 'Этот жанр уже добавлен';
    return;
  }

  formData.value.favorite_genres.push(genre);
  newGenre.value = '';
  saveError.value = '';
};

const addGenreSuggestion = (genre: string) => {
  if (!formData.value.favorite_genres) {
    formData.value.favorite_genres = [];
  }

  if (formData.value.favorite_genres.includes(genre)) return;
  if (formData.value.favorite_genres.length >= 10) {
    saveError.value = 'Максимум 10 жанров';
    return;
  }

  formData.value.favorite_genres.push(genre);
  saveError.value = '';
};

const removeGenre = (index: number) => {
  formData.value.favorite_genres?.splice(index, 1);
};

const handleSave = async () => {
  try {
    saving.value = true;
    saveError.value = '';
    successMessage.value = '';

    await updateProfile(formData.value);

    successMessage.value = 'Профиль успешно обновлен!';
    
    // Обновляем данные
    await refresh();

    // Через 1.5 сек возвращаемся в режим просмотра
    setTimeout(() => {
      isEditing.value = false;
      successMessage.value = '';
    }, 1500);
  } catch (err: any) {
    console.error('Ошибка при сохранении:', err);
    saveError.value = err.data?.statusMessage || 'Произошла ошибка при сохранении';
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 36px;
  margin: 0;
}

.btn-logout {
  padding: 12px 24px;
  background: rgba(252, 129, 129, 0.9);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #fc8181;
  transform: translateY(-2px);
}

.loading,
.error-card {
  background: white;
  padding: 60px;
  border-radius: 16px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-card h2 {
  color: #c53030;
  margin: 0 0 16px 0;
}

.profile-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.user-card {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 12px;
  margin-bottom: 32px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.user-info h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #1a202c;
}

.user-email {
  margin: 4px 0;
  color: #4a5568;
  font-size: 16px;
  font-weight: 500;
}

.user-date {
  margin: 4px 0;
  color: #718096;
  font-size: 14px;
}

.info-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 2px solid #e2e8f0;
}

.info-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.info-section h3,
.actions-section h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
}

.btn-edit {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 6px;
  font-size: 14px;
}

.value {
  display: block;
  font-weight: 600;
  color: #1a202c;
  font-size: 16px;
}

.genres-display {
  margin-top: 16px;
}

.genre-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.genre-badge {
  padding: 6px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

/* Форма редактирования */
.edit-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #e2e8f0;
}

.edit-section h3 {
  margin: 0 0 24px 0;
  font-size: 22px;
  color: #1a202c;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group small {
  font-size: 13px;
  color: #718096;
}

.genres-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
}

.genre-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.remove-genre {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  transition: background 0.2s;
}

.remove-genre:hover {
  background: rgba(255, 255, 255, 0.5);
}

.genre-input-row {
  display: flex;
  gap: 12px;
}

.genre-input-row input {
  flex: 1;
}

.btn-add {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add:hover:not(:disabled) {
  background: #5568d3;
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.popular-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.popular-genres small {
  margin-right: 8px;
}

.suggestion-btn {
  padding: 6px 12px;
  background: #edf2f7;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover:not(:disabled) {
  background: #e2e8f0;
  border-color: #667eea;
  color: #667eea;
}

.suggestion-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 14px;
  border-radius: 8px;
  font-size: 14px;
}

.alert-error {
  background: #fed7d7;
  color: #c53030;
}

.alert-success {
  background: #c6f6d5;
  color: #22543d;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f7fafc;
}

.actions-section {
  margin-top: 32px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  padding: 16px 20px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  color: #1a202c;
  text-decoration: none;
  display: block;
  transition: all 0.2s;
}

.action-item:not(.disabled):hover {
  border-color: #667eea;
  transform: translateX(4px);
}

.action-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .user-card {
    flex-direction: column;
    text-align: center;
  }

  .profile-content {
    padding: 24px;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>

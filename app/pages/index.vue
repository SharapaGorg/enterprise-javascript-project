<template>
  <div class="landing-page">
    <div class="container">
      <header class="header">
        <div class="logo">📚 ReadMind AI</div>
        <nav class="nav">
          <NuxtLink v-if="!user" to="/auth/login" class="nav-link">Войти</NuxtLink>
          <NuxtLink v-else to="/profile" class="nav-link">Профиль</NuxtLink>
        </nav>
      </header>

      <main class="hero">
        <h1 class="hero-title">
          AI-powered персональный<br />литературный ассистент
        </h1>
        <p class="hero-subtitle">
          Получайте персонализированные рекомендации книг на основе искусственного интеллекта
        </p>

        <div class="cta-buttons">
          <NuxtLink v-if="!user" to="/auth/register" class="btn btn-primary">
            Начать бесплатно
          </NuxtLink>
          <NuxtLink v-else to="/profile" class="btn btn-primary">
            Мой профиль
          </NuxtLink>
          <NuxtLink to="/books" class="btn btn-secondary">
            🔍 Поиск книг
          </NuxtLink>
        </div>

        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>AI-рекомендации</h3>
            <p>Умный алгоритм подберет книги под ваши предпочтения</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Краткие саммари</h3>
            <p>Получайте резюме книг прямо в приложении</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>Личная библиотека</h3>
            <p>Управляйте списками чтения со статусами</p>
          </div>
        </div>
      </main>

      <section class="status-section">
        <h2>✅ Что уже работает</h2>
        <ul class="status-list">
          <li>✅ Авторизация и регистрация через Supabase</li>
          <li>✅ Защищенные страницы профиля</li>
          <li>✅ Middleware для защиты роутов</li>
          <li>✅ Тестирование (Vitest)</li>
          <li>✅ Линтинг (ESLint + Prettier)</li>
        </ul>
        <h2>⬜ В разработке</h2>
        <ul class="status-list">
          <li>⬜ Онбординг (5 вопросов о предпочтениях)</li>
          <li>⬜ Интеграция с Deepseek API</li>
          <li>⬜ Получение книг через Google Books API</li>
          <li>⬜ Карточки книг и поиск</li>
          <li>⬜ Управление списками чтения</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
const { user } = useAuth();

// SEO мета-теги
useHead({
  title: 'ReadMind AI - AI-powered персональный литературный ассистент',
  meta: [
    {
      name: 'description',
      content: 'Получайте персонализированные рекомендации книг на основе искусственного интеллекта. Управляйте личной библиотекой и получайте краткие саммари книг.',
    },
    { property: 'og:title', content: 'ReadMind AI - Персональный литературный ассистент' },
    { property: 'og:description', content: 'AI-powered платформа для книжных рекомендаций' },
  ],
});
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.hero {
  text-align: center;
  padding: 80px 0 60px;
  color: white;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 24px 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  margin: 0 0 40px 0;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 80px;
}

.btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  color: #1a202c;
}

.feature-card p {
  margin: 0;
  color: #718096;
  line-height: 1.6;
}

.status-section {
  background: white;
  padding: 40px;
  border-radius: 16px;
  margin-bottom: 40px;
}

.status-section h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #1a202c;
}

.status-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
}

.status-list li {
  padding: 12px 0;
  font-size: 16px;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
}

.status-list li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>

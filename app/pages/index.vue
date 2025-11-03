<template>
  <div class="landing-page">
    <div class="container">
      <Navigation />

      <div v-if="!user" class="welcome-section">
        <h1 class="welcome-title">
          AI-powered персональный<br />литературный ассистент
        </h1>
        <p class="welcome-subtitle">
          Получайте персонализированные рекомендации книг на основе искусственного интеллекта
        </p>
        <div class="welcome-actions">
          <NuxtLink to="/auth/register" class="btn btn-primary">
            Начать бесплатно
          </NuxtLink>
          <NuxtLink to="/auth/login" class="btn btn-secondary">
            Войти
          </NuxtLink>
        </div>
      </div>

      <div v-else class="content-section">
        <BookmarksPreview />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navigation from '@/components/Navigation.vue';
import BookmarksPreview from '@/components/BookmarksPreview.vue';

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
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.welcome-title {
  font-size: 42px;
  font-weight: 800;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 18px;
  margin: 0 0 40px 0;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.welcome-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.content-section {
  padding: 0;
}

.btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
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

@media (max-width: 768px) {
  .landing-page {
    padding: 12px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }

  .welcome-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>

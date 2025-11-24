<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">{{ error.statusCode }}</div>
      <h1 class="error-title">{{ errorTitle }}</h1>
      <p class="error-message">
        {{ error.message || "Произошла неожиданная ошибка" }}
      </p>

      <div class="error-actions">
        <RouterLink to="/" class="btn-primary">На главную</RouterLink>
        <button class="btn-secondary" @click="handleError">
          Попробовать снова
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const errorTitle = computed(() => {
  const code = props.error.statusCode;
  if (code === 404) return "Страница не найдена";
  if (code === 403) return "Доступ запрещен";
  if (code === 500) return "Ошибка сервера";
  return "Что-то пошло не так";
});

const handleError = () => clearError({ redirect: "/" });
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-container {
  background: white;
  padding: 60px 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 20px;
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 16px 0;
}

.error-message {
  font-size: 16px;
  color: #718096;
  margin: 0 0 40px 0;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f7fafc;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>

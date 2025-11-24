<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Вход</h1>
      <p class="subtitle">Войдите в свой аккаунт ReadMind AI</p>

      <form class="form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? "Вход..." : "Войти" }}
        </button>
      </form>

      <p class="link-text">
        Нет аккаунта?
        <RouterLink to="/auth/register">Зарегистрироваться</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, login } = useAuth();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

// SEO мета-теги
useHead({
  title: "Вход - ReadMind AI",
  meta: [
    { name: "description", content: "Войдите в свой аккаунт ReadMind AI" },
  ],
});

// Если пользователь уже авторизован, редирект на профиль
watchEffect(() => {
  if (user.value) {
    router.push("/profile");
  }
});

const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = "";

    await login(email.value, password.value);

    // Успешный вход - редирект произойдет через watchEffect
  } catch (err: any) {
    error.value = err.message || "Произошла ошибка при входе";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
}

.subtitle {
  margin: 0 0 32px 0;
  color: #718096;
  font-size: 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.alert {
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.alert-error {
  background-color: #fed7d7;
  color: #c53030;
}

.btn-primary {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-text {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #718096;
}

.link-text a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.link-text a:hover {
  text-decoration: underline;
}
</style>

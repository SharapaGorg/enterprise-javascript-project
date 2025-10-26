<template>
  <div class="container center-col">
    <div class="card auth-card">
      <h1>Войти / Регистрация</h1>

      <div class="row mt-16" style="justify-content: center">
        <button @click="mode = 'login'" :disabled="mode === 'login'">
          Вход
        </button>
        <button @click="mode = 'register'" :disabled="mode === 'register'">
          Регистрация
        </button>
      </div>

      <form
        class="col mt-24"
        @submit.prevent="onSubmit"
        style="max-width: 360px; align-items: center"
      >
        <label class="col" style="width: 100%">
          Email
          <input v-model="email" type="email" required style="width: 100%" />
        </label>

        <label class="col" v-if="mode === 'register'" style="width: 100%">
          Имя (необязательно)
          <input v-model="name" type="text" style="width: 100%" />
        </label>

        <label class="col" style="width: 100%">
          Пароль
          <input
            v-model="password"
            type="password"
            required
            style="width: 100%"
          />
        </label>

        <button class="mt-24" type="submit">
          {{ mode === "login" ? "Войти" : "Зарегистрироваться" }}
        </button>

        <p v-if="error" style="color: #b00" class="mt-16">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const auth = useAuth();

const mode = ref<"login" | "register">("login");
const email = ref("");
const password = ref("");
const name = ref("");
const error = ref("");

async function onSubmit() {
  error.value = "";
  try {
    if (mode.value === "login") {
      await auth.login(email.value, password.value);
      const redirect = (route.query.redirect as string) || "/profile";
      router.push(redirect);
    } else {
      await auth.register(email.value, password.value, name.value || undefined);
      router.push("/onboarding");
    }
  } catch (e: any) {
    error.value = e?.message || "Ошибка";
  }
}
</script>

<style scoped>
.center-col {
  display: flex;
  justify-content: center;
}

.auth-card {
  text-align: center;
  padding: 32px;
  min-width: 340px;
}
</style>

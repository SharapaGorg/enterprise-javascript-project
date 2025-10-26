<script setup lang="ts">

const auth = useAuth();
const user = computed(() => auth.user.value);

const editing = ref(false);
const form = reactive({
  email: "",
  name: "",
});

watchEffect(() => {
  if (user.value && !editing.value) {
    form.email = user.value.email;
    form.name = user.value.name || "";
  }
});

function startEdit() {
  if (!user.value) return;
  form.email = user.value.email;
  form.name = user.value.name || "";
  editing.value = true;
}

function cancelEdit() {
  editing.value = false;
}

function saveEdit() {
  if (!form.email.trim()) return;
  auth.updateProfile({
    email: form.email.trim(),
    name: form.name.trim() || undefined,
  });
  editing.value = false;
}

function doLogout() {
  auth.logout();
  navigateTo("/");
}
</script>

<template>
  <div class="container center-col">
    <div class="card profile-card">
      <h1>Профиль</h1>

      <template v-if="user">
        <!-- Просмотр -->
        <div v-if="!editing" class="col mt-16" style="align-items: center">
          <div><strong>Email:</strong> {{ user.email }}</div>
          <div><strong>Имя:</strong> {{ user.name || "—" }}</div>
          <div>
            <strong>Онбординг:</strong>
            {{ auth.onboarded ? "пройден" : "не пройден" }}
          </div>

          <div class="row mt-16" style="justify-content: center">
            <button class="mt-16" @click="startEdit">Изменить</button>
            <NuxtLink v-if="!auth.onboarded" to="/onboarding" class="link-btn"
              >Пройти онбординг</NuxtLink
            >
            <button class="mt-16" @click="doLogout">Выйти</button>
          </div>
        </div>

        <!-- Редактирование -->
        <form v-else class="col mt-16 edit-form" @submit.prevent="saveEdit">
          <label class="col" style="width: 100%; align-items: flex-start">
            Email
            <input
              v-model="form.email"
              type="email"
              required
              style="width: 100%"
            />
          </label>

          <label class="col" style="width: 100%; align-items: flex-start">
            Имя
            <input v-model="form.name" type="text" style="width: 100%" />
          </label>

          <div class="row mt-16" style="justify-content: center">
            <button type="submit">Сохранить</button>
            <button
              type="button"
              @click="cancelEdit"
              style="background: #e5e7eb; color: #111"
            >
              Отмена
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.center-col {
  display: flex;
  justify-content: center;
}
.profile-card {
  text-align: center;
  padding: 32px;
  min-width: 340px;
}
.link-btn {
  background: none;
  color: var(--accent-color);
  text-decoration: underline;
  border: none;
  padding: 0 8px;
  cursor: pointer;
  font-weight: 500;
}
.link-btn:hover {
  color: #356440;
}
.edit-form {
  width: 100%;
  max-width: 420px;
  align-items: center;
}
</style>

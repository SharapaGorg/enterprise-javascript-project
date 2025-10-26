<script setup lang="ts">

const auth = useAuth();

const accept = ref(false);
const news = ref(false);

function complete() {
  // TODO: backend: POST /onboarding
  auth.completeOnboarding();
  navigateTo("/profile");
}
</script>

<template>
  <div class="container">
    <h1>Онбординг</h1>
    <div class="col mt-16" style="max-width: 460px">
      <label class="row">
        <input type="checkbox" v-model="accept" />
        <span>Я принимаю условия сервиса</span>
      </label>
      <label class="row">
        <input type="checkbox" v-model="news" />
        <span>Хочу получать новости на email</span>
      </label>
      <h2>Предпочитаемые жанры</h2>
      <label class="row">
        <input type="checkbox" />
        <span>Young Adult</span>
        <input type="checkbox" />
        <span>Антиутопия</span>
        <input type="checkbox" />
        <span>Нон-фикшн</span>
      </label>
      <button class="mt-16" :disabled="!accept" @click="complete">
        Завершить
      </button>
    </div>
  </div>
</template>

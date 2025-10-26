<template>
  <form class="search" @submit.prevent="onSearch">
    <input
      v-model="query"
      type="text"
      placeholder="Поиск..."
      aria-label="Search"
    />
    <button type="submit">Найти</button>
  </form>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const query = ref<string>((route.query.q as string) || "");

function onSearch() {
  router.push({ path: "/", query: { q: query.value || undefined } });
}
</script>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 6px;
}

.search input {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 6px 8px;
  min-width: 220px;
  background: white;
  transition: border-color 0.15s ease;
}

.search input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(76, 125, 240, 0.15);
}

.search button {
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.search button:hover {
  background: #356440;
}
</style>

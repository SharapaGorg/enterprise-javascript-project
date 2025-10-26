<template>
  <nav class="nav">
    <div class="nav-inner">
      <NuxtLink to="/" class="brand">Books</NuxtLink>

      <SearchBar />

      <div>
        <NuxtLink v-if="user" to="/profile">Профиль</NuxtLink>
        <NuxtLink v-else to="/login">Войти</NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { user } = useAuth();
</script>

<style scoped>
.nav {
  border-bottom: 1px solid var(--border-color);
  background: #fff;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
}

.brand {
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
  color: var(--text-color);
}
</style>

<template>
  <nav class="navigation">
    <NuxtLink to="/" class="nav-logo">
      📚 ReadMind AI
    </NuxtLink>
    <div class="nav-menu">
      <NuxtLink
        to="/books"
        class="nav-item"
        :class="{ 'nav-item--active': $route.path.startsWith('/books') }"
      >
        📚 Книги
      </NuxtLink>
      <NuxtLink
        to="/chat"
        class="nav-item"
        :class="{ 'nav-item--active': $route.path.startsWith('/chat') }"
      >
        🤖 Чат
      </NuxtLink>
      <NuxtLink
        to="/profile"
        class="nav-item"
        :class="{ 'nav-item--active': $route.path.startsWith('/profile') }"
      >
        👤 Профиль
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Компонент навигации использует $route для активного состояния
</script>

<style scoped>
.navigation {
  background: white;
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.nav-logo {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  text-decoration: none;
  transition: transform 0.2s;
}

.nav-logo:hover {
  transform: scale(1.05);
}

.nav-menu {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-item {
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-item:hover {
  background: #f7fafc;
  color: #667eea;
}

.nav-item--active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-item--active:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%);
  color: white;
}

@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .nav-menu {
    width: 100%;
    justify-content: space-around;
  }

  .nav-item {
    flex: 1;
    justify-content: center;
    padding: 10px 8px;
    font-size: 13px;
  }
}
</style>


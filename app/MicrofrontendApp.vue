<template>
  <div class="microfrontend-app">
    <Navigation />
    <main class="main-content">
      <router-view />
    </main>
    <OnboardingNotification />
  </div>
</template>

<script setup>
import Navigation from './components/Navigation.vue'
import OnboardingNotification from './components/OnboardingNotification.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.microfrontend-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
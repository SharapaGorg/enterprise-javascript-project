<template>
  <div class="microfrontend-app">
    <Navigation/>
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <div v-if="Component">
          <component :is="Component" :key="route.path"/>
        </div>
        <div v-else class="no-component">
          <h3>No component found for route: {{ route.path }}</h3>
          <p>Route object: {{ JSON.stringify(route, null, 2) }}</p>
        </div>
      </router-view>
    </main>
    <OnboardingNotification/>
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

.debug-info {
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
}

.no-component {
  background: rgba(255, 0, 0, 0.1);
  padding: 20px;
  margin: 20px;
  border-radius: 8px;
  border: 2px solid #ff0000;
  color: #ff0000;
}
</style>
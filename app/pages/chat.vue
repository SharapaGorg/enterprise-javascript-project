<template>
  <div class="chat-page">
    <div class="test-content">
      <h1>🤖 TEST CHAT PAGE WORKS!</h1>
      <p>This is a minimal test version of the chat page.</p>
      <RouterLink to="/" class="btn-home">🏠 На главную</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
console.log('MINIMAL CHAT PAGE - SCRIPT EXECUTING');

// Тестируем useAuth
const { logout } = useAuth();
console.log('useAuth loaded successfully');

// Тестируем useChat
const { chats, currentChatId } = useChat();
console.log('useChat loaded successfully');
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.test-content {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.test-content h1 {
  margin: 0 0 20px 0;
  color: #1a202c;
  font-size: 32px;
}

.test-content p {
  margin: 0 0 30px 0;
  color: #4a5568;
  font-size: 18px;
}

.btn-home {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-home:hover {
  transform: translateY(-2px);
}
</style>
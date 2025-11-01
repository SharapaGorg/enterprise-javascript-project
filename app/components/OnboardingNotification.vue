<template>
  <Transition name="slide-up">
    <div v-if="show" class="onboarding-notification">
      <div class="notification-content">
        <div class="notification-icon">📝</div>
        <div class="notification-text">
          <p class="notification-title">Помогите нам лучше понять вас!</p>
          <p class="notification-message">
            Пройдите онбординг, чтобы получать персонализированные рекомендации книг
          </p>
        </div>
        <div class="notification-actions">
          <NuxtLink to="/profile/onboarding" class="btn-notification">
            Пройти онбординг
          </NuxtLink>
          <button class="btn-close" @click="dismiss">×</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { useOnboarding } from "@/composables/useOnboarding";
import { useSupabaseUser } from "#imports";
import { useRoute } from "vue-router";

const { completed } = useOnboarding();
const user = useSupabaseUser();
const route = useRoute();

const show = ref(false);
let intervalId: ReturnType<typeof setInterval> | null = null;
const KEY_DISMISSED = "onboardingNotificationDismissed";
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 часа

// Проверяем, не находимся ли мы на странице онбординга
const isOnboardingPage = computed(() => route.path === '/profile/onboarding');

function checkAndShow() {
  // Показываем только если:
  // 1. Пользователь авторизован
  // 2. Онбординг не пройден
  // 3. Мы не на странице онбординга
  // 4. Уведомление не было отклонено недавно
  
  if (!user.value) {
    show.value = false;
    return;
  }

  if (completed.value) {
    show.value = false;
    return;
  }

  // Не показываем на странице онбординга
  if (isOnboardingPage.value) {
    show.value = false;
    return;
  }

  // Проверяем, было ли уведомление отклонено
  if (process.client) {
    const dismissed = localStorage.getItem(KEY_DISMISSED);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();
      // Если прошло меньше 24 часов, не показываем
      if (now - dismissedTime < DISMISS_DURATION) {
        show.value = false;
        return;
      }
    }
  }

  show.value = true;
}

function dismiss() {
  show.value = false;
  if (process.client) {
    localStorage.setItem(KEY_DISMISSED, Date.now().toString());
  }
}

onMounted(() => {
  // Показываем сразу при загрузке, если нужно
  checkAndShow();

  // Затем каждую минуту проверяем
  intervalId = setInterval(() => {
    checkAndShow();
  }, 60 * 1000); // 60 секунд = 1 минута
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

// Отслеживаем изменения статуса онбординга и пользователя
watch([() => completed.value, () => user.value, () => route.path], () => {
  checkAndShow();
});
</script>

<style scoped>
.onboarding-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  max-width: 420px;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  border: 2px solid #667eea;
}

.notification-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
}

.notification-title {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
}

.notification-message {
  margin: 0;
  font-size: 14px;
  color: #4a5568;
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.btn-notification {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-notification:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #1a202c;
}

/* Анимации */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .onboarding-notification {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
  }

  .notification-content {
    flex-direction: column;
    gap: 12px;
  }

  .notification-actions {
    width: 100%;
    justify-content: space-between;
  }

  .btn-notification {
    flex: 1;
  }
}
</style>


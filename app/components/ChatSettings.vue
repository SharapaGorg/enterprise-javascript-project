<template>
  <div class="chat-settings">
    <div class="settings-header" @click="toggleSettings">
      <h3>⚙️ Настройки чата</h3>
      <span class="toggle-icon" :class="{ open: isOpen }">▼</span>
    </div>

    <Transition name="slide-down">
      <div v-if="isOpen" class="settings-content">
        <!-- Выбор модели -->
        <div class="setting-group">
          <label class="setting-label">
            🤖 Модель ИИ
            <span class="setting-hint">Выберите модель для генерации ответов</span>
          </label>
          <select v-model="localSettings.model" class="setting-input">
            <option value="deepseek/deepseek-chat">DeepSeek Chat (быстрая, умная)</option>
            <option value="openai/gpt-4o">GPT-4o (самая умная)</option>
            <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo (быстрая)</option>
            <option value="anthropic/claude-3-opus">Claude 3 Opus (аналитическая)</option>
            <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet (сбалансированная)</option>
            <option value="google/gemini-pro">Gemini Pro (универсальная)</option>
          </select>
        </div>

        <!-- Температура -->
        <div class="setting-group">
          <label class="setting-label">
            🌡️ Температура: {{ localSettings.temperature.toFixed(1) }}
            <span class="setting-hint">Выше = креативнее, ниже = точнее (0.0 - 2.0)</span>
          </label>
          <input
            v-model.number="localSettings.temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            class="setting-slider"
          />
          <div class="slider-labels">
            <span>Точность</span>
            <span>Креативность</span>
          </div>
        </div>

        <!-- Максимум токенов -->
        <div class="setting-group">
          <label class="setting-label">
            📏 Максимум токенов: {{ localSettings.maxTokens }}
            <span class="setting-hint">Максимальная длина ответа (100-4000)</span>
          </label>
          <input
            v-model.number="localSettings.maxTokens"
            type="range"
            min="100"
            max="4000"
            step="100"
            class="setting-slider"
          />
          <div class="slider-labels">
            <span>Коротко</span>
            <span>Развернуто</span>
          </div>
        </div>

        <!-- Использовать данные онбординга -->
        <div class="setting-group">
          <label class="setting-checkbox">
            <input
              v-model="localSettings.includeOnboarding"
              type="checkbox"
            />
            <span>📝 Использовать данные онбординга</span>
            <span class="setting-hint">Включать информацию о предпочтениях в чтении из онбординга</span>
          </label>
        </div>

        <!-- Использовать данные профиля -->
        <div class="setting-group">
          <label class="setting-checkbox">
            <input
              v-model="localSettings.includeProfile"
              type="checkbox"
            />
            <span>👤 Использовать данные профиля</span>
            <span class="setting-hint">Включать информацию из профиля (жанры, цели чтения)</span>
          </label>
        </div>

        <!-- Кастомный контекст -->
        <div class="setting-group">
          <label class="setting-label">
            ✏️ Дополнительный контекст
            <span class="setting-hint">Любая дополнительная информация для ИИ (опционально)</span>
          </label>
          <textarea
            v-model="localSettings.customContext"
            class="setting-textarea"
            rows="3"
            placeholder="Например: Предпочитаю короткие рассказы, не люблю длинные описания..."
          ></textarea>
        </div>

        <!-- Кнопки -->
        <div class="settings-actions">
          <button class="btn-reset" @click="handleReset">Сбросить</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ChatSettings } from '@/composables/useChat';

interface Props {
  settings: ChatSettings;
}

interface Emits {
  (e: 'update:settings', value: ChatSettings): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref(false);
const localSettings = ref<ChatSettings>({ ...props.settings });

function toggleSettings() {
  isOpen.value = !isOpen.value;
}

function handleReset() {
  localSettings.value = {
    model: 'deepseek/deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000,
    includeOnboarding: true,
    includeProfile: true,
    customContext: '',
  };
}

// Синхронизация с родительским компонентом
watch(localSettings, (newSettings) => {
  emit('update:settings', { ...newSettings });
}, { deep: true });

// Синхронизация при изменении props
watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings };
}, { deep: true });
</script>

<style scoped>
.chat-settings {
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
}

.settings-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.settings-header:hover {
  background: #edf2f7;
}

.settings-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.toggle-icon {
  transition: transform 0.3s;
  color: #667eea;
  font-size: 12px;
}

.toggle-icon.open {
  transform: rotate(180deg);
}

.settings-content {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group:last-of-type {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.setting-hint {
  display: block;
  font-weight: 400;
  color: #718096;
  font-size: 12px;
  margin-top: 4px;
}

.setting-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.setting-input:focus {
  outline: none;
  border-color: #667eea;
}

.setting-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
  margin: 12px 0;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.setting-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
}

.setting-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.setting-checkbox input[type="checkbox"] {
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.setting-checkbox span:first-of-type {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  flex: 1;
}

.setting-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.setting-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.settings-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn-reset {
  padding: 8px 16px;
  background: #edf2f7;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e2e8f0;
}

/* Анимации */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 1000px;
  opacity: 1;
}
</style>


<template>
  <section class="onboarding-page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-header">Онбординг</h1>
        <NuxtLink to="/profile" class="btn btn--ghost">В профиль</NuxtLink>
      </header>
      <OnboardingProgress :current="current" :total="steps.length" />

      <main class="onboarding-content">
        <div class="qa">
          <label class="qa__q">{{ step.question }}</label>

          <div class="qa__a">
            <template v-if="step.type === 'select'">
              <select
                class="input"
                :value="answers[step.id] ?? ''"
                @change="
                  setAnswer(
                    step.id,
                    ($event.target as HTMLSelectElement).value || null,
                  )
                "
              >
                <option value="" disabled>Выберите вариант…</option>
                <option v-for="opt in step.options" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </template>

            <template v-else-if="step.type === 'bool'">
              <div class="choice-row">
                <button
                  class="btn"
                  :class="{ 'btn--active': answers[step.id] === true }"
                  @click="setAnswer(step.id, true)"
                >
                  Да
                </button>
                <button
                  class="btn"
                  :class="{ 'btn--active': answers[step.id] === false }"
                  @click="setAnswer(step.id, false)"
                >
                  Нет
                </button>
              </div>
            </template>

            <template v-else>
              <textarea
                class="input"
                rows="4"
                :value="(answers[step.id] as string) ?? ''"
                @input="
                  setAnswer(
                    step.id,
                    ($event.target as HTMLTextAreaElement).value,
                  )
                "
              />
            </template>
          </div>
        </div>
      </main>

      <footer class="page__footer">
        <button class="btn btn--ghost" :disabled="current === 0" @click="back">
          Назад
        </button>

        <div class="spacer" />

        <button
          v-if="current < steps.length - 1"
          class="btn"
          :disabled="!canContinue"
          @click="next"
        >
          Далее
        </button>

        <button
          v-else
          class="btn"
          :disabled="!canContinue"
          @click="handleFinish"
        >
          Завершить
        </button>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useOnboarding } from "@/composables/useOnboarding";
import OnboardingProgress from "@/components/OnboardingProgress.vue";
import { navigateTo } from "#app";

const { steps, current, answers, setAnswer, next, back, finish } =
  useOnboarding();
const step = computed(() => steps.value[current.value]);

const canContinue = computed(() => {
  const v = answers.value[step.value.id];
  if (step.value.type === "select") return !!v;
  if (step.value.type === "bool") return typeof v === "boolean";
  return typeof v === "string" && v.trim().length > 0;
});

async function handleFinish() {
  finish();
  await navigateTo("/profile");
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
}
.onboarding-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 36px;
  margin: 0;
}

.onboarding-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.input {
  background: #f7fafc;
  width: 100%;
  outline: none;
  font-weight: 500;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  font-family: inherit;
}

select option:hover {
  cursor: pointer;
  background-color: #667eea;
  color: white;
}

.input:focus {
  outline: none;
  border-color: #667eea;
}

.page__footer {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.spacer {
  flex: 1;
}

.qa__q {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
}

.choice-row {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #667eea;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn--ghost {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}
.btn--active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-style: none;
}
a {
  text-decoration: none;
}
</style>

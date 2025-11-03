import { ref, watch } from "vue";

type Answer = string | string[] | number | boolean | null;
type QA = {
  id: string;
  question: string;
  type?: "text" | "select" | "multi" | "bool";
  options?: string[];
};

export function useOnboarding() {
  const KEY_DONE = "onboardingCompleted";
  const KEY_ANSWERS = "onboardingAnswers";

  const steps = ref<QA[]>([
    {
      id: "languages",
      question: "На каких языках вы обычно читаете?",
      type: "text",
    },
    {
      id: "readingPurpose",
      question: "Зачем вы обычно читаете книги?",
      type: "text",
    },
    {
      id: "bookPreference",
      question: "Какие книги вам приносят больше удовольствия?",
      type: "text",
    },
    {
      id: "favoriteBooks",
      question: "Назовите 2–3 любимые книги и авторов",
      type: "text",
    },
    {
      id: "readingFrequency",
      question: "Как часто вы читаете?",
      type: "text",
    },
  ]);

  const current = ref(0);
  const answers = ref<Record<string, Answer>>({});
  const completed = ref(false);

  // Загрузка из localStorage
  if (process.client) {
    try {
      completed.value = localStorage.getItem(KEY_DONE) === "true";
      const raw = localStorage.getItem(KEY_ANSWERS);
      answers.value = raw ? JSON.parse(raw) : {};
    } catch {}
  }

  function setAnswer(id: string, value: Answer) {
    answers.value = { ...answers.value, [id]: value };
  }

  function next() {
    if (current.value < steps.value.length - 1) current.value++;
  }
  function back() {
    if (current.value > 0) current.value--;
  }

  function finish() {
    completed.value = true;
  }

  // Синхронизация с localStorage
  if (process.client) {
    watch(
      answers,
      (v) => localStorage.setItem(KEY_ANSWERS, JSON.stringify(v)),
      { deep: true },
    );
    watch(completed, (v) => localStorage.setItem(KEY_DONE, String(v)));
  }

  function reset() {
    answers.value = {};
    completed.value = false;
    current.value = 0;
    if (process.client) {
      localStorage.removeItem(KEY_DONE);
      localStorage.removeItem(KEY_ANSWERS);
    }
  }

  return {
    steps,
    current,
    answers,
    completed,
    setAnswer,
    next,
    back,
    finish,
    reset,
  };
}

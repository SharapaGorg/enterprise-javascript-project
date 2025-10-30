<template>
  <div class="ob-progress">
    <div class="ob-progress__bar" :style="{ width: pct + '%' }" />
    <div class="ob-progress__info">Шаг {{ current + 1 }} / {{ total }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ current: number; total: number }>();
const pct = computed(() =>
  Math.round(((props.current + 1) / props.total) * 100),
);
</script>

<style scoped>
.ob-progress {
  position: relative;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin: 12px 0 8px;
  margin-bottom: 30px;
}
.ob-progress__bar {
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  transition: width 0.2s ease;
}
</style>

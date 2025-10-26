<template>
  <button :type="type" :disabled="loading || disabled" :class="buttonClass">
    <span v-if="loading" class="spinner"></span>
    <span v-else><slot /></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  type: 'button',
  variant: 'primary',
});

const buttonClass = computed(() => {
  return [
    'loading-button',
    `loading-button--${props.variant}`,
    { 'loading-button--loading': props.loading },
  ];
});
</script>

<style scoped>
.loading-button {
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  position: relative;
  min-width: 120px;
}

.loading-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.loading-button--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.loading-button--secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.loading-button--secondary:hover:not(:disabled) {
  background: #f7fafc;
}

.loading-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>


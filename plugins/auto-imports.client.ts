// plugins/auto-imports.client.ts
export default defineNuxtPlugin(() => {
  // Принудительная инициализация Nuxt context для single-spa
  if (typeof window !== "undefined" && !window.__NUXT__) {
    window.__NUXT__ = {};
  }
});

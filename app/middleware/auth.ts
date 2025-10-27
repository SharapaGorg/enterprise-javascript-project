export default defineNuxtRouteMiddleware((_to) => {
  const user = useSupabaseUser();

  // Если пользователь не авторизован, редирект на страницу входа
  if (!user.value) {
    return navigateTo('/auth/login');
  }
});


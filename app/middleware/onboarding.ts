export default defineNuxtRouteMiddleware((to) => {
  // Если пользователь на странице онбординга, пропускаем проверку
  if (to.path === '/profile/onboarding') {
    return;
  }

  // Проверяем авторизацию
  const user = useSupabaseUser();
  if (!user.value) {
    return;
  }

  // Проверяем, пройден ли онбординг (только на клиенте)
  if (process.client) {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    
    if (!onboardingCompleted) {
      // Редирект на онбординг, если не пройден
      return navigateTo('/profile/onboarding');
    }
  }
});


export default defineNuxtRouteMiddleware(() => {
  if (process.server) return;
  const auth = useAuth();
  auth.loadOnce();
});

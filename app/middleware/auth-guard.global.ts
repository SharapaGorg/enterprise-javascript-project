export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;

  const auth = useAuth();
  auth.loadOnce();

  const isLoggedIn = !!auth.user.value;
  const isOnboarded = !!auth.onboarded.value;

  // Пути, куда можно без онбординга:
  const publicPaths = new Set<string>(["/", "/login"]);

  // 1) Если не залогинен — пускать только на publicPaths
  if (!isLoggedIn) {
    if (!publicPaths.has(to.path)) {
      return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
    }
    return;
  }

  // 2) Залогинен, но онбординг НЕ пройден:
  if (!isOnboarded) {
    if (to.path !== "/onboarding") {
      return navigateTo("/onboarding");
    }
    return;
  }

  // 3) Залогинен и онбординг пройден — не даём зависнуть на /onboarding
  if (to.path === "/onboarding") {
    return navigateTo("/profile");
  }
});

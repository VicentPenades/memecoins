export default defineNuxtRouteMiddleware((to) => {
  // En desarrollo no exigimos login: el server auto-crea la sesión
  // (ver server/middleware/0.dev-auth.ts). No redirigimos a /login.
  if (import.meta.dev) return;

  const { loggedIn } = useUserSession();

  // Rutas públicas: home, directorio de devs, directorio de coins y páginas de auth.
  const publicPaths = [
    "/",
    "/devs",
    "/coins",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  if (publicPaths.includes(to.path)) return;

  // Subrutas públicas: /devs/<handle>, /devs/<handle>/<slug> y todo lo que cuelgue de /coins.
  if (to.path.startsWith("/devs/")) return;
  if (to.path.startsWith("/coins/")) return;

  if (!loggedIn.value) {
    return navigateTo("/login");
  }
});

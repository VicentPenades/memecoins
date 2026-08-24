export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  // No proteger las rutas de auth, el webhook de Stripe (autenticado por firma)
  // ni nada que no sea una API.
  if (
    path.startsWith("/api/auth/") ||
    path === "/api/general-settings/billing/webhook" ||
    !path.startsWith("/api/")
  ) {
    return;
  }

  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });
  }
});

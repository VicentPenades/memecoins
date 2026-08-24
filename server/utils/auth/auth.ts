import type { H3Event } from "h3";

// Obtiene el user_id de la sesión actual; lanza 401 si no hay sesión.
export const getUserId = async (event: H3Event): Promise<number> => {
  const session = await getUserSession(event);
  const user = session.user as { id: number } | undefined;
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  return user.id;
};

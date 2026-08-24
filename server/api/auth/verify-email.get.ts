import { db } from "~/server/database";
import { users, verificationTokens } from "~/server/database/schema";
import { eq, and, gt } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event);

  if (!token || typeof token !== "string") {
    return sendRedirect(event, "/login?error=invalid-token");
  }

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expiresAt, new Date()),
      ),
    );

  if (!record) {
    return sendRedirect(event, "/login?error=invalid-token");
  }

  // Marcar el usuario como verificado.
  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, record.userId));

  // Eliminar el token ya usado.
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.id, record.id));

  // Obtener los datos del usuario para crear la sesión (auto-login).
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      handle: users.handle,
    })
    .from(users)
    .where(eq(users.id, record.userId));

  if (!user) {
    return sendRedirect(event, "/login?error=invalid-token");
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
    },
  });

  return sendRedirect(event, "/");
});

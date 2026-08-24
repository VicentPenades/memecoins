import { db } from "~/server/database";
import { users, passwordResetTokens } from "~/server/database/schema";
import { eq, and, gt } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const { token, password } = await readBody(event);

  if (!token || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Token and password are required",
    });
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be at least 6 characters long",
    });
  }

  // Buscar un token válido (no expirado).
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    );

  if (!resetToken) {
    throw createError({
      statusCode: 400,
      statusMessage: "The recovery link is invalid or has expired",
    });
  }

  // Hashear la nueva contraseña y actualizar el usuario.
  const passwordHash = await hashPassword(password);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, resetToken.userId));

  // Eliminar todos los tokens de reset del usuario (por seguridad).
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, resetToken.userId));

  return {
    success: true,
    message: "Password updated successfully",
  };
});

import { db } from "~/server/database";
import { users, passwordResetTokens } from "~/server/database/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { sendPasswordResetEmail } from "~/server/utils/auth/email";

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event);

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email is required",
    });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));

  // Por seguridad, siempre respondemos éxito aunque el email no exista,
  // para no revelar qué direcciones están registradas.
  if (!user) {
    return {
      success: true,
      message: "If the email is registered, you'll receive a recovery link.",
    };
  }

  // Generar token de reset (válido 1h).
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  // Enviar email con el enlace de reset.
  const baseUrl = getRequestURL(event).origin;
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    const response = await sendPasswordResetEmail(user.email, resetUrl);
    if (response.error) {
      console.error("Error sending recovery email:", response.error);
      throw createError({
        statusCode: 500,
        statusMessage: "Error sending the recovery email",
      });
    }
  } catch (error: unknown) {
    console.error("Error sending recovery email:", error);
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Error sending the recovery email",
    });
  }

  return {
    success: true,
    message: "If the email is registered, you'll receive a recovery link.",
  };
});

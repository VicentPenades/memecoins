import { db } from "~/server/database";
import { users, verificationTokens } from "~/server/database/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { sendVerificationEmail } from "~/server/utils/auth/email";
import { generateUniqueSlug } from "~/shared/utils/slug";

export default defineEventHandler(async (event) => {
  const { email, password, name } = await readBody(event);

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }

  // Comprobar si ya existe una cuenta con ese email.
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: "An account with that email already exists",
    });
  }

  // Hashear la contraseña.
  const passwordHash = await hashPassword(password);

  // Handle público (/devs/<handle>): se deriva del nombre o del local del email.
  const handle = await generateUniqueSlug(
    name || email.split("@")[0],
    async (candidate) => {
      const [row] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.handle, candidate))
        .limit(1);
      return Boolean(row);
    },
  );

  // Insertar el nuevo usuario (sin verificar).
  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name || null,
      handle,
      emailVerified: false,
    })
    .returning({ id: users.id, email: users.email, name: users.name });

  if (!user) {
    throw createError({ statusCode: 500, statusMessage: "Could not create account" });
  }

  // Generar token de verificación (válido 24h).
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Insertar token de verificación y suscripción free en una transacción para evitar
  // usuarios a medias si alguno de los inserts falla.
  await db.transaction(async (tx) => {
    await tx.insert(verificationTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

  });

  // Enviar email con el magic link de verificación.
  const baseUrl = getRequestURL(event).origin;
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  const response = await sendVerificationEmail(user.email, verifyUrl);

  if (response.error) {
    console.error("Error sending verification email:", response.error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error sending verification email",
    });
  }

  return {
    pending: true,
    message: "We've sent you a verification email. Check your inbox.",
  };
});

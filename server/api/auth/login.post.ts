import { db } from "~/server/database";
import { users } from "~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  if (!user.emailVerified) {
    throw createError({
      statusCode: 403,
      statusMessage: "Please verify your email before signing in. Check your inbox.",
    });
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  // Creamos la sesión para el usuario autenticado.
  await setUserSession(event, {
    user: { id: user.id, email: user.email, name: user.name, handle: user.handle },
  });

  // Aplicamos el idioma preferido del usuario a la cookie i18n para que la UI
  // cargue en su idioma tras iniciar sesión.
  setCookie(event, "i18n_locale", user.language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { user: { id: user.id, email: user.email, name: user.name, handle: user.handle } };
});

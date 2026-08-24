import { eq } from "drizzle-orm";
import { db } from "~/server/database";
import { users } from "~/server/database/schema";

// Email del usuario de desarrollo. Determinista para reutilizar la misma fila
// entre reinicios (la FK de coins.userId necesita un usuario real en la BD).
const DEV_EMAIL = "dev@local.test";

// Auto-login SOLO en desarrollo: evita tener que hacer login a mano. En un build
// de producción `import.meta.dev` es false en tiempo de compilación, así que este
// middleware desaparece del bundle. Se ejecuta antes que `auth.ts` (prefijo "0.").
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) return;

  const session = await getUserSession(event);
  if (session.user) return;

  // Busca o crea el usuario de desarrollo.
  let [devUser] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      handle: users.handle,
    })
    .from(users)
    .where(eq(users.email, DEV_EMAIL));

  if (!devUser) {
    [devUser] = await db
      .insert(users)
      .values({
        email: DEV_EMAIL,
        passwordHash: "dev-autologin-no-password",
        name: "Dev User",
        handle: "dev-user",
        emailVerified: true,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        handle: users.handle,
      });
  }

  if (devUser) {
    await setUserSession(event, { user: devUser });
  }
});

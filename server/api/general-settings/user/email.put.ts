import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { db } from "~/server/database";
import { users } from "~/server/database/schema";
import { getUserId } from "~/server/utils/auth/auth";

const bodySchema = z.object({
  email: z.string().email(),
  currentPassword: z.string().min(1),
});

// PUT /api/user/email — cambia el email pidiendo la contraseña actual
export default defineEventHandler(async (event) => {
  try {
    const userId = await getUserId(event);
    const body = bodySchema.parse(await readBody(event));
    const email = body.email.toLowerCase().trim();

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // La contraseña actual debe ser correcta para cambiar el email
    const valid = await verifyPassword(user.passwordHash, body.currentPassword);
    if (!valid) {
      throw createError({ statusCode: 401, statusMessage: "Wrong password" });
    }

    // El email no puede estar en uso por otra cuenta
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, userId)));
    if (taken) {
      throw createError({ statusCode: 409, statusMessage: "Email already in use" });
    }

    const [updated] = await db
      .update(users)
      .set({ email })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        handle: users.handle,
      });

    if (!updated) {
      throw createError({ statusCode: 500, statusMessage: "Could not update email" });
    }

    // Refrescamos la sesión con el email nuevo
    await setUserSession(event, { user: updated });

    return updated;
  } catch (error: unknown) {
    console.error("Error updating email:", error);
    if (error instanceof z.ZodError) {
      throw createError({ statusCode: 400, statusMessage: "Invalid data" });
    }
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  }
});

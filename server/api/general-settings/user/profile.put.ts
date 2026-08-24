import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "~/server/database";
import { users } from "~/server/database/schema";
import { getUserId } from "~/server/utils/auth/auth";

const bodySchema = z.object({
  name: z.string().trim().max(120).nullable().optional(),
  language: z.enum(["es", "en"]).optional(),
});

// PUT /api/user/profile — actualiza nombre e idioma del usuario autenticado
export default defineEventHandler(async (event) => {
  try {
    const userId = await getUserId(event);
    const body = bodySchema.parse(await readBody(event));

    // Solo escribimos los campos presentes en el body
    const values: Partial<{ name: string | null; language: string }> = {};
    if (body.name !== undefined) values.name = body.name || null;
    if (body.language !== undefined) values.language = body.language;

    const [updated] = await db
      .update(users)
      .set(values)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        handle: users.handle,
      });

    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Refrescamos la sesión para que el header refleje el nombre nuevo
    await setUserSession(event, { user: updated });

    return updated;
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    if (error instanceof z.ZodError) {
      throw createError({ statusCode: 400, statusMessage: "Invalid data" });
    }
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  }
});

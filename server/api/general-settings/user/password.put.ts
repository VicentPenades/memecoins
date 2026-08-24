import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "~/server/database";
import { users } from "~/server/database/schema";
import { getUserId } from "~/server/utils/auth/auth";

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

// PUT /api/user/password — cambia la contraseña verificando la actual
export default defineEventHandler(async (event) => {
  try {
    const userId = await getUserId(event);
    const body = bodySchema.parse(await readBody(event));

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    const valid = await verifyPassword(user.passwordHash, body.currentPassword);
    if (!valid) {
      throw createError({ statusCode: 401, statusMessage: "Wrong password" });
    }

    const passwordHash = await hashPassword(body.newPassword);
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating password:", error);
    if (error instanceof z.ZodError) {
      throw createError({ statusCode: 400, statusMessage: "Invalid data" });
    }
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  }
});

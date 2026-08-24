import type { UserRaw } from "~/server/database/schema";

// Usuario público (lo que devuelven los endpoints y guarda la sesión)
export type PublicUser = Pick<UserRaw, "id" | "email" | "name" | "handle">;

// Idiomas soportados (códigos i18n)
export type Locale = "es" | "en";

// Cuerpos de las peticiones de cuenta (type, no interface: así son asignables a
// Record<string, unknown> que espera la clase base Repository)
export type UpdateProfileBody = {
  name?: string | null;
  language?: Locale;
};

export type UpdateEmailBody = {
  email: string;
  currentPassword: string;
};

export type UpdatePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

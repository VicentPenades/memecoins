import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  handle: text("handle").unique(), // identificador público en /devs/<handle>; la API lo genera
  // Idioma preferido del usuario (código i18n: "es" | "en"). Se aplica al login.
  language: text("language").default("en").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  // Valoración pública del dev: contadores de like/dislike.
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tokens de verificación de email (alta de cuenta). Válidos 24h.
export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tokens de recuperación de contraseña. Válidos 1h.
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserRaw = InferSelectModel<typeof users>;
export type NewUserRaw = InferInsertModel<typeof users>;

export type VerificationTokenRaw = InferSelectModel<typeof verificationTokens>;
export type NewVerificationTokenRaw = InferInsertModel<
  typeof verificationTokens
>;

export type PasswordResetTokenRaw = InferSelectModel<
  typeof passwordResetTokens
>;
export type NewPasswordResetTokenRaw = InferInsertModel<
  typeof passwordResetTokens
>;

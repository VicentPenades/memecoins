# Base de datos — Drizzle + PostgreSQL

**Drizzle ORM** es _type-safe_ y centrado en TypeScript. El **schema es la fuente de verdad**:
de él parten todos los tipos, tanto del server como del frontend. Nunca se redefine a mano un
tipo que ya existe en el schema.

> Para la visión general de capas ver [`index.md`](./index.md); para la capa de endpoints que
> consume estos modelos ver [`api.md`](./api.md).

---

## Estructura

```
server/database/
  index.ts                        # Conexión; exporta `db`
  schema/
    index.ts                      # Barrel: reexporta todos los schemas
    {raíz}/{modulo}/index.ts      # Tabla Drizzle + tipos `{Entity}Raw`
  migrations/                     # Migraciones SQL generadas por db:generate
```

El schema se agrupa en las mismas tres raíces de dominio que el resto del server (según su grado
de reutilización): `auth/` (autenticación → `users`), `general-settings/` (usuario, billing,
brands → `brands`, `subscriptions`) y `v0/` (dominio específico del proyecto → `accounts`,
`keywords`, `opportunities`, `reply-history`, `brand-reply-settings`).

Cada tabla vive en su propio módulo dentro de su raíz (`schema/v0/keywords/index.ts`,
`schema/v0/opportunities/index.ts`…) y se registra en el barrel `schema/index.ts`, que reexporta
con la raíz incluida:

```ts
// server/database/schema/index.ts
export * from "./auth/users";
export * from "./general-settings/brands";
export * from "./general-settings/subscriptions";
export * from "./v0/keywords";
export * from "./v0/accounts";
export * from "./v0/opportunities";
```

---

## Reglas de schema

- **Tablas**: `snake_case` en plural (`keywords`, `opportunities`, `subscriptions`).
- **FKs**: `{tabla}_id` (`brand_id`, `user_id`). `.references(() => tabla.id, { onDelete })`.
- **Cascade**: `onDelete: "cascade"` en dependientes; `"set null"` en relaciones opcionales.
- **Timestamps**: `created_at` / `updated_at` con `.defaultNow().notNull()`.
- **Booleanas**: `.default(...).notNull()`.
- **Enums**: se definen con `pgEnum`; el tipo se deriva de `enumValues` (no se reescribe a mano).
- **Tipos inferidos**: exporta SIEMPRE `{Entity}Raw` y `New{Entity}Raw`.

```ts
// server/database/schema/v0/keywords/index.ts
import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
// Import entre schemas de distinta raíz → absoluto con `~/`
import { brands } from "~/server/database/schema/general-settings/brands";

// Keywords a monitorizar en X para detectar oportunidades de reply
export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  term: text("term").notNull(),
  category: text("category"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type KeywordRaw = InferSelectModel<typeof keywords>;
export type NewKeywordRaw = InferInsertModel<typeof keywords>;
```

### Enums y su tipo derivado

El enum se define con `pgEnum` y el tipo de dominio se saca de `enumValues`, para que schema y
tipo nunca se desincronicen:

```ts
// server/database/schema/general-settings/subscriptions/index.ts
export const planEnum = pgEnum("plan", ["free", "pro"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
]);

export type Plan = (typeof planEnum.enumValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];
```

### `set null` e índices únicos

Las relaciones opcionales usan `onDelete: "set null"` (el registro sobrevive al borrado del
padre) y las restricciones de unicidad compuesta se declaran en el segundo argumento de
`pgTable`:

```ts
// server/database/schema/v0/opportunities/index.ts (fragmento)
keywordId: integer("keyword_id").references(() => keywords.id, { onDelete: "set null" }),
accountId: integer("account_id").references(() => accounts.id, { onDelete: "set null" }),
// …
}, // segundo argumento de pgTable:
// Un tweet puede ser oportunidad para varias marcas, pero no duplicarse dentro de la misma marca.
(table) => [uniqueIndex("opportunities_brand_tweet_unique").on(table.brandId, table.tweetId)],
```

---

## Tipos de front a partir del schema

El frontend **nunca** redefine los tipos: los deriva del `{Entity}Raw` con `Omit`/`Pick`/`Partial`.

```ts
import type { KeywordRaw, NewKeywordRaw } from "~/server/database/schema/v0/keywords";

export type Keyword = KeywordRaw;
// El cliente no envía columnas gestionadas por el server/BD
export type NewKeyword = Omit<NewKeywordRaw, "id" | "createdAt" | "updatedAt">;
```

---

## Flujo de trabajo

```
1. Modificas schema/{raíz}/{modulo}/index.ts
2. npm run db:generate   # genera la migración SQL en migrations/
3. npm run db:push       # sincroniza el schema con la BD
4. Usas el modelo type-safe en el código
```

Nunca modifiques la BD a mano: usa migraciones. `npm run db:studio` para inspeccionar.

---

## Convenciones transversales

| Regla            | Detalle                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| Tablas           | `snake_case` plural                                                              |
| FKs              | `{tabla}_id` con `.references(...)`; `cascade` en dependientes, `set null` opcional |
| Timestamps       | `created_at` / `updated_at` con `.defaultNow().notNull()`                        |
| Enums            | `pgEnum` + tipo derivado de `enumValues` (no reescribir a mano)                  |
| Tipos inferidos  | Exportar siempre `{Entity}Raw` y `New{Entity}Raw`                                |
| Barrel           | Registrar cada schema en `schema/index.ts` (`export * from "./{raíz}/{modulo}"`) |
| Tipos de front   | Derivar del `{Entity}Raw` con `Omit`/`Pick`/`Partial`; nunca redefinir           |
| Migraciones      | `db:generate` + `db:push`; nunca tocar la BD a mano                              |

# Base de datos (Drizzle + PostgreSQL)

El schema es la **fuente de verdad**: los tipos de front parten de él.

## Reglas de schema

- Tablas: **snake_case en plural** (`tasks`, `users`, `habit_records`).
- FKs: `[tabla]_id` (`user_id`, `group_id`). Timestamps `created_at` / `updated_at` con
  `.defaultNow().notNull()`.
- Cascade: `onDelete: "cascade"` en dependientes; `"set null"` en relaciones opcionales.
- Enums: define con `pgEnum`; columnas booleanas con `.default(...).notNull()`.
- Exporta SIEMPRE los tipos inferidos como `[Entity]Raw` y `New[Entity]Raw`.
- Los schemas se agrupan por raíz de reutilización: `schema/{raíz}/{modulo}/index.ts` con
  `{raíz}` ∈ `auth` (users) · `general-settings` (brands, subscriptions) · `v0` (accounts,
  keywords, opportunities, reply-history, brand-reply-settings). Ver `backend.md`.
- Registra cada schema nuevo en el barrel `server/database/schema/index.ts`
  (`export * from "./{raíz}/{modulo}"`).
- **Los imports entre schemas de distinta raíz son absolutos `~/`**, no relativos.

```ts
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
// cruce de raíz → import absoluto (users vive en auth/)
import { users } from "~/server/database/schema/auth/users";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TaskRaw = InferSelectModel<typeof tasks>;
export type NewTaskRaw = InferInsertModel<typeof tasks>;
```

## Tipos de front a partir del schema

```ts
// desde la raíz que corresponda: auth/ · general-settings/ · v0/
import type { TaskRaw, NewTaskRaw } from "~/server/database/schema/v0/tasks";

export type Task = TaskRaw;
export type NewTask = Omit<NewTaskRaw, "userId" | "id" | "createdAt" | "updatedAt">;
```

## Flujo de trabajo

```
1. Modificas schema/{raíz}/[modulo]/index.ts
2. npm run db:generate   # genera migración SQL
3. npm run db:push       # sincroniza con la BD
4. Usas el modelo type-safe en el código
```

Nunca modifiques la BD a mano: usa migraciones. `npm run db:studio` para inspeccionar.

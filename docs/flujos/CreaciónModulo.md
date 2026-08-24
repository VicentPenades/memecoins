# Creación de un nuevo módulo

Guía paso a paso para crear un módulo completo (front + back + base de datos).

Sustituye `[modulo]` por el nombre del módulo en minúsculas (p. ej. `tareas`) y `[Modulo]` por la versión en PascalCase (p. ej. `Tareas`).

> **Paso 0 — Decide la raíz de reutilización.** El código de dominio del server se organiza en
> tres raíces según su reutilización, aplicadas **en paralelo** a `api/`, `database/schema/`,
> `services/`, `constants/` y `utils/`. Antes de crear nada, decide bajo qué raíz `[raíz]` vive tu módulo:
>
> - `auth/` — autenticación (p. ej. schema `users`).
> - `general-settings/` — usuario, facturación (billing), marcas (brands) (schema `brands`, `subscriptions`).
> - `v0/` — dominio específico del proyecto (opportunities, radar, reply-history…).
>
> En el resto de la guía, sustituye `[raíz]` por la raíz elegida (`auth`, `general-settings` o `v0`).

---

## 1. Base de datos — Schema

Crea el archivo `server/database/schema/[raíz]/[modulo]/index.ts`:

```ts
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
// cruce de raíz → import absoluto (users vive en auth/)
import { users } from "~/server/database/schema/auth/users";

export const [modulo] = pgTable("[modulo]", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // ... campos del módulo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type [Modulo]Raw = InferSelectModel<typeof [modulo]>;
export type New[Modulo]Raw = InferInsertModel<typeof [modulo]>;
```

Exporta el schema en `server/database/schema/index.ts`:

```ts
export * from "./[raíz]/[modulo]";
```

Genera y aplica la migración:

```bash
npm run db:generate
npm run db:migrate
```

---

## 2. Backend — API

### `server/api/[raíz]/[modulo]/mappers.ts`

```ts
import type { [Modulo]Raw } from "~/server/database/schema/[raíz]/[modulo]";
import type { [Modulo] } from "~/app/pages/(modules)/[modulo]/types/[modulo].types";

export const map[Modulo]ToRaw = (item: [Modulo]): [Modulo]Raw => ({
  ...item,
  // transformaciones de tipo si hacen falta (p. ej. string → Date)
});

export const mapRawTo[Modulo] = (raw: [Modulo]Raw): [Modulo] => ({
  ...raw,
});

export const mapRawArrayTo[Modulo]Array = (raws: [Modulo]Raw[]): [Modulo][] =>
  raws.map(mapRawTo[Modulo]);
```

### `server/api/[raíz]/[modulo]/index.ts` (GET + POST)

```ts
import { db } from "~/server/database";
import { [modulo] } from "~/server/database/schema";
import { eq } from "drizzle-orm";
import { map[Modulo]ToRaw, mapRawTo[Modulo], mapRawArrayTo[Modulo]Array } from "./mappers";
import { getUserId } from "~/server/utils/auth/auth";

export default defineEventHandler(async (event) => {
  try {
    const method = event.method || event.node.req.method;
    const userId = await getUserId(event);

    if (method === "GET") {
      const all = await db.select().from([modulo]).where(eq([modulo].userId, userId));
      return mapRawArrayTo[Modulo]Array(all);
    }

    if (method === "POST") {
      const body = await readBody(event);
      const data = map[Modulo]ToRaw(body);
      const [created] = await db.insert([modulo]).values({ ...data, userId }).returning();
      if (!created) throw createError({ statusCode: 500, statusMessage: "Error al crear" });
      return mapRawTo[Modulo](created);
    }

    throw createError({ statusCode: 405, statusMessage: `Método ${method} no permitido` });
  } catch (error: any) {
    console.error("Error en API de [modulo]:", error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Error interno" });
  }
});
```

### `server/api/[raíz]/[modulo]/[id].ts` (GET by id + PUT + DELETE)

```ts
import { db } from "~/server/database";
import { [modulo] } from "~/server/database/schema";
import { eq, and } from "drizzle-orm";
import { map[Modulo]ToRaw, mapRawTo[Modulo] } from "./mappers";
import { getUserId } from "~/server/utils/auth/auth";

export default defineEventHandler(async (event) => {
  try {
    const method = event.method || event.node.req.method;
    const userId = await getUserId(event);
    const id = Number(getRouterParam(event, "id"));

    const ownerCondition = and(eq([modulo].id, id), eq([modulo].userId, userId));

    if (method === "GET") {
      const [item] = await db.select().from([modulo]).where(ownerCondition);
      if (!item) throw createError({ statusCode: 404, statusMessage: "No encontrado" });
      return mapRawTo[Modulo](item);
    }

    if (method === "PUT") {
      const body = await readBody(event);
      const data = map[Modulo]ToRaw(body);
      const [updated] = await db.update([modulo]).set(data).where(ownerCondition).returning();
      if (!updated) throw createError({ statusCode: 404, statusMessage: "No encontrado" });
      return mapRawTo[Modulo](updated);
    }

    if (method === "DELETE") {
      await db.delete([modulo]).where(ownerCondition);
      return { success: true };
    }

    throw createError({ statusCode: 405, statusMessage: `Método ${method} no permitido` });
  } catch (error: any) {
    console.error("Error en API de [modulo]:", error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Error interno" });
  }
});
```

---

## 3. Frontend — Tipos

Crea `app/pages/(modules)/[modulo]/types/[modulo].types.ts`:

```ts
import type { [Modulo]Raw, New[Modulo]Raw } from "~/server/database/schema/[raíz]/[modulo]";

export type [Modulo] = [Modulo]Raw;
export type New[Modulo] = Omit<New[Modulo]Raw, "userId">;
```

---

## 4. Frontend — Repository

Crea `app/pages/(modules)/[modulo]/repositories/[modulo].repository.ts`:

```ts
import { Repository } from "~/app/utils/repository";
import type { [Modulo], New[Modulo] } from "../types/[modulo].types";

class [Modulo]Repository extends Repository {
  async getAll() {
    return this.httpGet<[Modulo][]>("/api/[raíz]/[modulo]");
  }
  async create(body: New[Modulo]) {
    return this.httpPost<[Modulo]>("/api/[raíz]/[modulo]", body);
  }
  async update(id: number, body: Partial<[Modulo]>) {
    return this.httpPut<[Modulo]>(`/api/[raíz]/[modulo]/${id}`, body);
  }
  async delete(id: number) {
    return this.httpDelete(`/api/[raíz]/[modulo]/${id}`);
  }
}

export const [modulo]Repository = new [Modulo]Repository();
```

---

## 5. Frontend — Composable (Service)

Crea `app/pages/(modules)/[modulo]/composables/use[Modulo]Service.ts`:

```ts
import type { [Modulo], New[Modulo] } from "../types/[modulo].types";
import { [modulo]Repository } from "../repositories/[modulo].repository";

export const use[Modulo]Service = () => {
  const items = useState<[Modulo][]>("[modulo]", () => []);
  const loading = useState<boolean>("[modulo]-loading", () => false);
  const openModal = useState<boolean>("[modulo]-open-modal", () => false);
  const selected = useState<[Modulo] | null>("[modulo]-selected", () => null);

  const fetchItems = async () => {
    loading.value = true;
    try {
      items.value = await [modulo]Repository.getAll();
    } catch (err) {
      console.error("Error cargando [modulo]:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createItem = async (data: New[Modulo]) => {
    try {
      const created = await [modulo]Repository.create(data);
      items.value.push(created);
      return created;
    } catch (err) {
      console.error("Error creando [modulo]:", err);
      throw err;
    }
  };

  const updateItem = async (id: number, changes: Partial<[Modulo]>) => {
    try {
      const updated = await [modulo]Repository.update(id, changes);
      const index = items.value.findIndex((i) => i.id === id);
      if (index !== -1) items.value[index] = updated;
      return updated;
    } catch (err) {
      console.error("Error actualizando [modulo]:", err);
      throw err;
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await [modulo]Repository.delete(id);
      items.value = items.value.filter((i) => i.id !== id);
    } catch (err) {
      console.error("Error eliminando [modulo]:", err);
      throw err;
    }
  };

  return {
    items: readonly(items),
    loading: readonly(loading),
    openModal,
    selected,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
};
```

---

## 6. Frontend — Componentes

### Modal (`components/modals/Modal[Modulo].vue`)

Formulario de creación/edición. Recibe el ítem seleccionado como prop y emite `save` y `close`.

### Tabs (`components/tabs/[nombre-tab]/[Modulo][Tab].vue`)

Un componente por cada tab del módulo. Consumen el service a través del composable.

---

## 7. Frontend — Página principal (`index.vue`)

```vue
<script setup lang="ts">
const { items, loading, openModal, selected, fetchItems, createItem, deleteItem } =
  use[Modulo]Service();

onMounted(fetchItems);

const onCreate = async (data: New[Modulo]) => {
  await createItem(data);
  openModal.value = false;
};

const onDelete = async (id: number) => {
  await deleteItem(id);
};
</script>
```

---

## Checklist de creación

- [ ] Schema Drizzle creado y exportado
- [ ] Migración generada y aplicada (`db:generate` + `db:migrate`)
- [ ] Endpoints `index.ts` y `[id].ts` con autenticación
- [ ] `mappers.ts` con transformaciones front ↔ DB
- [ ] Tipos en `[modulo].types.ts` partiendo del schema
- [ ] Repository extendiendo `Repository` base
- [ ] Composable con estado, computadas y servicios
- [ ] Componente modal para crear/editar
- [ ] Componentes de tabs
- [ ] `index.vue` con handlers prefijados con `on`

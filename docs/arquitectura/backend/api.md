# API REST — Capa de endpoints

Los endpoints son la puerta de entrada del backend. Reciben la petición HTTP, **autentican**,
**validan**, **controlan acceso** y orquestan: o bien acceden a la BD directamente (CRUD simple),
o bien delegan en un `service` de dominio. La lógica pesada nunca vive en el handler.

> Para la visión general de capas ver [`index.md`](./index.md); para integraciones externas ver
> [`servicios-externos.md`](./servicios-externos.md).

---

## Estructura de un módulo de API

```
server/api/{raíz}/{modulo}/
  index.ts        # GET (listado) + POST (crear)
  [id].ts         # GET by id + PUT (actualizar) + DELETE (eliminar)
  mappers.ts      # Transformación DB ↔ API (opcional; ver más abajo)
```

Los sub-recursos anidados usan carpetas: `server/api/v0/opportunities/[id]/reply.ts` →
`POST /api/v0/opportunities/:id/reply`.

### Convención de rutas

| Fichero          | Método + ruta                    | Uso                     |
| ---------------- | -------------------------------- | ----------------------- |
| `index.ts`       | `GET /api/{raíz}/{modulo}`       | Listado                 |
| `index.ts`       | `POST /api/{raíz}/{modulo}`      | Crear                   |
| `[id].ts`        | `GET /api/{raíz}/{modulo}/:id`   | Obtener uno             |
| `[id].ts`        | `PUT /api/{raíz}/{modulo}/:id`   | Actualizar              |
| `[id].ts`        | `DELETE /api/{raíz}/{modulo}/:id`| Eliminar                |

Los datos entran por **body** (crear/actualizar), **path params** (`:id`) o **query params**
(filtros como `?brandId=`).

---

## Anatomía de un handler

Un fichero con varios métodos hace **switch por `event.method`** y responde `405` a lo no
soportado. El patrón fijo: `try` → autenticar → validar → operar; `catch (error: unknown)` que
re-lanza los errores ya tipados y convierte el resto en `500`.

```ts
// server/api/v0/radar/keywords/index.ts
import { desc, eq } from "drizzle-orm";
import { db } from "~/server/database";
import { keywords } from "~/server/database/schema";
import { assertBrandOwnership, parseBrandId } from "~/server/utils/general-settings/brand-ownership";
import { assertCanCreateKeyword } from "~/server/utils/general-settings/plan-limits";

// GET  /api/v0/radar/keywords?brandId=  → listado de la marca
// POST /api/v0/radar/keywords           → crear keyword en la marca
export default defineEventHandler(async (event) => {
  try {
    const method = event.method;

    if (method === "GET") {
      const brandId = parseBrandId(getQuery(event).brandId);
      await assertBrandOwnership(event, brandId);
      return await db
        .select()
        .from(keywords)
        .where(eq(keywords.brandId, brandId))
        .orderBy(desc(keywords.createdAt));
    }

    if (method === "POST") {
      const body = await readBody(event);
      const brandId = parseBrandId(body?.brandId);
      const userId = await assertBrandOwnership(event, brandId);
      await assertCanCreateKeyword(userId, brandId);
      const term = typeof body?.term === "string" ? body.term.trim() : "";
      if (!term) {
        throw createError({ statusCode: 400, statusMessage: "term requerido" });
      }
      const [created] = await db
        .insert(keywords)
        .values({ brandId, term, category: body.category ?? null, active: body.active ?? true })
        .returning();
      return created;
    }

    throw createError({ statusCode: 405, statusMessage: `Método ${method} no permitido` });
  } catch (error: unknown) {
    console.error("Error en API de keywords:", error);
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError({ statusCode: 500, statusMessage: "Error interno" });
  }
});
```

---

## Autenticación y control de acceso

Se autentica **al inicio** de cada handler y se filtra **siempre** por propiedad del recurso.
Nunca se devuelven datos de otro usuario. `getUserId` vive en `server/utils/auth/auth.ts`;
`parseBrandId` y `assertBrandOwnership` viven en `server/utils/general-settings/brand-ownership.ts`:

- `getUserId(event)` → id de la sesión, o `401` si no hay sesión.
- `parseBrandId(value)` → valida que el id (query/body) es numérico, o `400`.
- `assertBrandOwnership(event, brandId)` → verifica que la marca es del usuario (o `404` sin
  revelar su existencia) y devuelve el `userId`.

En `[id].ts` primero se **carga el registro** para conocer su marca y luego se verifica propiedad:

```ts
// server/api/v0/radar/keywords/[id].ts
const id = Number(getRouterParam(event, "id"));
if (!Number.isFinite(id)) {
  throw createError({ statusCode: 400, statusMessage: "id inválido" });
}

// Cargamos el registro para conocer su marca y verificar propiedad.
const [existing] = await db.select().from(keywords).where(eq(keywords.id, id));
if (!existing) {
  throw createError({ statusCode: 404, statusMessage: "No encontrado" });
}
await assertBrandOwnership(event, existing.brandId);
```

---

## Validación de inputs

Se valida todo lo que llega del cliente antes de tocar la BD, lanzando errores controlados:

- Path/query params: `Number(...)` + `Number.isFinite`/`Number.isInteger`.
- Campos de body: comprobar tipo y normalizar (`typeof body?.term === "string" ? body.term.trim() : ""`).
- Actualizaciones parciales en `PUT`: solo se aplican los campos presentes:

```ts
const [updated] = await db
  .update(keywords)
  .set({
    ...(body.term !== undefined ? { term: String(body.term).trim() } : {}),
    ...(body.category !== undefined ? { category: body.category } : {}),
    ...(body.active !== undefined ? { active: body.active } : {}),
    updatedAt: new Date(),
  })
  .where(eq(keywords.id, id))
  .returning();
return updated;
```

---

## Manejo de errores

- Errores de negocio/validación → `createError({ statusCode, statusMessage })` con el código
  adecuado (`400` input inválido, `401` sin sesión, `404` no encontrado, `405` método,
  `500` interno).
- El `catch` tipa `error: unknown` (**nunca `any`**), hace `console.error` y:
  - **re-lanza** si el error ya trae `statusCode` (es un `createError` intencionado),
  - si no, lo envuelve en un `500` genérico.

```ts
} catch (error: unknown) {
  console.error("Error en API de keywords:", error);
  if (error && typeof error === "object" && "statusCode" in error) throw error;
  throw createError({ statusCode: 500, statusMessage: "Error interno" });
}
```

---

## Mappers (opcional)

Cuando la forma de la BD y la de la API divergen (o hay que ocultar campos), se añade
`server/api/{raíz}/{modulo}/mappers.ts` con una función pura por dirección — **DB → Front** (`mapRawToX`)
y **Front → DB** (`mapXToRaw`). Solo transforman tipos o desacoplan la forma; **sin lógica de
negocio**. Los endpoints CRUD simples (como `keywords`) pueden devolver el row de Drizzle directo
y no necesitan mapper.

```ts
export const mapRawToKeyword = (raw: KeywordRaw): Keyword => ({ ...raw });
export const mapKeywordToRaw = (keyword: NewKeyword): NewKeywordRaw => ({ ...keyword });
```

---

## Llamar a servicios de dominio

Cuando el endpoint necesita negocio reutilizable o una integración externa, importa el `service`
directamente (nunca su repository/mapper) y orquesta. El endpoint sigue siendo fino:

```ts
// server/api/v0/opportunities/[id]/reply.ts
import { aiService } from "~/server/services/v0/ai/services/ai.service";

// … tras cargar la oportunidad y verificar propiedad:
const reply = await aiService.generateReply({
  content: opportunity.content,
  authorHandle: opportunity.authorHandle,
});
return { reply, source: aiService.getSource() };
```

---

## Convenciones transversales

| Regla             | Detalle                                                                              |
| ----------------- | ------------------------------------------------------------------------------------ |
| Método            | Switch por `event.method`; `405` para lo no soportado                                |
| Auth primero      | `getUserId` / `assertBrandOwnership` al inicio; filtrar siempre por propiedad         |
| Validación        | Validar path/query/body antes de tocar la BD; `createError` con el código adecuado    |
| Errores           | `try/catch` con `error: unknown`; re-lanzar si trae `statusCode`, si no `500`         |
| Sin `any`         | TS estricto; comprobar `"statusCode" in error` en el catch                            |
| Acceso a datos    | `db` de `~/server/database`; nunca devolver datos de otro usuario                     |
| Servicios         | Importar el `service` (nunca repository/mapper); el endpoint solo orquesta            |
| Mappers           | Opcionales; función pura por dirección, sin negocio                                   |
| Rutas             | kebab-case; `index.ts` (GET+POST), `[id].ts` (GET/PUT/DELETE)                         |

---

## Flujo completo (resumen)

```
Petición HTTP (body / :id / query)
   ▼
defineEventHandler
   │  switch(event.method) → 405 si no soportado
   │  autentica (getUserId) · valida input · controla acceso (assertBrandOwnership)
   ├──────────────► BD directa (Drizzle `db`)     ─► CRUD simple, devuelve row (o mapper)
   └──────────────► Service de dominio            ─► negocio / API externa
   ▼
return JSON  (createError en fallo → catch: re-lanza statusCode | 500)
```

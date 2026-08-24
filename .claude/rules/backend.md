# Backend (Nuxt server + Drizzle)

Toda la lógica crítica (negocio, seguridad, acceso a datos, validación) vive en el server.

## Estructura y agrupación (`auth` / `general-settings` / `v0`)

El código de dominio del server se organiza en **tres raíces** según su reutilización entre
proyectos. La **misma agrupación se aplica en paralelo** en `api/`, `database/schema/`,
`services/`, `constants/` y `utils/`:

- **`auth/`** — autenticación reutilizable (login, sesión, registro, verify-email, reset).
- **`general-settings/`** — config de cuenta reutilizable: `user`, `billing`, `brands`.
- **`v0/`** — dominio específico de este proyecto, versionado: `opportunities`,
  `radar` (accounts/keywords/reply-settings/scan), `reply-history`.

```
server/
├── api/{raíz}/{modulo}/     # index.ts (GET+POST), [id].ts (GET/PUT/DELETE), mappers.ts (si hace falta)
├── database/
│   ├── index.ts             # conexión (exporta `db`)
│   └── schema/{raíz}/{modulo}/index.ts   # tabla + tipos; registrar en schema/index.ts (barrel)
├── services/{raíz}/{name}/  # lógica de dominio / integraciones (repository→service→mappers)
├── utils/{raíz}/            # helpers (auth/auth.ts, general-settings/brand-ownership.ts, v0/scoring.ts…)
└── constants/{raíz}/        # constantes de dominio
```

Cada **módulo** es una funcionalidad encapsulada con sus propios endpoints, mappers y helpers.
Al crear uno nuevo, colócalo en la **raíz que corresponda por reutilización**. Las carpetas de
módulo van en inglés y kebab-case. Los cruces entre raíces usan **imports absolutos `~/`**.

## Reglas de endpoints

- Switch por `event.method` (`GET`/`POST`/`PUT`/`DELETE`); `405` para método no soportado.
- **Autentica al inicio** de cada handler (`getUserId(event)`) si el proyecto tiene auth.
- **Control de acceso**: filtra siempre por `userId` (y `groupIds` si hay multi-tenancy). Nunca
  devuelvas datos de otro usuario.
- **Valida inputs** y lanza errores controlados con `createError({ statusCode, statusMessage })`.
- `catch (error: unknown)`: `console.error`, re-lanza si ya trae `statusCode`, si no `500`.

```ts
export default defineEventHandler(async (event) => {
  try {
    const method = event.method;
    const userId = await getUserId(event); // si hay auth

    if (method === "GET") {
      return await db.select().from(tasks).where(eq(tasks.userId, userId));
    }
    if (method === "POST") {
      const body = await readBody(event);
      const data = mapTaskToRaw(body);
      const [created] = await db.insert(tasks).values({ ...data, userId }).returning();
      if (!created) throw createError({ statusCode: 500, statusMessage: "Error al crear" });
      return mapRawToTask(created);
    }
    throw createError({ statusCode: 405, statusMessage: `Método ${method} no permitido` });
  } catch (error: unknown) {
    console.error("Error en API de tasks:", error);
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError({ statusCode: 500, statusMessage: "Error interno" });
  }
});
```

## Mappers (`server/api/{raíz}/[modulo]/mappers.ts`)

Un mapper por dirección — **Frontend → DB** (`mapXToRaw`) y **DB → Frontend** (`mapRawToX`).
Solo transforman tipos (p. ej. `string`↔`Date`) o desacoplan la forma DB de la API; **sin
lógica de negocio**. Opcionales: endpoints simples pueden devolver el row directo.

```ts
export const mapTaskToRaw = (task: Task): TaskRaw => ({ ...task });
export const mapRawToTask = (raw: TaskRaw): Task => ({ ...raw });
export const mapRawArrayToTasks = (raws: TaskRaw[]): Task[] => raws.map(mapRawToTask);
```

## Servicios de dominio (`server/services/{raíz}/`)

Lógica reutilizable o integraciones externas, bajo su raíz (`general-settings/billing`,
`v0/ai`, `v0/twitter`, `v0/radar`…). Sepáralas por capas `repository` → `service` → `mappers`
y, cuando integres una API externa, añade un **mock** para desarrollo y mantén la fuente de datos
_pluggable_ tras una interfaz.

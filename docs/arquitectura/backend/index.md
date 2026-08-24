# Arquitectura Backend — Visión general

El **server** es donde vive toda la lógica crítica: negocio, seguridad, acceso a datos y
validación. **Nunca se confía en el frontend**: se valida y autoriza siempre en la API.

Esta página es el punto de entrada. El detalle de cada capa está en:

- **[`api.md`](./api.md)** — la capa de endpoints REST (handlers, auth, validación, errores).
- **[`database.md`](./database.md)** — Drizzle + PostgreSQL (schema por módulo, tipos, migraciones).
- **[`servicios-externos.md`](./servicios-externos.md)** — integraciones con APIs externas
  (patrón Repository → Mapper → Service).

---

## Estructura del server

El código de dominio se agrupa en **tres raíces** según su reutilización entre proyectos, y esa
agrupación se repite **en paralelo** en `api/`, `database/schema/`, `services/`, `constants/` y
`utils/`:

- **`auth/`** — autenticación reutilizable (login, sesión, registro, verify-email, reset).
- **`general-settings/`** — config de cuenta reutilizable: `user`, `billing`, `brands`.
- **`v0/`** — dominio específico de RadarX, versionado: `opportunities`, `radar`
  (accounts/keywords/reply-settings/scan), `reply-history`.

```
server/
├── api/                        # Endpoints REST, agrupados por raíz y módulo
│   ├── auth/{modulo}/          # login, session, register, verify-email, reset…
│   ├── general-settings/{modulo}/   # user, billing, brands
│   └── v0/{modulo}/            # opportunities, radar/*, reply-history
│       ├── index.ts            #   GET (listado) + POST (crear)
│       ├── [id].ts             #   GET by id + PUT + DELETE
│       └── mappers.ts          #   Transformación DB ↔ API (opcional)
├── database/
│   ├── index.ts                # Conexión (exporta `db`)
│   ├── schema/                 # Schemas agrupados por raíz (ver database.md)
│   │   ├── index.ts            # Barrel: reexporta todos los schemas
│   │   └── {raíz}/{modulo}/index.ts   # Tabla Drizzle + tipos `{Entity}Raw`
│   └── migrations/             # Migraciones SQL generadas
├── services/{raíz}/{name}/     # Lógica de dominio e integraciones (ver servicios-externos.md)
├── utils/{raíz}/               # Helpers (auth/auth.ts, general-settings/brand-ownership.ts…)
└── constants/{raíz}/           # Constantes de dominio (planes, reply-style…)
```

Regla clave de dependencia: **el endpoint orquesta, el service tiene el negocio, el repository
solo habla con el exterior**. Un endpoint nunca importa un repository ni un mapper de servicio
directamente; siempre pasa por el `service`. Los cruces entre raíces usan imports absolutos `~/`.

---

## Diseño por módulos

Un **módulo** es una funcionalidad encapsulada (`keywords`, `accounts`, `opportunities`,
`billing`…). Cada uno tiene sus propios endpoints, su schema de BD y, si hace falta, sus mappers
y helpers. Esto permite escalar sin acoplar módulos entre sí.

Las carpetas de módulo van en **inglés y kebab-case** (`keywords`, no `palabras-clave`) y se
colocan bajo la **raíz de reutilización** que les corresponda (`auth/`, `general-settings/` o
`v0/`). Ej.: `v0/radar/keywords`, `general-settings/billing`, `auth/session`.

---

## Las tres capas del backend

```
Endpoint API (server/api/{modulo}/…)
   │  autentica, valida, controla acceso, orquesta
   ▼
Service de dominio (server/services/…)      ← negocio, combina fuentes, decide mock/real
   ▼
Repository / Base de datos                   ← acceso a datos (Drizzle) o API externa (fetch)
```

- **Acceso directo a BD desde el endpoint** es correcto para CRUD simple: el handler usa `db`
  (Drizzle) directamente (ver [`api.md`](./api.md)).
- **Cuando hay negocio reutilizable o una integración externa**, se extrae a un `service` bajo
  `server/services/` (ver [`servicios-externos.md`](./servicios-externos.md)).

---

## Base de datos con Drizzle

**Drizzle ORM** es _type-safe_: el schema es la **fuente de verdad** y de él parten los tipos,
tanto del server como del frontend. Cada tabla vive en `server/database/schema/{raíz}/{modulo}/index.ts`
(snake_case plural) y exporta sus tipos inferidos como `{Entity}Raw` / `New{Entity}Raw`.

El ciclo es `editar schema → db:generate → db:push`. El detalle completo (reglas de schema, enums,
cascade, tipos de front, migraciones) está en **[`database.md`](./database.md)**.

---

## Convenciones transversales

| Regla               | Detalle                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Todo en inglés      | Código, rutas, tablas y mensajes en inglés; **comentarios en español**                      |
| Sin `any`           | TS estricto; en `catch` tipa `error: unknown` y comprueba `"statusCode" in error`           |
| Módulos             | Carpetas en inglés y kebab-case; cada módulo encapsula endpoints + schema + helpers         |
| Tablas DB           | snake_case plural; FKs `{tabla}_id`; timestamps `created_at`/`updated_at` `.defaultNow()`   |
| Tipos               | Parten del schema (`{Entity}Raw`); nunca se redefinen a mano                                 |
| Acceso a datos      | Siempre filtrando por propiedad del usuario/marca; nunca devolver datos de otro usuario      |
| Imports             | Rutas absolutas con `~/`; `./`/`../` solo dentro del mismo módulo                            |
| Migraciones         | `db:generate` + `db:push`; nunca tocar la BD a mano                                          |

---

## Flujo completo (resumen)

```
Cliente (frontend)
   │  HTTP (body / path params / query params)
   ▼
Endpoint API (server/api/{modulo}/…)
   │  autentica (getUserId), controla acceso (assertBrandOwnership), valida input
   ├──────────────► BD directa (Drizzle `db`)         ─► CRUD simple
   └──────────────► Service de dominio                ─► negocio / API externa
   ▼
Respuesta JSON → frontend
```

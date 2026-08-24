# Arquitectura Frontend — Visión general

El frontend es **modular y desacoplado**: cada funcionalidad vive en su módulo y separa la UI de la lógica y del acceso HTTP. La lógica crítica **nunca** vive en el front (eso es del backend); aquí solo se orquesta estado, presentación y llamadas a la API.

Esta página es el punto de entrada. El detalle de cada capa está en:

- **[`views.md`](./views.md)** — Vistas
- **[`components.md`](./components.md)** — Componentes
- **[`composables.md`](./composables.md)** — Capa de estado y servicios (`use{Modulo}Service`).
- **[`repositories.md`](./repositories.md)** — Capa HTTP (clase `Repository` base, singletons).

---

## Arquitectura en 3 capas

Toda funcionalidad que hable con el backend sigue este flujo, análogo al del server:

```
Vista (index.vue / componentes)
  └── Composable / Service (use{Modulo}Service.ts)   ← estado + computadas + servicios
        └── Repository ({modulo}.repository.ts)       ← solo HTTP (extiende Repository base)
              └── API REST (server/api/…)
```

Regla clave de dependencia: **la vista solo conoce al composable; el composable, al repository;
el repository, a la API**. Una vista nunca llama al repository ni hace `$fetch` directo.

---

## Estructura del proyecto

```
app/
├── assets/css/                 # CSS global (único punto de entrada: main.css)
├── components/                 # Componentes reutilizables globales
│   ├── layout/                 # Header, Footer, Sidebar…
│   ├── section/                # Bloques de UI (PageHeader, Panel, EmptyState…)
│   └── ui/                     # Componentes base con prefijo `Vic` + form/, charts/…
├── composables/                # Composables globales (útiles a varios módulos)
├── layouts/                    # Layouts de página
├── locales/                    # i18n (es.json, en.json)
├── middleware/                 # Middleware de navegación (`*.global.ts`)
├── pages/                      # Routing automático, agrupado en route groups
│   ├── (auth)/                 # Login, registro, recuperación…
│   ├── (config)/               # Ajustes, marcas, facturación…
│   └── (modules)/              # Módulos de producto (dashboard…)
│       └── {modulo}/
│           ├── index.vue       # Página principal del módulo
│           ├── components/     # Vistas del módulo (tabs/, modals/, partials/)
│           ├── composables/    # use{Modulo}Service.ts (estado + servicios)
│           ├── repositories/   # {modulo}.repository.ts (singleton HTTP)
│           ├── types/          # {modulo}.types.ts (parten del schema Drizzle)
│           └── utils/          # Helpers sin estado
├── plugins/                    # Plugins (Vuetify…)
└── utils/                      # Utilidades globales (p. ej. Repository base)
```

Los **route groups** `(auth)`, `(config)`, `(modules)` agrupan páginas sin añadir segmento a la
URL: `(config)/settings/index.vue` → `/settings`.

---

## Diseño por módulos

Un **módulo** es una funcionalidad encapsulada dentro de un route group (`settings`, `dashboard`, `brands`…). Reúne su vista, su estado, su acceso HTTP, sus tipos y sus helpers. Las carpetas de módulo van en **inglés y kebab-case**.

Un módulo puede consumir el composable de otro (p. ej. `settings` usa `useBrandService` para saber la marca activa), pero nunca su repository directamente.

---

## Carpetas globales

- **`components/`** — reutilizables en toda la app: `layout/`, `section/` y `ui/` (base, con
  prefijo `Vic`). Ver [`components.md`](./components.md).
- **`layouts/`** — estructura visual compartida (`default.vue`).
- **`middleware/`** — se ejecuta antes de navegar; los `*.global.ts` aplican a todas las rutas
  (p. ej. `auth.global.ts`, `require-brand.global.ts`).
- **`plugins/`** — configuración de librerías (Vuetify se registra aquí; no se importa a mano).
- **`assets/css/`** — todo el CSS entra por `main.css` (único `css` en `nuxt.config.ts`).
- **`locales/`** — mensajes i18n; escapar `@` como `{'@'}` o el archivo no carga.

---

## Convenciones transversales

| Regla                 | Detalle                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| Todo en inglés        | Código, rutas, keys de estado; **comentarios en español**                 |
| Sin `any`             | TS estricto; los tipos de front parten del schema Drizzle (`{Entity}Raw`) |
| Capas                 | Vista → Composable → Repository → API; nunca saltar una capa              |
| Módulos               | Carpetas en inglés y kebab-case dentro de un route group                  |
| Layout                | Tailwind para layout; Vuetify **solo** para inputs interactivos           |
| `null` vs `undefined` | Vuetify espera `undefined` → usar `?? undefined` con valores de estado/DB |
| Handlers              | Prefijo `on` en la vista (`onCreate`, `onDelete`)                         |
| Imports               | Rutas absolutas con `~/`; `./`/`../` solo dentro del mismo módulo         |
| i18n                  | `$t("…")`; escapar `@` como `{'@'}` en los locales                        |

---

## Flujo completo (resumen)

```
Usuario interactúa con la Vista (index.vue / componente)
   │  handler `onX` (solo orquesta UI)
   ▼
Composable use{Modulo}Service
   │  muta estado (useState) · captura errores · expone readonly
   ▼
Repository {modulo}.repository (extiende Repository base)
   │  httpGet/httpPost/… (solo HTTP)
   ▼
API REST (server/api/…)  ─►  estado actualizado  ─►  la Vista reacciona
```

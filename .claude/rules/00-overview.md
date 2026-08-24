# Reglas del proyecto — Visión general y reglas de oro

> Plantilla base (Nuxt 4 + Drizzle + Vuetify/Tailwind). Estas reglas aplican a todo el código
> nuevo o modificado. Cuando estas reglas y `docs/` discrepen, **mandan estas**.

## Stack base

Nuxt 4 (SSR, `compatibilityVersion: 4`) · Vue 3 `<script setup lang="ts">` · TypeScript estricto ·
Tailwind v4 (layout) + Vuetify 3 (solo inputs) · Drizzle ORM + PostgreSQL ·
i18n (`@nuxtjs/i18n`) · Zod · Node `>=` ver `.nvmrc`.

## Reglas de oro (innegociables)

1. **Todo en inglés salvo comentarios.** Variables, funciones, tipos, archivos, rutas,
   mensajes de error, keys de estado → inglés. **Comentarios explicativos → castellano.**
2. **Sin `any`.** TS estricto. Si el tipo es desconocido usa `unknown` y estréchalo.
   En los `catch`, tipa `error: unknown` y comprueba `"statusCode" in error` — NO `error: any`.
3. **Los tipos de front parten del schema de Drizzle** (`InferSelectModel`/`InferInsertModel`).
   Nunca redefinas un tipo que ya existe; adáptalo con `Omit`/`Pick`/`Partial`/`extends`.
4. **Imports absolutos con `~/`.** Solo `./` / `../` cuando el archivo está en una subcarpeta
   del mismo módulo (`./components/...`, `../types/...`).
5. **Vuetify espera `undefined`, no `null`.** Usa `?? undefined` al pasar valores de estado/DB.
6. **Layout con Tailwind, no Vuetify.** (Ver `frontend.md`.)
7. **Carpetas de módulo en inglés y kebab-case** (`tasks`, `users`, `projects`). Nunca castellano.
8. **Toda la lógica crítica vive en el server.** Nunca confíes en el frontend: valida y autoriza
   en la API.
9. **Código de dominio del server agrupado por raíz de reutilización:** `auth/` (autenticación) ·
   `general-settings/` (user, billing, brands) · `v0/` (dominio específico del proyecto). La misma
   agrupación aplica en paralelo a `api/`, `database/schema/`, `services/`, `constants/` y
   `utils/`. Ver `backend.md`.

## Comandos

```bash
npm run dev          # desarrollo
npm run build        # build producción
npm run tsc          # typecheck (nuxt typecheck)
npm run db:generate  # generar migración Drizzle
npm run db:push      # aplicar schema a la BD
npm run db:studio    # Drizzle Studio
```

## Git

**No** hacer `git add/commit/push` salvo que el usuario lo pida explícitamente. Dejar los
cambios sin _stage_.

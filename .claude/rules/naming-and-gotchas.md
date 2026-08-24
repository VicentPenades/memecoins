# Nomenclatura y gotchas

## Convenciones de nomenclatura

| Elemento            | Convención                       | Ejemplo                     |
| ------------------- | -------------------------------- | --------------------------- |
| Archivos Vue        | PascalCase                       | `ModalTask.vue`             |
| Composables         | camelCase + `use…Service`        | `useTasksService.ts`        |
| Repositorios        | camelCase + `.repository`        | `tasks.repository.ts`       |
| Tipos               | PascalCase                       | `Task`, `NewTask`           |
| Constantes          | UPPER_SNAKE_CASE                 | `TASK_STATES`               |
| Tablas DB           | snake_case plural                | `tasks`, `habit_records`    |
| Endpoints           | kebab-case                       | `/api/my-tasks`             |
| Handlers en vista   | camelCase + prefijo `on`         | `onCreateTask`              |
| Keys de `useState`  | kebab-case con prefijo de módulo | `"tasks-loading"`           |
| Carpetas de módulo  | kebab-case en inglés             | `tasks`, `projects`         |
| Raíz de dominio (server) | `auth` / `general-settings` / `v0` | `api/v0/radar`, `services/general-settings/billing` |

## Gotchas conocidos

- **i18n**: los locales viven en `app/locales` (`es.json`, `en.json`). Escapa `@` como `{'@'}`;
  si no, **no carga ningún mensaje** del archivo. Revisa `defaultLocale`/`strategy` en
  `nuxt.config.ts`.
- **`null` vs `undefined`**: Vuetify espera `undefined` → usa `?? undefined` con valores de DB/estado.
- **CSS**: todo se importa desde `app/assets/css/main.css` (único `css` en `nuxt.config.ts`).
- **Vuetify** se auto-importa (plugin Vite + `build.transpile`); no lo importes manualmente.

## Crear un módulo completo

Sigue el paso a paso de `docs/CreaciónModulo.md`: DB → mappers → API → tipos → repository →
composable → componentes → `index.vue`.

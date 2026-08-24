# Frontend (Nuxt 4 + Vue 3)

## Arquitectura en 3 capas

Toda funcionalidad que conecte con el backend sigue este flujo:

```
Vista (index.vue / componentes)
  └── Service / Composable (use[Modulo]Service.ts)   ← estado + computadas + servicios
        └── Repository ([modulo].repository.ts)       ← solo HTTP, extiende Repository base
              └── API REST (server/api/...)
```

### Repository (`repositories/[modulo].repository.ts`)

- Solo comunicación HTTP. Sin estado ni lógica de negocio.
- Extiende la clase base `Repository` de `~/app/utils/repository` y usa sus helpers
  `httpGet/httpPost/httpPut/httpPatch/httpDelete`.
- Nombra los métodos según la convención de la clase base:
  `retrieve` (GET listado) · `find(id)` · `search(params)` · `create` · `update` ·
  `updatePartial` · `destroy`. Para crear subrecursos: `create[Resource]`.
- Exporta una **instancia singleton**: `export const tasksRepository = new TasksRepository()`.

```ts
import { Repository } from "~/app/utils/repository";
import type { Task, NewTask } from "../types/tasks.types";

class TasksRepository extends Repository {
  retrieve() {
    return this.httpGet<Task[]>("/api/tasks");
  }
  find(id: number) {
    return this.httpGet<Task>(`/api/tasks/${id}`);
  }
  create(body: NewTask) {
    return this.httpPost<Task>("/api/tasks", body);
  }
  update(id: number, body: Partial<Task>) {
    return this.httpPut<Task>(`/api/tasks/${id}`, body);
  }
  destroy(id: number) {
    return this.httpDelete(`/api/tasks/${id}`);
  }
}

export const tasksRepository = new TasksRepository();
```

### Service / Composable (`composables/use[Modulo]Service.ts`)

- Estado con `useState` (SSR-safe, key con prefijo de módulo en kebab-case: `"tasks-loading"`),
  computadas y servicios. Nada de lógica de presentación ni `$fetch` directo.
- **Aquí se capturan los errores**: `try/catch` + `console.error("Error …:", err)` + `throw err`.
- Expón el estado como `readonly(...)` para evitar mutaciones externas.

```ts
export const useTasksService = () => {
  const tasks = useState<Task[]>("tasks", () => []);
  const loading = useState<boolean>("tasks-loading", () => false);

  const fetchTasks = async () => {
    loading.value = true;
    try {
      tasks.value = await tasksRepository.retrieve();
    } catch (err) {
      console.error("Error cargando tasks:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { tasks: readonly(tasks), loading: readonly(loading), fetchTasks };
};
```

### Vista (pages / componentes)

- Handlers de usuario prefijados con `on`: `onCreateTask`, `onDeleteTask`.
- Nunca llama al repository directamente; siempre vía service. Solo orquesta UI.

## Componentes Vue

- Siempre `<script setup lang="ts">`.
- **Layout con Tailwind, NO Vuetify.** Prohibidos `VCard`/`VContainer`/`VRow`/`VCol`/`VSheet`
  en vistas. Vuetify SOLO para componentes interactivos (`VTextField`, `VSelect`, `VCheckbox`,
  `VDialog`, `VDataTable`…).
- Recuerda: Vuetify quiere `undefined`, no `null` → `?? undefined`.
- Componentes UI reutilizables van en `app/components/ui/` con prefijo `Vic` (`VicModal`,
  `VicTable`…). Revisa si ya existe antes de crear uno nuevo.

### Secciones de vista con `SectionPanel`

- **Cada sección lógica de una vista va envuelta en `SectionPanel`** (`app/components/section/Panel.vue`).
  Es la unidad visual por defecto: un tab, un bloque de ajustes, un formulario, una tabla…
  cada uno en su `SectionPanel` con su `:title`.
- Si una vista/tab tiene varias secciones, apílalas en un contenedor Tailwind
  (`<div class="flex flex-col gap-6">`), cada una en su propio `SectionPanel`.
- Dentro del panel, el layout es **Tailwind** (grids/flex); Vuetify solo para inputs.
- Excepciones (no envolver en `SectionPanel`): modales/diálogos (`VDialog` ya es su
  propio contenedor), la cabecera de página (`SectionPageHeader`) y las "zonas de
  peligro" u otros bloques con estilo propio intencional.

```vue
<template>
  <div class="flex flex-col gap-6">
    <SectionPanel :title="$t('module.sectionOneTitle')">
      <!-- layout Tailwind + inputs Vuetify -->
    </SectionPanel>
    <SectionPanel :title="$t('module.sectionTwoTitle')">
      <!-- … -->
    </SectionPanel>
  </div>
</template>
```

## Estructura de un módulo (route groups `(config)` / `(modules)`)

```
app/pages/(modules)/[modulo]/
├── index.vue
├── components/        # modals/, tabs/, partials/
├── composables/       # use[Modulo]Service.ts
├── repositories/      # [modulo].repository.ts (instancia singleton)
├── types/             # [modulo].types.ts (parten del schema Drizzle)
└── utils/             # helpers sin estado
```

## CSS / Vuetify

- Todo el CSS se importa desde `app/assets/css/main.css` (único `css` en `nuxt.config.ts`).
- Vuetify se auto-importa vía plugin Vite + `build.transpile`; no lo importes manualmente.

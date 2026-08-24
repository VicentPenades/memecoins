# Componentes

Los componentes situados en `app/components/` son componentes reutilizables. Se ordenan en 3 capas:

- **`layout/`** — estructura de la app (header, footer…).
- **`section/`** — Sección de una página repetible (`PageHeader`, `Panel`, `EmptyState`…).
- **`ui/`** — Componentes reutilizables de UI. Normalmente ordenados por carpetas que representan la funcionalidad o grupo`form/` y `charts/`.

Antes de crear un componente base nuevo, **revisa si ya existe** uno equivalente en `ui/`.

---

## Reglas base

- Siempre **`<script setup lang="ts">`**.
- La estructura de un componente es: **props > emits > estado y composables > computed > watchers > funciones y handlers**.
  - Las props estarán tipadas con `NombreComponenteProps` (p. ej. `MenuProps`) y se declaran con `withDefaults(defineProps<MenuProps>(), { … })`.
  - Los `emits` con la sintaxis tipada `defineEmits<{ nombreEvento: [payload: Tipo] }>()`.
  - Los handlers de usuario van al final, prefijados con `on` (`onApply`, `onToggle`).
- Los tipos deben estar en el propio componente. La excepción sería si el componente tiene subcomponentes parciales, en cual caso se creará una carpeta models con {componente}.models.ts

## Ejemplo de componente

Componente de `section/` que recibe una tarea, permite editar su título y emite eventos al
padre. Muestra el orden recomendado (**props > emits > estado y composables > computed >
watchers > funciones y handlers**), tipos en el propio componente, layout con Tailwind e inputs
con Vuetify.

```vue
<template>
  <!-- Layout con Tailwind; Vuetify solo para el input -->
  <div class="flex items-center gap-3 rounded-lg border border-[var(--border-default)] p-3">
    <v-checkbox
      :model-value="task.done"
      hide-details
      density="compact"
      color="primary"
      @update:model-value="onToggleDone($event ?? false)"
    />

    <div class="flex-grow">
      <v-text-field
        v-model="title"
        :label="$t('tasks.titleLabel')"
        density="compact"
        variant="outlined"
        hide-details
      />
      <p v-if="isOverdue" class="mt-1 text-xs text-[var(--mc-bw-grey-darken-1)]">
        {{ $t("tasks.overdue") }}
      </p>
    </div>

    <v-btn icon="mdi-delete-outline" variant="text" @click="onDelete" />
  </div>
</template>

<script setup lang="ts">
import type { Task } from "~/app/pages/(modules)/tasks/types/tasks.types";

// 1. Props — tipadas con {Componente}Props y valores por defecto con withDefaults
interface TaskItemProps {
  task: Task;
  editable?: boolean;
}

const props = withDefaults(defineProps<TaskItemProps>(), {
  editable: true,
});

// 2. Emits — sintaxis tipada
const emit = defineEmits<{
  toggleDone: [id: number, done: boolean];
  rename: [id: number, title: string];
  delete: [id: number];
}>();

// 3. Estado y composables
const { t } = useI18n();
// Vuetify espera undefined, no null → normalizamos el valor de estado/DB
const title = ref(props.task.title ?? undefined);

// 4. Computed
const isOverdue = computed(
  () => !props.task.done && props.task.dueAt != null && props.task.dueAt < new Date(),
);

// 5. Watchers
watch(title, (value) => {
  if (props.editable && value) emit("rename", props.task.id, value);
});

// 6. Funciones y handlers de usuario (prefijo on…)
const onToggleDone = (done: boolean) => emit("toggleDone", props.task.id, done);
const onDelete = () => emit("delete", props.task.id);
</script>
```

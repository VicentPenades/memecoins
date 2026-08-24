# Reglas de desarrollo

Estas reglas deben seguirse siempre que se cree o modifique código, ya sea de forma manual o asistida por IA.

---

## Reglas generales

- **Todo en inglés excepto los comentarios**: variables, funciones, clases, propiedades, módulos, rutas, nombres de archivos, mensajes de error, keys de estado — todo en inglés.
- **Comentarios en castellano**: cualquier comentario explicativo se escribe en castellano. Es la única excepción a la regla anterior.
- **Nombres de módulos en inglés**: las carpetas de módulos dentro de `pages/` deben nombrarse en inglés (p. ej. `tasks`, `activities`, `goals`). Jamás usar nombres en castellano como `tareas` o `metas` para las rutas.
- **Imports absolutos**: usar siempre rutas absolutas con `~/`. Solo se permiten imports relativos `./` cuando el archivo importado está en una subcarpeta inmediata del mismo módulo (p. ej. `./components/...`, `./utils/...`).
- **Sin `any`**: TypeScript estricto. Nunca usar `any`; si el tipo es desconocido usar `unknown` y estrecharlo.
- **Sin `null` en props de Vuetify**: los componentes de Vuetify esperan `undefined`, no `null`. Usar `?? undefined` al pasar valores del estado o la base de datos.

---

## TypeScript

- Los tipos de frontend **siempre** parten de los tipos inferidos del schema de Drizzle (`InferSelectModel`, `InferInsertModel`).
- Usar utilidades de TypeScript (`Omit`, `Pick`, `Partial`, `extends`) para adaptar los tipos en lugar de redefinirlos.
- Nunca redefinir un tipo que ya existe en el schema.

```ts
// server/database/schema/tareas/index.ts — fuente de verdad
export type TaskRaw = InferSelectModel<typeof tareas>;
export type NewTaskRaw = InferInsertModel<typeof tareas>;

// app/pages/(modules)/tareas/types/tareas.types.ts — tipos de front
export type Task = TaskRaw & { etiquetaIds: number[] };
export type NewTask = Omit<NewTaskRaw, "userId"> & { etiquetaIds?: number[] };
```

---

# Frontend

## Arquitectura (3 capas)

Toda funcionalidad que conecte con el backend debe seguir este flujo de 3 capas:

```
Vista (index.vue / componentes)
   └── Service / Composable (use[Modulo]Service.ts)
         └── Repository ([modulo].repository.ts)
               └── API REST (server/api/...)
```

### 1. Repository (`[modulo]/repositories/[modulo].repository.ts`)

- Única responsabilidad: **comunicación HTTP con el backend**.
- Extiende la clase base `Repository` de `~/app/utils/repository`.
- No tiene lógica de negocio ni gestión de estado.
- Métodos nombrados según la convención de la clase base: `getAll`, `create`, `update`, `delete`, `find`…

```ts
import { Repository } from "~/app/utils/repository";
import type { Task, NewTask } from "../types/tasks.types";

class TasksRepository extends Repository {
  async getAll() {
    return this.httpGet<Task[]>("/api/tasks");
  }
  async create(body: NewTask) {
    return this.httpPost<Task>("/api/tasks", body);
  }
  async update(id: number, body: Partial<Task>) {
    return this.httpPut<Task>(`/api/tasks/${id}`, body);
  }
  async delete(id: number) {
    return this.httpDelete(`/api/tasks/${id}`);
  }
}

export const tasksRepository = new TasksRepository();
```

### 2. Service / Composable (`[modulo]/composables/use[Modulo]Service.ts`)

- Contiene **estado, computadas y servicios** del módulo. Nada más.
- El estado se declara con `useState` para que sea compartido (SSR-safe).
- Los servicios llaman al repository y actualizan el estado.
- **Los errores se capturan aquí** (try/catch + `console.error` + re-throw).
- El estado se expone como `readonly` para evitar mutaciones externas accidentales.
- No incluir lógica de presentación ni llamadas directas a `$fetch`.

```ts
export const useTasksService = () => {
  const tasks = useState<Task[]>("tasks", () => []);
  const loading = useState<boolean>("tasks-loading", () => false);

  const tasksFiltradas = computed(() => {
    /* ... */
  });

  const fetchTasks = async () => {
    loading.value = true;
    try {
      tasks.value = await tasksRepository.getAll();
    } catch (err) {
      console.error("Error cargando tasks:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    tasks: readonly(tasks),
    loading: readonly(loading),
    tareasFiltradas,
    fetchTasks,
    // ...
  };
};
```

### 3. Vista (pages / components)

- Los handlers de eventos de usuario **empiezan siempre por `on`**: `onCreateTask`, `onDeleteTask`, `onUpdateTask`.
- La vista no llama directamente al repository; siempre pasa por el service.
- No hay lógica de negocio en la vista; solo orquestación de UI + llamadas al service.

```ts
// En el componente
const { createTask, openModal, selectedTask } = useTasksService();

const onCreateTask = async (data: NewTask) => {
  await createTask(data);
  openModal.value = false;
};
```

---

## Componentes Vue

- Siempre usar `<script setup lang="ts">`.
- **No usar Vuetify directamente para layout ni contenedores**: `VCard`, `VContainer`, `VRow`, `VCol`, `VSheet`, etc. están prohibidos en las vistas. Usar Tailwind CSS para layout.
- Vuetify **solo** para componentes con lógica de interacción: `VTextField`, `VSelect`, `VCheckbox`, `VDialog`, `VDataTable`…
- Antes de crear un componente UI nuevo, revisar `app/components/ui/`. Si existe una envoltura, usarla. Si no existe y el componente se va a reutilizar, crearlo en `app/components/ui/` con el prefijo `Vic`.

### Componentes UI disponibles (`app/components/ui/`)

| Componente           | Uso                                         |
| -------------------- | ------------------------------------------- |
| `VicModal`           | Modal estándar con confirmación/cancelación |
| `VicTable`           | Tabla de datos con acciones y ordenación    |
| `VicCalendar`        | Vista de calendario                         |
| `VicTracking`        | Grid de seguimiento semanal                 |
| `VicFileSelector`    | Selector de archivos                        |
| `form/TextField.vue` | Input de texto                              |
| `form/Select.vue`    | Selector                                    |
| `form/TextArea.vue`  | Área de texto                               |
| `form/Date.vue`      | Selector de fecha                           |
| `form/Color.vue`     | Selector de color                           |

---

## Estructura de un módulo frontend

```
app/pages/(modules)/[modulo]/
├── index.vue                          # Página principal (entrada del módulo)
├── components/
│   ├── modals/
│   │   └── Modal[Entidad].vue         # Formulario modal de creación/edición
│   ├── tabs/
│   │   └── [nombre-tab]/
│   │       └── [Modulo][Tab].vue      # Componente de cada tab
│   └── partials/                      # Componentes auxiliares (si hacen falta)
├── composables/
│   └── use[Modulo]Service.ts          # Estado + servicios del módulo
├── repositories/
│   └── [modulo].repository.ts         # Comunicación HTTP
├── types/
│   └── [modulo].types.ts              # Tipos TypeScript del módulo
└── utils/
    └── [modulo].utils.ts              # Helpers sin estado
```

---

# Backend

## Arquitectura backend

### Estructura de endpoints

```
server/api/[modulo]/
├── index.ts        # GET (listado) y POST (crear)
├── [id].ts         # GET /:id, PUT /:id, DELETE /:id
└── mappers.ts      # Transformación entre capa DB y capa API
```

### Reglas de endpoints

- **Siempre autenticar**: llamar a `getUserId(event)` al principio de cada handler.
- **Control de acceso**: filtrar siempre por `userId` (y `groupIds` si aplica multi-tenancy). Nunca devolver datos de otro usuario.
- **Errores con `createError`**: usar `createError({ statusCode, statusMessage })` para errores controlados.
- **Re-lanzar errores con `statusCode`**: en el catch, si el error ya tiene `statusCode`, relanzarlo directamente.

```ts
export default defineEventHandler(async (event) => {
  try {
    const userId = await getUserId(event);
    // lógica...
  } catch (error: any) {
    console.error("Error en API de [modulo]:", error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Error interno" });
  }
});
```

### Mappers

- Un mapper por dirección: **Frontend → DB** y **DB → Frontend**.
- Responsables de transformar tipos (p. ej. `string` → `Date`).
- Sin lógica de negocio; solo transformación de datos.

```ts
// mappers.ts
export const mapEntidadToRaw = (entidad: Entidad): EntidadRaw => {
  /* ... */
};
export const mapRawToEntidad = (raw: EntidadRaw): Entidad => {
  /* ... */
};
```

---

## Base de datos (Drizzle)

- **Nombres de tablas**: snake_case en plural (`tasks`, `habit_records`).
- **Foreign keys**: `[table]_id` (`user_id`, `group_id`, `category_id`).
- **Timestamps**: siempre incluir `created_at` y `updated_at` con `.defaultNow()`.
- **Cascade**: usar `onDelete: "cascade"` en registros dependientes; `onDelete: "set null"` para relaciones opcionales.
- **Enums**: definir con `pgEnum` y exportar el array de valores con `arrayToEnum`.
- **Tipos inferidos**: exportar siempre `InferSelectModel` e `InferInsertModel` como `[Entity]Raw` y `New[Entity]Raw`.

```ts
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

### Comandos de base de datos

```bash
npm run db:generate   # Generar migración SQL a partir del schema
npm run db:migrate    # Aplicar migraciones pendientes
```

---

## Convenciones de nomenclatura

| Elemento                     | Convención                        | Ejemplo                               |
| ---------------------------- | --------------------------------- | ------------------------------------- |
| Archivos Vue                 | PascalCase                        | `ModalTask.vue`                       |
| Composables                  | camelCase + prefijo `use`         | `useTasksService.ts`                  |
| Repositorios                 | camelCase + sufijo `.repository`  | `tasks.repository.ts`                 |
| Tipos                        | PascalCase                        | `Task`, `NewTask`                     |
| Constantes                   | UPPER_SNAKE_CASE                  | `TASK_STATES`                         |
| Tablas DB                    | snake_case plural                 | `tasks`, `habit_records`              |
| Endpoints                    | kebab-case                        | `/api/my-tasks`                       |
| Handlers de eventos en vista | camelCase con prefijo `on`        | `onCreateTask`, `onDeleteTask`        |
| Keys de `useState`           | kebab-case con prefijo del módulo | `"tasks-loading"`, `"tasks-selected"` |
| Carpetas de módulo           | kebab-case en inglés              | `tasks`, `activities`, `goals`        |

### Otras

- Usar siempre arrow function
- Usar types y nunca interfaces
- Rutas absolutas

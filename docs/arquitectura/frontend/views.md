# Vistas

Una vista es el punto de entrada de un page/index.vue.

Las vistas orquestan la UI: leen del composable y disparan sus servicios mediante handlers. No contienen lógica de negocio ni llaman al repository.

---

## Reglas base

- Siempre **`<script setup lang="ts">`**.
- **Layout con Tailwind**, no con Vuetify: prohibidos `VCard`/`VContainer`/`VRow`/`VCol`/`VSheet` en las vistas. Vuetify **solo** para componentes interactivos no definidos en app/components.
- Los handlers de usuario van prefijados con **`on`**: `onCreate`, `onDelete`, `onToggle`.
- La vista **nunca** llama al repository; siempre pasa por el composable.
- Vuetify espera `undefined`, no `null` → usa `?? undefined` al pasar valores de estado/DB.

---

## Estructura de las vistas de un módulo

```
{modulo}/
  index.vue           # Página principal: compone y orquesta
  components/         # Componentes parciales que únicamente se van a usar en la vista
    tabs/             # Componente por vista del módulo
    modals/           # Modales del módulo. Siempre tienen como base VicModal.vue.
    partials/         # Componentes auxiliares
```

La `index.vue` compone los componentes del módulo y arranca la carga de datos:

```vue
<!-- app/pages/(config)/settings/index.vue -->
<template>
  <div>
    <SectionPageHeader
      :title="$t('settings.title')"
      :description="$t('settings.description')"
    />
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SettingsKeywordsManager />
      <SettingsAccountsManager />
    </div>
  </div>
</template>

<script setup lang="ts">
import SettingsKeywordsManager from "./components/KeywordsManager.vue";
import SettingsAccountsManager from "./components/AccountsManager.vue";
import { useBrandService } from "~/app/pages/(config)/brands/composables/useBrandService";
import { useKeywordsService } from "./composables/useKeywordsService";

const { activeBrandId } = useBrandService();
const { fetchKeywords } = useKeywordsService();

// Recargamos cada vez que cambia la marca activa
watch(activeBrandId, () => fetchKeywords(), { immediate: true });
</script>
```

Un componente del módulo consume el composable y solo orquesta UI; los handlers `onX` delegan en
los servicios:

```vue
<!-- app/pages/(config)/settings/components/KeywordsManager.vue (fragmento) -->
<script setup lang="ts">
import { useKeywordsService } from "../composables/useKeywordsService";

const { keywords, createKeyword, deleteKeyword } = useKeywordsService();
const term = ref("");

const onCreate = async () => {
  if (!term.value.trim()) return;
  await createKeyword({ term: term.value.trim(), category: null });
  term.value = "";
};

const onDelete = async (id: number) => {
  await deleteKeyword(id);
};
</script>
```

Layout con Tailwind (grid/flex) y solo los inputs con Vuetify (`v-btn`, `v-switch`) o con los wrappers `Ui*` del proyecto (`UiFormTextField`).

---

## Auto-import y nombres de componentes

Tanto en las vistas como en los componentes parciales. Nuxt auto-importa los componentes; el nombre deriva de la ruta. Un componente en `components/section/PageHeader.vue` se usa como `<SectionPageHeader>`, y uno en `components/ui/form/TextField.vue` como `<UiFormTextField>`. No hace falta importarlos en el `<template>`.

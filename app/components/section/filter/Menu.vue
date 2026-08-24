<template>
  <div class="inline-flex">
    <v-menu
      v-model="open"
      location="bottom end"
      :close-on-content-click="false"
      :offset="[5, 0]"
    >
      <template #activator="{ props }">
        <!-- Activador personalizable; por defecto un botón con icono de filtro y badge -->
        <slot
          name="activator"
          v-bind="{ props, open, showBadge, filtersApplied, disabled, loading }"
        >
          <v-badge
            :model-value="showBadge"
            :content="filtersApplied"
            :offset-x="12"
            :offset-y="12"
            floating
            bordered
            color="primary"
          >
            <v-btn
              variant="outlined"
              :height="40"
              :min-width="40"
              class="bg-white"
              :disabled="disabled"
              :loading="loading"
              v-bind="props"
            >
              <v-icon color="primary">mdi-filter-variant</v-icon>
            </v-btn>
          </v-badge>
        </slot>
      </template>

      <div
        class="min-w-[280px] rounded-lg border border-gray-200 bg-white shadow-md"
        :class="menuContentClass"
      >
        <!-- Cabecera compacta -->
        <div
          class="flex items-center justify-between gap-4 border-b border-gray-100 px-3 py-2"
        >
          <v-btn
            size="x-small"
            variant="text"
            color="primary"
            :class="{ invisible: !totalFiltersLength }"
            @click="toggleAll"
          >
            {{
              internalFiltersApplied ? t("common.clear") : t("common.selectAll")
            }}
          </v-btn>
          <v-btn
            size="x-small"
            color="primary"
            :disabled="!noneAllowed && !internalFiltersApplied"
            @click="apply"
          >
            {{ t("common.apply") }}
          </v-btn>
        </div>

        <!-- Búsqueda de opciones -->
        <div v-if="searchable" class="px-3 py-2">
          <v-text-field
            v-model="searchString"
            :placeholder="searchPlaceholder ?? t('common.search')"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            hide-details
            clearable
          />
        </div>

        <!-- Secciones de filtros -->
        <div
          :style="{ maxHeight: maxMenuHeight }"
          class="overflow-y-auto"
          :class="sectionsWrapperClass"
        >
          <div
            v-for="(section, index) in filteredSections"
            :key="section.id"
            class="px-3 py-2"
            :class="{
              'border-b border-gray-100': index < filteredSections.length - 1,
              [section.className ?? '']: !!section.className,
            }"
          >
            <div
              v-if="section.label"
              class="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              <span>{{ section.label }}</span>
              <v-tooltip v-if="section.help" location="top">
                <template #activator="{ props }">
                  <v-icon size="small" v-bind="props">
                    mdi-help-circle-outline
                  </v-icon>
                </template>
                <div class="max-w-[200px] text-center">{{ section.help }}</div>
              </v-tooltip>

              <span
                v-if="canToggleSections && !section.singleSelect"
                class="ml-auto"
              >
                <v-checkbox
                  :model-value="sectionsToggleStatus[section.id] === 'all'"
                  :indeterminate="sectionsToggleStatus[section.id] === 'some'"
                  hide-details
                  density="compact"
                  color="primary"
                  @update:model-value="toggleSection(section, $event)"
                />
              </span>
            </div>

            <!-- Opción de filtro con checkbox -->
            <label
              v-for="option in section.options"
              :key="`${section.id}::${option.id}`"
              class="flex min-h-0 cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-sm hover:bg-gray-50"
              :class="{ 'pl-2': section.label }"
            >
              <v-icon v-if="option.icon" size="x-small" class="w-4 opacity-80">
                {{ option.icon }}
              </v-icon>

              <div class="flex flex-grow items-center gap-1 truncate">
                <v-chip
                  v-if="option.resultsCount != null"
                  size="x-small"
                  label
                  color="warning"
                  class="font-bold"
                >
                  {{ option.resultsCount }}
                </v-chip>
                <div class="truncate">
                  <slot name="itemLabel" v-bind="{ item: option, section }">
                    <span>{{ option.label }}</span>
                  </slot>
                </div>
              </div>

              <v-checkbox
                :model-value="filtersMapping[getMappingKey(section, option)]"
                hide-details
                density="compact"
                class="filter-checkbox flex-none"
                color="primary"
                @update:model-value="
                  onOptionToggle(section, option, $event ?? false)
                "
              />
            </label>
          </div>

          <p
            v-if="!filteredSections.length"
            class="px-3 py-2 text-center text-sm text-gray-400"
          >
            {{ noResultsLabel ?? t("common.noResults") }}
          </p>
        </div>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import type {
  FilterOption,
  FiltersMap,
  FilterSection,
} from "./models/filter.models";

const props = withDefaults(
  defineProps<{
    filterSections?: FilterSection[];
    label?: string;
    allFiltersLabel?: string;
    noneFiltersLabel?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    noResultsLabel?: string;
    noneAllowed?: boolean;
    loading?: boolean;
    disabled?: boolean;
    menuContentClass?: string;
    sectionsWrapperClass?: string;
    maxMenuHeight?: string;
    canToggleSections?: boolean;
  }>(),
  {
    filterSections: () => [],
    label: undefined,
    allFiltersLabel: "",
    noneFiltersLabel: "",
    searchable: false,
    searchPlaceholder: undefined,
    noResultsLabel: undefined,
    noneAllowed: true,
    loading: false,
    disabled: false,
    menuContentClass: "",
    sectionsWrapperClass: "",
    maxMenuHeight: "40vh",
    canToggleSections: false,
  },
);

const emit = defineEmits<{
  apply: [sections: FilterSection[]];
}>();

const { t } = useI18n();

// Clave del mapa para una opción concreta dentro de su sección
const getMappingKey = (section: FilterSection, option: FilterOption) =>
  `${section.id}::${option.id}`;

// Construye el mapa de selección a partir de las secciones. Si se pasa
// `activeValue` fuerza todas las opciones a ese valor (seleccionar todo / limpiar).
const buildMapping = (
  sections: FilterSection[],
  activeValue?: boolean,
): FiltersMap => {
  const mapping: FiltersMap = {};
  sections.forEach((section) => {
    section.options.forEach((option) => {
      mapping[getMappingKey(section, option)] = activeValue ?? option.active;
    });
  });
  return mapping;
};

const open = ref(false);
const searchString = ref("");
const filtersMapping = ref<FiltersMap>(buildMapping(props.filterSections));

// Normaliza texto (minúsculas + sin acentos) para búsquedas tolerantes
const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const filteredSections = computed<FilterSection[]>(() => {
  const query = normalize(searchString.value ?? "");
  if (!query) {
    return props.filterSections.filter((section) => section.options.length > 0);
  }
  return props.filterSections
    .map((section) => ({
      ...section,
      options: section.options.filter((option) =>
        normalize(option.label).includes(query),
      ),
    }))
    .filter((section) => section.options.length > 0);
});

const totalFiltersLength = computed(() =>
  props.filterSections.reduce(
    (count, section) => count + section.options.length,
    0,
  ),
);

// Nº de filtros aplicados actualmente (según las props, no el estado interno)
const filtersApplied = computed(() =>
  props.filterSections.reduce(
    (count, section) =>
      count + section.options.filter((option) => option.active).length,
    0,
  ),
);

// Nº de opciones seleccionadas en el estado interno (antes de aplicar)
const internalFiltersApplied = computed(
  () => Object.values(filtersMapping.value).filter(Boolean).length,
);

const allFiltersSelected = computed(
  () =>
    totalFiltersLength.value > 0 &&
    totalFiltersLength.value === filtersApplied.value,
);

const showBadge = computed(() => {
  if (allFiltersSelected.value) return false;
  if (!filtersApplied.value && !!props.noneFiltersLabel) return false;
  return filtersApplied.value > 0;
});

// Estado tri-estado de cada sección para el checkbox "seleccionar sección"
const sectionsToggleStatus = computed<Record<string, "none" | "some" | "all">>(
  () => {
    const status: Record<string, "none" | "some" | "all"> = {};
    props.filterSections.forEach((section) => {
      const selected = section.options.filter(
        (option) => filtersMapping.value[getMappingKey(section, option)],
      ).length;
      status[section.id] =
        selected === 0
          ? "none"
          : selected === section.options.length
            ? "all"
            : "some";
    });
    return status;
  },
);

// Al abrir, sincronizamos el estado interno con las props; al cerrar limpiamos búsqueda
watch(open, (isOpen) => {
  if (isOpen) {
    filtersMapping.value = buildMapping(props.filterSections);
  } else {
    searchString.value = "";
  }
});

// Si cambian las secciones y el menú está cerrado, reconstruimos el mapa
watch(
  () => props.filterSections,
  () => {
    if (!open.value) filtersMapping.value = buildMapping(props.filterSections);
  },
);

const toggleAll = () => {
  filtersMapping.value = buildMapping(
    props.filterSections,
    !internalFiltersApplied.value,
  );
};

const toggleSection = (section: FilterSection, active: boolean | null) => {
  const next = { ...filtersMapping.value };
  section.options.forEach((option) => {
    next[getMappingKey(section, option)] = active ?? false;
  });
  filtersMapping.value = next;
};

// Marca/desmarca una opción. En secciones singleSelect se comporta como radio:
// activar una desactiva el resto de la sección.
const onOptionToggle = (
  section: FilterSection,
  option: FilterOption,
  value: boolean,
) => {
  const next = { ...filtersMapping.value };
  if (section.singleSelect && value) {
    section.options.forEach((other) => {
      next[getMappingKey(section, other)] = false;
    });
  }
  next[getMappingKey(section, option)] = value;
  filtersMapping.value = next;
};

const apply = () => {
  // Los cambios del menú no se propagan hasta pulsar "Aplicar"
  const appliedSections = props.filterSections.map((section) => ({
    ...section,
    options: section.options.map((option) => ({
      ...option,
      active:
        filtersMapping.value[getMappingKey(section, option)] ?? option.active,
    })),
  }));
  emit("apply", appliedSections);
  open.value = false;
};
</script>

<style scoped>
/* Reduce la altura interna del checkbox de Vuetify para un menú compacto */
:deep(.filter-checkbox .v-selection-control) {
  min-height: unset;
}
:deep(.filter-checkbox .v-input__control) {
  min-height: unset;
}
</style>

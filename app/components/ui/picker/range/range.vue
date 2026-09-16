<template>
  <!-- `eager` monta el picker anidado aunque el menú esté cerrado, para que
       v-calendar dispare sus hooks y funcione al abrir por primera vez. -->
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    location="bottom start"
    eager
  >
    <template #activator="{ props: menuProps }">
      <!-- Activador por defecto: un botón. Sustituible vía slot `activator`. -->
      <slot
        name="activator"
        v-bind="{ start, end, label: selectedRangeLabel, props: menuProps }"
      >
        <v-btn
          :height="40"
          color="white"
          :disabled="disabled"
          v-bind="menuProps"
        >
          <v-icon start icon="mdi-calendar-range" />
          <span>{{ selectedRangeLabel }}</span>
          <v-icon end :icon="open ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
        </v-btn>
      </slot>
    </template>

    <div
      class="mt-1 rounded-lg border bg-white p-2 shadow-lg"
      :class="wrapperClass"
    >
      <slot name="prepend" v-bind="{ start, end }" />
      <PickerRangeBase
        v-model="range"
        :min-date="minDate"
        :max-date="maxDate"
        :max-range="maxRange"
        :columns="columns"
        :first-day-of-week="firstDayOfWeek"
        @update-range-selection="emit('updateRangeSelection', $event)"
      />
      <slot name="append" v-bind="{ start, end, close }" />
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { endOfDay, format, startOfDay } from "date-fns";
import PickerRangeBase from "./base.vue";
import type { DateRange } from "../models/date-picker.models";

interface Props {
  minDate?: Date | null;
  maxDate?: Date | null;
  maxRange?: number | null;
  columns?: number;
  firstDayOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  disabled?: boolean;
  /** Cierra el menú automáticamente al completar la selección del rango. */
  autoClose?: boolean;
  /** Texto del botón cuando no hay rango seleccionado. */
  placeholder?: string;
  /** Clases extra del panel desplegable. */
  wrapperClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  minDate: null,
  maxDate: null,
  maxRange: null,
  columns: 2,
  firstDayOfWeek: 2,
  disabled: false,
  autoClose: true,
  placeholder: "—",
  wrapperClass: "",
});

const emit = defineEmits<{
  updateRangeSelection: [{ isFirstSelection: boolean; date: Date }];
}>();

const range = defineModel<DateRange | null>({ default: null });

const open = ref(false);

// Aseguramos instancias Date (el valor podría llegar como string desde el padre).
const start = computed(() =>
  range.value?.start ? startOfDay(new Date(range.value.start)) : null,
);
const end = computed(() =>
  range.value?.end ? endOfDay(new Date(range.value.end)) : null,
);

const selectedRangeLabel = computed(() => {
  if (!start.value && !end.value) return props.placeholder;
  const from = start.value ? format(start.value, "dd/MM/yyyy") : "…";
  const to = end.value ? format(end.value, "dd/MM/yyyy") : "…";
  return `${from} → ${to}`;
});

const close = () => {
  open.value = false;
};

// Cierra el menú al completar el rango (ambos extremos) si autoClose está activo.
watch(range, (value) => {
  if (props.autoClose && value?.start && value?.end) close();
});
</script>

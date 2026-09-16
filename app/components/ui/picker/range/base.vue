<template>
  <!-- v-calendar accede a `window` en el setup → solo cliente. -->
  <ClientOnly>
    <DatePicker
      ref="datePickerRef"
      :model-value="calendarValue"
      :locale="locale"
      :columns="columns"
      is-range
      color="green"
      :min-date="effectiveMinDate ?? undefined"
      :max-date="effectiveMaxDate ?? undefined"
      :first-day-of-week="firstDayOfWeek"
      class="border-none"
      @update:model-value="setRange"
      @dayclick="onDayClick"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { addDays, differenceInDays, endOfDay, startOfDay } from "date-fns";
import { DatePicker } from "v-calendar";
import type { CalendarDay, DateRange } from "../models/date-picker.models";

interface Props {
  /** Fecha mínima seleccionable. */
  minDate?: Date | null;
  /** Fecha máxima seleccionable. */
  maxDate?: Date | null;
  /** Nº máximo de días que puede abarcar el rango (drag dinámico). */
  maxRange?: number | null;
  /** Nº de meses visibles en paralelo. */
  columns?: number;
  /** Primer día de semana en formato v-calendar: 1 = domingo … 7 = sábado. */
  firstDayOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

const props = withDefaults(defineProps<Props>(), {
  minDate: null,
  maxDate: null,
  maxRange: null,
  columns: 2,
  // 2 = lunes (por defecto).
  firstDayOfWeek: 2,
});

/** Emitido al confirmar el arranque/fin de una selección (opcional). */
const emit = defineEmits<{
  updateRangeSelection: [{ isFirstSelection: boolean; date: Date }];
}>();

const range = defineModel<DateRange | null>({ default: null });

const { locale } = useI18n();

// v-calendar solo acepta un rango con ambos extremos como Date; mientras el
// rango está a medias (solo start) no le pasamos valor controlado.
const calendarValue = computed(() =>
  range.value?.start && range.value?.end
    ? { start: range.value.start, end: range.value.end }
    : undefined,
);

const datePickerRef = ref<{ move?: (date: Date) => void } | null>(null);
const isStartDate = ref(false);
const dragStartDate = ref<Date | null>(null);

// Con maxRange activo, al fijar el primer día limitamos dinámicamente el rango
// seleccionable a ±maxRange días alrededor de ese día.
const effectiveMinDate = computed<Date | null>(() => {
  if (props.maxRange && dragStartDate.value) {
    const dynamicMin = startOfDay(addDays(dragStartDate.value, -props.maxRange));
    return props.minDate && props.minDate > dynamicMin
      ? props.minDate
      : dynamicMin;
  }
  return props.minDate;
});

const effectiveMaxDate = computed<Date | null>(() => {
  if (props.maxRange && dragStartDate.value) {
    const dynamicMax = endOfDay(addDays(dragStartDate.value, props.maxRange));
    return props.maxDate && props.maxDate < dynamicMax
      ? props.maxDate
      : dynamicMax;
  }
  return props.maxDate;
});

/**
 * Normaliza el rango a instancias Date y lo recorta a los límites min/max.
 * Esto impide seleccionar (o forzar desde el padre) fechas fuera de rango.
 */
const getSafeRange = (value: DateRange): DateRange => {
  const safe: DateRange = {
    start: value.start ? startOfDay(new Date(value.start)) : null,
    end: value.end ? endOfDay(new Date(value.end)) : null,
  };

  if (
    safe.start &&
    props.minDate &&
    differenceInDays(safe.start, props.minDate) < 0
  ) {
    safe.start = props.minDate;
  }
  if (
    safe.end &&
    props.maxDate &&
    differenceInDays(safe.end, props.maxDate) > 0
  ) {
    safe.end = props.maxDate;
  }

  return safe;
};

/** Fija el rango actual y notifica al padre solo si ha cambiado. */
const setRange = (value: DateRange | null) => {
  if (!value) {
    range.value = null;
    return;
  }

  const safe = getSafeRange(value);
  if (
    safe.start?.getTime() !== range.value?.start?.getTime() ||
    safe.end?.getTime() !== range.value?.end?.getTime()
  ) {
    range.value = safe;
  }
};

/**
 * Mueve la vista del calendario al rango indicado. Necesario cuando el rango
 * cambia desde el padre (p. ej. atajos de preset), porque v-calendar no reposiciona
 * la vista automáticamente.
 */
const moveCalendarToRange = (value: DateRange | null) => {
  if (value?.start && datePickerRef.value?.move) {
    datePickerRef.value.move(value.start);
  }
};

const onDayClick = (day: CalendarDay) => {
  if (props.maxRange) {
    dragStartDate.value = dragStartDate.value ? null : day.date;
  }

  isStartDate.value = !isStartDate.value;
  emit("updateRangeSelection", {
    isFirstSelection: isStartDate.value,
    date: day.date,
  });
};

// Cuando el valor cambia en el padre, sincronizamos el estado interno y
// reposicionamos la vista del calendario.
watch(
  range,
  (value) => {
    dragStartDate.value = null;
    moveCalendarToRange(value);
  },
  { immediate: true },
);
</script>

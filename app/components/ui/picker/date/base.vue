<template>
  <!-- v-calendar accede a `window` en el setup → solo cliente. -->
  <ClientOnly>
    <DatePicker
      ref="datePickerRef"
      :model-value="model ?? undefined"
      :locale="locale"
      :columns="columns"
      color="green"
      :min-date="minDate ?? undefined"
      :max-date="maxDate ?? undefined"
      :first-day-of-week="firstDayOfWeek"
      class="border-none"
      @update:model-value="onUpdate"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { DatePicker } from "v-calendar";

interface Props {
  /** Fecha mínima seleccionable. */
  minDate?: Date | null;
  /** Fecha máxima seleccionable. */
  maxDate?: Date | null;
  /** Nº de meses visibles en paralelo. */
  columns?: number;
  /** Primer día de semana en formato v-calendar: 1 = domingo … 7 = sábado. */
  firstDayOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

withDefaults(defineProps<Props>(), {
  minDate: null,
  maxDate: null,
  columns: 1,
  // 2 = lunes (por defecto).
  firstDayOfWeek: 2,
});

const model = defineModel<Date | null>({ default: null });

const { locale } = useI18n();

const datePickerRef = ref<{ move?: (date: Date) => void } | null>(null);

// v-calendar emite DatePickerModel; en modo fecha única siempre es un Date o null.
const onUpdate = (value: unknown) => {
  model.value = value instanceof Date ? value : null;
};

const moveCalendarTo = (date: Date | null) => {
  if (date && datePickerRef.value?.move) {
    datePickerRef.value.move(date);
  }
};

// Reposiciona la vista cuando la fecha cambia desde el padre.
watch(model, (value) => moveCalendarTo(value), { immediate: true });
</script>

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
        v-bind="{ date: model, label: selectedDateLabel, props: menuProps }"
      >
        <v-btn variant="outlined" :disabled="disabled" v-bind="menuProps">
          <v-icon start icon="mdi-calendar" />
          <span>{{ selectedDateLabel }}</span>
          <v-icon end :icon="open ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
        </v-btn>
      </slot>
    </template>

    <div
      class="mt-1 rounded-lg border bg-white p-2 shadow-lg"
      :class="wrapperClass"
    >
      <slot name="prepend" v-bind="{ date: model }" />
      <PickerDateBase
        v-model="model"
        :min-date="minDate"
        :max-date="maxDate"
        :columns="columns"
        :first-day-of-week="firstDayOfWeek"
      />
      <slot name="append" v-bind="{ date: model, close }" />
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import PickerDateBase from "./base.vue";

interface Props {
  minDate?: Date | null;
  maxDate?: Date | null;
  columns?: number;
  firstDayOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  disabled?: boolean;
  /** Cierra el menú automáticamente al elegir una fecha. */
  autoClose?: boolean;
  /** Texto del botón cuando no hay fecha seleccionada. */
  placeholder?: string;
  /** Clases extra del panel desplegable. */
  wrapperClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  minDate: null,
  maxDate: null,
  columns: 1,
  firstDayOfWeek: 2,
  disabled: false,
  autoClose: true,
  placeholder: "—",
  wrapperClass: "",
});

const model = defineModel<Date | null>({ default: null });

const open = ref(false);

const selectedDateLabel = computed(() =>
  model.value ? format(model.value, "dd/MM/yyyy") : props.placeholder,
);

const close = () => {
  open.value = false;
};

// Cierra el menú al elegir una fecha si autoClose está activo.
watch(model, (value) => {
  if (props.autoClose && value) close();
});
</script>

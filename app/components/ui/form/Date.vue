<template>
  <div>
    <v-text-field
      v-model="model"
      :label="props.label"
      type="date"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="mdi-calendar"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string;
}

const props = defineProps<Props>();

// El input nativo type="date" emite un string "YYYY-MM-DD" (no un Date).
const model = defineModel<string | null>();
</script>

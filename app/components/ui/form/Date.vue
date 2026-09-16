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

const model = defineModel<Date | null>();
</script>

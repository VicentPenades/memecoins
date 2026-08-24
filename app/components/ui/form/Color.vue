<template>
  <div>
    <v-text-field
      v-model="model"
      :label="props.label"
      type="color"
      variant="outlined"
      density="comfortable"
    />
  </div>
</template>

<script setup lang="ts">
interface FormColorProps {
  label?: string;
}

const props = defineProps<FormColorProps>();

const model = defineModel<string | null>();
</script>

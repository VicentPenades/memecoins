<template>
  <div>
    <v-select
      v-model="model"
      :items="props.items"
      :label="props.label"
      :prepend-inner-icon="props.prependInnerIcon"
      :disabled="props.disabled"
      :clearable="props.clearable"
      :multiple="props.multiple"
      :chips="props.multiple"
      variant="outlined"
      density="comfortable"
    />
  </div>
</template>

<script setup lang="ts">
interface FormSelectProps {
  label?: string;
  items: Array<{ title: string; value: any }>;
  prependInnerIcon?: string;
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
}
const props = defineProps<FormSelectProps>();

const model = defineModel<any>();
</script>

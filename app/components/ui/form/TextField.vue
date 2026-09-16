<template>
  <div>
    <v-text-field
      v-model="model"
      :label="props.label"
      :prepend-inner-icon="props.prependInnerIcon"
      :placeholder="props.placeholder"
      :type="props.type"
      :rules="props.rules"
      :hide-details="props.hideDetails"
      :clearable="props.clearable"
      variant="outlined"
      density="comfortable"
      bg-color="white"
    />
  </div>
</template>

<script setup lang="ts">
interface TextFieldProps {
  label?: string;
  placeholder?: string;
  prependInnerIcon?: string;
  clearable?: boolean;
  disabled?: boolean;
  type?: "text" | "number" | "email" | "password";
  rules?: Array<(value: string | number | null) => boolean | string> | any;
  hideDetails?: boolean;
}

const props = withDefaults(defineProps<TextFieldProps>(), {
  type: "text",
  clearable: false,
  hideDetails: true,
  disabled: false,
});

const model = defineModel<string | number | null>();
</script>

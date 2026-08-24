<template>
  <div>
    <v-textarea
      v-model="model"
      :label="props.label"
      :prepend-inner-icon="props.prependInnerIcon"
      :placeholder="props.placeholder"
      rows="3"
      auto-grow
      variant="outlined"
      density="comfortable"
    />
  </div>
</template>

<script setup lang="ts">
interface TextAreaProps {
  label?: string;
  placeholder?: string;
  prependInnerIcon?: string;
}

const props = withDefaults(defineProps<TextAreaProps>(), {});

const model = defineModel<string | null>();
</script>

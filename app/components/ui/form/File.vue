<template>
  <div
    class="form-file"
    @drag.stop.prevent
    @dragstart.stop.prevent
    @dragover.stop.prevent="onDragIn"
    @dragenter.stop.prevent="onDragIn"
    @dragend.stop.prevent="onDragOut"
    @dragleave.stop.prevent="onDragOut"
    @drop.stop.prevent="
      onDragOut();
      onChange($event);
    "
  >
    <slot name="label" v-bind="{ name, remove }">
      <label
        v-if="canSelectFromComputerIfAny || !files.length"
        :for="name"
        class="form-file--label flex items-center hover:bg-gray-200 text-sm justify-center w-full p-6 relative cursor-pointer"
        :class="emptyAreaClass"
      >
        CLICK TO SELECT
      </label>
    </slot>

    <input
      :id="name"
      ref="input"
      :multiple="multiple"
      :accept="mimeRules.length ? mimeRules.join(',') : '*/*'"
      type="file"
      :name="name"
      class="hidden"
      @change="onChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

// Props
interface Props {
  modelValue?: File[];
  canSelectFromComputerIfAny?: boolean;
  name: string;
  mimes?: string[];
  multiple?: boolean;
  emptyAreaClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  canSelectFromComputerIfAny: true,
  mimes: () => [],
  multiple: false,
  emptyAreaClass: "",
});

// Emits
interface Emits {
  (e: "update:modelValue", value: File[]): void;
}

const emit = defineEmits<Emits>();

// Reactive variables
const files = ref<File[]>(props.modelValue);
const mimeRules = ref<string[]>(props.mimes);
const input = ref<HTMLInputElement>();
// Watchers
watch(
  () => props.mimes,
  (value) => {
    mimeRules.value = value;
  },
);

watch(
  () => props.modelValue,
  (value) => {
    if (input.value) {
      input.value.value = "";
    }
    files.value = Array.isArray(value) ? value : value ? [value] : [];
  },
);

// Methods
/**
 * Validate the file selected and trigger the input.
 */
const onChange = async (
  e: InputEvent | DragEvent | (Event & { dataTransfer?: DataTransfer }),
) => {
  console.log("onChange", e);
  const files: File[] = Array.from(
    (e.target as HTMLInputElement)?.files || e.dataTransfer?.files || [],
  );
  const validFiles: File[] = [];

  // We wont let pass any file not matching our mimetype validation
  for (const file of files) {
    const validation = { valid: true };

    if (!validation.valid) continue;

    validFiles.push(file);
  }

  fireInput(validFiles);
};

/**
 * Remove the selected file and reset the component.
 */
const remove = (index: number) => {
  files.value.splice(index, 1);
  if (input.value) {
    input.value.value = "";
  }
  fireInput(files.value);
};

const fireInput = (fileArray: File[]) => {
  emit("update:modelValue", fileArray);
};

/**
 * Add dragover class on drag something in.
 */
const onDragIn = () => {
  // Note: Using template ref access pattern for Vue 3
};

/**
 * Remove dragover class.
 */
const onDragOut = () => {
  // Note: Using template ref access pattern for Vue 3
};
</script>

<style lang="scss">
.form-file {
  @apply relative;

  &--label {
    @apply rounded-lg border-2 border-dashed;
    transition: all 0.35s;

    span {
      transition: inherit;
    }
  }

  &--dragover {
    .form-file--label {
      @apply border-blue-500 bg-gray-300;

      span {
        transform: scale(1.1);
      }
    }
  }
}
</style>

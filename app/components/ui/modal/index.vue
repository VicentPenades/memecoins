<template>
  <v-dialog v-model="isOpen" class="max-w-4xl">
    <div class="bg-white rounded-lg">
      <!-- HEADER -->
      <div class="text-lg font-semibold p-4 border-b">
        {{ title }}
      </div>
      <!-- BODY -->
      <div class="max-h-96 overflow-y-auto p-4">
        <slot />
      </div>
      <!-- ACTIONS -->
      <div class="p-4 border-t flex justify-end gap-2">
        <v-btn color="neutral" variant="outlined" @click="closeModal">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          :disabled="confirmDisabled"
          @click="$emit('confirm')"
          color="primary"
        >
          {{ $t('common.confirm') }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  // Deshabilita el botón de confirmar (p. ej. formulario incompleto).
  confirmDisabled?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Modal",
  confirmDisabled: false,
});

const emit = defineEmits<Emits>();

// Computed para manejar el v-model
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const closeModal = () => {
  emit("update:modelValue", false);
};
</script>

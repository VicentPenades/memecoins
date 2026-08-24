<template>
  <v-dialog v-model="isOpen" :max-width="maxWidth">
    <div class="bg-white rounded-xl">
      <!-- HEADER -->
      <div class="text-lg font-semibold p-5 border-b">
        <slot name="title">{{ title }}</slot>
      </div>
      <!-- BODY -->
      <div class="max-h-96 overflow-y-auto p-5">
        <slot />
      </div>
      <!-- ACTIONS -->
      <div class="p-5 border-t flex justify-end gap-2">
        <slot name="footer">
          <v-btn variant="outlined" @click="closeModal">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn color="primary" @click="$emit('confirm')">
            {{ $t("common.confirm") }}
          </v-btn>
        </slot>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  maxWidth?: string | number;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  maxWidth: "600",
});

const emit = defineEmits<Emits>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const closeModal = () => {
  emit("update:modelValue", false);
};
</script>

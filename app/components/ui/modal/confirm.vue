<template>
  <UiModalBase v-model="isOpen" :title="title" max-width="480">
    <!-- Icono decorativo -->
    <div class="mb-4 flex justify-center">
      <UiIconBackground
        :icon-id="config.icon"
        :icon-size="24"
        :background-size="64"
        :icon-color="config.iconColor"
        :background-color="config.iconBgColor"
      />
    </div>

    <!-- Descripción -->
    <div class="text-sm text-[var(--mc-bw-grey-darken-1)] text-center">
      <slot name="description">
        <p v-if="description">{{ description }}</p>
      </slot>
    </div>

    <!-- Contenido extra -->
    <slot name="extra" />

    <!-- Acciones -->
    <template #footer>
      <div class="flex w-full justify-between">
        <v-btn variant="outlined" @click="onCancel">
          {{ $t("common.cancel") }}
        </v-btn>
        <v-btn :color="config.confirmColor" @click="onConfirm">
          {{ confirmLabel }}
        </v-btn>
      </div>
    </template>
  </UiModalBase>
</template>

<script setup lang="ts">
type ActionVariant = "delete" | "warning" | "info";

const VARIANT_CONFIGS: Record<
  ActionVariant,
  { icon: string; iconColor: string; iconBgColor: string; confirmColor: string }
> = {
  delete: {
    icon: "mdi-delete-outline",
    iconColor: "#dc2626",
    iconBgColor: "#fef2f2",
    confirmColor: "error",
  },
  warning: {
    icon: "mdi-alert-outline",
    iconColor: "#d97706",
    iconBgColor: "#fffbeb",
    confirmColor: "error",
  },
  info: {
    icon: "mdi-information-outline",
    iconColor: "#2563eb",
    iconBgColor: "#eff6ff",
    confirmColor: "primary",
  },
};

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    variant: ActionVariant;
    confirmLabel: string;
    description?: string;
  }>(),
  {},
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
  cancel: [];
}>();

const config = computed(() => VARIANT_CONFIGS[props.variant]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const onConfirm = () => {
  emit("confirm");
  isOpen.value = false;
};

const onCancel = () => {
  emit("cancel");
  isOpen.value = false;
};
</script>

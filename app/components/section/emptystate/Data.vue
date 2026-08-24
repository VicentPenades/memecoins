<template>
  <div
    class="rounded-xl flex justify-center items-center"
    :style="{
      height: SIZE_MAP[props.size],
    }"
  >
    <div class="flex flex-col items-center justify-center gap-5">
      <UiIconWithBackground
        :icon-id="props.iconId"
        :background-size="64"
        :icon-size="40"
        :icon-color="VARIANT_CONFIG[props.variant].iconColor"
        :background-color="VARIANT_CONFIG[props.variant].iconBgColor"
      />

      <div class="flex flex-col items-center text-center max-w-md">
        <span class="text-lg font-bold">{{ props.title }}</span>
        <span
          v-if="props.description"
          class="text-base text-[var(--mc-bw-grey-darken-1)]"
          >{{ props.description }}</span
        >
      </div>
      <v-btn
        v-if="props.actionButtonText"
        variant="outlined"
        @click="$emit('click')"
      >
        {{ props.actionButtonText }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
type Size = "s" | "m";
type Variant = "primary" | "secondary";

const SIZE_MAP: Record<Size, string> = {
  s: "226px",
  m: "400px",
};

const VARIANT_CONFIG: Record<
  Variant,
  { bg: string; iconColor: string; iconBgColor: string }
> = {
  primary: {
    bg: "var(--empty-state-bg)",
    iconColor: "var(--empty-state-icon-color)",
    iconBgColor: "var(--empty-state-icon-bg)",
  },
  secondary: {
    bg: "var(--empty-state-secondary-bg)",
    iconColor: "var(--empty-state-secondary-icon-color)",
    iconBgColor: "var(--empty-state-secondary-icon-bg)",
  },
};

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    actionButtonText?: string;
    size?: Size;
    variant?: Variant;
    iconId?: string;
  }>(),
  {
    size: "s",
    variant: "primary",
    iconId: "fa fa-solid fa-box-open",
  },
);

defineEmits<{
  click: [];
}>();
</script>

<template>
  <div class="rounded-lg p-4" :class="colorClass">
    <div class="text-xs text-[var(--mc-bw-grey-darken-1)] mb-1">
      {{ label }}
    </div>
    <div v-if="value !== undefined" class="text-sm font-bold">
      {{ value }}
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

export type StatCardColor =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "error"
  | "warning"
  | "neutral";

const props = withDefaults(
  defineProps<{
    label: string;
    value?: string | number;
    color?: StatCardColor;
  }>(),
  {
    color: "neutral",
  },
);

const COLOR_MAP: Record<string, string> = {
  neutral: "border border-gray-200",
  primary: "bg-[var(--primary)]/10",
  secondary: "bg-[var(--secondary)]/10",
  info: "bg-[var(--info)]/10",
  success: "bg-[var(--success)]/10",
  error: "bg-[var(--error)]/10",
  warning: "bg-[var(--warning)]/10",
};

const colorClass = computed(() => COLOR_MAP[props.color] ?? "");
</script>

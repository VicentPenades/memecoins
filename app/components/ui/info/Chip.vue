<template>
  <span class="vic-chip" :class="[colorClass, sizeClass]">
    <slot />
  </span>
</template>

<script setup lang="ts">
export type ChipColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "accent"
  | "neutral";

export type ChipSize = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    color?: ChipColor;
    size?: ChipSize;
  }>(),
  {
    color: "neutral",
    size: "md",
  },
);

const COLOR_MAP: Record<ChipColor, string> = {
  primary: "chip--primary",
  secondary: "chip--secondary",
  success: "chip--success",
  info: "chip--info",
  warning: "chip--warning",
  error: "chip--error",
  accent: "chip--accent",
  neutral: "chip--neutral",
};

const SIZE_MAP: Record<ChipSize, string> = {
  sm: "chip--sm",
  md: "chip--md",
  lg: "chip--lg",
};

const colorClass = computed(() => COLOR_MAP[props.color]);
const sizeClass = computed(() => SIZE_MAP[props.size]);
</script>

<style scoped>
.vic-chip {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
}

/* Sizes */
.chip--sm {
  font-size: 10px;
  padding: 2px 6px;
  height: 20px;
}
.chip--md {
  font-size: 12px;
  padding: 4px 10px;
  height: 28px;
}
.chip--lg {
  font-size: 14px;
  padding: 6px 14px;
  height: 36px;
}

/* Colors */
.chip--primary {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: color-mix(in srgb, var(--primary) 100%, black 30%);
}
.chip--secondary {
  background: color-mix(in srgb, var(--secondary) 15%, transparent);
  color: color-mix(in srgb, var(--secondary) 100%, black 30%);
}
.chip--success {
  background: color-mix(in srgb, var(--success) 15%, transparent);
  color: color-mix(in srgb, var(--success) 100%, black 30%);
}
.chip--info {
  background: color-mix(in srgb, var(--info) 15%, transparent);
  color: color-mix(in srgb, var(--info) 100%, black 30%);
}
.chip--warning {
  background: color-mix(in srgb, var(--warning) 15%, transparent);
  color: color-mix(in srgb, var(--warning) 100%, black 30%);
}
.chip--error {
  background: color-mix(in srgb, var(--error) 15%, transparent);
  color: color-mix(in srgb, var(--error) 100%, black 30%);
}
.chip--accent {
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: color-mix(in srgb, var(--accent) 100%, black 30%);
}
.chip--neutral {
  background: #f0f0f0;
  color: var(--mc-bw-text-primary);
}
</style>

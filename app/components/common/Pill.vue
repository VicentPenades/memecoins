<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "hero" | "tag";
  }>(),
  {
    variant: "tag",
  },
);
</script>

<template>
  <span
    :class="[
      'inline-block px-4 py-1.5 rounded-full text-xs uppercase border',
      variant === 'hero'
        ? 'font-black tracking-[0.2em] mb-4 border-amber-500/30 bg-amber-500/10 text-amber-400'
        : 'font-bold tracking-wider',
    ]"
    :style="
      variant === 'tag'
        ? {
            color: 'var(--primary)',
            borderColor:
              'color-mix(in srgb, var(--primary) 30%, transparent)',
            backgroundColor:
              'color-mix(in srgb, var(--primary) 10%, transparent)',
          }
        : undefined
    "
  >
    <slot />
  </span>
</template>

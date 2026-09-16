<template>
  <span
    class="flex h-14 w-20 items-center justify-center rounded-lg text-lg"
    style="
      color: var(--text-muted);
      background-color: color-mix(
        in srgb,
        var(--primary) 8%,
        transparent
      );
    "
    aria-label="Image unavailable"
  >
    {{ emoji || "—" }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  emoji?: string;
}>();
</script>

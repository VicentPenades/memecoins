<script setup lang="ts">
withDefaults(
  defineProps<{
    href: string;
    target?: string;
    rel?: string;
  }>(),
  {
    target: "_blank",
    rel: "noopener",
  },
);
</script>

<template>
  <a
    :href="href"
    :target="target"
    :rel="rel"
    class="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-black text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:scale-105 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-200"
  >
    <slot />
  </a>
</template>

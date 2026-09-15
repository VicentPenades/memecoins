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
    class="btn inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-black hover:scale-105 transition-all duration-200"
  >
    <slot />
  </a>
</template>

<style scoped>
/* Los colores se consumen siempre desde variables.css, nunca de Tailwind. */
.btn {
  color: var(--text-inverse);
  background: linear-gradient(to right, var(--primary-light), var(--primary));
  box-shadow: 0 0 30px color-mix(in srgb, var(--primary) 40%, transparent);
}
</style>

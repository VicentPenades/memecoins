<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    height?: string;
    backgroundColor?: string;
  }>(),
  {
    height: "calc(80vh - 113px)",
    backgroundColor: "transparent",
  },
);
</script>

<template>
  <section
    class="flex flex-col justify-center items-center scroll-mt-20 relative px-2 md:px-20 py-30 overflow-hidden"
    :style="{
      minHeight: height,
      backgroundColor,
    }"
  >
    <CommonSectionHeader v-if="title" :title="title" />
    <div>
      <slot />
    </div>
  </section>
</template>

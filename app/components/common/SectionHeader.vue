<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    headingTag?: "h1" | "h2";
    dividerClass?: string;
  }>(),
  {
    headingTag: "h2",
    dividerClass: "mb-14",
  },
);
</script>

<template>
  <header>
    <component
      :is="headingTag"
      class="text-4xl md:text-5xl font-black mb-4 text-center"
      style="
        color: var(--text-primary);
        text-shadow:
          0 0 20px color-mix(in srgb, var(--primary) 50%, transparent),
          0 0 40px color-mix(in srgb, var(--primary) 20%, transparent);
      "
    >
      {{ title }}
    </component>

    <div
      :class="['w-20 h-1 mx-auto rounded-full', dividerClass]"
      style="background: linear-gradient(90deg, var(--primary), var(--accent))"
    />
  </header>
</template>

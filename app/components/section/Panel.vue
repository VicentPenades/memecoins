<template>
  <div class="w-full">
    <h2 v-if="title && titlePosition === 'out'" class="mb-2 font-bold">
      {{ title }}
    </h2>

    <div class="mc-panel-section p-5" :class="bgColor">
      <h2 v-if="title && titlePosition === 'in'" class="mb-2 font-bold">
        {{ title }}
      </h2>
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type TitledSectionProps = {
  title?: string;
  titlePosition?: "out" | "in";
  bgColor?: "white" | "gray" | "transparent";
};

withDefaults(defineProps<TitledSectionProps>(), {
  title: "",
  titlePosition: "in",
  bgColor: "white",
});
</script>

<style scoped lang="scss">
.mc-panel-section {
  border-radius: 16px;

  &.gray {
    border: 1px solid #ebeeef;
    background: #f5f6f7;
  }

  &.white {
    border: 1px solid #ebeeef;
    background: #ffffff;
  }
}
</style>

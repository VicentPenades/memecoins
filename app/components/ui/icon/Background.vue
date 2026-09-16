<template>
  <div
    class="flex justify-center items-center"
    :style="{
      backgroundColor: props.backgroundColor,
      borderRadius: CONTAINER_SHAPE_VARIANTS[props.shape],
      height: props.backgroundSize + 'px',
      width: props.backgroundSize + 'px',
    }"
  >
    <v-icon :size="props.iconSize" :color="props.iconColor">{{
      props.iconId
    }}</v-icon>
  </div>
</template>

<script lang="ts">
export enum ContainerShape {
  Circle = "circle",
  Square = "square",
  Rounded = "rounded",
}

export const CONTAINER_SHAPE_VARIANTS: Record<ContainerShape, string> = {
  [ContainerShape.Circle]: "100%",
  [ContainerShape.Square]: "0",
  [ContainerShape.Rounded]: `8px`, // pending aproval
};
</script>

<script setup lang="ts">
export type IconWithBackgroundProps = {
  iconId?: string;
  oldIcon?: string;
  shape?: ContainerShape;
  backgroundSize?: number;
  backgroundColor?: string;
  iconSize?: number;
  iconColor?: string;
};

const props = withDefaults(defineProps<IconWithBackgroundProps>(), {
  iconId: undefined,
  oldIcon: undefined,
  shape: ContainerShape.Circle,
  backgroundSize: 48,
  backgroundColor: "grey",
  iconSize: 24,
  iconColor: "black",
});
</script>

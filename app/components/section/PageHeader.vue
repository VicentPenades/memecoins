<template>
  <div class="page-header flex flex-col gap-2 mb-4">
    <div class="flex justify-between">
      <slot name="title">
        <div>
          <div class="flex gap-2 items-center">
            <h1 class="font-bold text-2xl">{{ props.title }}</h1>
            <slot name="title-after" />
            <div v-if="props.subtitle" class="text-sm flex gap-1 subtitle">
              <v-icon v-if="props.subtitleIcon" :size="18">
                {{ props.subtitleIcon }}
              </v-icon>
              <span>{{ props.subtitle }}</span>
            </div>
          </div>

          <div v-if="props.description">{{ props.description }}</div>
        </div>
      </slot>

      <div v-if="$slots['actions-header']">
        <slot name="actions-header" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  subtitleIcon?: string;
  description?: string;
};

const props = defineProps<PageHeaderProps>();
</script>

<style scoped>
.page-header {
  color: var(--mc-bw-text-primary);
}

.subtitle {
  color: var(--mc-bw-grey-darken-1);
}
</style>

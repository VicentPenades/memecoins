<template>
  <span class="d-inline-flex align-center gap-1">
    {{ title }}
    <v-tooltip :text="info" location="top" max-width="260">
      <template #activator="{ props }">
        <v-icon
          v-bind="props"
          size="14"
          class="text-medium-emphasis"
          @click.stop
        >
          mdi-information-outline
        </v-icon>
      </template>
    </v-tooltip>
  </span>
</template>

<script setup lang="ts">
// Cabecera de columna con un icono de info y su tooltip descriptivo.
defineProps<{
  title: string;
  info: string;
}>();
</script>

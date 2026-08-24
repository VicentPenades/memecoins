<template>
  <div class="w-full">
    <h1 v-if="title" class="text-h3 font-weight-bold">{{ title }}</h1>
    <v-tabs
      v-model="activeTab"
      class="mb-4"
      content-class="flex justify-between"
    >
      <div>
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          :text="tab.text"
        >
          <v-icon v-if="tab.icon" start>{{ tab.icon }}</v-icon>
          {{ tab.text }}
        </v-tab>
      </div>
      <div></div>
    </v-tabs>
    <div class="w-full mb-4">
      <slot name="actions" />
    </div>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
      >
        <!-- Contenido por pestaña vía slot (nombre = value); si no se pasa,
             se usa tab.component y, como último recurso, el texto -->
        <slot :name="tab.value">
          <component :is="tab.component" v-if="tab.component" />
          <div v-else>{{ tab.text }}</div>
        </slot>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

export type VicTab = {
  value: string;
  text: string;
  icon?: string;
  component?: Component;
};

defineProps<{
  title?: string;
  tabs: VicTab[];
}>();

const activeTab = defineModel<string>({ default: "" });
</script>

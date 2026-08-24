<template>
  <div class="flex items-center gap-2">
    <template v-for="(network, index) in SOCIAL_NETWORK_LINKS" :key="index">
      <v-tooltip
        v-if="network && network.url"
        :text="network?.name"
        location="top"
      >
        <template #activator="{ props: tooltipProps }">
          <a
            v-bind="tooltipProps"
            :href="network.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center w-8 h-8 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <!-- eslint-disable vue/no-v-html -->
            <span
              class="w-5 h-5 flex items-center"
              :style="{
                color:
                  SOCIAL_NETWORK_COLORS[
                    index as keyof typeof SOCIAL_NETWORK_COLORS
                  ],
              }"
              v-html="
                SOCIAL_NETWORK_ICONS[index as keyof typeof SOCIAL_NETWORK_ICONS]
              "
            />
          </a>
        </template>
      </v-tooltip>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  SOCIAL_NETWORK_LINKS,
  SOCIAL_NETWORK_ICONS,
  SOCIAL_NETWORK_COLORS,
} from "~/app/social.config";
</script>

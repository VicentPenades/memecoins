<template>
  <nav class="flex justify-between items-center gap-2">
    <template v-for="item in MAIN_NAVIGATION" :key="item.to">
      <NuxtLink v-if="!item.beta || debugMode" :to="item.to">
        <v-btn class="rounded-lg" variant="text" :title="$t(item.titleKey)">
          <div class="flex items-center gap-1">
            <v-icon>{{ item.icon }}</v-icon>
            <span class="text-xs font-mono">{{ $t(item.titleKey) }}</span>
            <v-chip
              v-if="item.comingSoon"
              size="x-small"
              color="warning"
              label
              class="ml-1"
            >
              {{ $t("nav.comingSoon") }}
            </v-chip>
          </div>
        </v-btn>
      </NuxtLink>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { MAIN_NAVIGATION } from "~/app/routes.config";
import { isDebugMode } from "~/app/utils/feature-flags";

const debugMode = isDebugMode();
</script>

<template>
  <div class="main-logo">
    <NuxtLink to="/">
      <img src="/favicon.png" alt="Logo" class="h-10 w-10 inline-block mr-2" />
      <span> {{ WEBSITE_CONFIG.NAME }}</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { WEBSITE_CONFIG } from "~/app/web.config";
</script>

<style scoped>
.main-logo {
  font-family: Consolas, monaco, monospace;
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.75rem;
}
.main-logo:hover {
  transform: scale(1.4) rotate(-4deg);
  transition: transform 0.5s;
}
</style>

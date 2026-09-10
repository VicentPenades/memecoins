<script setup lang="ts">
import { COIN } from "~/data/coin";

const year = new Date().getFullYear();
</script>

<template>
  <footer
    class="relative px-6 py-12 text-center border-t"
    style="
      background-color: var(--bg-footer);
      border-color: color-mix(in srgb, var(--primary) 10%, transparent);
    "
  >
    <div class="max-w-2xl mx-auto">
      <img
        v-if="COIN.logo"
        :src="COIN.logo"
        :alt="COIN.name"
        class="w-10 h-10 mx-auto rounded-full mb-4 opacity-40"
      />
      <p
        class="text-sm opacity-40 leading-relaxed mb-4"
        style="color: var(--text-muted)"
      >
        {{ COIN.footer.disclaimer }}
      </p>
      <p class="text-xs opacity-25" style="color: var(--text-muted)">
        © {{ year }} {{ COIN.name }}
      </p>
    </div>
  </footer>
</template>

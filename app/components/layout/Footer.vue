<template>
  <footer
    class="relative px-6 text-center border-t"
    style="
      background-color: var(--bg-footer);
      border-color: color-mix(in srgb, var(--primary) 10%, transparent);
    "
  >
    <div class="max-w-2xl mx-auto py-6 pb-20">
      <img
        v-if="COIN.general.logo"
        :src="COIN.general.logo"
        :alt="COIN.general.name"
        class="w-10 h-10 mx-auto rounded-full mb-4 opacity-40"
      />
      <p
        class="text-sm opacity-40 leading-relaxed mb-4"
        style="color: var(--text-muted)"
      >
        {{ COIN.general.disclaimer }}
      </p>
    </div>

    <!-- Banda de redes fija al fondo del viewport (estilo banda del header) -->
    <div
      class="social-band fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm"
    >
      <nav
        class="flex items-center justify-center gap-4 py-1"
        aria-label="Social links"
      >
        <a
          v-for="social in COIN.community.socials"
          :key="social.platform"
          :href="social.url"
          target="_blank"
          rel="noopener"
          :aria-label="social.label || social.platform"
          class="social-chip flex items-center justify-center w-8 h-8 rounded-xl transition-transform duration-200 hover:scale-110"
        >
          {{ social.icon || "🔗" }}
        </a>
      </nav>
      <p class="text-xs opacity-25" style="color: var(--text-muted)">
        © {{ year }} {{ COIN.general.name }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
/* Los colores se consumen siempre desde variables.css, nunca de Tailwind. */
.social-band {
  background: var(--overlay-dark);
  border-top: 1px solid var(--border-subtle);
}

.social-chip {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: var(--primary);
}
</style>

<script setup lang="ts">
import { COIN } from "~/data/coin";
const year = new Date().getFullYear();
</script>

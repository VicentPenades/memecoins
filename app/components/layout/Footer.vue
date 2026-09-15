<template>
  <footer
    class="relative px-6 pt-12 pb-28 text-center border-t"
    style="
      background-color: var(--bg-footer);
      border-color: color-mix(in srgb, var(--primary) 10%, transparent);
    "
  >
    <div class="max-w-2xl mx-auto">
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
        {{ COIN.general.footer_disclaimer }}
      </p>
      <p class="text-xs opacity-25" style="color: var(--text-muted)">
        © {{ year }} {{ COIN.general.name }}
      </p>
    </div>

    <!-- Banda de redes fija al fondo del viewport (estilo banda del header) -->
    <div
      class="social-band fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm"
    >
      <nav
        class="flex items-center justify-center gap-4 py-3"
        aria-label="Social links"
      >
        <a
          v-for="social in socialLinks"
          :key="social.platform"
          :href="social.url"
          target="_blank"
          rel="noopener"
          :aria-label="social.label || social.platform"
          class="social-chip flex items-center justify-center w-10 h-10 rounded-xl text-xl transition-transform duration-200 hover:scale-110"
        >
          {{ platformIcons[social.platform] || "🔗" }}
        </a>
      </nav>
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

// Icono por plataforma (por ahora solo Twitter; ampliar aquí al añadir redes)
const platformIcons: Record<string, string> = {
  twitter: "𝕏",
};

// Redes que se muestran en la banda inferior. De momento solo Twitter:
// extensible cambiando el filtro cuando se quieran más.
const socialLinks = COIN.community.socials.filter(
  (social) => social.platform === "twitter",
);
</script>

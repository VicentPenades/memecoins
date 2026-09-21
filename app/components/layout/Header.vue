<script setup lang="ts">
import { COIN } from "~/data/coin";

// Navegación principal del header
const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Hall of Fame", href: "#cat-coins" },
  { label: "Community", href: "#community" },
];
</script>

<template>
  <section
    class="header sticky top-0 z-50 flex items-center justify-center overflow-hidden px-6 pt-11 pb-3 backdrop-blur-md"
  >
    <!-- Ticker tape -->
    <div
      class="ticker-tape absolute top-0 left-0 right-0 overflow-hidden py-2 backdrop-blur-sm"
    >
      <div class="animate-ticker whitespace-nowrap flex gap-8">
        <span
          v-for="i in 20"
          :key="i"
          class="ticker-item text-xs font-bold tracking-widest uppercase"
        >
          {{ COIN.general.ticker }} TO THE MOON 🚀 &nbsp;&nbsp;•&nbsp;&nbsp;
        </span>
      </div>
    </div>

    <nav
      class="nav-scroll relative z-10 w-full max-w-5xl overflow-x-auto overflow-y-hidden"
      aria-label="Main navigation"
    >
      <ul class="flex min-w-max items-center justify-center gap-2 sm:gap-6">
        <li v-for="item in NAV_ITEMS" :key="item.href">
          <a
            :href="item.href"
            class="nav-link rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>
  </section>
</template>

<style scoped>
/* Los colores se consumen siempre desde variables.css, nunca de Tailwind. */
.header {
  background: var(--bg-gradient);
}

.ticker-tape {
  background: var(--overlay-dark);
  border-bottom: 1px solid var(--border-subtle);
}

.ticker-item {
  color: var(--primary);
  opacity: 0.4;
}

.nav-link {
  color: var(--text-muted);
  transition: background-color 0.2s;
}

.nav-link:hover {
  background: var(--overlay-light);
}

.nav-scroll {
  scrollbar-width: none;
}

.nav-scroll::-webkit-scrollbar {
  display: none;
}
</style>

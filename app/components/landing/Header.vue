<script setup lang="ts">
import { COIN } from "~/data/coin";
</script>
<template>
  <section
    class="sticky top-0 z-50 flex items-center justify-center overflow-hidden px-6 pt-11 pb-3 backdrop-blur-md"
    style="background: var(--bg-gradient)"
  >
    <!-- Ticker tape -->
    <div
      class="absolute top-0 left-0 right-0 overflow-hidden py-2 bg-black/40 backdrop-blur-sm border-b border-white/5"
    >
      <div class="animate-ticker whitespace-nowrap flex gap-8">
        <span
          v-for="i in 20"
          :key="i"
          class="text-xs font-bold tracking-widest uppercase opacity-40"
          style="color: var(--primary)"
        >
          {{ COIN.ticker }} TO THE MOON 🚀 &nbsp;&nbsp;•&nbsp;&nbsp;
        </span>
      </div>
    </div>

    <nav
      class="relative z-10 w-full max-w-5xl overflow-x-auto"
      aria-label="Main navigation"
    >
      <ul class="flex min-w-max items-center justify-center gap-2 sm:gap-6">
        <li
          v-for="item in [
            { label: 'Home', href: '#home' },
            { label: 'About', href: '#about' },
            { label: 'Tokenomics', href: '#tokenomics' },
            { label: 'How to Buy', href: '#how-to-buy' },
            { label: 'Community', href: '#community' },
          ]"
          :key="item.href"
        >
          <a
            :href="item.href"
            class="rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-white/10"
            style="color: var(--text-muted)"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>
  </section>
</template>

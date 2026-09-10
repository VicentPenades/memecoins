<script setup lang="ts">
import { COIN } from "~/data/coin";

const platformIcons: Record<string, string> = {
  twitter: "𝕏",
  telegram: "✈️",
  discord: "💬",
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  website: "🌐",
};
</script>

<template>
  <CommonSection
    id="community"
    height="auto"
    background-color="var(--bg-main)"
    :title="COIN.community.title"
    divider-class="mb-8"
  >
    <!-- Background glow -->
    <div
      class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] opacity-10"
      style="background: var(--primary)"
    />

    <div class="relative max-w-3xl mx-auto text-center">
      <p
        class="text-lg mb-14 max-w-xl mx-auto"
        style="color: var(--text-muted)"
      >
        {{ COIN.community.description }}
      </p>

      <div class="flex flex-wrap justify-center gap-5">
        <a
          v-for="social in COIN.community.socials"
          :key="social.platform"
          :href="social.url"
          target="_blank"
          rel="noopener"
          class="group inline-flex items-center gap-4 px-8 py-5 rounded-2xl font-bold transition-all duration-300 hover:scale-105 border"
          style="
            background-color: var(--bg-subtle);
            color: var(--text-primary);
            border-color: color-mix(in srgb, var(--primary) 15%, transparent);
          "
        >
          <span
            class="flex items-center justify-center w-10 h-10 rounded-xl text-xl transition-all duration-300"
            style="
              background-color: color-mix(in srgb, var(--primary) 15%, transparent);
              color: var(--primary);
            "
          >
            {{ platformIcons[social.platform] || "🔗" }}
          </span>
          <span>{{ social.label || social.platform }}</span>
        </a>
      </div>
    </div>
  </CommonSection>
</template>

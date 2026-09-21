<template>
  <CommonSection
    id="community"
    background-color="var(--bg-main)"
    :title="COIN.community.title"
  >
    <!-- Background glow -->
    <div
      class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] opacity-10"
      style="background: var(--primary)"
    />

    <div class="relative mx-auto max-w-5xl text-center">
      <p
        class="mx-auto mb-10 max-w-2xl text-lg leading-relaxed"
        style="color: var(--text-muted)"
      >
        {{ COIN.community.description }}
      </p>

      <div class="mb-12 grid gap-4 text-left sm:grid-cols-2">
        <article
          v-for="rule in COIN.community.rules"
          :key="rule.title"
          class="flex gap-4 rounded-2xl border p-5"
          style="
            background-color: var(--bg-subtle);
            border-color: color-mix(in srgb, var(--primary) 15%, transparent);
          "
        >
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style="
              background-color: color-mix(
                in srgb,
                var(--primary) 14%,
                transparent
              );
            "
            aria-hidden="true"
          >
            {{ rule.icon }}
          </span>
          <div>
            <h3 class="mb-1 font-black" style="color: var(--text-primary)">
              {{ rule.title }}
            </h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-muted)">
              {{ rule.description }}
            </p>
          </div>
        </article>
      </div>

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
              background-color: color-mix(
                in srgb,
                var(--primary) 15%,
                transparent
              );
              color: var(--primary);
            "
          >
            {{ social.icon || "🔗" }}
          </span>
          <span>{{ social.label || social.platform }}</span>
        </a>
      </div>
    </div>
  </CommonSection>
</template>

<script setup lang="ts">
import { COIN } from "~/data/coin";
</script>

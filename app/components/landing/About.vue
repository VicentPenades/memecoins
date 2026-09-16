<template>
  <CommonSection
    id="about"
    background-color="var(--bg-section)"
    :title="COIN.about.title"
  >
    <div class="flex flex-col gap-6">
      <p
        v-for="(paragraph, i) in COIN.about.paragraphs"
        :key="i"
        class="text-base md:text-lg leading-relaxed"
        style="color: var(--text-muted)"
      >
        {{ paragraph }}
      </p>

      <div v-if="COIN.about.image" class="flex justify-center">
        <div class="relative">
          <div
            class="absolute inset-0 rounded-3xl blur-3xl opacity-20"
            style="background: var(--primary)"
          />
          <img
            :src="COIN.about.image"
            :alt="COIN.about.title"
            class="relative w-full rounded-3xl border"
            style="
              border-color: color-mix(in srgb, var(--primary) 20%, transparent);
            "
          />
        </div>
      </div>
    </div>
  </CommonSection>
</template>

<script setup lang="ts">
import { COIN } from "~/data/coin";
</script>

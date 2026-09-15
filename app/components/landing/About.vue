<script setup lang="ts">
import { COIN } from "~/data/coin";

const COIN_ABOUT = COIN.about;
</script>

<template>
  <CommonSection
    id="about"
    background-color="var(--bg-section)"
    :title="COIN_ABOUT.title"
  >
    <div class="relative grid w-full grid-cols-1 lg:grid-cols-2 items-center">
      <div class="flex flex-col gap-6">
        <p
          v-for="(paragraph, i) in COIN_ABOUT.paragraphs"
          :key="i"
          class="text-base md:text-lg leading-relaxed"
          style="color: var(--text-muted)"
        >
          {{ paragraph }}
        </p>

        <!-- Feature pills -->
        <div class="flex flex-wrap gap-3 pt-4">
          <CommonPill v-for="tag in COIN_ABOUT.tags || []" :key="tag">
            {{ tag }}
          </CommonPill>
        </div>
      </div>

      <div v-if="COIN_ABOUT.image" class="flex justify-center">
        <div class="relative">
          <div
            class="absolute inset-0 rounded-3xl blur-3xl opacity-20"
            style="background: var(--primary)"
          />
          <img
            :src="COIN_ABOUT.image"
            :alt="COIN_ABOUT.title"
            class="relative w-full max-w-md rounded-3xl border"
            style="
              border-color: color-mix(in srgb, var(--primary) 20%, transparent);
            "
          />
        </div>
      </div>
    </div>
  </CommonSection>
</template>

<script setup lang="ts">
import { COIN } from "~/data/coin";
</script>

<template>
  <CommonSection
    id="how-to-buy"
    height="auto"
    background-color="var(--bg-section)"
    :title="COIN.howToBuy.title"
  >
    <div class="relative max-w-5xl mx-auto">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(step, i) in COIN.howToBuy.steps"
          :key="i"
          class="landing-card group p-7"
        >
          <!-- Step number -->
          <div
            class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
            style="
              background: linear-gradient(135deg, var(--primary), var(--accent));
              color: var(--text-inverse);
            "
          >
            {{ i + 1 }}
          </div>

          <!-- Hover glow -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style="
              box-shadow:
                inset 0 1px 0 color-mix(in srgb, var(--primary) 30%, transparent),
                0 0 30px color-mix(in srgb, var(--primary) 10%, transparent);
            "
          />

          <span class="relative text-5xl block mb-5">{{ step.emoji }}</span>

          <h3
            class="relative text-lg font-bold mb-3"
            style="color: var(--text-primary)"
          >
            {{ step.title }}
          </h3>

          <p
            class="relative text-sm leading-relaxed"
            style="color: var(--text-muted)"
          >
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </CommonSection>
</template>

<script setup lang="ts">
import { COIN } from "~/data/coin";

const copied = ref(false);

function copyAddress() {
  if (COIN.tokenomics.contractAddress) {
    navigator.clipboard.writeText(COIN.tokenomics.contractAddress);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}
</script>

<template>
  <CommonSection
    id="tokenomics"
    height="auto"
    background-color="var(--bg-main)"
    :title="COIN.tokenomics.title"
  >
    <div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-14">
        <div
          v-for="item in COIN.tokenomics.items"
          :key="item.label"
          class="landing-card group p-6 md:p-8"
        >
          <!-- Hover glow -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style="
              box-shadow: inset 0 0 40px
                color-mix(in srgb, var(--primary) 15%, transparent);
            "
          />
          <p
            class="relative text-2xl md:text-4xl font-black mb-2"
            style="color: var(--primary)"
          >
            {{ item.value }}
          </p>
          <p
            class="relative text-xs md:text-sm font-bold uppercase tracking-wider"
            style="color: var(--text-muted)"
          >
            {{ item.label }}
          </p>
        </div>
      </div>
      <!-- Contract address -->
      <div class="flex justify-center items-center">
        <div
          v-if="COIN.tokenomics.contractAddress"
          class="gap-3 px-6 py-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          style="
            background-color: var(--bg-subtle);
            border-color: color-mix(in srgb, var(--primary) 20%, transparent);
          "
          @click="copyAddress"
        >
          <span
            v-if="COIN.tokenomics.chain"
            class="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider"
            style="
              background-color: color-mix(
                in srgb,
                var(--primary) 20%,
                transparent
              );
              color: var(--primary);
            "
          >
            {{ COIN.tokenomics.chain }}
          </span>
          <code
            class="font-mono text-xs md:text-sm"
            style="color: var(--text-muted)"
          >
            {{ COIN.tokenomics.contractAddress }}
          </code>
          <span class="text-sm" style="color: var(--primary)">
            {{ copied ? "✅" : "📋" }}
          </span>
        </div>
      </div>
    </div>
  </CommonSection>
</template>

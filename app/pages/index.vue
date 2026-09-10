<script setup lang="ts">
import { COIN } from "~/data/coin";

useHead({
  title: `${COIN.name} (${COIN.ticker})`,
  meta: [
    { name: "description", content: COIN.description },
    { property: "og:title", content: `${COIN.name} — ${COIN.tagline}` },
    { property: "og:description", content: COIN.description },
    { property: "og:image", content: COIN.logo },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${COIN.name} (${COIN.ticker})` },
    { name: "twitter:description", content: COIN.description },
  ],
});
</script>

<template>
  <div >
    <LandingHeader />
    <LandingHero />
    <LandingAbout />
    <LandingTokenomics />
    <LandingHowToBuy />
    <LandingCommunity />
    <LandingFooter />
  </div>
</template>

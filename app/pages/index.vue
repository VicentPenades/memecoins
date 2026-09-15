<script setup lang="ts">
import { COIN } from "~/data/coin";

useHead({
  title: `${COIN.general.name} (${COIN.general.ticker})`,
  meta: [
    { name: "description", content: COIN.general.description },
    {
      property: "og:title",
      content: `${COIN.general.name} — ${COIN.general.tagline}`,
    },
    { property: "og:description", content: COIN.general.description },
    { property: "og:image", content: COIN.general.logo },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: `${COIN.general.name} (${COIN.general.ticker})`,
    },
    { name: "twitter:description", content: COIN.general.description },
  ],
});
</script>

<template>
  <div>
    <LayoutHeader />
    <LandingHero />
    <LandingAbout />
    <LandingTokenomics />
    <LandingHowToBuy />
    <LandingCommunity />
    <LayoutFooter />
  </div>
</template>

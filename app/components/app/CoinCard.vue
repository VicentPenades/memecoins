<template>
  <UiCardLink :to="`/devs/${devHandle}/${coin.slug}`">
    <span
      v-if="showBadge"
      class="coin-card__badge"
      :class="`coin-card__badge--${coin.status}`"
    >
      {{ $t(`dev.badge.${coin.status}`) }}
    </span>
    <img
      v-if="coin.imageUrl"
      :src="resolveImageUrl(coin.imageUrl)"
      :alt="coin.name"
      class="coin-card__img"
    />
    <div v-else class="coin-card__img coin-card__img--ph">
      {{ coin.symbol.slice(0, 3).toUpperCase() }}
    </div>
    <p class="coin-card__ticker">${{ coin.symbol.toUpperCase() }}</p>
    <p class="coin-card__name">{{ coin.name }}</p>
    <AppRating
      v-if="coin.slug"
      :likes="coin.likes"
      :dislikes="coin.dislikes"
      :submit="submitVote"
    />
  </UiCardLink>
</template>

<script setup lang="ts">
import type { Coin } from "~/app/pages/(modules)/my-coins/types/coins.types";
import type { VoteValue } from "~/app/pages/(modules)/devs/types/devs.types";
import { resolveImageUrl } from "~/shared/utils/image";

const props = withDefaults(
  defineProps<{ coin: Coin; devHandle: string; showBadge?: boolean }>(),
  { showBadge: true },
);
const { t: $t } = useI18n();
const { rateCoin } = useRatingService();

// La card solo pinta el rating cuando hay slug (identidad pública de la moneda).
const submitVote = (value: VoteValue) =>
  rateCoin(props.devHandle, props.coin.slug ?? "", value);
</script>

<style scoped>
.coin-card__badge {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
}
.coin-card__badge--launched {
  background: var(--pp-brand-tint);
  color: var(--pp-brand-strong);
}
.coin-card__badge--prelaunch {
  background: rgba(30, 35, 38, 0.08);
  color: var(--pp-muted);
}
.coin-card__img {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  object-fit: cover;
}
.coin-card__img--ph {
  display: grid;
  place-items: center;
  background: var(--pp-brand-tint);
  color: var(--pp-brand-strong);
  font-weight: 800;
}
.coin-card__ticker {
  margin-top: 0.75rem;
  font-weight: 800;
  color: var(--pp-brand-strong);
  letter-spacing: -0.02em;
}
.coin-card__name {
  margin-top: 0.1rem;
  font-size: 0.85rem;
  color: var(--pp-muted);
}
</style>

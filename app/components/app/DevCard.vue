<template>
  <UiCardLink :to="`/devs/${dev.handle}`">
    <div class="dev-card__thumbs">
      <img
        v-for="(thumbnail, index) in dev.thumbnails"
        :key="index"
        :src="thumbnail"
        alt=""
        class="dev-card__thumb"
      />
      <div
        v-if="!dev.thumbnails.length"
        class="dev-card__thumb dev-card__thumb--ph"
      >
        {{ (dev.name || dev.handle).slice(0, 2).toUpperCase() }}
      </div>
    </div>
    <p class="dev-card__handle">{{ "@" }}{{ dev.handle }}</p>
    <p v-if="dev.name" class="dev-card__name">{{ dev.name }}</p>
    <p class="dev-card__count">{{ $t("dev.list.coinCount", dev.coinCount) }}</p>
    <AppRating
      :likes="dev.likes"
      :dislikes="dev.dislikes"
      :submit="(value) => rateDev(dev.handle, value)"
    />
  </UiCardLink>
</template>

<script setup lang="ts">
import type { DevListItem } from "~/app/pages/(modules)/devs/types/devs.types";

defineProps<{ dev: DevListItem }>();
const { t: $t } = useI18n();
const { rateDev } = useRatingService();
</script>

<style scoped>
.dev-card__thumbs {
  display: flex;
}
.dev-card__thumb {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--pp-surface);
  margin-left: -0.6rem;
}
.dev-card__thumb:first-child {
  margin-left: 0;
}
.dev-card__thumb--ph {
  display: grid;
  place-items: center;
  background: var(--pp-brand-tint);
  color: var(--pp-brand-strong);
  font-weight: 800;
  font-size: 0.9rem;
}
.dev-card__handle {
  margin-top: 0.9rem;
  font-weight: 800;
  color: var(--pp-brand-strong);
  letter-spacing: -0.02em;
}
.dev-card__name {
  margin-top: 0.1rem;
  font-size: 0.85rem;
  color: var(--pp-text);
}
.dev-card__count {
  margin-top: 0.35rem;
  font-size: 0.8rem;
  color: var(--pp-muted);
}
</style>

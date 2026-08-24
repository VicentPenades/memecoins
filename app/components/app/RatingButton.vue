<template>
  <!-- Un único botón de voto (like o dislike). Mismo lenguaje visual que
       AppRating pero pensado para vivir en su propia columna de tabla. -->
  <button
    type="button"
    class="rating-btn"
    :class="[
      kind === 'like' ? 'rating-btn--like' : 'rating-btn--dislike',
      { 'rating-btn--active': active },
    ]"
    :disabled="disabled"
    :aria-pressed="active"
    :aria-label="kind === 'like' ? $t('rating.like') : $t('rating.dislike')"
    @click.stop="emit('vote')"
  >
    <svg viewBox="0 0 24 24" class="rating-btn__icon" aria-hidden="true">
      <path v-if="kind === 'like'" :d="LIKE_PATH" />
      <path v-else :d="DISLIKE_PATH" />
    </svg>
    <span class="rating-btn__count">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  kind: "like" | "dislike";
  count: number;
  active: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{ vote: [] }>();

const { t: $t } = useI18n();

// Mismos trazos que AppRating para mantener la identidad visual.
const LIKE_PATH =
  "M2 21h4V9H2v12ZM22 10a2 2 0 0 0-2-2h-6.31l.95-4.57.03-.32a1.5 1.5 0 0 0-.44-1.06L13.17 1 6.59 7.59A2 2 0 0 0 6 9v10a2 2 0 0 0 2 2h9a2 2 0 0 0 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2Z";
const DISLIKE_PATH =
  "M22 3h-4v12h4V3ZM2 14a2 2 0 0 0 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L10.83 23l6.58-6.59A2 2 0 0 0 18 15V5a2 2 0 0 0-2-2H7a2 2 0 0 0-1.84 1.22L2.14 11.27c-.09.23-.14.47-.14.73v2Z";
</script>

<style scoped>
.rating-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--pp-border);
  background: var(--pp-surface);
  color: var(--pp-muted);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background-color 0.15s ease;
}
.rating-btn:hover:not(:disabled) {
  border-color: var(--pp-brand);
}
.rating-btn:disabled {
  cursor: default;
}
.rating-btn--like:hover:not(:disabled),
.rating-btn--like.rating-btn--active {
  color: var(--pp-brand-strong);
  background: var(--pp-brand-tint);
  border-color: var(--pp-brand);
}
.rating-btn--dislike:hover:not(:disabled),
.rating-btn--dislike.rating-btn--active {
  color: var(--error, #c0392b);
  background: color-mix(in srgb, var(--error, #c0392b) 12%, transparent);
  border-color: color-mix(in srgb, var(--error, #c0392b) 45%, transparent);
}
.rating-btn__icon {
  width: 0.95rem;
  height: 0.95rem;
  fill: currentColor;
}
.rating-btn__count {
  min-width: 0.75rem;
  text-align: left;
}
</style>

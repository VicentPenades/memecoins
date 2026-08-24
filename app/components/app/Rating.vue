<template>
  <!-- Va dentro del NuxtLink de la card: parar la navegación al votar. -->
  <div class="rating" @click.stop.prevent>
    <button
      type="button"
      class="rating__btn rating__btn--like"
      :class="{ 'rating__btn--active': myVote === 'like' }"
      :disabled="pending || myVote !== null"
      :aria-pressed="myVote === 'like'"
      :aria-label="$t('rating.like')"
      @click="onVote('like')"
    >
      <svg viewBox="0 0 24 24" class="rating__icon" aria-hidden="true">
        <path
          d="M2 21h4V9H2v12ZM22 10a2 2 0 0 0-2-2h-6.31l.95-4.57.03-.32a1.5 1.5 0 0 0-.44-1.06L13.17 1 6.59 7.59A2 2 0 0 0 6 9v10a2 2 0 0 0 2 2h9a2 2 0 0 0 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2Z"
        />
      </svg>
      <span class="rating__count">{{ likesLocal }}</span>
    </button>

    <button
      type="button"
      class="rating__btn rating__btn--dislike"
      :class="{ 'rating__btn--active': myVote === 'dislike' }"
      :disabled="pending || myVote !== null"
      :aria-pressed="myVote === 'dislike'"
      :aria-label="$t('rating.dislike')"
      @click="onVote('dislike')"
    >
      <svg viewBox="0 0 24 24" class="rating__icon" aria-hidden="true">
        <path
          d="M22 3h-4v12h4V3ZM2 14a2 2 0 0 0 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L10.83 23l6.58-6.59A2 2 0 0 0 18 15V5a2 2 0 0 0-2-2H7a2 2 0 0 0-1.84 1.22L2.14 11.27c-.09.23-.14.47-.14.73v2Z"
        />
      </svg>
      <span class="rating__count">{{ dislikesLocal }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type {
  VoteValue,
  VoteCounts,
} from "~/app/pages/(modules)/devs/types/devs.types";

const props = defineProps<{
  likes: number;
  dislikes: number;
  // Persiste el voto y devuelve los contadores actualizados del server.
  submit: (value: VoteValue) => Promise<VoteCounts>;
}>();

const { t: $t } = useI18n();

// Contadores en local para pintar la UI optimista; el voto de esta sesión bloquea repetir.
const likesLocal = ref(props.likes);
const dislikesLocal = ref(props.dislikes);
const myVote = ref<VoteValue | null>(null);
const pending = ref(false);

// Si el padre refresca los datos y aún no hemos votado, sincronizamos.
watch(
  () => [props.likes, props.dislikes] as const,
  ([likes, dislikes]) => {
    if (myVote.value === null) {
      likesLocal.value = likes;
      dislikesLocal.value = dislikes;
    }
  },
);

const onVote = async (value: VoteValue) => {
  if (pending.value || myVote.value !== null) return;
  const prevLikes = likesLocal.value;
  const prevDislikes = dislikesLocal.value;

  pending.value = true;
  myVote.value = value;
  if (value === "like") likesLocal.value += 1;
  else dislikesLocal.value += 1;

  try {
    const counts = await props.submit(value);
    likesLocal.value = counts.likes;
    dislikesLocal.value = counts.dislikes;
  } catch {
    // Revertimos la UI optimista si el server falla.
    likesLocal.value = prevLikes;
    dislikesLocal.value = prevDislikes;
    myVote.value = null;
  } finally {
    pending.value = false;
  }
};
</script>

<style scoped>
.rating {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.9rem;
}
.rating__btn {
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
.rating__btn:hover:not(:disabled) {
  border-color: var(--pp-brand);
}
.rating__btn:disabled {
  cursor: default;
}
.rating__btn--like:hover:not(:disabled),
.rating__btn--like.rating__btn--active {
  color: var(--pp-brand-strong);
  background: var(--pp-brand-tint);
  border-color: var(--pp-brand);
}
.rating__btn--dislike:hover:not(:disabled),
.rating__btn--dislike.rating__btn--active {
  color: var(--error, #c0392b);
  background: color-mix(in srgb, var(--error, #c0392b) 12%, transparent);
  border-color: color-mix(in srgb, var(--error, #c0392b) 45%, transparent);
}
.rating__icon {
  width: 0.95rem;
  height: 0.95rem;
  fill: currentColor;
}
.rating__count {
  min-width: 0.75rem;
  text-align: left;
}
</style>

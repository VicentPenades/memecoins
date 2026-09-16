<template>
  <NuxtLink :to="to" class="card-link">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
// Wrapper de card-enlace: la "shell" común que antes duplicaban DevCard y
// CoinCard (superficie, borde, sombra, hover y focus). El contenido va por slot.
defineProps<{ to: string }>();
</script>

<style scoped>
.card-link {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 1rem;
  border-radius: 1rem;
  background: var(--pp-surface);
  border: 1px solid var(--pp-border);
  box-shadow: var(--pp-shadow);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.card-link:hover {
  transform: translateY(-3px);
  border-color: var(--pp-brand);
}
.card-link:focus-visible {
  outline: 2px solid var(--pp-brand);
  outline-offset: 3px;
}
</style>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const title = computed(() => {
  if (props.error?.statusCode === 404) return "Page not found";
  if (props.error?.statusCode === 403) return "Access denied";
  if (props.error?.statusCode === 500) return "Server error";
  return "Something went wrong";
});

const description = computed(() => {
  if (props.error?.statusCode === 404)
    return "The page you're looking for doesn't exist or has been moved.";
  if (props.error?.statusCode === 403)
    return "You don't have permission to access this resource.";
  return "An unexpected error occurred. Please try again later.";
});

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen px-4 text-center"
  >
    <p class="text-8xl font-bold text-[var(--primary)] mb-4">
      {{ error?.statusCode || 500 }}
    </p>
    <h1 class="text-2xl font-semibold text-[var(--mc-bw-text-primary)] mb-2">
      {{ title }}
    </h1>
    <p class="text-[var(--text-secondary)] max-w-md mb-8">
      {{ description }}
    </p>
    <button
      class="px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
      @click="handleError"
    >
      Back to home
    </button>
  </div>
</template>

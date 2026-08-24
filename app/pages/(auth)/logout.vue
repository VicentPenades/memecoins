<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="mt-4 text-body-1">{{ $t("auth.logout.message") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

// Ejecutar logout automáticamente al montar el componente.
onMounted(async () => {
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Error signing out:", error);
  } finally {
    // Siempre redirigir a login, incluso si hubo error.
    navigateTo("/login");
  }
});
</script>

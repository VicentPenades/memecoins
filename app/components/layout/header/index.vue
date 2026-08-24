<template>
  <header class="root-layout__header">
    <div>
      <div class="relative flex h-full w-full items-center justify-between">
        <MainLogo />
        <MainNavigation />
        <div class="flex items-center gap-2">

          <UiVicSocial />
          <MainMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import MainLogo from "./MainLogo.vue";
import MainNavigation from "./MainNavigation.vue";
import MainMenu from "./MainMenu.vue";

</script>

<style scoped>
.root-layout__header {
  z-index: 100;
  background-color: white;
  border-bottom: 1px solid var(--border-default);

  position: sticky;
  top: 0;
  padding: 8px 16px;
}
</style>

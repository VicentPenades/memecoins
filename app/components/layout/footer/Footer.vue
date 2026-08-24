<template>
  <footer class="root-layout__footer">
    <div class="items-center justify-center flex">
      <SectionVicSocial />
    </div>
  </footer>
</template>

<script setup lang="ts">
const CURRENT_YEAR = new Date().getFullYear();
</script>

<style scoped>
.root-layout__footer {
  z-index: 100;
  background-color: white;
  border-top: 1px solid var(--border-default);

  position: sticky;
  bottom: 0;
  padding: 8px 16px;
}
</style>

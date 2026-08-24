<script setup lang="ts">
export interface NavSection {
  id: string;
  label: string;
  icon?: string;
}

const props = defineProps<{
  navSections?: NavSection[];
  backTo?: string;
  refreshing?: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
  back: [];
}>();

const linkCopied = ref(false);

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function onBack() {
  emit("back");
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  linkCopied.value = true;
  setTimeout(() => {
    linkCopied.value = false;
  }, 2000);
}
</script>

<template>
  <nav class="sticky top-12 z-10 pt-4" :style="{ backgroundColor: '#EBEEEF' }">
    <div class="flex justify-between items-center">
      <div class="flex gap-1">
        <v-btn
          v-for="section in navSections"
          :key="section.id"
          size="small"
          variant="text"
          :prepend-icon="section.icon"
          @click="scrollToSection(section.id)"
        >
          {{ section.label }}
        </v-btn>
      </div>
      <div>
        <v-btn variant="text" prepend-icon="mdi-link-variant" @click="copyLink">
          {{ linkCopied ? $t("common.copied") : $t("common.shareLink") }}
        </v-btn>
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          :to="backTo"
          @click="!backTo && onBack()"
        >
          {{ $t("common.back") }}
        </v-btn>
        <v-btn
          variant="text"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="refreshing"
          @click="emit('refresh')"
        >
          {{ $t("common.refresh") }}
        </v-btn>
      </div>
    </div>
  </nav>
</template>

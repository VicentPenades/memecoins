<template>
  <v-menu
    v-model="menuOpen"
    location="bottom end"
    :close-on-content-click="true"
  >
    <template #activator="{ props }">
      <v-btn icon class="rounded-lg" :title="$t('menu.settings')" v-bind="props">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </template>
    <v-list min-width="200" class="mc-menu-list-wrap">
      <!-- Módulos privados de la app (antes en la barra principal). -->
      <v-list-item
        v-for="item in MAIN_MENU.filter((i) => i.type === 'modules')"
        :key="item.titleKey"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="$t(item.titleKey)"
      />
      <v-divider class="my-1" />
      <v-list-item
        v-for="item in MAIN_MENU.filter((i) => i.type === 'settings')"
        :key="item.titleKey"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="$t(item.titleKey)"
      />
      <v-divider class="my-1" />
      <v-list-item
        v-for="item in MAIN_MENU.filter((i) => i.type === 'others')"
        :key="item.titleKey"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="$t(item.titleKey)"
      />

      <!-- Language submenu -->
      <v-menu location="start top" :close-on-content-click="true">
        <template #activator="{ props: subProps }">
          <v-list-item
            v-bind="subProps"
            prepend-icon="mdi-translate"
            :title="$t('menu.language')"
            append-icon="mdi-chevron-right"
          />
        </template>
        <v-list min-width="150">
          <v-list-item
            v-for="loc in availableLocales"
            :key="loc.code"
            :title="$t(`languages.${loc.code}`)"
            :append-icon="locale === loc.code ? 'mdi-check' : undefined"
            @click="setLocale(loc.code)"
          />
        </v-list>
      </v-menu>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { MAIN_MENU } from "~/app/routes.config";

const { locale, locales, setLocale } = useI18n();
const menuOpen = ref(false);

const availableLocales = computed(() =>
  (locales.value as { code: string }[]).map((l) => ({ code: l.code })),
);
</script>

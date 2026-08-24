<template>
  <div>
    <SectionPageHeader
      :title="$t('settings.title')"
      :description="$t('settings.description')"
    />

    <SectionVicTabs v-model="activeSettingsTab" :tabs="tabs" class="mt-8">
      <template #account>
        <SettingsAccountSettings />
      </template>
      <template #access>
        <SettingsAccessSettings />
      </template>
    </SectionVicTabs>
  </div>
</template>

<script setup lang="ts">
import SettingsAccountSettings from "./components/tabs/AccountSettings.vue";
import SettingsAccessSettings from "./components/tabs/AccessSettings.vue";

const { t: $t } = useI18n();

const activeSettingsTab = ref("account");
const tabs = computed(() => [
  { value: "account", text: $t("settings.tabAccount"), icon: "mdi-account-outline" },
  { value: "access", text: $t("settings.tabAccess"), icon: "mdi-lock-outline" },
]);
</script>

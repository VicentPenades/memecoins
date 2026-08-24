<template>
  <SectionPanel :title="$t('settings.accountTitle')">
    <div class="flex flex-col gap-4">
      <UiFormTextField
        v-model="name"
        :label="$t('settings.nameLabel')"
        :hide-details="false"
      />
      <UiFormSelect
        v-model="language"
        :items="languageItems"
        :label="$t('settings.languageLabel')"
      />
    </div>

    <div class="mt-4 flex items-center gap-3">
      <v-btn
        color="primary"
        variant="flat"
        :loading="saving"
        prepend-icon="mdi-content-save-outline"
        @click="onSave"
      >
        {{ $t("settings.save") }}
      </v-btn>
      <span v-if="justSaved" class="text-sm text-green-600">
        {{ $t("settings.saved") }}
      </span>
    </div>
  </SectionPanel>
</template>

<script setup lang="ts">
import { useAccountService } from "../../composables/useAccountService";
import type { Locale } from "../../types/user.types";

const { t: $t, locale, locales } = useI18n();
const { user } = useUserSession();
const { updateProfile, setLanguage } = useAccountService();

const name = ref(user.value?.name ?? "");
const language = ref<Locale>(locale.value as Locale);
const saving = ref(false);
const justSaved = ref(false);

// Resincroniza si la sesión llega/actualiza después del montaje
watch(
  () => user.value?.name,
  (value) => {
    name.value = value ?? "";
  },
);

const languageItems = computed(() =>
  (locales.value as { code: Locale }[]).map((l) => ({
    title: $t(`languages.${l.code}`),
    value: l.code,
  })),
);

const onSave = async () => {
  saving.value = true;
  try {
    await updateProfile({ name: name.value.trim() || null });
    if (language.value !== locale.value) await setLanguage(language.value);
    justSaved.value = true;
    setTimeout(() => (justSaved.value = false), 2000);
  } finally {
    saving.value = false;
  }
};
</script>

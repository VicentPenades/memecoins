<template>
  <div class="flex flex-col gap-6">
    <!-- Cambiar email -->
    <SectionPanel :title="$t('settings.accessEmailTitle')">
      <div class="flex flex-col gap-4">
        <UiFormTextField
          v-model="email"
          type="email"
          :label="$t('settings.newEmail')"
          :hide-details="false"
        />
        <UiFormTextField
          v-model="emailPassword"
          type="password"
          :label="$t('settings.currentPassword')"
          :hide-details="false"
        />
      </div>
      <div class="mt-4 flex items-center gap-3">
        <v-btn
          color="primary"
          variant="flat"
          :loading="emailSaving"
          :disabled="!email.trim() || !emailPassword"
          @click="onChangeEmail"
        >
          {{ $t("settings.changeEmail") }}
        </v-btn>
        <span v-if="emailSaved" class="text-sm text-green-600">
          {{ $t("settings.saved") }}
        </span>
        <span v-if="emailError" class="text-sm text-red-600">
          {{ $t(emailError) }}
        </span>
      </div>
    </SectionPanel>

    <!-- Cambiar contraseña -->
    <SectionPanel :title="$t('settings.accessPasswordTitle')">
      <div class="flex flex-col gap-4">
        <UiFormTextField
          v-model="currentPassword"
          type="password"
          :label="$t('settings.currentPassword')"
          :hide-details="false"
        />
        <UiFormTextField
          v-model="newPassword"
          type="password"
          :label="$t('settings.newPassword')"
          :hide-details="false"
        />
        <UiFormTextField
          v-model="confirmPassword"
          type="password"
          :label="$t('settings.confirmPassword')"
          :hide-details="false"
        />
      </div>
      <div class="mt-4 flex items-center gap-3">
        <v-btn
          color="primary"
          variant="flat"
          :loading="passwordSaving"
          :disabled="!currentPassword || !newPassword"
          @click="onChangePassword"
        >
          {{ $t("settings.changePassword") }}
        </v-btn>
        <span v-if="passwordSaved" class="text-sm text-green-600">
          {{ $t("settings.saved") }}
        </span>
        <span v-if="passwordError" class="text-sm text-red-600">
          {{ $t(passwordError) }}
        </span>
      </div>
    </SectionPanel>
  </div>
</template>

<script setup lang="ts">
import { useAccountService } from "../../composables/useAccountService";

const { updateEmail, updatePassword } = useAccountService();

// Extrae el statusCode de un error de $fetch para mapearlo a un mensaje
const statusOf = (err: unknown): number | undefined => {
  if (err && typeof err === "object" && "statusCode" in err) {
    return (err as { statusCode?: number }).statusCode;
  }
  return undefined;
};

// --- Email ---
const email = ref("");
const emailPassword = ref("");
const emailSaving = ref(false);
const emailSaved = ref(false);
const emailError = ref("");

const onChangeEmail = async () => {
  emailError.value = "";
  emailSaved.value = false;
  emailSaving.value = true;
  try {
    await updateEmail({
      email: email.value.trim(),
      currentPassword: emailPassword.value,
    });
    emailSaved.value = true;
    emailPassword.value = "";
    setTimeout(() => (emailSaved.value = false), 2000);
  } catch (err) {
    const status = statusOf(err);
    emailError.value =
      status === 401
        ? "settings.errWrongPassword"
        : status === 409
          ? "settings.errEmailTaken"
          : "settings.errGeneric";
  } finally {
    emailSaving.value = false;
  }
};

// --- Password ---
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const passwordSaving = ref(false);
const passwordSaved = ref(false);
const passwordError = ref("");

const onChangePassword = async () => {
  passwordError.value = "";
  passwordSaved.value = false;
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "settings.passwordMismatch";
    return;
  }
  passwordSaving.value = true;
  try {
    await updatePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    passwordSaved.value = true;
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    setTimeout(() => (passwordSaved.value = false), 2000);
  } catch (err) {
    const status = statusOf(err);
    passwordError.value =
      status === 401
        ? "settings.errWrongPassword"
        : status === 400
          ? "settings.errPasswordShort"
          : "settings.errGeneric";
  } finally {
    passwordSaving.value = false;
  }
};
</script>

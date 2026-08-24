<template>
  <div class="min-h-screen flex items-center justify-center bg-grey-lighten-4">
    <div class="w-full max-w-sm px-4">
      <div class="bg-white rounded-lg shadow-lg pa-6">
        <h1 class="text-center text-h5 mb-4">
          {{ $t("auth.forgot.title") }}
        </h1>

        <p class="text-center text-subtitle-1 mb-6">
          {{ $t("auth.forgot.subtitle") }}
        </p>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="successMessage = ''"
        >
          {{ successMessage }}
        </v-alert>

        <v-form v-if="!successMessage" @submit.prevent="onForgotPassword">
          <v-text-field
            v-model="email"
            :label="$t('auth.email')"
            type="email"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            required
          />

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
            class="mb-4"
          >
            {{ $t("auth.forgot.submit") }}
          </v-btn>
        </v-form>

        <hr class="my-4" />

        <div class="text-center">
          <p class="text-body-2">
            <NuxtLink to="/login" class="text-primary text-decoration-none">
              {{ $t("auth.backToLogin") }}
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const { t } = useI18n();
const { loggedIn } = useUserSession();

const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const email = ref("");

// Redirigir si ya hay sesión activa.
watchEffect(() => {
  if (loggedIn.value) {
    navigateTo("/");
  }
});

async function onForgotPassword() {
  error.value = "";
  successMessage.value = "";
  loading.value = true;

  try {
    const response = await $fetch("/api/auth/forgot-password", {
      method: "POST",
      body: { email: email.value },
    });

    successMessage.value = response.message || t("auth.forgot.sent");
    email.value = "";
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } };
    error.value = err.data?.statusMessage || t("auth.forgot.error");
  } finally {
    loading.value = false;
  }
}
</script>

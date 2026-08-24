<template>
  <div class="public-page auth-page">
    <div class="auth-card">
      <div class="auth-brand"><LayoutHeaderMainLogo /></div>
      <h1 class="auth-title">{{ $t("auth.login.subtitle") }}</h1>

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

      <v-form @submit.prevent="onLogin">
        <v-text-field
          v-model="loginForm.email"
          :label="$t('auth.email')"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          required
        />
        <v-text-field
          v-model="loginForm.password"
          :label="$t('auth.password')"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          required
          @click:append-inner="showPassword = !showPassword"
        />

        <NuxtLink to="/forgot-password" class="auth-link auth-forgot">
          {{ $t("auth.login.forgotPassword") }}
        </NuxtLink>

        <button type="submit" class="auth-submit" :disabled="loading">
          <span v-if="loading" class="auth-spinner" aria-hidden="true" />
          {{ $t("auth.login.submit") }}
        </button>
      </v-form>

      <hr class="auth-divider" />

      <p class="auth-foot">
        {{ $t("auth.login.noAccount") }}
        <NuxtLink to="/register" class="auth-link">
          {{ $t("auth.login.signUp") }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const { t } = useI18n();
const { loggedIn, fetch: refreshSession } = useUserSession();

const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const showPassword = ref(false);

const loginForm = ref({ email: "", password: "" });

// Mensajes según los query params de la verificación de email.
const route = useRoute();
if (route.query.error === "invalid-token") {
  error.value = t("auth.login.invalidTokenError");
}
if (route.query.verified === "true") {
  successMessage.value = t("auth.login.verifiedSuccess");
}

// Redirigir si ya hay sesión activa.
watchEffect(() => {
  if (loggedIn.value) {
    navigateTo("/");
  }
});

async function onLogin() {
  error.value = "";
  loading.value = true;
  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: loginForm.value,
    });
    // Refrescar la sesión para obtener los datos del usuario antes de navegar.
    await refreshSession();
    navigateTo("/");
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } };
    error.value = err.data?.statusMessage || t("auth.login.error");
  } finally {
    loading.value = false;
  }
}
</script>

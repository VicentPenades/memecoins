<template>
  <div class="public-page auth-page">
    <div class="auth-card">
      <div class="auth-brand"><LayoutHeaderMainLogo /></div>
      <h1 class="auth-title">{{ $t("auth.register.subtitle") }}</h1>

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

      <v-form v-if="!successMessage" @submit.prevent="onRegister">
        <v-text-field
          v-model="registerForm.name"
          :label="$t('auth.name')"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />
        <v-text-field
          v-model="registerForm.email"
          :label="$t('auth.email')"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          required
        />
        <v-text-field
          v-model="registerForm.password"
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
        <button type="submit" class="auth-submit" :disabled="loading">
          <span v-if="loading" class="auth-spinner" aria-hidden="true" />
          {{ $t("auth.register.submit") }}
        </button>
      </v-form>

      <hr class="auth-divider" />

      <p class="auth-foot">
        {{ $t("auth.register.haveAccount") }}
        <NuxtLink to="/login" class="auth-link">
          {{ $t("auth.register.signIn") }}
        </NuxtLink>
      </p>
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
const showPassword = ref(false);

const registerForm = ref({ name: "", email: "", password: "" });

// Redirigir si ya hay sesión activa.
watchEffect(() => {
  if (loggedIn.value) {
    navigateTo("/");
  }
});

async function onRegister() {
  error.value = "";
  successMessage.value = "";
  loading.value = true;
  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: registerForm.value,
    });
    successMessage.value = t("auth.register.pending");
    registerForm.value = { name: "", email: "", password: "" };
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } };
    error.value = err.data?.statusMessage || t("auth.register.error");
  } finally {
    loading.value = false;
  }
}
</script>

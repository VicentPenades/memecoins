<template>
  <div class="min-h-screen flex items-center justify-center bg-grey-lighten-4">
    <div class="w-full max-w-sm px-4">
      <div class="bg-white rounded-lg shadow-lg pa-6">
        <h1 class="text-center text-h5 mb-4">
          {{ $t("auth.reset.title") }}
        </h1>

        <p class="text-center text-subtitle-1 mb-6">
          {{ $t("auth.reset.subtitle") }}
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

        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
          {{ successMessage }}
        </v-alert>

        <v-form v-if="!successMessage" @submit.prevent="onResetPassword">
          <v-text-field
            v-model="password"
            :label="$t('auth.reset.newPassword')"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            required
            :hint="$t('auth.reset.hint')"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-text-field
            v-model="confirmPassword"
            :label="$t('auth.reset.confirmPassword')"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            required
            @click:append-inner="showPassword = !showPassword"
          />

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
            class="mb-4"
          >
            {{ $t("auth.reset.submit") }}
          </v-btn>
        </v-form>

        <div v-else class="text-center">
          <v-btn to="/login" color="primary" variant="outlined" block size="large">
            {{ $t("auth.reset.goToLogin") }}
          </v-btn>
        </div>

        <hr v-if="!successMessage" class="my-4" />

        <div v-if="!successMessage" class="text-center">
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
const route = useRoute();

const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const showPassword = ref(false);
const password = ref("");
const confirmPassword = ref("");

const token = computed(() => route.query.token as string);

// Redirigir si ya hay sesión activa.
watchEffect(() => {
  if (loggedIn.value) {
    navigateTo("/");
  }
});

// Validar que existe el token en la URL.
onMounted(() => {
  if (!token.value) {
    error.value = t("auth.reset.missingToken");
  }
});

async function onResetPassword() {
  error.value = "";
  successMessage.value = "";

  // Validaciones de cliente.
  if (password.value.length < 6) {
    error.value = t("auth.reset.tooShort");
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = t("auth.reset.mismatch");
    return;
  }
  if (!token.value) {
    error.value = t("auth.reset.invalidToken");
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch("/api/auth/reset-password", {
      method: "POST",
      body: { token: token.value, password: password.value },
    });

    successMessage.value = response.message || t("auth.reset.success");
    password.value = "";
    confirmPassword.value = "";
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } };
    error.value = err.data?.statusMessage || t("auth.reset.error");
  } finally {
    loading.value = false;
  }
}
</script>

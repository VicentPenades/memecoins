#!/bin/bash
# Clona este proyecto como plantilla para un nuevo micro-SaaS.
#
# Pregunta qué sistemas base conservar y elimina el resto:
#   - auth    → autenticación + usuarios (login, sesión, ajustes de cuenta)
#   - billing → suscripciones/Stripe (requiere auth)
#   - brands  → sistema de marcas (requiere auth)
# El dominio específico del proyecto (raíz `v0`: opportunities, radar, reply-history)
# se elimina SIEMPRE.
#
# Uso interactivo:      ./scripts/clone-template.sh <nombre-proyecto> [directorio-destino]
# Uso no interactivo:   AUTH=yes BILLING=no BRANDS=yes ./scripts/clone-template.sh mi-proyecto

set -e

PROJECT_NAME="${1:?❌ Uso: $0 <nombre-proyecto> [directorio-destino]}"
DEST_DIR="${2:-$(dirname "$(pwd)")/$PROJECT_NAME}"
SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -d "$DEST_DIR" ]; then
  echo "❌ El directorio '$DEST_DIR' ya existe"
  exit 1
fi

# ── 0. Qué sistemas base conserva el nuevo proyecto ─────────────────────────
# Cada sistema se puede fijar por variable de entorno (yes/no) para uso no
# interactivo; si no, se pregunta. billing y brands dependen de auth.
ask_yn() {
  local ans
  read -r -p "$1 [Y/n] " ans || ans="y"
  case "${ans:-y}" in [nN]*) echo "no" ;; *) echo "yes" ;; esac
}

HAS_AUTH="${AUTH:-}"
HAS_BILLING="${BILLING:-}"
HAS_BRANDS="${BRANDS:-}"

echo ""
echo "🔧 Sistemas base de la plantilla para '$PROJECT_NAME':"
[ -z "$HAS_AUTH" ] && HAS_AUTH=$(ask_yn "   ¿Sistema de autenticación (login + usuarios)?")

if [ "$HAS_AUTH" = "no" ]; then
  HAS_BILLING="no"
  HAS_BRANDS="no"
  echo "   ℹ️  Sin auth: billing y marcas también se eliminan (dependen de usuarios)."
else
  [ -z "$HAS_BILLING" ] && HAS_BILLING=$(ask_yn "   ¿Sistema de billing/suscripciones (Stripe)?")
  [ -z "$HAS_BRANDS" ] && HAS_BRANDS=$(ask_yn "   ¿Sistema de marcas (brands)?")
fi

echo "   → auth=$HAS_AUTH · billing=$HAS_BILLING · brands=$HAS_BRANDS"
echo ""
echo "📦 Creando proyecto '$PROJECT_NAME' en $DEST_DIR..."

# ── 1. Copiar estructura excluyendo datos específicos ───────────────────────
rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.nuxt' \
  --exclude='.output' \
  --exclude='.env' \
  --exclude='server/database/migrations/' \
  --exclude='docs/superpowers/' \
  --exclude='docs/app/' \
  --exclude='public/images/posts/' \
  "$SOURCE_DIR/" "$DEST_DIR/"

cd "$DEST_DIR"

# ── 2. Actualizar package.json ──────────────────────────────────────────────
sed -i '' "s/\"name\": \"[^\"]*\"/\"name\": \"$PROJECT_NAME\"/" package.json
sed -i '' 's/"version": "[^"]*"/"version": "0.0.1"/' package.json

# ── 3. Eliminar el dominio específico del proyecto (raíz `v0`) — SIEMPRE ─────
rm -rf "app/pages/(modules)"
rm -rf server/api/v0
rm -rf server/services/v0
rm -rf server/database/schema/v0
rm -rf server/constants/v0
rm -rf server/utils/v0

# ── 4. Marcas (brands) ──────────────────────────────────────────────────────
# La entidad `brands` (schema + API CRUD + switcher) es reutilizable. Su página
# original, en cambio, gestiona la config de radar por marca (accounts, keywords,
# reply-settings), que es dominio `v0`. Por eso, si se conservan las marcas, la
# página se reduce a un CRUD mínimo (nombre/handle) sin las pestañas de radar.
BR="app/pages/(config)/brands"
if [ "$HAS_BRANDS" = "no" ]; then
  rm -rf server/api/general-settings/brands
  rm -rf server/database/schema/general-settings/brands
  rm -f server/utils/general-settings/brand-ownership.ts
  rm -rf "$BR"
  rm -f app/middleware/require-brand.global.ts
  rm -f app/components/layout/header/BrandSwitcher.vue
else
  # Recortar la config de radar (v0) de la página de marcas.
  rm -f "$BR/components/ReplyStyleManager.vue"
  rm -rf "$BR/components/modals/account-add"
  rm -f "$BR/components/modals/AccountAddModal.vue" "$BR/components/modals/KeywordModal.vue"
  rm -f "$BR/components/tabs/AccountSettings.vue" "$BR/components/tabs/IaSettings.vue" "$BR/components/tabs/KeywordSettings.vue"
  rm -f "$BR/composables/useAccountsService.ts" "$BR/composables/useKeywordsService.ts" "$BR/composables/useReplySettingsService.ts"
  rm -f "$BR/repositories/accounts.repository.ts" "$BR/repositories/keywords.repository.ts" "$BR/repositories/reply-settings.repository.ts"
  rm -f "$BR/types/radar-config.types.ts"
  rm -f "$BR/utils/format-followers.ts"

  # Página de marcas mínima: switcher + alta + pestaña general (editar/borrar).
  cat > "$BR/index.vue" << 'EOF'
<template>
  <div>
    <SectionPageHeader
      :title="$t('brands.title')"
      :description="$t('brands.description')"
    />

    <!-- Estado vacío: onboarding para crear la primera marca -->
    <div v-if="!brands.length" class="mt-8 flex flex-col items-start gap-3">
      <h2 class="text-lg font-semibold">{{ $t("brands.onboardingTitle") }}</h2>
      <p class="text-sm text-gray-500">{{ $t("brands.onboardingDescription") }}</p>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="onAdd">
        {{ $t("brands.add") }}
      </v-btn>
    </div>

    <template v-else>
      <div class="mt-6 flex flex-wrap items-center gap-2">
        <LayoutHeaderBrandSwitcher hide-manage />
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="onAdd">
          {{ $t("brands.add") }}
        </v-btn>
      </div>

      <div v-if="activeBrand" class="mt-8">
        <BrandsGeneralSettings />
      </div>
    </template>

    <BrandsModalBrand v-model="modalOpen" @save="onSave" />
  </div>
</template>

<script setup lang="ts">
import LayoutHeaderBrandSwitcher from "~/app/components/layout/header/BrandSwitcher.vue";
import BrandsModalBrand from "./components/modals/ModalBrand.vue";
import BrandsGeneralSettings from "./components/tabs/GeneralSettings.vue";
import { useBrandService } from "./composables/useBrandService";

const { t: $t } = useI18n();
const { brands, activeBrand, fetchBrands, createBrand } = useBrandService();

const modalOpen = ref(false);

await fetchBrands();

const onAdd = () => {
  modalOpen.value = true;
};

const onSave = async (data: { name: string; handle: string }) => {
  await createBrand(data);
};
</script>
EOF

  # useBrandService: el upsell de plan (getPlanErrorKey) solo aplica con billing.
  if [ "$HAS_BILLING" = "yes" ]; then
    PLANERR_IMPORT='import { getPlanErrorKey } from "~/app/pages/(config)/settings/utils/plan-error";'
    PLANERR_BLOCK='      const planErrorKey = getPlanErrorKey(err);
      if (planErrorKey) {
        // Mensaje de upsell: el usuario ha superado el límite de su plan.
        console.warn(planErrorKey);
      }
'
  else
    PLANERR_IMPORT=""
    PLANERR_BLOCK=""
  fi
  cat > "$BR/composables/useBrandService.ts" << EOF
import { brandsRepository } from "../repositories/brands.repository";
import type { Brand, NewBrand } from "../types/brands.types";
$PLANERR_IMPORT
export const useBrandService = () => {
  const brands = useState<Brand[]>("brands", () => []);
  const loading = useState<boolean>("brands-loading", () => false);
  // Id de la marca activa persistido en cookie (SSR-safe).
  const activeBrandId = useCookie<number | null>("brand-active-id", {
    default: () => null,
  });

  const activeBrand = computed<Brand | null>(
    () => brands.value.find((b) => b.id === activeBrandId.value) ?? null,
  );

  const setActiveBrand = (id: number) => {
    activeBrandId.value = id;
  };

  // Garantiza que activeBrandId apunta a una marca existente; si no, la primera.
  const ensureValidActiveBrand = () => {
    if (!brands.value.length) {
      activeBrandId.value = null;
      return;
    }
    const exists = brands.value.some((b) => b.id === activeBrandId.value);
    if (!exists) activeBrandId.value = brands.value[0]!.id;
  };

  const fetchBrands = async () => {
    loading.value = true;
    try {
      brands.value = await brandsRepository.retrieve();
      ensureValidActiveBrand();
    } catch (err) {
      console.error("Error cargando brands:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createBrand = async (data: NewBrand) => {
    try {
      const created = await brandsRepository.create(data);
      brands.value = [created, ...brands.value];
      // Primera marca creada → se selecciona automáticamente.
      if (activeBrandId.value === null) activeBrandId.value = created.id;
      return created;
    } catch (err) {
$PLANERR_BLOCK      console.error("Error creando brand:", err);
      throw err;
    }
  };

  const updateBrand = async (id: number, data: Partial<Brand>) => {
    try {
      const updated = await brandsRepository.update(id, data);
      const index = brands.value.findIndex((b) => b.id === id);
      if (index !== -1) brands.value[index] = updated;
    } catch (err) {
      console.error("Error actualizando brand:", err);
      throw err;
    }
  };

  const deleteBrand = async (id: number) => {
    try {
      await brandsRepository.destroy(id);
      brands.value = brands.value.filter((b) => b.id !== id);
      ensureValidActiveBrand();
    } catch (err) {
      console.error("Error eliminando brand:", err);
      throw err;
    }
  };

  return {
    brands: readonly(brands),
    loading: readonly(loading),
    activeBrandId: readonly(activeBrandId),
    activeBrand,
    fetchBrands,
    setActiveBrand,
    createBrand,
    updateBrand,
    deleteBrand,
  };
};
EOF
fi

# ── 5. Billing ──────────────────────────────────────────────────────────────
if [ "$HAS_BILLING" = "no" ]; then
  rm -rf server/api/general-settings/billing
  rm -rf server/services/general-settings/billing
  rm -rf server/database/schema/general-settings/subscriptions
  rm -rf server/constants/general-settings   # solo contiene los planes
  rm -f server/utils/general-settings/plan-limits.ts
  # Pestaña y capas de billing dentro de ajustes (si auth se mantiene)
  rm -f "app/pages/(config)/settings/components/tabs/BillingSettings.vue"
  rm -f "app/pages/(config)/settings/composables/useBillingService.ts"
  rm -f "app/pages/(config)/settings/repositories/billing.repository.ts"
  rm -f "app/pages/(config)/settings/types/billing.types.ts"
  rm -f "app/pages/(config)/settings/utils/plan-error.ts"
fi

# brands sin billing: el endpoint de brands ya no puede limitar por plan.
if [ "$HAS_BRANDS" = "yes" ] && [ "$HAS_BILLING" = "no" ]; then
  # Elimina el import y la llamada a assertCanCreateBrand (ambas líneas la citan).
  sed -i '' '/assertCanCreateBrand/d' server/api/general-settings/brands/index.ts
fi

# plan-limits: v0 se lleva keyword/account/ai; solo puede sobrevivir el límite de
# marcas. Si hay billing, se recorta a assertCanCreateBrand (si hay brands) o se
# elimina (nadie lo usa). Si no hay billing, ya se borró arriba.
if [ "$HAS_BILLING" = "yes" ]; then
  if [ "$HAS_BRANDS" = "yes" ]; then
    cat > server/utils/general-settings/plan-limits.ts << 'EOF'
import { count, eq } from "drizzle-orm";
import { db } from "~/server/database";
import { subscriptions, brands } from "~/server/database/schema";
import { PLANS, resolveEffectivePlan, isWithinLimit } from "~/server/constants/general-settings/plans";
import type { Plan } from "~/server/constants/general-settings/plans";

// Resuelve el plan efectivo del usuario leyendo su suscripción. Si por algún
// motivo no tuviera fila (no debería pasar), se trata como "free".
export const getEffectivePlan = async (userId: number): Promise<Plan> => {
  const [sub] = await db
    .select({ plan: subscriptions.plan, status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));
  if (!sub) return "free";
  return resolveEffectivePlan(sub.plan, sub.status);
};

// Lanza 402 con un código de plan estable que el frontend mapea a un mensaje.
const denyLimit = (statusMessage: string): never => {
  throw createError({ statusCode: 402, statusMessage });
};

export const assertCanCreateBrand = async (userId: number): Promise<void> => {
  const plan = await getEffectivePlan(userId);
  const [row] = await db
    .select({ value: count() })
    .from(brands)
    .where(eq(brands.userId, userId));
  if (!isWithinLimit(row?.value ?? 0, PLANS[plan].maxBrands)) {
    denyLimit("PLAN_LIMIT_BRANDS");
  }
};
EOF
  else
    rm -f server/utils/general-settings/plan-limits.ts
  fi
fi

# ── 5b. Desacoplar endpoints que cruzan sistemas ────────────────────────────
# El registro crea una suscripción free; sin billing, ese insert sobra.
if [ "$HAS_AUTH" = "yes" ] && [ "$HAS_BILLING" = "no" ]; then
  sed -i '' \
    -e 's/import { users, verificationTokens, subscriptions }/import { users, verificationTokens }/' \
    -e '/Cada usuario arranca con una suscripción free/d' \
    -e '/tx.insert(subscriptions)/d' \
    server/api/auth/register.post.ts
fi

# La suscripción reporta el uso de marcas; sin brands, se quita ese cómputo.
if [ "$HAS_BILLING" = "yes" ] && [ "$HAS_BRANDS" = "no" ]; then
  sed -i '' \
    -e 's/import { count, eq }/import { eq }/' \
    -e 's/import { subscriptions, brands }/import { subscriptions }/' \
    -e '/const \[brandCount\] = await db/d' \
    -e '/\.select({ value: count() })/d' \
    -e '/\.from(brands)/d' \
    -e '/\.where(eq(brands\.userId, userId))/d' \
    -e 's/usage: { brands: brandCount?.value ?? 0 }/usage: {}/' \
    server/api/general-settings/billing/subscription.get.ts
fi

# ── 6. Auth (implica billing=no y brands=no) ────────────────────────────────
if [ "$HAS_AUTH" = "no" ]; then
  rm -rf "app/pages/(auth)"
  rm -rf "app/pages/(config)"          # settings (y brands ya eliminado)
  rm -rf server/api/auth
  rm -rf server/api/general-settings/user
  rm -rf server/database/schema/auth
  rm -rf server/utils/auth
  rm -f server/middleware/auth.ts
  rm -f app/middleware/auth.global.ts
  # Augmentaciones de tipos de la sesión de nuxt-auth-utils.
  rm -f app/types/auth.d.ts server/types/auth.d.ts
  # Quitar el módulo de sesión
  sed -i '' '/nuxt-auth-utils/d' nuxt.config.ts
  # MainMenu depende de useAccountService (auth); lo reducimos al selector de idioma.
  cat > app/components/layout/header/MainMenu.vue << 'EOF'
<template>
  <v-menu v-model="menuOpen" location="bottom end" :close-on-content-click="true">
    <template #activator="{ props }">
      <v-btn icon class="rounded-lg" :title="$t('menu.language')" v-bind="props">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </template>
    <v-list min-width="200">
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
const { locale, locales, setLocale } = useI18n();
const menuOpen = ref(false);

const availableLocales = computed(() =>
  (locales.value as { code: "es" | "en" }[]).map((l) => ({ code: l.code })),
);
</script>
EOF
fi

# ── 7. Ajustes: regenerar pestañas si billing se eliminó pero auth se mantiene
if [ "$HAS_AUTH" = "yes" ] && [ "$HAS_BILLING" = "no" ]; then
  cat > "app/pages/(config)/settings/index.vue" << 'EOF'
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
EOF
fi

# ── 8. Regenerar el header (BrandSwitcher solo si hay marcas) ────────────────
BRANDSWITCHER_TAG=""
BRANDSWITCHER_IMPORT=""
if [ "$HAS_BRANDS" = "yes" ]; then
  BRANDSWITCHER_TAG="          <BrandSwitcher />"
  BRANDSWITCHER_IMPORT='import BrandSwitcher from "./BrandSwitcher.vue";'
fi
cat > app/components/layout/header/index.vue << EOF
<template>
  <header class="root-layout__header">
    <div>
      <div class="relative flex h-full w-full items-center justify-between">
        <MainLogo />
        <MainNavigation />
        <div class="flex items-center gap-2">
$BRANDSWITCHER_TAG
          <UiVicSocial />
          <MainMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import MainLogo from "./MainLogo.vue";
import MainNavigation from "./MainNavigation.vue";
import MainMenu from "./MainMenu.vue";
$BRANDSWITCHER_IMPORT
</script>

<style scoped>
.root-layout__header {
  z-index: 100;
  background-color: white;
  border-bottom: 1px solid var(--border-default);

  position: sticky;
  top: 0;
  padding: 8px 16px;
}
</style>
EOF

# ── 9. Regenerar navegación (routes.config.ts) según sistemas activos ───────
{
  cat << 'EOF'
type NavigationItem = {
  to: string;
  titleKey: string;
  icon: string;
  type?: string;
  beta?: boolean;
};

// Barra de navegación principal. Añade aquí las rutas de tu proyecto.
export const MAIN_NAVIGATION: NavigationItem[] = [];

export const MAIN_MENU: NavigationItem[] = [
EOF
  [ "$HAS_BRANDS" = "yes" ] && echo '  { to: "/brands", titleKey: "menu.brands", icon: "mdi-tag-multiple", type: "settings" },'
  [ "$HAS_AUTH" = "yes" ] && echo '  { to: "/settings", titleKey: "menu.settings", icon: "mdi-cog", type: "settings" },'
  [ "$HAS_AUTH" = "yes" ] && echo '  { to: "/logout", titleKey: "auth.logout.menu", icon: "mdi-logout", type: "others" },'
  echo "];"
} > app/routes.config.ts

# ── 10. Regenerar el barrel de schemas (solo lo que queda) ──────────────────
{
  echo "// Exporta aquí tus schemas de Drizzle"
  [ "$HAS_AUTH" = "yes" ] && echo 'export * from "./auth/users";'
  [ "$HAS_BRANDS" = "yes" ] && echo 'export * from "./general-settings/brands";'
  [ "$HAS_BILLING" = "yes" ] && echo 'export * from "./general-settings/subscriptions";'
} > server/database/schema/index.ts

# ── 11. Migrations vacías ───────────────────────────────────────────────────
mkdir -p server/database/migrations/meta
cat > server/database/migrations/meta/_journal.json << 'EOF'
{
  "version": "7",
  "dialect": "postgresql",
  "entries": []
}
EOF

# ── 12. Limpiar página index ────────────────────────────────────────────────
cat > app/pages/index.vue << 'EOF'
<template>
  <div class="flex items-center justify-center min-h-screen">
    <h1 class="text-3xl font-bold">Welcome</h1>
  </div>
</template>
EOF

# ── 13. Eliminar carpetas vacías que hayan quedado ──────────────────────────
find server app -type d -empty -delete 2>/dev/null || true

# ── 14. Resetear README ─────────────────────────────────────────────────────
cat > README.md << EOF
# $PROJECT_NAME

## Setup

\`\`\`bash
npm install
cp .env.example .env
# Configura tu DATABASE_URL en .env
npm run dev
\`\`\`
EOF

# ── 15. .env.example según sistemas activos ─────────────────────────────────
{
  echo "NODE_ENV=development"
  echo ""
  echo "# Postgres (Neon / Supabase / local). Requerido."
  echo "DATABASE_URL=postgresql://usuario@localhost:5432/mi_db"
  if [ "$HAS_AUTH" = "yes" ]; then
    cat << 'EOF'

# Auth (nuxt-auth-utils). Clave de cifrado de la sesión. Requerido. Mínimo 32 caracteres.
NUXT_SESSION_PASSWORD=

# Resend - emails de verificación y recuperación de contraseña.
RESEND_API_KEY=
EMAIL_FROM=noreply@example.com
EOF
  fi
  if [ "$HAS_BILLING" = "yes" ]; then
    cat << 'EOF'

# Stripe (vacío = modo mock automático en desarrollo).
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
EOF
  fi
} > .env.example

# ── 16. Limpiar meta del template ───────────────────────────────────────────
rm -f CLAUDE.md TODOs.md
rm -f .github/copilot-instructions.md

# ── 17. Inicializar git limpio ──────────────────────────────────────────────
git init -q
git add .
git commit -q -m "Initial commit from template"

echo ""
echo "✅ Proyecto '$PROJECT_NAME' creado (auth=$HAS_AUTH · billing=$HAS_BILLING · brands=$HAS_BRANDS)"
echo ""
echo "   cd $DEST_DIR"
echo "   npm install"
echo "   cp .env.example .env      # rellena DATABASE_URL$([ "$HAS_AUTH" = yes ] && echo " y NUXT_SESSION_PASSWORD")"
echo "   npm run db:generate && npm run db:push"
echo "   npm run tsc               # verifica que no quedan referencias colgadas"
echo "   npm run dev"
echo ""
echo "📝 Revisa manualmente:"
echo "   - app/locales/{es,en}.json: se conservan intactos; elimina las claves de"
echo "     los módulos que ya no existen (v0, y billing/brands/auth si los quitaste)."
[ "$HAS_AUTH" = "no" ] && echo "   - Sin auth: no hay control de sesión. Añade tu propia protección de rutas si la necesitas."
echo "   - docs/arquitectura y .claude/rules describen la estructura base (auth/general-settings/v0)."

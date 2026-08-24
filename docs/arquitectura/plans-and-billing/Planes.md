# Planes y facturación (Billing)

Sistema de suscripciones SaaS **por usuario** con dos planes (**Free** y **Pro**), cobrados con
**Stripe** (Checkout + Customer Portal + webhooks). El plan efectivo limita el uso de la app
(marcas, keywords, cuentas, análisis IA). La configuración de planes es **modular**: añadir un plan
o cambiar un límite se hace editando un único archivo.

> Documentos relacionados: spec en `docs/superpowers/specs/2026-06-30-billing-subscriptions-design.md`
> y plan de implementación en `docs/superpowers/plans/2026-06-30-billing-subscriptions.md`.

---

## 1. Resumen rápido

| Concepto | Valor |
| --- | --- |
| Ámbito de la suscripción | Por **usuario** (no por marca) |
| Planes | `free`, `pro` |
| Proveedor de cobro | Stripe (Checkout hosted + Customer Portal) |
| Modo sin claves de Stripe | **Mock automático** (desarrollo) |
| Página de planes | `/billing` (menú → **Planes**) |
| Fuente de verdad del estado | Stripe → webhook → tabla `subscriptions` |

---

## 2. Planes y límites

Toda la configuración vive en **`server/constants/general-settings/plans.ts`**. Es el **único** punto que hay que
tocar para crear un plan o cambiar un límite.

```ts
export interface PlanConfig {
  maxBrands: number | null;          // total por usuario
  maxKeywordsPerBrand: number | null;
  maxAccountsPerBrand: number | null;
  aiAnalysis: boolean;
  stripePriceId: string | null;      // null = no comprable (free)
}
```

Valores actuales:

| Límite | Free | Pro |
| --- | --- | --- |
| Marcas (total por usuario) | **1** | ∞ (`null`) |
| Keywords por marca | **5** | ∞ (`null`) |
| Cuentas monitorizadas por marca | **5** | ∞ (`null`) |
| Análisis IA de oportunidades | ❌ | ✅ |
| Comprable en Stripe | — | `STRIPE_PRICE_PRO` |

> **`null` = ilimitado** (no se usa `Infinity` porque `JSON.stringify(Infinity)` produce `null` y
> rompería la serialización hacia el frontend).

---

## 3. Plan efectivo

El plan "real" que se aplica no es solo la columna `plan`, sino el resultado de cruzarla con el
`status` de Stripe. Lógica en `server/constants/general-settings/plans.ts`:

```ts
resolveEffectivePlan(plan, status):
  → "pro"  si plan === "pro" Y status ∈ { active, trialing }
  → "free" en cualquier otro caso
```

Es decir: una suscripción marcada `pro` pero con `status` `past_due` / `canceled` / `incomplete`
**se trata como Free** a efectos de límites. Esta función es la única fuente de verdad y la usan
tanto el endpoint `GET /subscription` como todos los helpers de enforcement.

`isWithinLimit(current, max)`: `max === null` ⇒ siempre permitido; si no, `current < max`
(crear el recurso nº `max` queda bloqueado).

---

## 4. Modelo de datos

Tabla **`subscriptions`** (`server/database/schema/general-settings/subscriptions/index.ts`). Una fila por usuario.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | serial PK | |
| `user_id` | int, **unique**, FK→users (cascade) | 1 suscripción por usuario |
| `plan` | enum `plan` | `free` \| `pro`. Default `free` |
| `status` | enum `subscription_status` | `active`/`trialing`/`past_due`/`canceled`/`incomplete`. Default `active` |
| `stripe_customer_id` | text, nullable | `null` hasta el primer checkout |
| `stripe_subscription_id` | text, nullable | |
| `current_period_end` | timestamp, nullable | Fin del periodo pagado (Pro) |
| `created_at` / `updated_at` | timestamp | |

**Ciclo de vida de la fila:**

1. Se crea en `plan="free"` **al registrarse** (`server/api/auth/register.post.ts`, dentro de una
   transacción junto al token de verificación).
2. Se actualiza a `pro` vía **webhook de Stripe** (o `dev/activate` en mock).
3. Vuelve a `free`/`canceled` cuando Stripe envía `customer.subscription.deleted`.

> Usuarios creados **antes** de existir el sistema: `POST /api/general-settings/billing/backfill` inserta una fila
> `free` para todos los que no tengan ninguna (idempotente).

---

## 5. Enforcement (servidor)

Los límites se aplican **siempre en el servidor** (nunca se confía en el front). Helpers en
**`server/utils/general-settings/plan-limits.ts`**, lanzan `createError({ statusCode: 402, statusMessage: <CÓDIGO> })`:

| Helper | Se llama en | Código de error |
| --- | --- | --- |
| `assertCanCreateBrand(userId)` | `POST /api/general-settings/brands` | `PLAN_LIMIT_BRANDS` |
| `assertCanCreateKeyword(userId, brandId)` | `POST /api/v0/radar/keywords` | `PLAN_LIMIT_KEYWORDS` |
| `assertCanCreateAccount(userId, brandId)` | `POST /api/v0/radar/accounts` | `PLAN_LIMIT_ACCOUNTS` |
| `assertAiAllowed(userId)` | `POST /api/v0/opportunities/:id/reply` | `PLAN_AI_NOT_ALLOWED` |

Cada helper: resuelve el plan efectivo → cuenta el uso actual en la BD → compara con `PLANS[plan]`.
El `statusMessage` es una **key estable** que el frontend mapea a un mensaje i18n.

---

## 6. Endpoints de la API

Todos en `server/api/general-settings/billing/`.

| Método / Ruta | Auth | Función |
| --- | --- | --- |
| `GET /api/general-settings/billing/subscription` | Sesión | Devuelve `{ plan, status, effectivePlan, limits, usage: { brands } }` |
| `POST /api/general-settings/billing/checkout` | Sesión | Crea sesión de Stripe Checkout (plan Pro). Devuelve `{ url }` |
| `POST /api/general-settings/billing/portal` | Sesión | Crea sesión del Customer Portal. `{ url }`. 400 si no hay `stripeCustomerId` |
| `POST /api/general-settings/billing/webhook` | **Firma Stripe** | Sincroniza `subscriptions`. Sin auth de sesión |
| `POST /api/general-settings/billing/dev/activate` | Sesión (**solo mock**) | Simula upgrade a Pro sin pagar. 403 en modo real |
| `POST /api/general-settings/billing/backfill` | Sesión | Crea filas `free` para usuarios sin suscripción (migración puntual) |

> **Importante:** `/api/general-settings/billing/webhook` está **exento** del middleware global de sesión
> (`server/middleware/auth.ts`), porque su autenticidad la da la **firma de Stripe**, no la cookie.
> El resto de rutas de billing sí requieren sesión.

---

## 7. Servicio de billing (real vs mock)

`server/services/general-settings/billing/` — mismo patrón que `twitterService` / `aiService`: un servicio con
`getSource()` que decide la fuente.

```
getSource():
  → "mock"   si NO hay STRIPE_SECRET_KEY   (desarrollo)
  → "stripe" en otro caso
```

- **`repository/stripe.repository.ts`** — implementación real con el SDK `stripe` (v22).
  - Nota SDK v22: `current_period_end` está en `sub.items.data[0]`, no en `sub`.
- **`utils/mock.ts`** — en mock, el checkout devuelve una URL fake que vuelve a `/billing?status=success`.
- **`services/billing.service.ts`** — lógica agnóstica al proveedor (`createCheckout`, `createPortal`, `parseWebhook`).
- **`index.ts`** — punto de entrada (`billingService`).

### Webhook

`parseWebhook(rawBody, signature)`:
1. Verifica la **firma de Stripe** sobre el **body crudo** (`constructEvent`).
2. Mapea solo 3 tipos de evento; cualquier otro → `data: null` (se ignora):
   - `checkout.session.completed` → liga `stripeCustomerId` al usuario vía `client_reference_id`.
   - `customer.subscription.updated` → actualiza estado/periodo.
   - `customer.subscription.deleted` → `status=canceled`, `plan=free`.
3. Devuelve `{ type, data: SyncedSubscription | null }`. El handler ignora el evento si `data` es null.

Es **idempotente** (usa `UPDATE`, nunca `INSERT`).

---

## 8. Frontend

Módulo en `app/pages/(config)/billing/` con las 3 capas del proyecto:

```
billing/
├── index.vue                         # vista de planes (Tailwind; Vuetify solo VBtn)
├── composables/useBillingService.ts  # estado + acciones (fetchSubscription, onUpgrade, onManage, onDevActivate)
├── repositories/billing.repository.ts# HTTP (singleton, extiende Repository)
├── types/billing.types.ts            # BillingInfo (parte del schema/constants)
└── utils/plan-error.ts               # getPlanErrorKey(err) → key i18n del error 402
```

- **Acceso:** menú → **Planes** (`MAIN_MENU` en `app/routes.config.ts`, ruta `/billing`).
- **Carga de datos en cliente** (`onMounted`), no en SSR: el `$fetch` del Repository base no
  reenvía la cookie de sesión en SSR y la API protegida daría 401.
- `/billing` está **exento** de `require-brand.global.ts`, así que se puede ver sin tener marcas.
- Errores de plan (402): `getPlanErrorKey()` detecta el código y lo mapea a `billing.errors.*`.
  > Estado actual: solo se hace `console.warn` (no hay sistema de toasts aún — ver §11).

### i18n

Claves en `app/locales/es.json` y `en.json`:
- `menu.billing` (etiqueta del menú).
- `billing.*`: `title`, `loading`, `current`, `upgrade`, `manage`, `devActivate`,
  `usage.brands`, `plans.free/pro.{name,desc}`, `errors.PLAN_*`.

> Recordatorio: escapar `@` como `{'@'}` en los locales o no carga ningún mensaje.

---

## 9. Variables de entorno

En `.env` (vacías = modo mock automático). Documentadas en `.env.example`.

```bash
STRIPE_SECRET_KEY=        # sk_test_... / sk_live_...  (vacío → modo mock)
STRIPE_WEBHOOK_SECRET=    # whsec_...
STRIPE_PRICE_PRO=         # price_...  (precio del plan Pro)
```

---

## 10. Cómo trabajar con esto

### Probar en local (modo mock, sin Stripe)

1. `npm run dev`, regístrate / inicia sesión.
2. Menú → **Planes** (`/billing`). Verás Free como plan actual.
3. Botón **"Activar Pro (solo desarrollo)"** → la fila pasa a `pro` y los límites se desbloquean.
4. Para volver a Free: edita la fila en `npm run db:studio` (o llama a Stripe en modo real).

### Probar el webhook real

```bash
# con STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET configurados:
stripe listen --forward-to localhost:3000/api/general-settings/billing/webhook
```
Completa un checkout de prueba → la fila del usuario pasa a `pro/active`.

### Añadir un plan nuevo (p. ej. `business`)

1. Añade el valor al `planEnum` en `server/database/schema/general-settings/subscriptions/index.ts`.
2. `npm run db:generate` + `npm run db:push`.
3. Añade su entrada a `PLANS` en `server/constants/general-settings/plans.ts` (límites + `stripePriceId`).
4. Ajusta `resolveEffectivePlan` si el nuevo plan también debe considerarse "de pago".
5. (Frontend) añade su tarjeta en `index.vue` y las claves i18n `billing.plans.business.*`.

### Cambiar un límite

Edita el número en `PLANS` (`server/constants/general-settings/plans.ts`). Nada más.

---

## 11. Pendiente / mejoras conocidas

- **UX del error 402:** hoy solo `console.warn`. Falta renderizar el mensaje (`billing.errors.*`)
  como toast/aviso con CTA a `/billing` cuando se alcanza un límite. (No hay sistema de toasts aún.)
- **`POST /api/general-settings/billing/backfill`:** accesible por cualquier usuario logado. Restringir a admin/dev
  o eliminarlo tras ejecutar el backfill antes de producción.
- **Planes anuales, cupones, equipos, plan Business:** fuera de alcance del MVP.
- **Tests:** la lógica pura (`resolveEffectivePlan`, `isWithinLimit`) tiene tests
  (`server/constants/general-settings/plans.test.ts`); endpoints y webhook se verifican con `tsc` + modo mock manual.

---

## 12. Mapa de archivos

| Archivo | Responsabilidad |
| --- | --- |
| `server/database/schema/general-settings/subscriptions/index.ts` | Tabla + enums + tipos |
| `server/constants/general-settings/plans.ts` | Config de planes + `resolveEffectivePlan` + `isWithinLimit` |
| `server/constants/general-settings/plans.test.ts` | Tests de la lógica pura |
| `server/utils/general-settings/plan-limits.ts` | Helpers de enforcement (402) |
| `server/services/general-settings/billing/*` | Servicio Stripe/mock + webhook parsing |
| `server/api/general-settings/billing/*` | Endpoints (subscription, checkout, portal, webhook, dev/activate, backfill) |
| `server/api/auth/register.post.ts` | Crea la suscripción `free` al registrarse |
| `server/middleware/auth.ts` | Exime el webhook de la auth de sesión |
| `app/pages/(config)/billing/*` | Frontend (vista, service, repository, types, util) |
| `app/routes.config.ts` | Entrada de menú **Planes** |
| `app/middleware/require-brand.global.ts` | Exime `/billing` del redirect a `/brands` |
| `app/locales/{es,en}.json` | Textos i18n |

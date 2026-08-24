# Flujos de Autenticación

Documentación del sistema de autenticación de la aplicación.

## Stack Tecnológico

- **Framework**: Nuxt.js 4
- **Base de datos**: PostgreSQL + Drizzle ORM
- **Sesiones**: nuxt-auth-utils (cookies HTTP-only)
- **Emails**: Resend
- **Seguridad**: bcrypt + tokens aleatorios

## Estructura de Archivos

```
app/pages/(auth)/
├── login.vue              # Inicio de sesión
├── register.vue           # Registro
├── logout.vue             # Cierre de sesión
├── forgot-password.vue    # Solicitar recuperación
└── reset-password.vue     # Restablecer contraseña

server/api/auth/
├── register.post.ts       # POST - Crear cuenta
├── login.post.ts          # POST - Iniciar sesión
├── logout.post.ts         # POST - Cerrar sesión
├── verify-email.get.ts    # GET - Verificar email
├── forgot-password.post.ts # POST - Solicitar recuperación
└── reset-password.post.ts  # POST - Restablecer contraseña
```

---

## 1. Registro de Usuario

### Flujo

```
/register → POST /api/auth/register → BD (users + verification_tokens) → Email enviado
```

### Proceso

1. **Usuario envía formulario** con nombre, email y contraseña
2. **Backend valida**:
   - Email y contraseña obligatorios
   - Email no existe en BD
3. **Crea usuario**:
   - Hash de contraseña con bcrypt
   - `emailVerified = false`
4. **Genera token de verificación**:
   - Token aleatorio de 32 bytes (hex)
   - Válido por 24 horas
5. **Envía email** con enlace: `/api/auth/verify-email?token=xxx`
6. **Usuario no puede iniciar sesión** hasta verificar email

### Datos en BD

```sql
-- Tabla users
| id | email           | email_verified | created_at |
|----|-----------------|----------------|------------|
| 1  | user@mail.com   | false          | 2026-04-14 |

-- Tabla verification_tokens
| id | user_id | token    | expires_at          |
|----|---------|----------|---------------------|
| 1  | 1       | a4f3c... | 2026-04-15 13:00:00 |
```

---

## 2. Verificación de Email

### Flujo

```
Email → Click → GET /api/auth/verify-email?token=xxx → Usuario verificado → Auto-login → Redirige a /
```

### Proceso

1. **Usuario hace clic** en enlace del email
2. **Backend valida token**:
   - Token existe en BD
   - No ha expirado
3. **Marca usuario como verificado**: `emailVerified = true`
4. **Elimina token** (ya usado)
5. **Crea sesión automática** (login)
6. **Redirige** a la página principal

### Resultado

✅ Usuario verificado  
✅ Sesión iniciada  
✅ Token eliminado

---

## 3. Inicio de Sesión

### Flujo

```
/login → POST /api/auth/login → Validaciones → Crea sesión → Redirige a /
```

### Validaciones en Orden

1. ✅ Email y contraseña proporcionados
2. ✅ Usuario existe en BD
3. ✅ Email verificado (`emailVerified === true`)
4. ✅ Contraseña correcta (bcrypt.compare)
5. ✅ Crea sesión (cookie HTTP-only)
6. ✅ Redirige a página principal

### Errores Comunes

- **"Credenciales incorrectas"** → Usuario no existe o contraseña incorrecta
- **"Debes verificar tu email..."** → Email no verificado aún

---

## 4. Cierre de Sesión

### Flujo

```
Click "Cerrar sesión" → /logout → POST /api/auth/logout → Elimina cookie → Redirige a /login
```

### Proceso

1. Usuario hace clic en "Cerrar sesión"
2. Navega a `/logout` (muestra spinner)
3. Llama a `POST /api/auth/logout`
4. Backend elimina cookie de sesión
5. Redirige a `/login`

---

## 5. Recuperación de Contraseña

### Flujo

```
/forgot-password → POST /api/auth/forgot-password → Token generado → Email enviado
```

### Proceso

1. **Usuario ingresa email**
2. **Backend busca usuario**:
   - Si no existe, responde igual (seguridad)
3. **Genera token de reset**:
   - Token aleatorio de 32 bytes
   - Válido por **1 hora** (más corto que verificación)
4. **Envía email** con enlace: `/reset-password?token=xxx`
5. **Respuesta**: "Si el email está registrado, recibirás un enlace"

### Seguridad

⚠️ **Siempre responde éxito**, exista o no el email, para prevenir enumeración de usuarios.

---

## 6. Restablecimiento de Contraseña

### Flujo

```
Email → Click → /reset-password?token=xxx → POST /api/auth/reset-password → Password actualizada
```

### Proceso

1. **Usuario hace clic** en enlace del email
2. **Ingresa nueva contraseña** (con confirmación)
3. **Backend valida**:
   - Token existe y no ha expirado (1 hora)
   - Contraseña >= 6 caracteres
4. **Actualiza contraseña**: nuevo hash con bcrypt
5. **Elimina TODOS los tokens de reset** del usuario
6. **Muestra éxito** con botón para ir a login

### Resultado

✅ Contraseña actualizada  
✅ Tokens eliminados (no reutilizables)  
✅ Usuario puede iniciar sesión con nueva contraseña

---

## Seguridad

### Hash de Contraseñas

```typescript
// bcrypt con 10 salt rounds
const passwordHash = await hashPassword(password);
const valid = await verifyPassword(hash, password);
```

### Generación de Tokens

```typescript
// 32 bytes (256 bits) - criptográficamente seguro
const token = randomBytes(32).toString("hex");
```

### Cookies de Sesión

- **HTTP-only**: No accesible desde JavaScript
- **Secure**: Solo HTTPS en producción
- **Firmadas**: Con NUXT_SESSION_PASSWORD
- **SameSite**: Lax/Strict

### Expiración de Tokens

| Token                 | Duración |
| --------------------- | -------- |
| Verificación de email | 24 horas |
| Reset de contraseña   | 1 hora   |

### Prevención de Ataques

✅ **Enumeración de usuarios**: Respuestas genéricas en forgot-password  
✅ **Reutilización de tokens**: Eliminados tras uso  
✅ **CSRF**: Cookies con SameSite  
✅ **XSS**: HTTP-only cookies

---

## Base de Datos

### Tablas

```typescript
// users
{
  id: number
  email: string (UNIQUE)
  passwordHash: string
  nombre: string?
  emailVerified: boolean (default: false)
  createdAt: timestamp
}

// verification_tokens
{
  id: number
  userId: number (FK → users)
  token: string (UNIQUE)
  expiresAt: timestamp
  createdAt: timestamp
}

// password_reset_tokens
{
  id: number
  userId: number (FK → users)
  token: string (UNIQUE)
  expiresAt: timestamp
  createdAt: timestamp
}
```

### Relaciones

- `onDelete: cascade` → Al eliminar usuario, se eliminan sus tokens

---

## Configuración

### Variables de Entorno

```bash
# .env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=onboarding@resend.dev  # Dev
# EMAIL_FROM=info@vicci.es        # Prod (requiere verificar dominio)
NUXT_SESSION_PASSWORD=min-32-caracteres
```

### Resend

**Desarrollo**:

- Usar `onboarding@resend.dev` (no requiere verificación)

**Producción**:

- Verificar dominio en [resend.com/domains](https://resend.com/domains)
- Configurar DNS (SPF, DKIM, DMARC)

---

## Middleware de Protección

```typescript
// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  // Redirigir a login si no autenticado
  if (!loggedIn.value && !publicRoutes.includes(to.path)) {
    return navigateTo("/login");
  }

  // Redirigir a home si ya autenticado
  if (loggedIn.value && publicRoutes.includes(to.path)) {
    return navigateTo("/");
  }
});
```

---

## Diagrama de Estados

```
┌─────────────┐
│ Sin Cuenta  │
└──────┬──────┘
       │ register
       ▼
┌──────────────────┐
│ Email No Verificado│ ─── Error al login
└──────┬───────────┘
       │ verify-email
       ▼
┌──────────────────┐
│ Email Verificado │◄─────┐
└──────┬───────────┘      │
       │ login            │ logout
       ▼                  │
┌──────────────────┐      │
│  Sesión Activa   │──────┘
└──────────────────┘
       │
       │ forgot-password
       ▼
┌──────────────────┐
│ Token Reset      │
└──────┬───────────┘
       │ reset-password
       ▼
┌──────────────────┐
│ Password Updated │
└──────────────────┘
```

---

## Casos de Uso

### Token Expirado

- **Verificación** (24h): Debe registrarse de nuevo
- **Reset** (1h): Debe solicitar nuevo enlace

### Usuario Sin Verificar Intenta Login

- Error 403: "Debes verificar tu email antes de iniciar sesión"

### Reutilización de Tokens

- Los tokens se eliminan tras usarse
- No pueden reutilizarse

### Múltiples Recuperaciones

- Al usar un token de reset, se eliminan TODOS los tokens del usuario
- Enlaces anteriores dejan de funcionar

---

## Testing en Desarrollo

```bash
# 1. Registro
Ir a /register → Enviar formulario
→ Ver consola del servidor para enlace de verificación

# 2. Login
Ir a /login → Ingresar credenciales verificadas
→ Redirige a /

# 3. Recuperación
Ir a /forgot-password → Ingresar email
→ Ver consola para enlace de reset
→ Abrir enlace → Cambiar contraseña
→ Login con nueva contraseña

# 4. Logout
Click "Cerrar sesión" → Redirige a /login
```

---

## Mantenimiento

### Limpieza de Tokens Expirados

Los tokens expirados permanecen en BD. Recomendación: cron job para eliminarlos.

```typescript
// Ejemplo de limpieza
await db
  .delete(verificationTokens)
  .where(lt(verificationTokens.expiresAt, new Date()));

await db
  .delete(passwordResetTokens)
  .where(lt(passwordResetTokens.expiresAt, new Date()));
```

---

## Resumen

✅ Verificación de email obligatoria  
✅ Contraseñas hasheadas con bcrypt  
✅ Tokens temporales y de un solo uso  
✅ Sesiones seguras HTTP-only  
✅ Protección contra enumeración de usuarios  
✅ Recuperación de contraseña segura

El sistema sigue las mejores prácticas de seguridad y está listo para producción.

# Servicios Externos — Arquitectura base

Guía general para integrar cualquier API externa (DexScreener, PumpFun, Helius, Twitter, Telegram...).
Todos los servicios siguen el mismo patrón en capas, usando **DexScreener como referencia**.

## Patrón en capas: Repository → Mapper → Service

Cada integración vive en `server/services/{name}/` y separa responsabilidades en tres capas:

```
server/services/{name}/
  repository/
    types/{provider}.types.ts           # Tipos del servicio externo (raw tipado a mano, o alias del SDK)
    {provider}.repository.ts            # Fetch HTTP puro (singleton)
    {provider}.repository.http          # Tests manuales de endpoints (REST Client)
  mappers/{name}.mappers.ts             # Transforma raw → tipo de dominio
  services/
      types/{name}.types.ts             # Tipos de DOMINIO, tanto de los inputs como de los outputs.
      {name}.service.ts                 # Lógica de negocio y orquestación (singleton)
  utils/                                # Utilidades adicionales: mocks, helpers, prompts...
```

Regla clave: **cada capa solo conoce a la de abajo**. El endpoint API solo llama al Service
(importándolo directamente: `import { fooService } from "~/server/services/foo/services/foo.service"`);
que llama al repositorio y al mapper.

Aunque el tipo de salida sea el mismo de entada, el archivo mappers/{name}.mappers.ts debe existir.

> **Sin barrel `index.ts`.** No hay un fichero de entrada que reexporte el servicio: cada consumidor
> importa la ruta concreta (`services/{name}.service`) para el singleton.

## Dos ficheros de tipos, no confundir

- **`repository/types/{provider}.types.ts`** → **solo** tipos del servicio externo. Dos casos:
  - API REST tipada a mano (p. ej. `twitter-api45`): defines aquí la forma cruda del JSON.
  - Proveedor con SDK (p. ej. `stripe`): reexportas/aliaseas aquí los tipos del paquete que consumen
    el repository y el mapper (`export type StripeEvent = Stripe.Event`), para no acoplar el resto del
    servicio al espacio de nombres del SDK.
    Un fichero por proveedor: `twitter-api45.types.ts`, `stripe.types.ts`, `openai.types.ts`, etc. Si un
    servicio no referencia ningún tipo externo por nombre (todo es inferencia inline), la carpeta puede
    no existir.
- **`services/types/{name}.types.ts`** → tipos de **dominio** que el servicio expone y consume el resto de la app.
  - Tipos de entrada: Son los tipos que se necesitan para hacer la consulta al servicio.
  - Tipos de salida: Son los tipos de la resupesta del repositorio mapeada. Este tipo debe ser común sea como sea el repositorio. Es el mapper quien se encarga de unificarlo si existen varios repositorios para un mismo servicio.

El nombre de los tipos debe ser estandar:

- El nombre del tipo de un repositorio sera **RepositorioEntidadData** (p. ej. DexscreenTokenData)
- El nombre del tipo del servicio será **EntidadData** (p. ej. TokenData)

---

## 1. Repository — Fetch HTTP puro

Responsabilidad **única**: hacer la petición HTTP y devolver el tipo crudo (o `null`).
No transforma datos, no aplica lógica de negocio, no cachea.

- Se exporta como **singleton de clase**: `export const fooRepository = new FooRepository();`
- Métodos definidos como **arrow functions** (mantienen el `this` correcto).
- Devuelve el **tipo raw** importado de `repository/types/`, o `null` si falla.
- Captura errores con `try/catch`, hace `console.error` y devuelve `null` (no lanza).
- La normalización mínima de la forma de la respuesta (ej. elegir el primer elemento de un array) puede vivir aquí.

> **Excepción — repositorios que sí lanzan.** Cuando el error es _significativo_ y el `null` no
> basta para decidir, el repositorio puede lanzar en vez de devolver `null`:
>
> - **Verificación de firma / autenticidad** (p. ej. `stripeRepository.constructEvent`): una firma
>   de webhook inválida debe abortar el flujo, no confundirse con "sin datos".
> - **Errores de negocio duros** (p. ej. Stripe no devuelve la URL de checkout): se lanza
>   `createError({ statusCode, statusMessage })` para que el endpoint lo propague al cliente.
> - **Fuente con fallback en el service** (p. ej. `openAiRepository.generateReply`): el error de la
>   API se propaga y es el service quien decide (cae al mock si no hay clave).
>
> En estos casos el repositorio documenta el porqué en un comentario; en todos los demás rige la
> regla general de `return null`.

```ts
// repository/dexscreener.repository.ts
import type { DexscreenerTokenData } from "~/server/services/dexscreener/repository/types/dexscreener.types";

class DexscreenerRepository {
  fetchDexscreenerTokenPairData = async (
    address: string,
  ): Promise<DexscreenerTokenData | null> => {
    try {
      const response = await fetch(
        `https://api.dexscreener.com/tokens/v1/solana/${address}`,
      );
      const data = await response.json();
      const tokenData = Array.isArray(data)
        ? (data[0] ?? null)
        : (data?.pairs?.[0] ?? null);

      return tokenData;
    } catch (error) {
      console.error(`Error fetching DexScreener data for ${address}:`, error);
      return null;
    }
  };
}

export const dexscreenerRepository = new DexscreenerRepository();
```

### Tipos raw (`repository/types/{provider}.types.ts`)

Reflejan **exactamente** la respuesta de la API externa (mismos nombres de campos, mismos tipos que devuelve el JSON). Los campos opcionales de la API se marcan con `?`. Solo se crean cuando la API se tipa a mano (sin SDK).

```ts
// repository/types/dexscreener.types.ts
export type DexscreenerTokenData = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  priceUsd: string;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    socials?: { url: string; type: string }[];
    websites?: { url: string; label: string }[];
  };
  // ...resto de campos según la API
};
```

---

### {provider}.repository.http

Siempre debe existir un archivo .http de cada repositorio para poder hacer tests manuales.

## 2. Mapper — Raw → Dominio

Función pura que traduce el tipo raw de la API al **tipo de dominio** que consume el frontend/negocio.

- Es una **función pura exportada** (no una clase): `export const mapXToY = (raw): Domain => {...}`.
- Concentra las **decisiones de normalización**: valores por defecto, parseos (`parseFloat`), campos derivados, extracción de datos anidados.
- Pasa del tipo de repositorio al tipo de servicio. El tipo de repositorio se encuentra en `./repository/types` y el tipo de servicio se encuentra en `./services/types`.
- Siempre debe existir aunque no haya transformación de datos.
- Nunca hace peticiones ni cachea; solo transforma.

```ts
// mappers/dexscreen.mappers.ts
import type { DexscreenerTokenData } from "~/server/services/dexscreener/repository/types/dexscreener.types";
import type { TokenData } from "~/app/pages/(modules)/token-analysis/types/token-data.types";

export const mapDexScreenTokenPairDataToTokenInfo = (
  pair: DexscreenerTokenData,
): TokenData => {
  const info = pair.info;
  const twitter = info?.socials?.find((s) => s.type === "twitter")?.url ?? null;

  return {
    address: pair.pairAddress,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    imageUri: info?.imageUrl ?? "",
    priceUsd: parseFloat(pair.priceUsd ?? "0"), // parseo/normalización
    marketCapUsd: pair.marketCap ?? 0, // valor por defecto
    twitter, // dato derivado/extraído
    // ...
  };
};
```

---

## 3. Service — Orquestación y negocio

Punto de entrada que consume el resto de la app (los endpoints API).

- Se exporta como **singleton de clase**: `export const fooService = new FooService();`
- Orquesta: llama al Repository, comprueba `null`, aplica el Mapper y devuelve el tipo de dominio.
- Aquí vive la **lógica de negocio** que combine varias fuentes o transforme el resultado.

```ts
// services/dexscreener.service.ts
import { mapDexScreenTokenPairDataToTokenInfo } from "~/server/services/dexscreener/mappers/dexscreen.mappers";
import { dexscreenerRepository } from "~/server/services/dexscreener/repository/dexscreener.repository";

class DexscreenerService {
  getDexscreenerTokenInfo = async (
    address: string,
  ): Promise<TokenData | null> => {
    const response =
      await dexscreenerRepository.fetchDexscreenerTokenPairData(address);
    if (!response) {
      return null;
    }
    return mapDexScreenTokenPairDataToTokenInfo(response);
  };
}

export const dexscreenerService = new DexscreenerService();
```

> **Nota:** El service de DexScreener actual tipa el retorno como `any`. Los servicios nuevos deben tipar el retorno con el **tipo de dominio** (ej. `Promise<TokenData | null>`) — nunca `any` (regla de TS estricto).

---

## Convenciones transversales

| Regla                 | Detalle                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Singletons            | Repository y Service se exportan como `const x = new XClass()`                                                          |
| Métodos               | Arrow functions dentro de la clase                                                                                      |
| Nombres de fichero    | `{provider}.repository.ts`, `{name}.mappers.ts`, `{name}.service.ts`                                                    |
| Errores en Repository | `try/catch` → `console.error` → `return null` (no lanzar). Excepción: firma/auth, error de negocio duro o fuente con fallback en el service pueden lanzar (documentar el porqué) |
| Tipado                | Raw (solo externos) en `repository/types/{provider}.types.ts`; y dominio en `services/types/{name}.types.ts`. Sin `any` |
| Sin barrel            | No hay `index.ts`; se importa la ruta concreta (`services/{name}.service`, `types`)                                     |
| Mock                  | Fuente de desarrollo en `utils/mock.ts` (patrón pluggable real ↔ mock)                                                  |
| Imports               | Rutas absolutas con `~/` entre módulos; `./` solo dentro de la subcarpeta                                               |
| Comentarios           | En español; código en inglés                                                                                            |
| `.http`               | Fichero con tests manuales de endpoints (extensión REST Client). Siempre debe existir                                   |

---

## Flujo completo (resumen)

```
Endpoint API (server/api/.../*.get.ts)
   │  valida entrada (p. ej. SOLANA_ADDRESS_RE)
   ▼
Service (lógica de negocio + orquestación)
   │  llama al Repository, comprueba null, aplica Mapper
   ├──────────────► Repository (fetch HTTP puro) ──► API externa
   │                       │ devuelve tipo raw | null
   └──────────────► Mapper (raw → dominio, función pura)
   ▼
Tipo de dominio → frontend
```

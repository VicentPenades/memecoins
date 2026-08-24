# Roadmap / TODO — Launch Memecoin

Mejoras aplazadas conscientemente durante el diseño de la v1 (ver
`docs/superpowers/specs/2026-07-03-launch-memecoin-v1-design.md`).

## Aplazado

- [ ] **Programación de lanzamientos a una hora.** Con firma en navegador no se puede disparar
      solo; requeriría o bien un "borrador programado" que avisa y confirmas tú, o bien pasar a
      un modelo con custodia de claves en el servidor. Decidir cuando se aborde.
- [ ] **Bundling multi-wallet** (compras desde varias wallets en el primer bloque / bloques
      sucesivos). Requiere custodiar las claves de esas wallets de sniping (modo híbrido).
- [ ] **Generación de web + Twitter + Telegram** para cada lanzamiento.
- [ ] **Opción B — integración on-chain directa.** Hablar directamente con Solana (programa
      on-chain + IPFS + Jito propio), sin depender de PumpPortal. Permitiría **lanzar fuera de
      pump.fun**: otras launchpads (LetsBonk/Bonk, Raydium LaunchLab, Moonshot…) o un token SPL
      propio con liquidez propia. Se implementaría como otra `LaunchProvider` sin romper el resto.
- [ ] **Panel de analítica** sobre las características de lanzamiento guardadas, para identificar
      qué configuración da mejores resultados.

## Pendiente de validación manual (v1)

- [ ] **Smoke test en navegador** con provider mock: registrar/login → `/launcher` guardar borrador
      → `/coins` ver histórico + buscador/filtro → intentar lanzar (con mock, el envío a Jito
      fallará y la moneda se registra como `failed`, confirmando el cableado del flujo). Requiere
      `DATABASE_URL`, `NUXT_SESSION_PASSWORD` y `npm run dev`.
- [ ] **Validación de integración real** (`PUMPFUN_PROVIDER=pumpportal`, mainnet, SOL real, wallet
      desechable, dev buy mínimo): confirmar el contrato de `https://pump.fun/api/ipfs` (o migrar a
      Pinata con `PINATA_JWT`) y el boundary multipart de axios en `uploadMetadata`.

## Follow-ups de código (no bloqueantes, del review final)

- [ ] **M1 — Manejo de error en la respuesta de Jito** (`launcher/utils/launch.ts` `submitJitoBundle`):
      Jito puede devolver `{ error }` con HTTP 200; hoy eso deja `bundleId` undefined y la moneda se
      guarda como `launched` sin bundle id ni error visible. Comprobar `error` en la respuesta.
- [ ] **M2 — Constantes compartidas para los defaults de lanzamiento** (`slippage 10`, fees `0.00001`,
      `pool "pump"`) hoy duplicados en el schema, el zod de `build` y `emptyForm()`. Unificar en una
      constante para evitar drift.

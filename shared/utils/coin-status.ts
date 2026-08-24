// Máquina de estados de una moneda, compartida entre front (qué opciones
// mostrar) y server (validar). El server sigue siendo la fuente de verdad: aquí
// solo vive la definición de transiciones y qué exige cada destino.

export type CoinStatus = "draft" | "launched" | "prelaunch";

export const COIN_STATUSES: CoinStatus[] = ["draft", "prelaunch", "launched"];

// Transiciones permitidas: solo hacia delante. `launched` es terminal.
const TRANSITIONS: Record<CoinStatus, CoinStatus[]> = {
  draft: ["prelaunch", "launched"],
  prelaunch: ["launched"],
  launched: [],
};

// Estados a los que puede moverse una moneda desde `current`.
export const getNextStatuses = (current: CoinStatus): CoinStatus[] =>
  TRANSITIONS[current];

// ¿Es legal la transición de `from` a `to`?
export const canTransition = (from: CoinStatus, to: CoinStatus): boolean =>
  TRANSITIONS[from].includes(to);

// Requisito de datos que impone cada destino al hacer la transición:
// - prelaunch exige una fecha de lanzamiento programada.
// - launched exige un mint.
export type TransitionRequirement = "scheduledLaunchAt" | "mintAddress" | null;

export const getTransitionRequirement = (
  to: CoinStatus,
): TransitionRequirement => {
  if (to === "prelaunch") return "scheduledLaunchAt";
  if (to === "launched") return "mintAddress";
  return null;
};

// Una moneda lanzada queda bloqueada: no cambia de estado ni de datos, solo se
// puede personalizar su página pública (la web).
export const isLocked = (status: CoinStatus): boolean => status === "launched";

// Validación laxa de un mint de Solana: base58 (sin 0/O/I/l) de 32 a 44 chars.
const SOLANA_MINT_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const isValidMintAddress = (value: unknown): value is string =>
  typeof value === "string" && SOLANA_MINT_REGEX.test(value.trim());

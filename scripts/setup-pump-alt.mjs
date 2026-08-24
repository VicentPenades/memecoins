// Setup ÚNICO: crea una Address Lookup Table (ALT) con las cuentas ESTÁTICAS de
// pump.fun y la rellena. Comprime la tx create+dev-buy para que quepa en el
// límite de 1232 bytes de Solana. Se ejecuta una sola vez.
//
// Uso (real, firma y gasta ~0,002 SOL de rent):
//   PUMP_ALT_AUTHORITY_KEYPAIR=/ruta/al/keypair.json \
//   SOLANA_RPC_URL=... node --env-file=.env <bundled>.cjs
//
// Uso (dry-run, no envía nada, no requiere keypair):
//   node <bundled>.cjs --dry-run
//
// Nota: el SDK de pump.fun rompe en Node ESM crudo; hay que bundlear con esbuild:
//   npx esbuild scripts/setup-pump-alt.mjs --bundle --platform=node \
//     --format=cjs --outfile=/tmp/setup-alt.cjs && node --env-file=.env /tmp/setup-alt.cjs
import fs from "node:fs";
import {
  AddressLookupTableProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import {
  OnlinePumpSdk,
  PumpSdk,
  getBuyTokenAmountFromSolAmount,
  PUMP_PROGRAM_ID,
  MAYHEM_PROGRAM_ID,
  PUMP_FEE_PROGRAM_ID,
  GLOBAL_PDA,
  PUMP_FEE_CONFIG_PDA,
  GLOBAL_VOLUME_ACCUMULATOR_PDA,
  PUMP_EVENT_AUTHORITY_PDA,
  PUMP_FEE_EVENT_AUTHORITY_PDA,
  FEE_PROGRAM_GLOBAL_PDA,
  getGlobalParamsPda,
  getSolVaultPda,
} from "@pump-fun/pump-sdk";

const RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const DRY_RUN =
  process.argv.includes("--dry-run") || process.env.DRY_RUN === "1";

// Programas estáticos bien conocidos (no dependen del launch).
const TOKEN_2022 = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const SPL_TOKEN = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ATA_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const WSOL = new PublicKey("So11111111111111111111111111111111111111112");

// Carga el keypair de la autoridad/pagador (formato JSON de Solana CLI). En
// dry-run no se necesita: usamos uno efímero solo para derivar direcciones.
const loadAuthority = () => {
  const path = process.env.PUMP_ALT_AUTHORITY_KEYPAIR;
  if (!path) {
    if (DRY_RUN) return Keypair.generate();
    throw new Error(
      "Falta PUMP_ALT_AUTHORITY_KEYPAIR (ruta al keypair.json que crea/paga la ALT)",
    );
  }
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(path, "utf-8")));
  return Keypair.fromSecretKey(secret);
};

const dedupeByBase58 = (keys) => {
  const map = new Map();
  for (const key of keys) map.set(key.toBase58(), key);
  return [...map.values()];
};

async function main() {
  console.log(`RPC: ${RPC.replace(/\?.*$/, "?<redacted>")}  dryRun=${DRY_RUN}`);
  const connection = new Connection(RPC, "confirmed");
  const online = new OnlinePumpSdk(connection);
  const offline = new PumpSdk();
  const authority = loadAuthority();

  const global = await online.fetchGlobal();
  const feeConfig = await online.fetchFeeConfig().catch(() => null);

  // mint-authority es PDA estática de pump (no la exporta el SDK): la derivamos.
  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint-authority")],
    PUMP_PROGRAM_ID,
  );

  // Cuentas ESTÁTICAS (iguales en todo launch). Las firmantes (mint, user) NO
  // van aquí: una ALT no puede comprimir firmantes.
  const staticAccounts = dedupeByBase58([
    PUMP_PROGRAM_ID,
    mintAuthority,
    GLOBAL_PDA,
    SystemProgram.programId,
    TOKEN_2022,
    SPL_TOKEN,
    ATA_PROGRAM,
    WSOL,
    MAYHEM_PROGRAM_ID,
    getGlobalParamsPda(),
    getSolVaultPda(),
    PUMP_EVENT_AUTHORITY_PDA,
    global.feeRecipient,
    GLOBAL_VOLUME_ACCUMULATOR_PDA,
    PUMP_FEE_CONFIG_PDA,
    PUMP_FEE_PROGRAM_ID,
    FEE_PROGRAM_GLOBAL_PDA,
    PUMP_FEE_EVENT_AUTHORITY_PDA,
  ]);

  console.log(`\nCuentas estáticas para la ALT: ${staticAccounts.length}`);
  staticAccounts.forEach((key, index) =>
    console.log(`  [${index}] ${key.toBase58()}`),
  );

  // VALIDACIÓN: construimos un sample create+buy y comprobamos que toda cuenta
  // NO firmante de la tx está cubierta por la ALT (las que falten deben ser
  // PDAs por-launch: bonding curve, ATAs, mayhem-state, creator vault…).
  const dummyMint = Keypair.generate();
  const solAmount = new BN(50_000_000);
  const amount = getBuyTokenAmountFromSolAmount({
    global,
    feeConfig,
    mintSupply: null,
    bondingCurve: null,
    amount: solAmount,
    quoteMint: WSOL,
  });
  const sampleIxs = await offline.createV2AndBuyInstructions({
    global,
    mint: dummyMint.publicKey,
    name: "ALT Setup Sample",
    symbol: "ALTSMP",
    uri: "https://example.com/metadata.json",
    creator: authority.publicKey,
    user: authority.publicKey,
    amount,
    solAmount,
    mayhemMode: false,
  });
  const covered = new Set(staticAccounts.map((key) => key.toBase58()));
  const nonSignerKeys = dedupeByBase58(
    sampleIxs
      .flatMap((instruction) => instruction.keys)
      .filter((meta) => !meta.isSigner)
      .map((meta) => meta.pubkey),
  );
  const uncovered = nonSignerKeys.filter((key) => !covered.has(key.toBase58()));
  console.log(
    `\nSample tx: ${nonSignerKeys.length} cuentas no-firmantes; ${uncovered.length} fuera de la ALT (deben ser por-launch):`,
  );
  uncovered.forEach((key) => console.log(`  · ${key.toBase58()}`));

  // MEDICIÓN de tamaño: compilamos la tx sin y con una ALT en memoria (con las
  // mismas cuentas estáticas) para comprobar que baja del límite de 1232 bytes.
  const { AddressLookupTableAccount, ComputeBudgetProgram, TransactionMessage, VersionedTransaction } =
    await import("@solana/web3.js");
  const budgetIxs = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 33 }),
  ];
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const compile = (lookupTables) =>
    new VersionedTransaction(
      new TransactionMessage({
        payerKey: authority.publicKey,
        recentBlockhash: blockhash,
        instructions: [...budgetIxs, ...sampleIxs],
      }).compileToV0Message(lookupTables),
    ).serialize().length;

  const inMemoryAlt = new AddressLookupTableAccount({
    key: PublicKey.default,
    state: { addresses: staticAccounts, deactivationSlot: 2n ** 64n - 1n, lastExtendedSlot: 0, lastExtendedSlotStartIndex: 0, authority: authority.publicKey },
  });
  const sizeWithout = compile([]);
  const sizeWith = compile([inMemoryAlt]);
  console.log(`\nTamaño tx serializada:`);
  console.log(`  sin ALT: ${sizeWithout} bytes  (límite raw 1232)`);
  console.log(`  con ALT: ${sizeWith} bytes  ${sizeWith <= 1232 ? "✅ cabe" : "❌ SIGUE grande"}`);

  if (DRY_RUN) {
    console.log("\n[dry-run] No se envía nada. Script válido.");
    return;
  }

  // 1) Crear la ALT (su dirección deriva de authority + recentSlot).
  const recentSlot = await connection.getSlot("finalized");
  const [createIx, altAddress] = AddressLookupTableProgram.createLookupTable({
    authority: authority.publicKey,
    payer: authority.publicKey,
    recentSlot,
  });
  console.log(`\nCreando ALT: ${altAddress.toBase58()} (slot ${recentSlot})`);
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(createIx),
    [authority],
  );

  // 2) Rellenarla con las cuentas estáticas.
  const extendIx = AddressLookupTableProgram.extendLookupTable({
    payer: authority.publicKey,
    authority: authority.publicKey,
    lookupTable: altAddress,
    addresses: staticAccounts,
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(extendIx),
    [authority],
  );

  console.log("\n✅ ALT creada y rellenada. Añade esto a tu .env:");
  console.log(`   PUMPFUN_LOOKUP_TABLE=${altAddress.toBase58()}`);
}

main().catch((err) => {
  console.error("\n✗ setup-pump-alt falló:", err?.message ?? err);
  process.exit(1);
});

// Seed de datos de prueba: crea varios devs (users con handle) y sus monedas.
// Idempotente: usa ON CONFLICT para poder re-ejecutarse sin duplicar.
//   node scripts/seed-dev-data.mjs
import "dotenv/config";
import postgres from "postgres";

// slugify inline (misma lógica que shared/utils/slug.ts; node no importa .ts directo).
const slugify = (input) => {
  const s = String(input)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "coin";
};

// Cada dev: identidad + sus monedas. launched ⟹ pública (se fuerza abajo).
const DEVS = [
  {
    name: "Satoshi Moon",
    email: "satoshimoon@seed.test",
    coins: [
      { name: "Moon Doge", symbol: "MOOND", status: "launched", mint: "MoonDoge111111111111111111111111111111111", website: "https://moondoge.example", twitter: "https://twitter.com/moondoge", description: "The original lunar doge. WAGMI." },
      { name: "Rocket Cat", symbol: "RKTCAT", status: "launched", mint: "RocketCat22222222222222222222222222222222", telegram: "https://t.me/rocketcat", description: "9 lives, 1 mission: orbit." },
      { name: "Stealth Gem", symbol: "STEALTH", status: "prelaunch", isPublic: true, description: "Coming soon. Blink and you'll miss it." },
      { name: "Backroom Draft", symbol: "BACK", status: "draft", description: "Just an idea for now." },
    ],
  },
  {
    name: "Degen Queen",
    email: "degenqueen@seed.test",
    coins: [
      { name: "Diamond Hands", symbol: "DIAMOND", status: "launched", mint: "Diamond33333333333333333333333333333333333", website: "https://diamond.example", twitter: "https://twitter.com/diamondhands", telegram: "https://t.me/diamondhands", description: "Hold. Then hold some more." },
      { name: "Queen Coin", symbol: "QUEEN", status: "launched", mint: "QueenCoin4444444444444444444444444444444444", description: "Long live the queen of memes." },
      { name: "Secret Sauce", symbol: "SAUCE", status: "prelaunch", isPublic: false, description: "Private for now — recipe classified." },
    ],
  },
  {
    name: "Pixel Pepe",
    email: "pixelpepe@seed.test",
    coins: [
      { name: "Pepe Prime", symbol: "PEPEP", status: "launched", mint: "PepePrime55555555555555555555555555555555555", twitter: "https://twitter.com/pepeprime", description: "Rarest pepe on the curve." },
      { name: "Green Candle", symbol: "GREEN", status: "prelaunch", isPublic: true, description: "Only green from here." },
      { name: "WIP Token", symbol: "WIP", status: "draft", description: "Work in progress." },
    ],
  },
];

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

// Handle único: base slugificada + sufijo si ya está tomada.
const uniqueHandle = async (base, taken) => {
  let h = slugify(base);
  let n = 2;
  while (taken.has(h)) h = `${slugify(base)}-${n++}`;
  taken.add(h);
  return h;
};

const takenHandles = new Set(
  (await sql`SELECT handle FROM users WHERE handle IS NOT NULL`).map((r) => r.handle),
);

let devCount = 0;
let coinCount = 0;

for (const dev of DEVS) {
  const handle = await uniqueHandle(dev.name, takenHandles);

  // Upsert del user por email (los seed no inician sesión: passwordHash placeholder).
  await sql`
    INSERT INTO users (email, password_hash, name, handle, email_verified, language)
    VALUES (${dev.email}, ${"seed-no-login"}, ${dev.name}, ${handle}, ${true}, ${"en"})
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
  `;
  const [user] = await sql`SELECT id, handle FROM users WHERE email = ${dev.email}`;
  devCount++;

  for (const c of dev.coins) {
    const isPublic = c.status === "launched" ? true : Boolean(c.isPublic);
    const slug = slugify(c.name);
    const imageUrl = `https://picsum.photos/seed/${slug}/240`;
    await sql`
      INSERT INTO coins (user_id, name, symbol, description, image_url, website, twitter, telegram, slug, status, is_public, mint_address, launched_at)
      VALUES (
        ${user.id}, ${c.name}, ${c.symbol}, ${c.description ?? null}, ${imageUrl},
        ${c.website ?? null}, ${c.twitter ?? null}, ${c.telegram ?? null},
        ${slug}, ${c.status}, ${isPublic}, ${c.mint ?? null},
        ${c.status === "launched" ? new Date() : null}
      )
      ON CONFLICT (user_id, slug) DO NOTHING
    `;
    coinCount++;
  }
  console.log(`  @${user.handle} — ${dev.coins.length} coins`);
}

console.log(`\nSeed OK: ${devCount} devs, ${coinCount} coins upserted.`);
console.log("Perfiles:");
for (const dev of DEVS) {
  const [u] = await sql`SELECT handle FROM users WHERE email = ${dev.email}`;
  console.log(`  /dev/${u.handle}`);
}
await sql.end();

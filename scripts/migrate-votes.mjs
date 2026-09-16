import { readdir, readFile } from "node:fs/promises";
import process from "node:process";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const migrationsDirectory = new URL(
  "../server/database/migrations/",
  import.meta.url,
);
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const sql = postgres(databaseUrl, { max: 1 });

try {
  for (const file of migrationFiles) {
    const migration = await readFile(new URL(file, migrationsDirectory), "utf8");
    await sql.unsafe(migration);
    console.log(`Applied ${file}`);
  }
  console.log("Cat coin voting migrations completed");
} finally {
  await sql.end();
}

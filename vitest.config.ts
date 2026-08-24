import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Alias "~" = raíz del proyecto, igual que en Nuxt, para que los tests puedan
// importar de ~/server/... Solo probamos lógica pura (sin auto-imports de Nuxt).
export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    include: [
      "server/**/*.test.ts",
      "app/**/*.test.ts",
      "shared/**/*.test.ts",
    ],
  },
});

import { fileURLToPath } from "node:url";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },

  ssr: true,

  nitro: {
    // El SDK de pump.fun (y su dep agent-payments-sdk) hace named imports de
    // `@coral-xyz/anchor`, que es CommonJS. En dev Nitro externaliza los paquetes
    // y los carga como ESM nativo de Node → "Named export 'BN' not found". Hay que
    // inline TODA la cadena (incluidos anchor y bn.js) para que Nitro la bundlee
    // (rollup) y resuelva el interop CJS, igual que ya hace el build de producción.
    externals: {
      inline: [
        "@pump-fun/pump-sdk",
        "@pump-fun/agent-payments-sdk",
        "@coral-xyz/anchor",
        "bn.js",
        // En Node (Vercel) @solana/web3.js arrastra un import ESM a
        // `jayson/lib/client/browser` que falla si queda externalizado.
        // Inlinar ambos evita el import de directorio en runtime.
        "@solana/web3.js",
        "jayson",
      ],
    },
  },

  runtimeConfig: {
    public: {
      // RPC de Solana usado por el cliente para enviar/confirmar el lanzamiento.
      solanaRpcUrl:
        process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    },
  },
  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "robots", content: "index, follow" },
        { name: "author", content: "Vicent Penades" },
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.png" }],
    },
  },

  // ✅ Solo main.css - todo se importa desde ahí
  css: ["./app/assets/css/main.css"],

  modules: [
    "@nuxtjs/i18n",
    "nuxt-auth-utils",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins?.push(vuetify({ autoImport: true }));
      });
    },
  ],

  i18n: {
    locales: [
      { code: "es", file: "es.json" },
      { code: "en", file: "en.json" },
    ],
    langDir: "../app/locales",
    defaultLocale: "en",
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      fallbackLocale: "en",
    },
  },

  alias: {
    "@": fileURLToPath(new URL("./", import.meta.url)),
    "~": fileURLToPath(new URL("./", import.meta.url)),
  },

  build: {
    transpile: ["vuetify"],
  },

  vite: {
    plugins: [tailwindcss()],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    ssr: {
      noExternal: ["vuetify"],
    },
    define: {
      "process.env.DEBUG": false,
      global: "globalThis",
    },
    resolve: {
      alias: {
        buffer: "buffer/",
      },
    },
    optimizeDeps: {
      include: ["@solana/web3.js", "@solana/kit", "buffer"],
    },
  },
});

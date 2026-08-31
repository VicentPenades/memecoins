import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },

  ssr: true,

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

  css: ["./app/assets/css/main.css"],

  modules: ["@nuxtjs/i18n"],

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

  vite: {
    plugins: [tailwindcss()],
  },
});

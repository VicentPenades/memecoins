// filepath: /Users/vicentpenadespla/workspace/personal/nuxt-web-creator/tailwind.config.ts
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{vue,js,ts}",
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#63855a",
        secondary: "#ad3f43",
        success: "#92c089",
        info: "#319acb",
        warning: "#e9c417",
        error: "#e37272",
      },
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

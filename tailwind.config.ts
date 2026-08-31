/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{vue,js,ts}",
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#63855a",
        secondary: "#ff375e",
        success: "#92c089",
        info: "#319acb",
        warning: "#e9c417",
        error: "#e37272",
      },
    },
  },
  plugins: [],
};

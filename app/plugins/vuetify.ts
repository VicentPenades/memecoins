import { createVuetify } from "vuetify";
import * as components from "vuetify/components";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    defaults: {
      VBtn: {
        variant: "flat",
        ripple: false,
        border: "primary",
      },
      VTabs: {
        class: "mb-4 border-b",
      },
    },
    icons: {
      defaultSet: "mdi",
    },
    theme: {
      defaultTheme: "neutral",
      themes: {
        neutral: {
          dark: false,
          colors: {
            primary: "#63855a",
            secondary: "#ff375e",
            accent: "#05603d",
            error: "#e37272",
            info: "#319acb",
            success: "#92c089",
          },
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});

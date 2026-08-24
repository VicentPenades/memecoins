type NavigationItem = {
  to: string;
  titleKey: string;
  icon: string;
  type?: string;
  beta?: boolean;
};

// Barra de navegación principal. Añade aquí las rutas de tu proyecto.
export const MAIN_NAVIGATION: NavigationItem[] = [];

export const MAIN_MENU: NavigationItem[] = [
  { to: "/settings", titleKey: "menu.settings", icon: "mdi-cog", type: "settings" },
  { to: "/logout", titleKey: "auth.logout.menu", icon: "mdi-logout", type: "others" },
];

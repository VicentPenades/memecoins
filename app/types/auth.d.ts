// Augmentación del usuario de sesión de nuxt-auth-utils, visible también para el
// build del app/cliente (el server tiene la suya en server/types/auth.d.ts).
declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    name: string | null;
    handle: string | null;
  }
}

export {};

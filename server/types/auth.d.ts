declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    name: string | null;
    handle: string | null;
  }
}

export {};

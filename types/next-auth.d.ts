import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "RESIDENT" | "ADMIN";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: "RESIDENT" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "RESIDENT" | "ADMIN";
  }
}

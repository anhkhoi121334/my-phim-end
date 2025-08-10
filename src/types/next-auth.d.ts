

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

// Extend JWT to include custom fields
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    image?: string;
  }
} 
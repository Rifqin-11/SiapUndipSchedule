import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    nim?: string;
    jurusan?: string;
    fakultas?: string;
    angkatan?: string;
    avatar?: string;
    role: string;
    isEmailVerified: boolean;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      nim?: string;
      jurusan?: string;
      fakultas?: string;
      angkatan?: string;
      avatar?: string;
      role: string;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nim?: string;
    jurusan?: string;
    fakultas?: string;
    angkatan?: string;
    avatar?: string;
    role: string;
    isEmailVerified: boolean;
  }
}

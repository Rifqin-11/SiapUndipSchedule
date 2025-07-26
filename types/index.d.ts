interface subject {
  id: string;
  name: string;
  day: string;
  room: string;
  startTime: string;
  endTime: string;
  lecturer: string[];
  meeting: number;
  category?: string;
}

// NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    nim?: string;
    jurusan?: string;
    fakultas?: string;
    angkatan?: string;
    avatar?: string;
    role?: string;
    isEmailVerified?: boolean;
  }

  interface Session {
    user: User;
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
    role?: string;
    isEmailVerified?: boolean;
  }
}

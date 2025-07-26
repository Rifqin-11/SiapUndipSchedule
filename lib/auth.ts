import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// @ts-ignore - Suppress NextAuth v5 beta type issues for Vercel deployment
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // @ts-ignore - Suppress parameter type issues
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/auth/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            return null;
          }

          const user = await response.json();
          return user;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    // @ts-ignore - Suppress callback parameter type issues
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nim = (user as any).nim;
        token.jurusan = (user as any).jurusan;
        token.fakultas = (user as any).fakultas;
        token.angkatan = (user as any).angkatan;
        token.avatar = (user as any).avatar;
        token.role = (user as any).role;
        token.isEmailVerified = (user as any).isEmailVerified;
      }

      return token;
    },
    // @ts-ignore - Suppress callback parameter type issues
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).nim = token.nim;
        (session.user as any).jurusan = token.jurusan;
        (session.user as any).fakultas = token.fakultas;
        (session.user as any).angkatan = token.angkatan;
        (session.user as any).avatar = token.avatar;
        (session.user as any).role = token.role;
        (session.user as any).isEmailVerified = token.isEmailVerified;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createAuthService } from "@/lib/services/authService";
import { authRepoInstance } from "@/lib/repositories/authRepo";



export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },

      async authorize(credentials) {
        const email = credentials?.email as string;
        const otp = credentials?.otp as string;

        if (!email || !otp) {
          return null;
        }

        const authService = createAuthService(authRepoInstance);
        const isValid = authService.verifyOTP(email, otp);

        if (!isValid) return null;
        return { id: email, email };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },

    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string;
      return session;
    },
  },
});

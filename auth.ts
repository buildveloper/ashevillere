import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";

/**
 * Auth.js (v5) magic-link authentication.
 *
 * Email provider = Resend (AUTH_RESEND_KEY). No passwords, no OAuth.
 * Users are persisted in Turso via @auth/drizzle-adapter. Sessions are JWT
 * (default strategy); the session table exists for a future database-session
 * switch but is not required by the JWT strategy.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Resend({
      from: process.env.EMAIL_FROM ?? "AshevilleRE <magic@ashevillere.com>",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (!session.user) return session;
      return {
        ...session,
        user: { ...session.user, id: token.sub ?? "" },
      };
    },
  },
});
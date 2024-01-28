import NextAuth, { Session } from "next-auth";
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById, updateUser } from "@/data/user";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  // the functions in callbacks are called on every request
  // we can use them to add data to the session / tokens
  callbacks: {
    async signIn({ user }) {
      const existingUser = await getUserById(user.id);

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      session.user.customField = "custom";

      console.log(token.role + "&" + !!session.user.id);

      if (token.role && !!session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
      }

      return session;
    },
    async jwt({ token, trigger, session }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      if (trigger === "update" && session?.role) {
        console.log("updating token: " + session.role);
        token.role = session.role;
        await updateUser(token.sub, { role: session.role });
        console.log("updated token: " + session.role);
      }

      // add role and username to token
      token.name = existingUser.name;
      token.role = existingUser.role;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});

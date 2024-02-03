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
      // TODO: ??
      const existingUser = await getUserById(user.id);

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      session.user.customField = "custom";

      if (token.role && !!session.user) {
        session.user.role = token.role as UserRole;
      }

      if (token.username && !!session.user) {
        session.user.username = token.username as string;
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

      // should only trigger on user creation
      // await updateUser(token.sub, { role: session.role });
      // TODO: double check if this is a sufficient updating of username in db
      if (trigger === "update" && session?.role) {
        token.role = session.role;
        await updateUser(token.sub, {
          role: session.role,
          username: session.username,
          name: session.name,
          lastname: session.lastname,
        });
      }

      //TODO:  ^if so no need to do this:

      // if (trigger === "update" && session?.username) {
      //   token.username = session.username;
      //   await updateUser(token.sub, { username: session.username });
      // }

      // add role and username to token
      token.username = existingUser.username;
      token.name = existingUser.name;
      token.role = existingUser.role;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});

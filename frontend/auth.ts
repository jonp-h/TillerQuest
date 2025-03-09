import NextAuth from "next-auth";
import { db } from "./lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { Class, UserRole } from "@prisma/client";
import { getUserAuthById } from "./data/user/getUser";
import { updateUser } from "./data/user/updateUser";

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && !!session.user) {
        session.user.role = token.role as UserRole;
      }
      if (token.class && !!session.user) {
        session.user.class = token.class as Class;
      }

      if (token.username && !!session.user) {
        session.user.username = token.username as string;
      }

      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, trigger, session }): Promise<any> {
      if (!token.sub) return token;

      const existingUser = await getUserAuthById(token.sub);

      if (!existingUser) return token;

      // should only trigger on user successful setup/user-creation
      if (trigger === "update") {
        token.role = session.role;
        await updateUser(token.sub, {
          role: session.role,
          username: session.username,
          name: session.name,
          lastname: session.lastname,
          class: session.class,
          image: session.image,
          guildName: session.guild,
          schoolClass: session.schoolClass,
          publicHighscore: session.publicHighscore,
          lastMana: new Date(new Date().setDate(new Date().getDate() - 1)),
        });
      }

      // add role and username to token
      token.username = existingUser.username;
      token.class = existingUser.class;
      token.role = existingUser.role;

      return token;
    },
  },
});

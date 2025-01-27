import NextAuth from "next-auth";
import { db } from "./lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { Class, UserRole } from "@prisma/client";
import { getUserById } from "./data/user/getUser";
import { updateUser } from "./data/user/updateUser";

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    // FIXME: 02 commented
    // async signIn({ user }) {
    //   // TODO: ??
    //   const existingUser = await getUserById(user.id);

    //   return true;
    // },
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

      if (session.user) {
        session.user.lastname = token.lastname as string;
        session.user.name = token.name as string;
      }

      return session;
    },
    async jwt({ token, trigger, session }): Promise<any> {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      // should only trigger on user successful setup/user-creation
      if (trigger === "update") {
        console.log("updating role in db", session.role);
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
        });
      }

      // add role and username to token
      token.name = existingUser.name;
      token.username = existingUser.username;
      token.lastname = existingUser.lastname;
      token.class = existingUser.class;
      token.role = existingUser.role;
      token.class = existingUser.class;

      return token;
    },
  },
});

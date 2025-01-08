import { getSession } from "@auth/express";
import type { NextFunction, Request, Response } from "express";
import { ExpressAuth } from "@auth/express";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "../lib/db.js";
import authConfig from "./auth.config.js";
import { getUserById, updateUser } from "../data/user.js";
import { Class, UserRole } from "@prisma/client";
import type { ExpressAuthConfig } from "@auth/express";

const authSettings: ExpressAuthConfig = {
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
        });
      }

      // add role and username to token
      token.name = existingUser.name as string;
      token.username = existingUser.username as string;
      token.lastname = existingUser.lastname as string;
      token.class = existingUser.class as Class;
      token.role = existingUser.role as UserRole;

      return token;
    },
  },
};

export const auth = ExpressAuth(authSettings);

export async function authenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session =
    res.locals.session ?? (await getSession(req, authSettings)) ?? undefined;

  res.locals.session = session;

  if (session) {
    return next();
  }

  res.status(401).json({ message: "Not Authenticated" });
}

export async function authenticatedGameMaster(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session =
    res.locals.session ?? (await getSession(req, authSettings)) ?? undefined;

  res.locals.session = session;

  if (session && session.user.role === "ADMIN") {
    return next();
  }

  res.status(401).json({ message: "Higher security clearance required" });
}

export async function currentSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await getSession(req, authSettings);
  res.locals.session = session;
  return next();
}

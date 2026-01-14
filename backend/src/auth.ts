import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { db } from "./lib/db.js";
import { Class, UserRole } from "@tillerquest/prisma/browser";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.FRONTEND_URL as string],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "tillerquest",
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
        description: "Your username, used to identify you in the game.",
      },
      role: {
        type: "string",
        required: true,
        input: false,
        default: "NEW",
        description: "Your role in the game, used to determine permissions.",
        enum: UserRole,
      },
      class: {
        type: "string",
        required: true,
        input: false,
        default: "DRUID",
        description: "Your class in the game, used to determine abilities.",
        enum: Class,
      },
    },
  },
  rateLimit: {
    enabled: true,
    max: 100, // 100 requests
    window: 10 * 60 * 5, // 5 minutes
    storage: "memory",
    modelName: "RateLimit",
  },
  // TODO: ensure session token does not constantly refresh
  // session: {
  //   // Increase session expiration time
  //   expiresIn: 60 * 60 * 24 * 7, // 7 days instead of default

  //   // Control when tokens refresh (default is 60% of expiration)
  //   updateAge: 60 * 60 * 24, // Only refresh after 1 day
  // },
  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    },
  },
});

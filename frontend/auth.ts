import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { db } from "./lib/db";
import { $Enums } from "@prisma/client";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  // should be automatically set to true in production
  // advanced: {
  //   useSecureCookies: true,
  // },
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
        enum: ["NEW", "USER", "ADMIN", "ARCHIVED"],
      },
      class: {
        type: "string",
        required: true,
        input: false,
        default: "DRUID",
        description: "Your class in the game, used to determine abilities.",
        enum: $Enums.Class,
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    },
  },
});

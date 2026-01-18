import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { Class, UserRole } from "@tillerquest/prisma/browser";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // Optional if the API base URL matches the frontend
  plugins: [
    inferAdditionalFields({
      user: {
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
    }),
  ],
});

export const { signIn, signOut, useSession, getSession, updateUser } =
  authClient;

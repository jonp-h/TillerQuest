import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { $Enums } from "@prisma/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // Optional if the API base URL matches the frontend
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
    }),
  ],
});

export const { signIn, signOut, useSession, getSession, updateUser } =
  authClient;

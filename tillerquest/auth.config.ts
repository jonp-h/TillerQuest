import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import github from "next-auth/providers/github";

export default {
  providers: [
    github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig;

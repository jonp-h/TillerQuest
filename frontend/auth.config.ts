import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: String(profile.id),
          role: "NEW",
          username: profile.login,
          image: profile.avatar_url,
          email: profile.email,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;

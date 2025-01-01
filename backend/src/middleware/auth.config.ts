import GitHub from "@auth/express/providers/github";
import type { ExpressAuthConfig } from "@auth/express";

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
} satisfies ExpressAuthConfig;

import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    GitHub({
      profile(profile) {
        // Destructure and exclude unwanted fields
        const {
          login,
          node_id,
          avatar_url,
          gravatar_id,
          url,
          html_url,
          followers_url,
          following_url,
          gists_url,
          starred_url,
          subscriptions_url,
          organizations_url,
          repos_url,
          events_url,
          received_events_url,
          type,
          user_view_type,
          site_admin,
        } = profile;

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

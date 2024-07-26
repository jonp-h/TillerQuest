// In order to avoid the edge, we split the configuration which does not rely on the adapter into a separate file
// https://authjs.dev/getting-started/migrating-to-v5#edge-compatibility
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

export default { providers: [GitHub] } satisfies NextAuthConfig;

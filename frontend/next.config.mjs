import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  // TODO: Remove when backend is migrated away from Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb", // Increased from default 1mb to 4mb to allow for image uploads
    },
  },
  turbopack: {
    // Manually set the monorepo root for Turbopack
    root: resolve(__dirname, "../"),
  },
};

export default nextConfig;

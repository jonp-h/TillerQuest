import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  turbopack: {
    // Manually set the monorepo root for Turbopack
    root: resolve(__dirname, "../"),
  },
};

export default nextConfig;

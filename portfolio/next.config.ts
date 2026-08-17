import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The desktop preview loads the dev server from 127.0.0.1; Next 16 blocks
  // cross-origin dev resources by default, which silently prevents hydration.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;

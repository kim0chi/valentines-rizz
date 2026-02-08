import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

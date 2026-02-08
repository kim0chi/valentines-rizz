import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'valentines-rizz'; // Your GitHub repo name

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}` : '',
  images: {
    unoptimized: true, // Required for static export
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const apiBaseUrl = process.env.KHATRI_AI_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  basePath: '/admin',
  async rewrites() {
    if (!apiBaseUrl) return [];
    return [{
      source: '/upload/media/:path*',
      destination: `${apiBaseUrl}/upload/media/:path*`,
      basePath: false,
    }];
  },
};

export default nextConfig;

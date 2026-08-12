import type { NextConfig } from "next";

const apiBaseUrl = process.env.KHATRI_AI_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  basePath: '/admin',
  // Uploads are forwarded through this route to the API. Next Server Actions
  // otherwise reject multipart bodies above their default 1 MB limit first.
  // Keep this deliberately high rather than showing a misleading UI limit.
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
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

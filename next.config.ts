import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    unoptimized: true,
  },
  // Ignore build errors for Vercel deployment
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Suppress warnings during build
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;

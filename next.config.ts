import type { NextConfig } from "next";

// Bundle analyzer untuk development
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimasi untuk performance
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header

  // Optimasi caching
  experimental: {
    // Waktu staleness untuk static dan dynamic content
    staleTimes: {
      dynamic: 30, // 30 detik untuk dynamic content
      static: 300, // 5 menit untuk static content
    },
    // Enable optimistic client cache
    optimisticClientCache: true,
    // Optimasi package imports
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  // Optimasi images
  images: {
    // Format modern untuk performa lebih baik
    formats: ["image/webp", "image/avif"],
    // Cache TTL untuk images (24 jam)
    minimumCacheTTL: 86400,
    // Ukuran image yang dioptimasi
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Domain yang diizinkan untuk external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Optimasi bundle
  compiler: {
    // Remove console.log di production
    removeConsole: process.env.NODE_ENV === "production",
    // Remove unused imports
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Tree shaking optimization
      config.optimization.sideEffects = false;

      // Split chunks untuk better caching
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Headers untuk caching dan performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);

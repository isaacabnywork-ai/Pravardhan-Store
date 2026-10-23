import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/orders/:id',
        destination: '/account/orders/:id',
      },
      {
        source: '/order/:id',
        destination: '/account/orders/:id',
      },
    ];
  },
};

export default nextConfig;

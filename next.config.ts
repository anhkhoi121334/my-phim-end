import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.phimapi.com',
      },
      {
        protocol: 'https',
        hostname: 'phimimg.com',
      },
    ],
  },
};

export default nextConfig;
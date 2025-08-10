import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Allow common remote hosts used in the app
    domains: [
      'img.phimapi.com',
      'phimimg.com',
      'lh3.googleusercontent.com',
      'scontent.fsgn2-4.fna.fbcdn.net',
      'static.xx.fbcdn.net',
      'platform-lookaside.fbsbx.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'img.phimapi.com' },
      { protocol: 'https', hostname: 'phimimg.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'scontent.fsgn2-4.fna.fbcdn.net' },
      { protocol: 'https', hostname: 'static.xx.fbcdn.net' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
    ],
  },
};

export default nextConfig;
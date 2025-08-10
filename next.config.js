// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: [
      'phimimg.com',
      'img.phimapi.com',
      'lh3.googleusercontent.com',
      'scontent.fsgn2-4.fna.fbcdn.net',
      'static.xx.fbcdn.net',
      'platform-lookaside.fbsbx.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'phimimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.phimapi.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      }
    ]
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/icons-material']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
}
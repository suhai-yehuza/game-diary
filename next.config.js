/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables exposed to the client
  env: {
    NEXT_PUBLIC_API_MOCK_MODE: process.env.API_MOCK_MODE || 'false',
    CUSTOM_KEY: 'value',
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Production optimizations
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  output: 'standalone',

  // Experimental features
  experimental: {
    // Performance optimizations
    optimizePackageImports: [
      '@apollo/client',
      '@clerk/nextjs',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'recharts',
      'framer-motion',
      'react-hook-form',
      'zod',
    ],
    // Optimize bundle size
    optimizeCss: true,
  },

  // External packages for server components
  serverExternalPackages: ['drizzle-orm'],

  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.nba.com',
      },
      {
        protocol: 'https',
        hostname: '**.nba.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'http',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '**.wikimedia.org',
      },
      {
        protocol: 'http',
        hostname: '**.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Custom page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

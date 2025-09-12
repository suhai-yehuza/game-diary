/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables exposed to the client
  env: {
    NEXT_PUBLIC_MOCK_MODE: process.env.MOCK_MODE || 'false',
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
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Avatar generation services
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'source.boringavatars.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
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

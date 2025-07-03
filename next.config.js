/* eslint-env node */
/* global process, console */

/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

import bundleAnalyzer from '@next/bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// Bundle analyzer configuration
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Production optimizations
  ...(isProd && {
    trailingSlash: false,
    skipTrailingSlashRedirect: true,
    output: 'standalone',
    generateBuildId: async () => {
      return 'game-diary-build-' + Date.now();
    },
  }),

  // Experimental features
  experimental: {
    // Performance optimizations - exclude drizzle-orm to avoid conflict
    optimizePackageImports: ['@apollo/client'],
  },

  // External packages for server components (moved out of experimental)
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
    ],
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimization for build size
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@apollo/client': path.resolve(__dirname, 'node_modules/@apollo/client'),
      };
    }

    // Handle CSV files
    config.module.rules.push({
      test: /\.csv$/,
      loader: 'csv-loader',
      options: {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true,
      },
    });

    return config;
  },

  // Custom page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Asset optimization
  assetPrefix: isDev ? '' : '',

  // Environment variables
  env: {
    CUSTOM_KEY: 'value',
  },

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

export default withBundleAnalyzer(nextConfig);

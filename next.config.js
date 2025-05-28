/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  images: {
    domains: ['api.dicebear.com'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
      {
        protocol: 'http',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.nba.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.nba.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'stats.nba.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ak-static.cms.nba.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  output: 'standalone',
  webpack: (config, { dev, isServer }) => {
    // Optimize webpack cache settings
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(__dirname, '.next/cache'),
      maxAge: 172800000, // 2 days
      compression: 'gzip',
      allowCollectingMemory: true,
    };

    // Exclude test data from production builds
    if (!dev) {
      config.module.rules.push({
        test: /__tests__\/sample-data\//,
        loader: 'ignore-loader',
      });
    }

    return config;
  },
};

export default nextConfig;

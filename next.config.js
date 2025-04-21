/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
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
    ],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  devIndicators: false,
};

module.exports = nextConfig;

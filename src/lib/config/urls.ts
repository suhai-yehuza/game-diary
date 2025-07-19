// URL Configuration - Single source of truth for all URLs in the project

// Base protocols
export const HTTP = 'http';
export const HTTPS = `${HTTP}s`;
export const HTTP_PROTOCOL = `${HTTP}://`;
export const HTTPS_PROTOCOL = `${HTTPS}://`;

// App configuration
export const APP_NAME = 'game-diary';
export const VERCEL_GENERIC_PREVIEW_ID = 'suhai-yehuza-suhais-projects-33a81a2a';
export const VERCEL_DOMAIN = 'vercel.app';

// URL building blocks
export const LOCALHOST_BASE = `${HTTP_PROTOCOL}localhost`;
export const VERCEL_APP_BASE = `${HTTPS_PROTOCOL}${APP_NAME}`;
export const VERCEL_BASE_URL = `${VERCEL_APP_BASE}-${VERCEL_GENERIC_PREVIEW_ID}.${VERCEL_DOMAIN}`;
export const VERCEL_MAIN_URL = `${VERCEL_APP_BASE}.${VERCEL_DOMAIN}`;
export const PRODUCTION_DOMAINS = [
  `${HTTPS_PROTOCOL}www.${APP_NAME}.io`,
  `${HTTPS_PROTOCOL}${APP_NAME}.io`,
];

// Localhost ports for development
export const LOCALHOST_PORTS = [3000, 3001, 3002, 3003, 3004, 3005];

// Vercel preview patterns
export const VERCEL_PREVIEW_PATTERNS = [
  'git-main',
  'git-master',
  'git-dev',
  'git-development',
  'git-demo',
  'git-preview',
  'git-feature',
  'git-stg',
  'git-staging',
  'git-prod',
  'git-production',
];

// Generate all Vercel preview URLs
export const VERCEL_PREVIEW_URLS = VERCEL_PREVIEW_PATTERNS.map(
  pattern => `${VERCEL_APP_BASE}-${pattern}-${VERCEL_GENERIC_PREVIEW_ID}.${VERCEL_DOMAIN}`
);

// Generate all localhost URLs
export const LOCALHOST_URLS = LOCALHOST_PORTS.map(port => `${LOCALHOST_BASE}:${port}`);

// Convenience exports
export const STAGING_URL = VERCEL_BASE_URL;
export const PRODUCTION_URL = VERCEL_MAIN_URL;

// Export all URL configurations as a single object
export const URL_CONFIG = {
  // Base protocols
  HTTP,
  HTTPS,
  HTTP_PROTOCOL,
  HTTPS_PROTOCOL,

  // App configuration
  APP_NAME,
  VERCEL_GENERIC_PREVIEW_ID,
  VERCEL_DOMAIN,

  // Main URLs
  LOCALHOST_BASE,
  VERCEL_APP_BASE,
  VERCEL_BASE_URL,
  VERCEL_MAIN_URL,
  PRODUCTION_DOMAINS,

  // Generated URL arrays
  LOCALHOST_PORTS,
  LOCALHOST_URLS,
  VERCEL_PREVIEW_PATTERNS,
  VERCEL_PREVIEW_URLS,

  // Convenience exports
  STAGING_URL,
  PRODUCTION_URL,
} as const;

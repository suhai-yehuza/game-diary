import { rateLimit } from 'express-rate-limit';

// Rate limit configuration constants
const TIME_CONSTANTS = {
  SECONDS_PER_MINUTE: 60,
  MILLISECONDS_PER_SECOND: 1000,
} as const;

const RATE_LIMIT_VALUES = {
  REQUESTS_PER_WINDOW: 15,
  WINDOW_SIZE_SECONDS: TIME_CONSTANTS.SECONDS_PER_MINUTE,
  WINDOW_SIZE_MS: TIME_CONSTANTS.MILLISECONDS_PER_SECOND,
} as const;

const RATE_LIMIT_CONFIG = {
  DEFAULT_WINDOW_MS: RATE_LIMIT_VALUES.WINDOW_SIZE_SECONDS * RATE_LIMIT_VALUES.WINDOW_SIZE_MS,
  DEFAULT_REQUESTS: RATE_LIMIT_VALUES.REQUESTS_PER_WINDOW,
  STRICT_WINDOW_MS: RATE_LIMIT_VALUES.WINDOW_SIZE_SECONDS * RATE_LIMIT_VALUES.WINDOW_SIZE_MS,
  STRICT_REQUESTS: RATE_LIMIT_VALUES.REQUESTS_PER_WINDOW,
} as const;

// Global rate limit configuration
export const RATE_LIMIT_CONFIG_FULL = {
  // Default rate limit: 1000 requests per 15 minutes
  default: {
    windowMs: RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS,
    max: RATE_LIMIT_CONFIG.DEFAULT_REQUESTS,
  },

  // Strict rate limit: 1000 requests per minute
  strict: {
    windowMs: RATE_LIMIT_CONFIG.STRICT_WINDOW_MS,
    max: RATE_LIMIT_CONFIG.STRICT_REQUESTS,
  },

  // API rate limit: 1000 requests per 15 minutes
  api: {
    windowMs: RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS,
    max: RATE_LIMIT_CONFIG.DEFAULT_REQUESTS,
  },

  // GraphQL specific routes
  graphql: {
    windowMs: 60 * 1000, // 1 minute
    max: 50000, // 50000 requests per minute
    message: 'GraphQL rate limit exceeded, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  // Auth routes (more strict)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
};

// Create rate limiters
export const rateLimiters = {
  api: rateLimit(RATE_LIMIT_CONFIG_FULL.api),
  graphql: rateLimit(RATE_LIMIT_CONFIG_FULL.graphql),
  auth: rateLimit(RATE_LIMIT_CONFIG_FULL.auth),
};

import { rateLimit } from 'express-rate-limit';

// Rate limit configuration constants
const TIME_CONSTANTS = {
  SECONDS_PER_MINUTE: 60,
  MILLISECONDS_PER_SECOND: 1000,
} as const;

const RATE_LIMIT_CONSTANTS = {
  REQUESTS_PER_WINDOW: 15,
} as const;

const RATE_LIMIT_VALUES = {
  REQUESTS_PER_WINDOW: RATE_LIMIT_CONSTANTS.REQUESTS_PER_WINDOW,
  WINDOW_SIZE_SECONDS: TIME_CONSTANTS.SECONDS_PER_MINUTE,
  WINDOW_SIZE_MS: TIME_CONSTANTS.MILLISECONDS_PER_SECOND,
} as const;

const RATE_LIMIT_CONFIG = {
  DEFAULT_WINDOW_MS: RATE_LIMIT_VALUES.WINDOW_SIZE_SECONDS * RATE_LIMIT_VALUES.WINDOW_SIZE_MS,
  DEFAULT_REQUESTS: RATE_LIMIT_VALUES.REQUESTS_PER_WINDOW,
  STRICT_WINDOW_MS: RATE_LIMIT_VALUES.WINDOW_SIZE_SECONDS * RATE_LIMIT_VALUES.WINDOW_SIZE_MS,
  STRICT_REQUESTS: RATE_LIMIT_VALUES.REQUESTS_PER_WINDOW,
} as const;

// Additional constants for specific rate limits
const GRAPHQL_RATE_LIMIT = {
  WINDOW_MS: TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MILLISECONDS_PER_SECOND,
  MAX_REQUESTS: 50000,
} as const;

const AUTH_RATE_LIMIT = {
  WINDOW_MS:
    RATE_LIMIT_CONSTANTS.REQUESTS_PER_WINDOW *
    TIME_CONSTANTS.SECONDS_PER_MINUTE *
    TIME_CONSTANTS.MILLISECONDS_PER_SECOND,
  MAX_REQUESTS: 100,
} as const;

// Loosen or disable rate limiting for local/test environments
const isDevOrTest =
  process.env.NODE_ENV === 'development' ||
  process.env.CI === 'true' ||
  process.env.GITHUB_ACTIONS === 'true' ||
  process.env.API_MOCK_MODE === 'true';

// Global rate limit configuration
export const RATE_LIMIT_CONFIG_FULL = {
  // Default rate limit: 1000 requests per 15 minutes
  default: {
    windowMs: RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS,
    max: isDevOrTest ? 100000 : RATE_LIMIT_CONFIG.DEFAULT_REQUESTS,
  },

  // Strict rate limit: 1000 requests per minute
  strict: {
    windowMs: RATE_LIMIT_CONFIG.STRICT_WINDOW_MS,
    max: isDevOrTest ? 100000 : RATE_LIMIT_CONFIG.STRICT_REQUESTS,
  },

  // API rate limit: 1000 requests per 15 minutes
  api: {
    windowMs: RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS,
    max: isDevOrTest ? 100000 : RATE_LIMIT_CONFIG.DEFAULT_REQUESTS,
  },

  // GraphQL specific routes
  graphql: {
    windowMs: GRAPHQL_RATE_LIMIT.WINDOW_MS,
    max: isDevOrTest ? 100000 : GRAPHQL_RATE_LIMIT.MAX_REQUESTS,
    message: 'GraphQL rate limit exceeded, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  // Auth routes (more strict)
  auth: {
    windowMs: AUTH_RATE_LIMIT.WINDOW_MS,
    max: isDevOrTest ? 100000 : AUTH_RATE_LIMIT.MAX_REQUESTS,
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

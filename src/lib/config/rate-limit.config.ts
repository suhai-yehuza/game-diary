import { rateLimit } from 'express-rate-limit';

// Global rate limit configuration
export const RATE_LIMIT_CONFIG = {
  // General API routes
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
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
  api: rateLimit(RATE_LIMIT_CONFIG.api),
  graphql: rateLimit(RATE_LIMIT_CONFIG.graphql),
  auth: rateLimit(RATE_LIMIT_CONFIG.auth),
};

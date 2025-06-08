import { z } from 'zod';

import { logger } from 'lib/core/logger';

// Better build detection that works across different environments
const isServer = typeof window === 'undefined';
const isBuild =
  process.env.NODE_ENV === 'production' &&
  (process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1');

// Database-only schema for database initialization
export const dbEnvSchema = z.object({
  // Database - always required
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_CONNECTION_TIMEOUT: z.string().optional(),
  DATABASE_POOL_SIZE: z.string().optional(),
  DATABASE_RETRY_ATTEMPTS: z.string().optional(),

  // Redis - optional for all environments
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
});

// Build-time environment schema (minimal requirements)
export const buildEnvSchema = z.object({
  // Database - always required
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_CONNECTION_TIMEOUT: z.string().optional(),
  DATABASE_POOL_SIZE: z.string().optional(),
  DATABASE_RETRY_ATTEMPTS: z.string().optional(),

  // Clerk - required for middleware to work
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional().default('/sign-up'),

  // Redis - optional for all environments
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),

  // API - optional during build
  NEXT_PUBLIC_RAPID_API_HOST: z.string().min(1).optional(),
  NEXT_PUBLIC_RAPID_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_RAPID_API_BASE_URL: z.string().url().optional(),
});

// Full environment schema for complete application validation
export const envSchema = z.object({
  // Database - always required
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_CONNECTION_TIMEOUT: z.string().optional(),
  DATABASE_POOL_SIZE: z.string().optional(),
  DATABASE_RETRY_ATTEMPTS: z.string().optional(),

  // Clerk - required for authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional().default('/sign-up'),

  // Redis - optional for all environments
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),

  // API - required at runtime
  NEXT_PUBLIC_RAPID_API_HOST: z.string().min(1),
  NEXT_PUBLIC_RAPID_API_KEY: z.string().min(1),
  NEXT_PUBLIC_RAPID_API_BASE_URL: z.string().url(),
});

export type EnvConfig = z.infer<typeof envSchema>;
export type DbEnvConfig = z.infer<typeof dbEnvSchema>;
export type BuildEnvConfig = z.infer<typeof buildEnvSchema>;

// Runtime validation helper
export function validateRuntimeEnv() {
  if (!isBuild && isServer) {
    const requiredApiVars = [
      'NEXT_PUBLIC_RAPID_API_HOST',
      'NEXT_PUBLIC_RAPID_API_KEY',
      'NEXT_PUBLIC_RAPID_API_BASE_URL',
    ];

    const missing = requiredApiVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
      logger.warn(`Missing RapidAPI environment variables: ${missing.join(', ')}`);
    }
  }
}

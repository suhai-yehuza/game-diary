import { z } from 'zod';

import { logger } from '@/lib/logger';
// Create a more sophisticated environment validation that handles build vs runtime
const isServer = typeof window === 'undefined';
const isBuild =
  process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

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

// Full environment schema for complete application validation
export const envSchema = z.object({
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

  // API - required at runtime but optional during build
  NEXT_PUBLIC_RAPID_API_HOST: isBuild ? z.string().min(1).optional() : z.string().min(1),
  NEXT_PUBLIC_RAPID_API_KEY: isBuild ? z.string().min(1).optional() : z.string().min(1),
  NEXT_PUBLIC_RAPID_API_BASE_URL: isBuild ? z.string().url().optional() : z.string().url(),
});

export type EnvConfig = z.infer<typeof envSchema>;
export type DbEnvConfig = z.infer<typeof dbEnvSchema>;

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

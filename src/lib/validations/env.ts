import { z } from 'zod';

// Environment validation schemas
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export const buildEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  ANALYZE: z.string().optional(),
  DEBUG: z.string().optional(),
});

export type IEnv = z.infer<typeof envSchema>;
export type IBuildEnv = z.infer<typeof buildEnvSchema>;

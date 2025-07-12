import { z } from 'zod';

// Environment validation schema
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  DATABASE_CONNECTION_TIMEOUT: z.string().optional(),
  DATABASE_POOL_SIZE: z.string().optional(),
  DATABASE_RETRY_ATTEMPTS: z.string().optional(),
  ANALYZE: z.string().optional(),
  DEBUG: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_HOST: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_KEY: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_BASE_URL: z.string().optional(),
  DATA_ENCRYPTION_KEY: z.string().optional(),
});

export type IEnv = z.infer<typeof envSchema>;

import { describe, expect, it } from 'vitest';

import { envSchema } from '@/lib/validations/env';

describe('Environment Validation', () => {
  it('validates required environment variables', () => {
    const validEnv = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NEXT_PUBLIC_RAPID_API_KEY: 'test-key',
      NEXT_PUBLIC_RAPID_API_HOST: 'test-host',
      NEXT_PUBLIC_RAPID_API_BASE_URL: 'https://test-api.com',
    };

    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('rejects missing API key', () => {
    const invalidEnv = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NEXT_PUBLIC_RAPID_API_HOST: 'test-host',
      NEXT_PUBLIC_RAPID_API_BASE_URL: 'https://test-api.com',
    };

    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
  });

  it('rejects invalid NEXTAUTH_URL', () => {
    const invalidEnv = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NEXT_PUBLIC_RAPID_API_KEY: 'test-key',
      NEXT_PUBLIC_RAPID_API_HOST: 'test-host',
      NEXT_PUBLIC_RAPID_API_BASE_URL: 'https://test-api.com',
      NEXTAUTH_URL: 'not-a-url',
    };

    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
  });
});

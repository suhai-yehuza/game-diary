#!/usr/bin/env tsx

import { z } from 'zod';
import { envSchema } from '@/lib/validations/env';
import dotenvFlow from 'dotenv-flow';
import dotenv from 'dotenv';
import fs from 'fs';

if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = 'development';
}

const isCI =
  process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' || process.env.VERCEL === '1';
const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

if (!isCI) {
  if (isDevOrTest) {
    // For development/test, load .env.local as override synchronously
    dotenvFlow.config();
  } else {
    // For production/staging, only load environment-specific files synchronously
    const env = process.env.NODE_ENV || 'development';
    let envFile = '.env';
    if (String(env) === 'staging' && fs.existsSync('.env.staging')) {
      envFile = '.env.staging';
    } else if (String(env) === 'production' && fs.existsSync('.env.production')) {
      envFile = '.env.production';
    } else if (String(env) === 'development' && fs.existsSync('.env.development')) {
      envFile = '.env.development';
    }
    try {
      dotenv.config({ path: envFile });
    } catch (error) {
      console.log('⚠️  No .env files found, using system environment variables');
    }
  }
}

// Debug: Check what environment variables are loaded
console.log('🔍 Environment variables loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
console.log('CI Environment:', isCI);

// Environment validation schema for CI/local development
const requiredEnvSchema = z.object({
  // Database - required for all environments except CI prebuild
  DATABASE_URL: z.string().optional(),

  // Clerk authentication - required for production/staging
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),

  // API keys - optional but recommended
  NEXT_PUBLIC_RAPID_API_KEY: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_HOST: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_BASE_URL: z.string().optional(),

  // Redis - optional
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // NextAuth - optional
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),

  // CI/Testing flags
  CI: z.string().optional(),
  GITHUB_ACTIONS: z.string().optional(),
  API_MOCK_MODE: z.string().optional(),
});

function validateEnvironment(): void {
  console.log('🔍 Validating environment variables...');

  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CI: ${isCI}`);

  try {
    // Parse and validate environment variables
    const env = requiredEnvSchema.parse(process.env);

    // Check required variables based on environment
    const errors: string[] = [];
    const warnings: string[] = [];

    // DATABASE_URL is required for non-CI environments or when running database operations
    if (!env.DATABASE_URL) {
      if (isCI) {
        warnings.push(
          'DATABASE_URL not set in CI environment - database operations will be skipped'
        );
      } else {
        errors.push('DATABASE_URL is required for local development');
      }
    }

    // Clerk keys are required for production/staging (unless in test/E2E or CI)
    if (!isCI && (env.NODE_ENV === 'production' || env.NODE_ENV === 'staging')) {
      if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required for production/staging');
      }
      if (!env.CLERK_SECRET_KEY) {
        errors.push('CLERK_SECRET_KEY is required for production/staging');
      }
    } else if (isCI && (env.NODE_ENV === 'production' || env.NODE_ENV === 'staging')) {
      // In CI (including Vercel), check if Clerk keys are available but don't fail if missing
      if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !env.CLERK_SECRET_KEY) {
        warnings.push(
          'Clerk authentication keys not found in CI environment - ensure they are set in deployment settings'
        );
      }
    }

    // API keys are recommended but not required (skip warnings in CI)
    if (!isCI) {
      if (!env.NEXT_PUBLIC_RAPID_API_KEY) {
        warnings.push('NEXT_PUBLIC_RAPID_API_KEY is not set - API features may be limited');
      }
      if (!env.NEXT_PUBLIC_RAPID_API_HOST) {
        warnings.push('NEXT_PUBLIC_RAPID_API_HOST is not set - using default');
      }
      if (!env.NEXT_PUBLIC_RAPID_API_BASE_URL) {
        warnings.push('NEXT_PUBLIC_RAPID_API_BASE_URL is not set - using default');
      }
    }

    // Redis is optional but recommended for production
    if (env.NODE_ENV !== 'production') {
      if (!env.UPSTASH_REDIS_REST_URL && !env.REDIS_URL) {
        warnings.push('Redis URL not configured - caching may be limited');
      }
    }

    // Display warnings
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    // Display errors and exit if any
    if (errors.length > 0) {
      console.log('\n❌ Environment validation failed:');
      errors.forEach(error => console.log(`  - ${error}`));
      console.log('\nPlease check your environment variables and try again.');
      process.exit(1);
    }

    console.log('\n✅ Environment validation passed!');

    // Log environment summary
    console.log('\n📋 Environment Summary:');
    console.log(
      `  Database: ${env.DATABASE_URL ? '✅ Configured' : isCI ? '⚠️  Skipped in CI' : '❌ Missing'}`
    );
    console.log(
      `  Clerk Auth: ${env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Configured' : isCI ? '⚠️  Check deployment settings' : '⚠️  Not configured'}`
    );
    console.log(
      `  RapidAPI: ${env.NEXT_PUBLIC_RAPID_API_KEY ? '✅ Configured' : isCI ? '⚠️  Skipped in CI' : '⚠️  Not configured'}`
    );
    console.log(
      `  Redis: ${env.UPSTASH_REDIS_REST_URL || env.REDIS_URL ? '✅ Configured' : '⚠️  Not configured'}`
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('\n❌ Environment validation failed:');
      (error as any).errors.forEach((err: any) => {
        console.log(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.log('\n❌ Environment validation failed with unexpected error:', error);
    }
    console.log('\nPlease check your environment variables and try again.');
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnvironment();
}

export { validateEnvironment };

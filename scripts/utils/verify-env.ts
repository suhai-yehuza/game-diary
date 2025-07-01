#!/usr/bin/env tsx
/**
 * @fileoverview Verifies that all required environment variables are set and valid.
 * Run with: pnpm verify-env or tsx scripts/utils/verify-env.ts
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

import * as dotenv from 'dotenv';

import { logger } from '@lib/core/logger';
import { envSchema } from '@src/lib/validations/env';

import { parseScriptArgs } from '../shared/script-utils';

function verifyEnvironment(envFile?: string, isBuildTime = false) {
  try {
    const options = parseScriptArgs();
    const nodeEnv = options.environment || 'development';
    const isProduction = nodeEnv === 'production';
    const isVercel = process.env.VERCEL === '1';
    const isCI =
      process.env.CI === 'true' ||
      process.env.GITHUB_ACTIONS === 'true' ||
      process.env.VERCEL === '1';

    if (isBuildTime) {
      logger.info(`\n🔍 Verifying environment variables for ${nodeEnv} environment...`);
      if (isVercel) {
        logger.info('🚀 Detected Vercel deployment - using build-time validation');
      }
      if (isCI) {
        logger.info('🤖 Detected CI environment - using environment variables');
      }
    } else {
      logger.info(
        `\n🔍 Verifying environment variables in ${envFile} for ${nodeEnv} environment...`
      );
    }

    // Only try to load .env files in non-production environments and when not in CI
    if (!isProduction && !isCI) {
      try {
        if (isBuildTime) {
          // For build-time, load based on current NODE_ENV
          const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
          const envPath = join(process.cwd(), envFile);

          // Only try to load if file exists
          if (existsSync(envPath)) {
            const result = dotenv.config({ path: envPath });
            if (result.error) {
              throw new Error(`Failed to load environment: ${result.error.message}`);
            }
          } else {
            logger.info(`⚠️ Environment file not found: ${envFile} (using environment variables)`);
          }
        } else {
          // For full validation, load the specific file
          const envPath = join(process.cwd(), envFile!);
          const result = dotenv.config({ path: envPath });

          if (result.error) {
            throw new Error(`Failed to load ${envFile}: ${result.error.message}`);
          }
        }
      } catch (error) {
        if (isCI) {
          logger.info(
            `ℹ️ Skipping environment file validation in CI: ${error instanceof Error ? error.message : String(error)}`
          );
        } else {
          throw new Error(
            `Environment file not found: ${isBuildTime ? 'current environment' : envFile}`
          );
        }
      }
    } else if (isCI) {
      logger.info(
        '🤖 CI environment detected - skipping environment file loading, using environment variables'
      );
    }

    // Use the single comprehensive schema for all validation
    const env = envSchema.parse(process.env);

    if (isBuildTime) {
      logger.info('✅ All required build-time environment variables are present and valid');
    } else {
      logger.info('✅ All required environment variables are present and valid');
    }

    // Log environment-specific information
    logger.info(`\nEnvironment: ${env.NODE_ENV}`);
    if (isBuildTime && isVercel) {
      logger.info('Deployment: Vercel');
    }
    if (isCI) {
      logger.info('Environment: CI/CD Pipeline');
    }

    logger.info('Database configuration:');
    logger.info(`- URL: ${env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
    logger.info(`- Connection Timeout: ${env.DATABASE_CONNECTION_TIMEOUT || 'Not set'}`);
    logger.info(`- Pool Size: ${env.DATABASE_POOL_SIZE || 'Not set'}`);
    logger.info(`- Retry Attempts: ${env.DATABASE_RETRY_ATTEMPTS || 'Not set'}`);

    if (isBuildTime) {
      logger.info('\nClerk Authentication:');
      logger.info(
        `- Publishable Key: ${env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Configured' : '❌ Missing'}`
      );
      logger.info(`- Secret Key: ${env.CLERK_SECRET_KEY ? '✅ Configured' : '❌ Missing'}`);
      logger.info(`- Sign In URL: ${env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'Default (/sign-in)'}`);
      logger.info(`- Sign Up URL: ${env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || 'Default (/sign-up)'}`);
    }

    logger.info('\nRedis configuration:');
    logger.info(`- Upstash URL: ${env.UPSTASH_REDIS_REST_URL ? '✅ Configured' : '❌ Missing'}`);
    logger.info(
      `- Upstash Token: ${env.UPSTASH_REDIS_REST_TOKEN ? '✅ Configured' : '❌ Missing'}`
    );
    logger.info(`- Redis URL: ${env.REDIS_URL ? '✅ Configured' : '❌ Missing'}`);

    if (isBuildTime) {
      logger.info('\nAPI configuration (optional during build):');
      logger.info(
        `- RapidAPI Host: ${env.NEXT_PUBLIC_RAPID_API_HOST ? '✅ Configured' : '⚠️ Not set (optional for build)'}`
      );
      logger.info(
        `- RapidAPI Key: ${env.NEXT_PUBLIC_RAPID_API_KEY ? '✅ Configured' : '⚠️ Not set (optional for build)'}`
      );
      logger.info(
        `- RapidAPI Base URL: ${env.NEXT_PUBLIC_RAPID_API_BASE_URL ? '✅ Configured' : '⚠️ Not set (optional for build)'}`
      );
    } else {
      logger.info('\nAPI configuration:');
      logger.info(
        `- RapidAPI Host: ${env.NEXT_PUBLIC_RAPID_API_HOST ? '✅ Configured' : '❌ Missing'}`
      );
      logger.info(
        `- RapidAPI Key: ${env.NEXT_PUBLIC_RAPID_API_KEY ? '✅ Configured' : '❌ Missing'}`
      );
      logger.info(
        `- RapidAPI Base URL: ${env.NEXT_PUBLIC_RAPID_API_BASE_URL ? '✅ Configured' : '❌ Missing'}`
      );
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      logger.error('❌ Environment validation failed:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('❌ Environment validation failed:', String(error));
    }
    return false;
  }
}

// Check if this is a build-time validation
const isBuildTime = process.argv.includes('--build') || process.argv.includes('-b');

if (isBuildTime) {
  // Build-time validation - single environment check
  const isValid = verifyEnvironment(undefined, true);

  if (!isValid) {
    process.exit(1);
  } else {
    logger.info('\n✨ Environment validation successful!');
  }
} else {
  // Full validation - check all environment files
  const isCI =
    process.env.CI === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.VERCEL === '1';

  if (isCI) {
    // In CI, just validate current environment variables
    logger.info('🤖 CI environment detected - validating current environment variables only');
    const isValid = verifyEnvironment(undefined, true);

    if (!isValid) {
      process.exit(1);
    } else {
      logger.info('\n✨ Environment validation successful!');
    }
  } else {
    // In development, check all environment files
    const envFiles = ['.env.development', '.env.production'];
    let allValid = true;

    for (const envFile of envFiles) {
      const isValid = verifyEnvironment(envFile, false);
      if (!isValid) {
        allValid = false;
      }
    }

    if (!allValid) {
      process.exit(1);
    } else {
      logger.info('\n✨ All environment files are valid!');
    }
  }
}

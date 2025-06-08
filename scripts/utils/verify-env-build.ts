import { buildEnvSchema } from '@src/lib/validations/env';
import { logger } from 'lib/core/logger';
import * as dotenvFlow from 'dotenv-flow';
import * as path from 'path';

function verifyEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const isVercel = process.env.VERCEL === '1';

  logger.info(`\n🔍 Verifying environment variables for ${nodeEnv} environment...`);
  if (isVercel) {
    logger.info('🚀 Detected Vercel deployment - using build-time validation');
  }

  // Only try to load .env files in non-production environments
  if (!isProduction) {
    const result = dotenvFlow.config({
      path: process.cwd(),
      node_env: nodeEnv,
    });

    if (result.error) {
      logger.error(`Failed to load environment: ${result.error.message}`);
      return false;
    }
  }

  try {
    // Use build-time schema for validation (less strict)
    const env = buildEnvSchema.parse(process.env);
    logger.info('✅ All required build-time environment variables are present and valid');

    // Log environment-specific information
    logger.info(`\nEnvironment: ${env.NODE_ENV}`);
    if (isVercel) {
      logger.info('Deployment: Vercel');
    }

    logger.info('Database configuration:');
    logger.info(`- URL: ${env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
    logger.info(`- Connection Timeout: ${env.DATABASE_CONNECTION_TIMEOUT || 'Not set'}`);
    logger.info(`- Pool Size: ${env.DATABASE_POOL_SIZE || 'Not set'}`);
    logger.info(`- Retry Attempts: ${env.DATABASE_RETRY_ATTEMPTS || 'Not set'}`);

    logger.info('\nClerk Authentication:');
    logger.info(
      `- Publishable Key: ${env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Configured' : '❌ Missing'}`
    );
    logger.info(`- Secret Key: ${env.CLERK_SECRET_KEY ? '✅ Configured' : '❌ Missing'}`);
    logger.info(`- Sign In URL: ${env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'Default (/sign-in)'}`);
    logger.info(`- Sign Up URL: ${env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || 'Default (/sign-up)'}`);

    logger.info('\nRedis configuration:');
    logger.info(`- Upstash URL: ${env.UPSTASH_REDIS_REST_URL ? '✅ Configured' : '❌ Missing'}`);
    logger.info(
      `- Upstash Token: ${env.UPSTASH_REDIS_REST_TOKEN ? '✅ Configured' : '❌ Missing'}`
    );
    logger.info(`- Redis URL: ${env.REDIS_URL ? '✅ Configured' : '❌ Missing'}`);

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

    return true;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`❌ Environment validation failed: ${error.message}`);
    }
    return false;
  }
}

// Verify environment
const isValid = verifyEnvironment();

if (!isValid) {
  process.exit(1);
} else {
  logger.info('\n✨ Environment validation successful!');
}

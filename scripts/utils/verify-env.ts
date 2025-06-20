import * as path from 'path';

import * as dotenvFlow from 'dotenv-flow';

import { logger } from '@lib/core/logger';
import { envSchema } from '@src/lib/validations/env';

import { parseScriptArgs } from '../shared/script-utils';

function verifyEnvironment(envFile: string) {
  try {
    const options = parseScriptArgs();
    const nodeEnv = options.environment || 'development';
    const isProduction = nodeEnv === 'production';

    logger.info(`\n🔍 Verifying environment variables in ${envFile} for ${nodeEnv} environment...`);

    // Only try to load .env files in non-production environments
    if (!isProduction) {
      // Load environment variables from the specified file
      const result = dotenvFlow.config({
        path: process.cwd(),
        node_env: path.basename(envFile, '.env'),
      });

      if (result.error) {
        throw new Error(`Failed to load ${envFile}: ${result.error.message}`);
      }
    }

    // Validate full environment schema
    const env = envSchema.parse(process.env);
    logger.info('✅ All required environment variables are present and valid');

    // Log environment-specific information
    logger.info(`\nEnvironment: ${env.NODE_ENV}`);
    logger.info('Database configuration:');
    logger.info(`- URL: ${env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
    logger.info(`- Connection Timeout: ${env.DATABASE_CONNECTION_TIMEOUT || 'Not set'}`);
    logger.info(`- Pool Size: ${env.DATABASE_POOL_SIZE || 'Not set'}`);
    logger.info(`- Retry Attempts: ${env.DATABASE_RETRY_ATTEMPTS || 'Not set'}`);

    logger.info('\nRedis configuration:');
    logger.info(`- Upstash URL: ${env.UPSTASH_REDIS_REST_URL ? '✅ Configured' : '❌ Missing'}`);
    logger.info(
      `- Upstash Token: ${env.UPSTASH_REDIS_REST_TOKEN ? '✅ Configured' : '❌ Missing'}`
    );
    logger.info(`- Redis URL: ${env.REDIS_URL ? '✅ Configured' : '❌ Missing'}`);

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

// Verify all environment files
const envFiles = ['.env.development', '.env.production', '.env.local'];
let allValid = true;

for (const envFile of envFiles) {
  const isValid = verifyEnvironment(envFile);
  if (!isValid) {
    allValid = false;
  }
}

if (!allValid) {
  process.exit(1);
} else {
  logger.info('\n✨ All environment files are valid!');
}

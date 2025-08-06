import fs from 'fs';

import { config } from 'dotenv-flow';

import { isCI } from './e2e-test-setup';

// Re-export isCI for convenience
export { isCI };

/**
 * Safely load environment variables using dotenv-flow
 * Handles CI environments and missing .env files gracefully
 */
export function loadEnvironmentVariables(): void {
  try {
    if (isCI()) {
      console.log('🔧 CI environment detected, skipping .env file loading');
      return;
    }

    // Check if .env files exist
    const envFilesExist =
      fs.existsSync('.env') || fs.existsSync('.env.local') || fs.existsSync('.env.development');

    if (!envFilesExist) {
      console.log('⚠️  No .env files found, using system environment variables');
      return;
    }

    // Load environment variables from .env files
    const result = config({
      silent: true,
      default_node_env: 'development',
    });

    if (result.error) {
      console.warn('⚠️  Failed to load environment variables from .env files:', result.error);
      console.log('📝 Using system environment variables instead');
    } else {
      console.log('✅ Environment variables loaded successfully');
    }
  } catch (error) {
    console.warn('⚠️  Failed to load environment variables from .env files:', error);
    console.log('📝 Using system environment variables instead');
  }
}

/**
 * Validate required environment variables
 */
export function validateEnvironmentVariables(): void {
  const requiredVars = ['DATABASE_URL', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing required environment variables:', missingVars.join(', '));

    // In CI, this should be a hard error
    if (isCI()) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
}

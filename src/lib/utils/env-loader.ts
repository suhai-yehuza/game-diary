import fs from 'fs';

import { config } from 'dotenv-flow';

/**
 * Check if the current environment is a CI environment
 */
export function isCI(): boolean {
  return (
    process.env.CI === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.VERCEL === 'true' ||
    process.env.VERCEL === '1'
  );
}

/**
 * Safely load environment variables using dotenv-flow
 * Handles CI environments and missing .env files gracefully
 */
export function loadEnvironmentVariables(): void {
  try {
    // Check if we're in a CI environment
    if (isCI()) {
      // In CI, environment variables should be set via secrets/environment
      // Don't try to load .env files
      console.log('🔧 CI environment detected, skipping .env file loading');
      return;
    }

    // Check if any .env files exist
    const envFiles = ['.env.local', '.env.development', '.env.production', '.env.staging', '.env'];

    const hasEnvFiles = envFiles.some(file => fs.existsSync(file));

    if (!hasEnvFiles) {
      console.log('⚠️  No .env files found, using system environment variables');
      return;
    }

    // Load environment variables using dotenv-flow
    config({
      silent: true, // Suppress dotenv-flow warnings
      default_node_env: 'development',
    });

    console.log('✅ Environment variables loaded successfully');
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

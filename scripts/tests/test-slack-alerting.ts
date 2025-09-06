#!/usr/bin/env tsx
/**
 * @fileoverview Test Slack alerting by triggering a critical audit event
 */
import dotenvFlow from 'dotenv-flow';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables safely
const isDevOrTest =
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'test' ||
  !process.env.NODE_ENV;
if (isDevOrTest) {
  dotenvFlow.config();
} else {
  const env = process.env.NODE_ENV || 'development';
  let envFile = '.env';
  if (String(env) === 'staging' && fs.existsSync('.env.staging')) {
    envFile = '.env.staging';
  } else if (String(env) === 'production' && fs.existsSync('.env.production')) {
    envFile = '.env.production';
  } else if (String(env) === 'development' && fs.existsSync('.env.development')) {
    envFile = '.env.development';
  }
  dotenv.config({ path: envFile });
}

import { dbManager } from '@/lib/db';
import { AuditLogger } from '@/lib/services/audit-logger';
import { errorHandlers } from '@/lib/utils/error-handler';

// Ensure database is initialized for the global AuditLogger
async function ensureDatabaseInitialized(): Promise<void> {
  try {
    // 🚨 PRODUCTION DATABASE PROTECTION
    const env = process.env.NODE_ENV || 'development';
    if (
      env === 'production' &&
      process.env.CI !== 'true' &&
      process.env.ALLOW_ACCESS_TO_PRODUCTION_DB !== 'true'
    ) {
      throw new Error(
        '🚨 PRODUCTION DATABASE ACCESS BLOCKED: Slack alerting tests cannot run against production database. ' +
          'If this is intentional, set ALLOW_ACCESS_TO_PRODUCTION_DB=true environment variable.'
      );
    }

    // Get the correct connection string using the same logic as createDatabaseClient
    let databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

    // If no DATABASE_URL is found and we're in a CI environment, try to construct it
    if (!databaseUrl && process.env.CI) {
      databaseUrl = process.env.DATABASE_URL ?? '';
    }

    // For non-CI environments, try environment-specific variables
    if (!databaseUrl && !process.env.CI) {
      const envSpecificUrl = process.env[`DATABASE_URL_${env.toUpperCase()}`];
      if (envSpecificUrl) {
        databaseUrl = envSpecificUrl;
      }
    }

    if (!databaseUrl) {
      throw new Error(`DATABASE_URL environment variable is required for ${env} environment`);
    }

    // Update the global database manager with the correct connection string
    (dbManager as any).config.connectionString = databaseUrl;

    // Initialize the global database manager
    await dbManager.initialize();
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Slack Alerting Test',
      action: 'Database manager initialization',
    });
    console.warn('Database manager initialization failed:', error);
  }
}

async function main() {
  // Ensure the global database manager is initialized
  await ensureDatabaseInitialized();

  const logger = AuditLogger.getInstance();
  console.log('🚨 Triggering a critical audit event to test Slack alerting...');

  await logger.logAuditEvent({
    category: 'security',
    action: 'security_alert', // valid action
    severity: 'critical',
    userId: 'test-user',
    description: 'This is a test of the Slack alerting system from the CLI.',
    details: { test: true, timestamp: new Date().toISOString() },
    success: true,
  });

  console.log(
    '✅ If your SLACK_ALERT_WEBHOOK_URL is set, you should receive a Slack notification.'
  );
}

main().catch(err => {
  console.error('❌ Slack alert test failed:', err);
  process.exit(1);
});

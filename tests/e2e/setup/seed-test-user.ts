import * as dotenvFlow from 'dotenv-flow';
import { eq } from 'drizzle-orm';

// Load environment variables first
dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
});

import { db } from '@src/lib/db';
import { users } from '@src/lib/db/schema';
import { seedLogger } from 'lib/core/logger';
import { TEST_USER } from '../utils/auth-utils';

/**
 * Ensure test user exists in database for E2E tests
 */
export async function seedTestUser() {
  try {
    seedLogger.info('🧪 Setting up E2E test user...');

    // Check if test user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, TEST_USER.id),
    });

    if (existingUser) {
      seedLogger.info('✅ Test user already exists, updating...');

      // Update existing test user with current data
      await db
        .update(users)
        .set({
          ...TEST_USER,
          inboundFriendshipIds: [] as string[],
          outboundFriendshipIds: [] as string[],
          external_accounts: [] as any[],
          updatedAt: new Date(),
        })
        .where(eq(users.id, TEST_USER.id));
    } else {
      seedLogger.info('🆕 Creating new test user...');

      // Create new test user with proper types
      await db.insert(users).values({
        ...TEST_USER,
        inboundFriendshipIds: [] as string[],
        outboundFriendshipIds: [] as string[],
        external_accounts: [] as any[],
      });
    }

    seedLogger.info(`✅ Test user ready: ${TEST_USER.emailAddress}`);
    return TEST_USER;
  } catch (error) {
    seedLogger.error('❌ Failed to setup test user:', error);
    throw error;
  }
}

/**
 * Clean up test user (for test teardown)
 */
export async function cleanupTestUser() {
  try {
    seedLogger.info('🧹 Cleaning up test user...');

    await db.delete(users).where(eq(users.id, TEST_USER.id));

    seedLogger.info('✅ Test user cleaned up');
  } catch (error) {
    seedLogger.warn('⚠️ Failed to cleanup test user:', error);
    // Don't throw - cleanup failures shouldn't break tests
  }
}

/**
 * CLI script to setup test user
 */
if (require.main === module) {
  seedTestUser()
    .then(() => {
      console.log('Test user setup complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test user setup failed:', error);
      process.exit(1);
    });
}

import * as dotenvFlow from 'dotenv-flow';
import { eq } from 'drizzle-orm';

// Load environment variables first
dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
});

import { db } from '@src/lib/db';
import { users } from '@src/lib/db/schema';

import { seedLogger } from '../../../lib/core/logger';
import { TEST_USER } from '../utils/auth-utils';

/**
 * Ensure test user exists in database for E2E tests
 */
export async function seedTestUser() {
  try {
    seedLogger.info('🧪 Setting up E2E test user...');

    // Check if test user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, TEST_USER.id))
      .limit(1)
      .then(rows => rows[0]);

    if (existingUser) {
      seedLogger.info(`✅ Test user already exists: ${TEST_USER.emailAddresses[0].emailAddress}`);
      return existingUser;
    }

    // Create test user
    const username = (TEST_USER as { username?: string }).username || `test-${TEST_USER.id}`;
    const createdAt = (TEST_USER as { createdAt?: Date }).createdAt || new Date();
    const updatedAt = (TEST_USER as { updatedAt?: Date }).updatedAt || new Date();

    const [user] = await db
      .insert(users)
      .values({
        id: TEST_USER.id,
        username,
        first_name: TEST_USER.firstName,
        last_name: TEST_USER.lastName,
        emailAddress: TEST_USER.emailAddresses[0].emailAddress,
        image_url: TEST_USER.imageUrl,
        inboundFriendshipIds: [],
        outboundFriendshipIds: [],
        external_accounts: [],
        createdAt,
        updatedAt,
      })
      .returning();

    seedLogger.info(`✅ Test user created: ${TEST_USER.emailAddresses[0].emailAddress}`);
    return user;
  } catch (error) {
    seedLogger.error('Failed to seed test user:', error);
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
      seedLogger.info('Test user setup complete');
      process.exit(0);
    })
    .catch(error => {
      seedLogger.error('Test user setup failed:', error);
      process.exit(1);
    });
}

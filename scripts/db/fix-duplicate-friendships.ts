#!/usr/bin/env tsx

/**
 * Fix Duplicate Friendships Script
 *
 * This script identifies and removes duplicate friendship records that were
 * created by the test-user-interactions script. The script was incorrectly
 * creating two friendship records per pair of users instead of one.
 *
 * The fix:
 * 1. Identifies duplicate friendships (same user pair in both directions)
 * 2. Keeps the older friendship record
 * 3. Removes the duplicate record
 * 4. Ensures only one friendship record exists per user pair
 */

import { eq, and, or, sql } from 'drizzle-orm';
import { createDatabaseClient } from '../../src/lib/db';
import { friendships } from '../../src/lib/db/schema';
import { loadEnvironmentVariables } from '../../src/lib/utils/env-loader';
import { logger } from '../../src/lib/utils/logger';

interface DuplicateFriendship {
  id1: string;
  id2: string;
  user1: string;
  user2: string;
  created_at1: Date;
  created_at2: Date;
}

async function findDuplicateFriendships(db: any): Promise<DuplicateFriendship[]> {
  logger.info('🔍 Finding duplicate friendships...');

  const duplicates = await db.execute(sql`
    SELECT
      f1.id as id1,
      f2.id as id2,
      f1.user_id as user1,
      f1.friend_id as user2,
      f1.created_at as created_at1,
      f2.created_at as created_at2
    FROM friendships f1
    JOIN friendships f2 ON (
      f1.user_id = f2.friend_id AND
      f1.friend_id = f2.user_id AND
      f1.id != f2.id
    )
    WHERE f1.deleted_at IS NULL
      AND f2.deleted_at IS NULL
      AND f1.status = 'ACCEPTED'
      AND f2.status = 'ACCEPTED'
    ORDER BY f1.created_at ASC
  `);

  return duplicates.rows || [];
}

async function removeDuplicateFriendships(
  db: any,
  duplicates: DuplicateFriendship[]
): Promise<void> {
  if (duplicates.length === 0) {
    logger.info('✅ No duplicate friendships found');
    return;
  }

  logger.info(`🗑️  Found ${duplicates.length} duplicate friendship pairs`);

  let removedCount = 0;

  for (const duplicate of duplicates) {
    // Keep the older friendship (created_at1) and remove the newer one (created_at2)
    const keepId = duplicate.created_at1 <= duplicate.created_at2 ? duplicate.id1 : duplicate.id2;
    const removeId = duplicate.created_at1 <= duplicate.created_at2 ? duplicate.id2 : duplicate.id1;

    logger.info(`Removing duplicate friendship ${removeId} (keeping ${keepId})`);

    await db.execute(sql`
      UPDATE friendships
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${removeId}
    `);

    removedCount++;
  }

  logger.info(`✅ Removed ${removedCount} duplicate friendships`);
}

async function verifyFriendshipIntegrity(db: any): Promise<void> {
  logger.info('🔍 Verifying friendship integrity...');

  // Check for remaining duplicates
  const remainingDuplicates = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM friendships f1
    JOIN friendships f2 ON (
      f1.user_id = f2.friend_id AND
      f1.friend_id = f2.user_id AND
      f1.id != f2.id
    )
    WHERE f1.deleted_at IS NULL
      AND f2.deleted_at IS NULL
      AND f1.status = 'ACCEPTED'
      AND f2.status = 'ACCEPTED'
  `);

  const duplicateCount = remainingDuplicates.rows[0]?.count || 0;

  if (duplicateCount > 0) {
    logger.warn(`⚠️  Still found ${duplicateCount} duplicate friendships`);
  } else {
    logger.info('✅ No duplicate friendships remaining');
  }

  // Count total active friendships
  const totalFriendships = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM friendships
    WHERE deleted_at IS NULL AND status = 'ACCEPTED'
  `);

  const totalCount = totalFriendships.rows[0]?.count || 0;
  logger.info(`📊 Total active friendships: ${totalCount}`);
}

async function fixDuplicateFriendships(env: 'development' | 'production' = 'development') {
  logger.info('🔧 Starting Duplicate Friendships Fix...');
  logger.info('===============================================');

  try {
    // Create database client
    const db = createDatabaseClient({ env });

    // Step 1: Find duplicate friendships
    const duplicates = await findDuplicateFriendships(db);

    // Step 2: Remove duplicates
    await removeDuplicateFriendships(db, duplicates);

    // Step 3: Verify integrity
    await verifyFriendshipIntegrity(db);

    logger.info('===============================================');
    logger.info('🎉 Duplicate friendships fix completed successfully!');
  } catch (error) {
    logger.error('❌ Error fixing duplicate friendships:', error);
    throw error;
  }
}

async function main() {
  try {
    // Load environment variables
    loadEnvironmentVariables();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const envArg = args.find(arg => arg.startsWith('--env='));
    const env = envArg ? (envArg.split('=')[1] as 'development' | 'production') : 'development';

    await fixDuplicateFriendships(env);
  } catch (error) {
    logger.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { fixDuplicateFriendships };

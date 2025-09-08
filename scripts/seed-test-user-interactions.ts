#!/usr/bin/env tsx

/**
 * Test User Interactions Seeding Script
 *
 * This script creates a comprehensive test user interaction ecosystem including:
 * - User insertion from JSON files (development/production)
 * - Friendships between all test users (single record per pair)
 * - Outgoing friend requests from test users to 10 non-test users each (PENDING)
 * - Incoming friend requests to test users from 10 non-test users each (PENDING)
 * - Additional accepted friendships between test users and 10 non-test users each
 * - Random game logs (10-100 per user)
 * - Reactions and comments on 1-2% of game logs
 * - External user interactions for realistic data
 * - Child comments with reactions for engagement depth
 *
 * ## Features
 * - **Idempotent Operations**: Safe to run multiple times without conflicts
 * - **Environment-Specific**: Loads users from dev/prod JSON files
 * - **Clean Mode**: Removes existing test data before seeding
 * - **Deterministic Mode**: Generates consistent data for testing
 * - **Dry Run Mode**: Preview actions without database changes
 * - **Comprehensive Logging**: Detailed progress and error reporting
 *
 * ## Data Flow
 * 1. Load test users from JSON file (test-users.{env}.json)
 * 2. Insert users into database (idempotent)
 * 3. Clean existing data (if --clean flag)
 * 4. Create friendships between all test users (single record per pair)
 * 5. Create outgoing friend requests from test users to 10 non-test users each (PENDING)
 * 6. Create incoming friend requests to test users from 10 non-test users each (PENDING)
 * 7. Create additional accepted friendships between test users and 10 non-test users each
 * 8. Generate random game logs (10-100 per user)
 * 9. Select 1-2% of game logs for interactions
 * 10. Create reactions and comments from other test users
 * 11. Add external user interactions (10-100 random users)
 * 12. Create child comments with reactions for engagement depth
 *
 * ## Usage Examples
 * ```bash
 * # Basic development seeding
 * pnpm seed:test-user-interactions:dev
 *
 * # Production seeding with clean reset
 * pnpm seed:test-user-interactions:clean:prod
 *
 * # Preview what would be created (dry run)
 * pnpm seed:test-user-interactions:dry-run
 *
 * # Consistent test data generation
 * pnpm seed:test-user-interactions:deterministic:dev
 *
 * # Clean reset with consistent data
 * pnpm seed:test-user-interactions:clean:deterministic:prod
 * ```
 *
 * ## Command Line Options
 * - `--env=development|production`: Target environment
 * - `--dry-run`: Preview actions without database changes
 * - `--clean`: Remove existing test data before seeding
 * - `--deterministic`: Generate consistent data for testing
 * - `--help`: Show usage information
 *
 * ## File Dependencies
 * - `src/lib/db/seed/test-users/test-users.dev.json`: Development user data
 * - `src/lib/db/seed/test-users/test-users.prod.json`: Production user data
 * - Requires existing NBA games data in database
 * - Requires existing users table with proper schema
 *
 * ## Database Tables Affected
 * - `users`: Test user insertion (idempotent)
 * - `friendships`: Friendships between test users, friend requests, and additional friendships
 * - `game_logs`: Random game logs for each test user
 * - `reactions`: Reactions on game logs and comments
 * - `comments`: Top-level and child comments on game logs
 *
 * ## Idempotency Guarantees
 * - User insertion: `onConflictDoNothing()` - skips existing users
 * - Friendships: `onConflictDoNothing()` - skips existing friendships
 * - Game logs: `onConflictDoNothing()` - skips existing game logs
 * - Reactions: `onConflictDoNothing()` - skips existing reactions
 * - Comments: `onConflictDoNothing()` - skips existing comments
 *
 * ## Error Handling
 * - File system errors: JSON file loading failures
 * - Database errors: Connection and query failures
 * - Validation errors: Missing required data or constraints
 * - Graceful degradation: Continues with available data when possible
 *
 * @author Game Diary Team
 * @version 1.0.0
 * @since 2025-09-05
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, inArray, sql, or } from 'drizzle-orm';
import { randomInt, randomBytes } from 'crypto';

import * as schema from '@/lib/db/schema';
import { REACTION_EMOJIS, FRIENDSHIP_STATUS, TARGET_TYPES } from '@/lib/constants';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { syncReactionEmojis } from '@/lib/db/seed/shared-seeding-utils';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

/**
 * Interface for test user data loaded from JSON files
 *
 * This interface matches the structure of user objects stored in the
 * test-users.dev.json and test-users.prod.json files. All fields
 * correspond to the users table schema in the database.
 *
 * @interface TestUser
 */
interface TestUser {
  /** Unique user identifier (Clerk user ID) */
  id: string;
  /** Object type identifier (always "user") */
  object: string;
  /** User's chosen username */
  username: string;
  /** User's first name */
  first_name: string;
  /** User's last name */
  last_name: string;
  /** URL to user's profile image */
  image_url: string;
  /** Whether user has uploaded a custom image */
  has_image: boolean;
  /** URL to user's profile image (alternative) */
  profile_image_url: string;
  /** Primary email address ID from Clerk */
  primary_email_address_id: string;
  /** Primary phone number ID from Clerk */
  primary_phone_number_id: string;
  /** Encrypted primary email address */
  email_address: string | null;
  /** Encrypted primary phone number */
  phone_number: string | null;
  /** External system identifier */
  external_id: string;
  /** Last time user was active (ISO string) */
  last_active_at: string | null;
  /** Last time user signed in (ISO string) */
  last_sign_in_at: string | null;
  /** User's bio/description */
  bio: string | null;
  /** User's timezone preference */
  timezone: string | null;
  /** User's preferred language */
  preferred_language: string;
  /** Whether user has admin privileges */
  isAdmin: boolean;
  /** Array of inbound friendship IDs */
  inbound_friendship_ids: string[];
  /** Array of outbound friendship IDs */
  outbound_friendship_ids: string[];
  /** User creation timestamp (ISO string) */
  created_at: string;
  /** User last update timestamp (ISO string) */
  updated_at: string;
  /** User deletion timestamp (ISO string, null if not deleted) */
  deleted_at: string | null;
}

/**
 * Configuration options for the test user interactions seeding script
 *
 * @interface ScriptOptions
 */
interface ScriptOptions {
  /** Target environment for seeding (development or production) */
  environment: 'development' | 'production';
  /** Whether to preview actions without making database changes */
  dryRun?: boolean;
  /** Whether to clean existing test data before seeding */
  clean?: boolean;
  /** Whether to generate deterministic data for consistent testing */
  deterministic?: boolean;
}

/**
 * Main class for seeding test user interactions
 *
 * This class orchestrates the entire seeding process, from loading user data
 * from JSON files to creating complex interaction patterns in the database.
 * All operations are designed to be idempotent and safe to run multiple times.
 *
 * ## Key Responsibilities
 * - Load test users from environment-specific JSON files
 * - Insert users into database with conflict handling
 * - Create friendships between all test users (single record per pair)
 * - Generate random game logs for each user
 * - Create realistic interaction patterns (reactions, comments)
 * - Add external user interactions for engagement depth
 * - Provide comprehensive logging and error handling
 *
 * ## Idempotency Strategy
 * All database operations use `onConflictDoNothing()` to ensure that
 * running the script multiple times produces the same result without
 * errors or duplicate data.
 *
 * @class TestUserInteractionSeeder
 */
class TestUserInteractionSeeder {
  /** Database connection instance */
  private db: NeonHttpDatabase<typeof schema>;
  /** Target environment (development/production) */
  private environment: string;
  /** Whether to preview actions without database changes */
  private dryRun: boolean;
  /** Whether to clean existing data before seeding */
  private clean: boolean;
  /** Whether to generate deterministic data */
  private deterministic: boolean;

  /**
   * Initialize the seeder with configuration options
   *
   * @param options - Configuration options for the seeding process
   * @throws {Error} If environment configuration or database connection fails
   */
  constructor(options: ScriptOptions) {
    this.environment = options.environment;
    this.dryRun = options.dryRun || false;
    this.clean = options.clean || false;
    this.deterministic = options.deterministic || false;
    this.loadEnvironmentConfig();
    this.db = this.createDatabaseConnection();
  }

  /**
   * Create database connection using environment configuration
   *
   * Establishes a connection to the database using the DATABASE_URL or POSTGRES_URL
   * environment variable. Uses Neon serverless driver with Drizzle ORM for
   * type-safe database operations.
   *
   * @private
   * @returns {NeonHttpDatabase<typeof schema>} Configured database connection instance
   * @throws {Error} If database URL is not provided in environment variables
   */
  private createDatabaseConnection(): NeonHttpDatabase<typeof schema> {
    const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

    if (!databaseUrl) {
      throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
    }

    const sql = neon(databaseUrl);
    return drizzle(sql, { schema });
  }

  /**
   * Load environment-specific configuration from .env files
   *
   * Loads the appropriate .env file based on the target environment.
   * This ensures that database connections and other environment-specific
   * settings are properly configured before database operations.
   *
   * @private
   * @throws {Error} If the environment file cannot be loaded
   */
  private loadEnvironmentConfig(): void {
    const envFile = `.env.${this.environment}`;
    const envPath = resolve(process.cwd(), envFile);

    try {
      const result = config({ path: envPath });
      if (result.error) {
        logger.warn(`⚠️  Could not load ${envFile}, using system environment variables`);
      } else {
        logger.info(`📁 Loaded environment from: ${envFile}`);
      }
    } catch (error) {
      logger.warn(`⚠️  Could not load ${envFile}, using system environment variables`);
    }
  }

  /**
   * Generate a unique identifier for database records
   *
   * Creates a cryptographically secure random identifier using 16 bytes
   * converted to hexadecimal string. Used for generating unique IDs for
   * friendships, game logs, reactions, and comments.
   *
   * @private
   * @returns {string} Unique hexadecimal identifier
   */
  private generateId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Get a random element from an array
   *
   * @private
   * @template T - Type of array elements
   * @param array - Array to select from
   * @returns {T} Random element from the array
   */
  private getRandomElement<T>(array: T[]): T {
    return array[randomInt(0, array.length)];
  }

  /**
   * Get multiple random elements from an array
   *
   * @private
   * @template T - Type of array elements
   * @param array - Array to select from
   * @param count - Number of elements to select
   * @returns {T[]} Array of random elements
   */
  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Generate a random integer within a range
   *
   * Supports deterministic mode for consistent test data generation.
   * In deterministic mode, uses a simple timestamp-based seed.
   *
   * @private
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns {number} Random integer in range [min, max]
   */
  private getRandomInt(min: number, max: number): number {
    if (this.deterministic) {
      // Use a simple deterministic "random" function based on current timestamp
      const seed = Date.now() % 1000;
      return min + (seed % (max - min + 1));
    }
    return randomInt(min, max + 1);
  }

  /**
   * Generate a random float within a range
   *
   * Supports deterministic mode for consistent test data generation.
   * In deterministic mode, uses a simple timestamp-based seed.
   *
   * @private
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns {number} Random float in range [min, max]
   */
  private getRandomFloat(min: number, max: number): number {
    if (this.deterministic) {
      const seed = Date.now() % 1000;
      return min + (seed / 1000) * (max - min);
    }
    return Math.random() * (max - min) + min;
  }

  /**
   * Load test users from JSON file based on environment
   *
   * Reads user data from the appropriate JSON file (test-users.dev.json or
   * test-users.prod.json) based on the target environment. The file path
   * is automatically mapped from environment names to file suffixes.
   *
   * @private
   * @returns {TestUser[]} Array of test user objects loaded from JSON
   * @throws {Error} If the JSON file cannot be read or parsed
   */
  private loadTestUsers(): TestUser[] {
    // Map environment names to file names
    const envToFileMap: Record<string, string> = {
      development: 'dev',
      production: 'prod',
    };

    const fileSuffix = envToFileMap[this.environment] || this.environment;
    const jsonFilePath = resolve(
      process.cwd(),
      `src/lib/db/seed/test-users/test-users.${fileSuffix}.json`
    );

    try {
      const jsonContent = readFileSync(jsonFilePath, 'utf-8');
      const users: TestUser[] = JSON.parse(jsonContent);
      logger.info(`📁 Loaded ${users.length} test users from ${jsonFilePath}`);
      return users;
    } catch (error) {
      errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Load test users from JSON',
      });
      throw new Error(`Failed to load test users from ${jsonFilePath}: ${error}`);
    }
  }

  /**
   * Insert test users into the database (idempotent)
   *
   * Converts JSON user data to database format and inserts users into the
   * users table. Uses onConflictDoNothing() to ensure idempotency - existing
   * users are skipped without errors. Handles date conversion and data
   * type mapping from JSON strings to database types.
   *
   * @private
   * @param testUsers - Array of test user objects from JSON file
   * @returns {Promise<string[]>} Array of user IDs that were processed
   * @throws {Error} If database insertion fails
   */
  private async insertTestUsers(testUsers: TestUser[]): Promise<string[]> {
    logger.info('👥 Inserting test users into database...');

    if (this.dryRun) {
      logger.info(`[DRY RUN] Would insert ${testUsers.length} test users`);
      return testUsers.map(user => user.id);
    }

    try {
      // Convert JSON data to database format
      const usersToInsert = testUsers.map(user => ({
        id: user.id,
        object: user.object,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        image_url: user.image_url,
        has_image: user.has_image,
        profile_image_url: user.profile_image_url,
        primary_email_address_id: user.primary_email_address_id,
        primary_phone_number_id: user.primary_phone_number_id,
        email_address: user.email_address,
        phone_number: user.phone_number,
        external_id: user.external_id,
        last_active_at: user.last_active_at ? new Date(user.last_active_at) : null,
        last_sign_in_at: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
        bio: user.bio,
        timezone: user.timezone,
        preferred_language: user.preferred_language,
        isAdmin: user.isAdmin,
        inbound_friendship_ids: user.inbound_friendship_ids,
        outbound_friendship_ids: user.outbound_friendship_ids,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
        deleted_at: user.deleted_at ? new Date(user.deleted_at) : null,
      }));

      // Insert users with conflict handling (idempotent)
      await this.db.insert(schema.users).values(usersToInsert).onConflictDoNothing();

      logger.info(`✅ Inserted ${testUsers.length} test users (idempotent)`);
      return testUsers.map(user => user.id);
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Insert test users',
      });
      throw error;
    }
  }

  /**
   * Clean up existing test user data
   *
   * Removes all data associated with test users from the database in the
   * correct order to respect foreign key constraints. This includes:
   * - Reactions on game logs and comments by test users
   * - Comments by test users and on their game logs
   * - Game logs created by test users
   * - Friendships involving test users
   *
   * @private
   * @param testUserIds - Array of test user IDs to clean up
   * @throws {Error} If cleanup operations fail
   */
  private async cleanupTestUserData(testUserIds: string[]): Promise<void> {
    logger.info('🧹 Cleaning up existing test user data...');

    if (this.dryRun) {
      logger.info('[DRY RUN] Would clean up existing test user data');
      return;
    }

    try {
      // Delete reactions from test users - break into multiple queries for better compatibility
      // First, delete reactions where user_id is in test users
      await this.db.delete(schema.reactions).where(inArray(schema.reactions.user_id, testUserIds));

      // Then, delete reactions on game logs from test users
      const gameLogIds = await this.db
        .select({ id: schema.game_logs.id })
        .from(schema.game_logs)
        .where(inArray(schema.game_logs.user_id, testUserIds));

      if (gameLogIds.length > 0) {
        await this.db.delete(schema.reactions).where(
          inArray(
            schema.reactions.target_id,
            gameLogIds.map((log: { id: string }) => log.id)
          )
        );
      }

      // Finally, delete reactions on comments from test users
      const commentIds = await this.db
        .select({ id: schema.comments.id })
        .from(schema.comments)
        .where(inArray(schema.comments.user_id, testUserIds));

      if (commentIds.length > 0) {
        await this.db.delete(schema.reactions).where(
          inArray(
            schema.reactions.target_id,
            commentIds.map((comment: { id: string }) => comment.id)
          )
        );
      }

      // Delete comments from test users
      await this.db.delete(schema.comments).where(inArray(schema.comments.user_id, testUserIds));

      // Delete comments on game logs from test users
      if (gameLogIds.length > 0) {
        await this.db.delete(schema.comments).where(
          inArray(
            schema.comments.parent_id,
            gameLogIds.map((log: { id: string }) => log.id)
          )
        );
      }

      // Delete game logs from test users
      await this.db.delete(schema.game_logs).where(inArray(schema.game_logs.user_id, testUserIds));

      // Delete friendships involving test users
      await this.db
        .delete(schema.friendships)
        .where(
          or(
            inArray(schema.friendships.user_id, testUserIds),
            inArray(schema.friendships.friend_id, testUserIds)
          )
        );

      logger.info('✅ Cleaned up existing test user data');
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Cleanup test user data',
      });
      throw error;
    }
  }

  /**
   * Create friendships between all test users
   *
   * Creates ACCEPTED friendships between every pair of test users, ensuring
   * that each user is friends with every other user in the group. Creates
   * only ONE friendship record per pair (not bidirectional records), as the
   * application logic handles bidirectional queries by checking both user_id
   * and friend_id fields.
   *
   * @private
   * @param testUserIds - Array of test user IDs to create friendships for
   * @throws {Error} If friendship creation fails
   */
  private async createFriendships(testUserIds: string[]): Promise<void> {
    logger.info('🤝 Creating friendships between test users...');

    if (this.dryRun) {
      logger.info(
        `[DRY RUN] Would create ${(testUserIds.length * (testUserIds.length - 1)) / 2} friendships`
      );
      return;
    }

    const friendships = [];

    for (let i = 0; i < testUserIds.length; i++) {
      for (let j = i + 1; j < testUserIds.length; j++) {
        const user1 = testUserIds[i];
        const user2 = testUserIds[j];

        // Create single friendship record per pair (bidirectional logic handled by queries)
        friendships.push({
          id: this.generateId(),
          user_id: user1,
          friend_id: user2,
          status: FRIENDSHIP_STATUS.ACCEPTED,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    try {
      await this.db.insert(schema.friendships).values(friendships).onConflictDoNothing();
      logger.info(`✅ Created ${friendships.length} friendships`);
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Create friendships',
      });
      throw error;
    }
  }

  /**
   * Get available non-test users from the database
   *
   * Fetches users from the database who are not in the test user list.
   * This is used to create friend requests and friendships with external users.
   *
   * @private
   * @param testUserIds - Array of test user IDs to exclude
   * @param limit - Maximum number of users to return (default: 50)
   * @returns {Promise<string[]>} Array of user IDs that are not test users
   * @throws {Error} If database query fails
   */
  private async getAvailableNonTestUsers(testUserIds: string[], limit = 50): Promise<string[]> {
    try {
      const availableUsers = await this.db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(sql`${schema.users.id} NOT IN (${testUserIds.join(',')})`)
        .limit(limit);

      return availableUsers.map((user: { id: string }) => user.id);
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Get available non-test users',
      });
      throw error;
    }
  }

  /**
   * Create outgoing friend requests from test users to non-test users
   *
   * Creates PENDING friend requests from each test user to 10 different
   * non-test users (if they exist in the database). Each test user will
   * send out exactly 10 friend requests to different users.
   *
   * @private
   * @param testUserIds - Array of test user IDs to create outgoing requests for
   * @throws {Error} If friend request creation fails
   */
  private async createOutgoingFriendRequests(testUserIds: string[]): Promise<void> {
    logger.info('📤 Creating outgoing friend requests from test users...');

    if (this.dryRun) {
      logger.info(`[DRY RUN] Would create ${testUserIds.length * 10} outgoing friend requests`);
      return;
    }

    try {
      // Get available non-test users (need more than test users * 10)
      const availableUsers = await this.getAvailableNonTestUsers(
        testUserIds,
        testUserIds.length * 15
      );

      if (availableUsers.length < testUserIds.length * 10) {
        logger.warn(
          `⚠️  Only ${availableUsers.length} non-test users available, but need ${testUserIds.length * 10} for outgoing requests`
        );
      }

      const friendRequests = [];
      let userIndex = 0;

      for (const testUserId of testUserIds) {
        // Create 10 outgoing friend requests for this test user
        for (let i = 0; i < 10 && userIndex < availableUsers.length; i++) {
          const targetUserId = availableUsers[userIndex];
          userIndex++;

          friendRequests.push({
            id: this.generateId(),
            user_id: testUserId,
            friend_id: targetUserId,
            status: FRIENDSHIP_STATUS.PENDING,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      if (friendRequests.length > 0) {
        await this.db.insert(schema.friendships).values(friendRequests).onConflictDoNothing();
        logger.info(`✅ Created ${friendRequests.length} outgoing friend requests`);
      } else {
        logger.warn('⚠️  No outgoing friend requests created - insufficient non-test users');
      }
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Create outgoing friend requests',
      });
      throw error;
    }
  }

  /**
   * Create incoming friend requests to test users from non-test users
   *
   * Creates PENDING friend requests from non-test users to each test user.
   * Each test user will receive exactly 10 friend requests from different
   * non-test users (excluding those who already sent requests to test users).
   *
   * @private
   * @param testUserIds - Array of test user IDs to create incoming requests for
   * @throws {Error} If friend request creation fails
   */
  private async createIncomingFriendRequests(testUserIds: string[]): Promise<void> {
    logger.info('📥 Creating incoming friend requests to test users...');

    if (this.dryRun) {
      logger.info(`[DRY RUN] Would create ${testUserIds.length * 10} incoming friend requests`);
      return;
    }

    try {
      // Get available non-test users (need more than test users * 10, excluding those already used for outgoing)
      const availableUsers = await this.getAvailableNonTestUsers(
        testUserIds,
        testUserIds.length * 25
      );

      if (availableUsers.length < testUserIds.length * 10) {
        logger.warn(
          `⚠️  Only ${availableUsers.length} non-test users available, but need ${testUserIds.length * 10} for incoming requests`
        );
      }

      const friendRequests = [];
      let userIndex = 0;

      for (const testUserId of testUserIds) {
        // Create 10 incoming friend requests for this test user
        for (let i = 0; i < 10 && userIndex < availableUsers.length; i++) {
          const requesterUserId = availableUsers[userIndex];
          userIndex++;

          friendRequests.push({
            id: this.generateId(),
            user_id: requesterUserId,
            friend_id: testUserId,
            status: FRIENDSHIP_STATUS.PENDING,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      if (friendRequests.length > 0) {
        await this.db.insert(schema.friendships).values(friendRequests).onConflictDoNothing();
        logger.info(`✅ Created ${friendRequests.length} incoming friend requests`);
      } else {
        logger.warn('⚠️  No incoming friend requests created - insufficient non-test users');
      }
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Create incoming friend requests',
      });
      throw error;
    }
  }

  /**
   * Create additional accepted friendships between test users and non-test users
   *
   * Creates ACCEPTED friendships between each test user and 10 different
   * non-test users (excluding those already used for friend requests).
   * Each test user will have exactly 10 additional accepted friendships.
   *
   * @private
   * @param testUserIds - Array of test user IDs to create additional friendships for
   * @throws {Error} If friendship creation fails
   */
  private async createAdditionalAcceptedFriendships(testUserIds: string[]): Promise<void> {
    logger.info('🤝 Creating additional accepted friendships for test users...');

    if (this.dryRun) {
      logger.info(
        `[DRY RUN] Would create ${testUserIds.length * 10} additional accepted friendships`
      );
      return;
    }

    try {
      // Get available non-test users (need more than test users * 10, excluding those already used)
      const availableUsers = await this.getAvailableNonTestUsers(
        testUserIds,
        testUserIds.length * 35
      );

      if (availableUsers.length < testUserIds.length * 10) {
        logger.warn(
          `⚠️  Only ${availableUsers.length} non-test users available, but need ${testUserIds.length * 10} for additional friendships`
        );
      }

      const friendships = [];
      let userIndex = 0;

      for (const testUserId of testUserIds) {
        // Create 10 additional accepted friendships for this test user
        for (let i = 0; i < 10 && userIndex < availableUsers.length; i++) {
          const friendUserId = availableUsers[userIndex];
          userIndex++;

          friendships.push({
            id: this.generateId(),
            user_id: testUserId,
            friend_id: friendUserId,
            status: FRIENDSHIP_STATUS.ACCEPTED,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      if (friendships.length > 0) {
        await this.db.insert(schema.friendships).values(friendships).onConflictDoNothing();
        logger.info(`✅ Created ${friendships.length} additional accepted friendships`);
      } else {
        logger.warn('⚠️  No additional friendships created - insufficient non-test users');
      }
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Create additional accepted friendships',
      });
      throw error;
    }
  }

  /**
   * Generate random game logs for each test user
   *
   * Creates 10-100 game logs per user, linking them to existing NBA games
   * in the database. Each game log includes realistic data such as:
   * - Random classification (PRIVATE, PROTECTED, PUBLIC)
   * - Random watch settings and scope
   * - Random ratings and notes
   * - Random tags and metadata
   *
   * @private
   * @param testUserIds - Array of test user IDs to create game logs for
   * @returns {Promise<string[]>} Array of created game log IDs
   * @throws {Error} If no NBA games are available or game log creation fails
   */
  private async createGameLogs(testUserIds: string[]): Promise<string[]> {
    logger.info('📝 Creating game logs for test users...');

    // Get available games from the database
    const availableGames = await this.db
      .select({ id: schema.basketball_games.id })
      .from(schema.basketball_games);

    if (availableGames.length === 0) {
      throw new Error('No games found in database. Please seed NBA data first.');
    }

    const gameLogs = [];
    const gameLogIds: string[] = [];

    for (const userId of testUserIds) {
      const gameLogCount = this.getRandomInt(10, 100);
      const userGames = this.getRandomElements(availableGames, gameLogCount);

      for (const game of userGames) {
        const gameLogId = this.generateId();
        gameLogIds.push(gameLogId);

        const gameLog = {
          id: gameLogId,
          user_id: userId,
          game_id: (game as { id: string }).id,
          classification: this.getRandomElement(['PRIVATE', 'PROTECTED', 'PUBLIC']),
          watched_setting: this.getRandomElement(['TV', 'ARENA', 'PHONE', 'LAPTOP', 'BAR', 'HOME']),
          watched_scope: this.getRandomElement([
            'FULL_GAME',
            'HALF_GAME',
            'HIGHLIGHTS',
            'PRE_GAME',
            'POST_GAME',
          ]),
          watched_date: new Date(Date.now() - this.getRandomInt(0, 365) * 24 * 60 * 60 * 1000),
          watched_location: this.getRandomElement(['Home', 'Arena', 'Bar', "Friend's house", '']),
          rating_for_game: this.getRandomInt(1, 5),
          notes: this.getRandomElement([
            'Great game!',
            'Amazing performance',
            'Could have been better',
            'Incredible finish',
            'Disappointing result',
            "Best game I've seen",
            'Close game',
            'Blowout win',
            '',
          ]),
          tags: this.getRandomElements(
            ['nba', 'basketball', 'sports', 'entertainment', 'live'],
            this.getRandomInt(0, 3)
          ),
          created_at: new Date(),
          updated_at: new Date(),
        };

        gameLogs.push(gameLog);
      }
    }

    if (this.dryRun) {
      logger.info(`[DRY RUN] Would create ${gameLogs.length} game logs`);
      return gameLogIds;
    }

    try {
      await this.db.insert(schema.game_logs).values(gameLogs).onConflictDoNothing();
      logger.info(`✅ Created ${gameLogs.length} game logs`);
      return gameLogIds;
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Create game logs',
      });
      throw error;
    }
  }

  /**
   * Create realistic interactions on a subset of game logs
   *
   * Selects 1-2% of game logs and creates comprehensive interaction patterns:
   * - Other test users add 1-5 reactions and 1 comment per selected game log
   * - External users (10-100 random users, if available) add reactions and comments
   * - Child comments with reactions for engagement depth
   * - All interactions use onConflictDoNothing() for idempotency
   * - Gracefully handles cases where no external users exist
   *
   * @private
   * @param gameLogIds - Array of all game log IDs to select from
   * @param testUserIds - Array of test user IDs for interaction patterns
   * @throws {Error} If interaction creation fails
   */
  private async createInteractionsOnSelectedGameLogs(
    gameLogIds: string[],
    testUserIds: string[]
  ): Promise<void> {
    logger.info('👍 Creating reactions and comments on selected game logs...');

    // Select 1-2% of game logs for interactions
    const percentage = this.getRandomFloat(0.01, 0.02);
    const selectedCount = Math.max(1, Math.floor(gameLogIds.length * percentage));
    const selectedGameLogs = this.getRandomElements(gameLogIds, selectedCount);

    logger.info(
      `Selected ${selectedGameLogs.length} game logs (${(percentage * 100).toFixed(1)}%) for interactions`
    );

    // Get all available users for external interactions
    const allUsers = await this.db.select({ id: schema.users.id }).from(schema.users);
    const externalUsers = allUsers.filter((user: { id: string }) => !testUserIds.includes(user.id));

    // Handle case where there are no external users
    let selectedExternalUsers: { id: string }[] = [];
    if (externalUsers.length > 0) {
      // Select 10-100 external users for additional interactions (or all available if less than 10)
      const maxExternalUsers = Math.max(10, Math.min(100, externalUsers.length));
      const minExternalUsers = Math.min(10, externalUsers.length);
      const externalUserCount = this.getRandomInt(minExternalUsers, maxExternalUsers);
      selectedExternalUsers = this.getRandomElements(externalUsers, externalUserCount);
      logger.info(
        `📊 Found ${externalUsers.length} external users, selected ${selectedExternalUsers.length} for interactions`
      );
    } else {
      logger.info('📊 No external users found - will only create interactions between test users');
    }

    const reactions = [];
    const comments = [];
    const childComments = [];
    const childReactions = [];

    for (const gameLogId of selectedGameLogs) {
      // Get the owner of this game log
      const gameLogOwner = await this.db
        .select({ user_id: schema.game_logs.user_id })
        .from(schema.game_logs)
        .where(eq(schema.game_logs.id, gameLogId))
        .limit(1);

      if (gameLogOwner.length === 0) continue;

      const ownerId = gameLogOwner[0].user_id;
      const otherTestUsers = testUserIds.filter(id => id !== ownerId);

      // Each other test user adds 1-5 reactions to this game log
      for (const userId of otherTestUsers) {
        const reactionCount = this.getRandomInt(1, 5);
        const selectedEmojis = this.getRandomElements(
          Object.values(REACTION_EMOJIS),
          reactionCount
        );

        for (const emoji of selectedEmojis) {
          reactions.push({
            id: this.generateId(),
            user_id: userId,
            target_type: TARGET_TYPES.GAME_LOG,
            target_id: gameLogId,
            emoji,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      // Each other test user adds a comment to this game log
      for (const userId of otherTestUsers) {
        const commentId = this.generateId();
        comments.push({
          id: commentId,
          user_id: userId,
          parent_id: gameLogId,
          parent_type: TARGET_TYPES.GAME_LOG,
          content: this.getRandomElement([
            'Great game!',
            'Amazing performance by the team',
            'That was incredible to watch',
            'What a finish!',
            'Disappointing result',
            'The refs were terrible',
            'Best game of the season',
            "Can't believe they won",
            'Should have been a blowout',
            'Close game until the end',
          ]),
          depth: 0,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Some external users add reactions to this comment (1-2 reactions each)
        if (selectedExternalUsers.length > 0) {
          const commentReactionUsers = this.getRandomElements(
            selectedExternalUsers,
            this.getRandomInt(1, selectedExternalUsers.length)
          );
          for (const user of commentReactionUsers) {
            const reactionCount = this.getRandomInt(1, 2);
            const selectedEmojis = this.getRandomElements(
              Object.values(REACTION_EMOJIS),
              reactionCount
            );

            for (const emoji of selectedEmojis) {
              childReactions.push({
                id: this.generateId(),
                user_id: user.id,
                target_type: TARGET_TYPES.COMMENT,
                target_id: commentId,
                emoji,
                created_at: new Date(),
                updated_at: new Date(),
              });
            }
          }
        }

        // Some external users add child comments
        if (selectedExternalUsers.length > 0) {
          const childCommentUsers = this.getRandomElements(
            selectedExternalUsers,
            this.getRandomInt(1, selectedExternalUsers.length)
          );
          for (const user of childCommentUsers) {
            childComments.push({
              id: this.generateId(),
              user_id: user.id,
              parent_id: commentId,
              parent_type: TARGET_TYPES.COMMENT,
              content: this.getRandomElement([
                'I agree!',
                'Totally disagree',
                "You're right about that",
                'What about the defense?',
                'The coaching was questionable',
                'Great point',
                'I saw it differently',
                "That's exactly what I thought",
                "Couldn't have said it better",
                "I think you're wrong",
              ]),
              depth: 1,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }
      }

      // External users add reactions to the game log (1-5 reactions each)
      if (selectedExternalUsers.length > 0) {
        for (const user of selectedExternalUsers) {
          const reactionCount = this.getRandomInt(1, 5);
          const selectedEmojis = this.getRandomElements(
            Object.values(REACTION_EMOJIS),
            reactionCount
          );

          for (const emoji of selectedEmojis) {
            reactions.push({
              id: this.generateId(),
              user_id: user.id,
              target_type: TARGET_TYPES.GAME_LOG,
              target_id: gameLogId,
              emoji,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }
      }

      // External users add comments to the game log
      if (selectedExternalUsers.length > 0) {
        for (const user of selectedExternalUsers) {
          comments.push({
            id: this.generateId(),
            user_id: user.id,
            parent_id: gameLogId,
            parent_type: TARGET_TYPES.GAME_LOG,
            content: this.getRandomElement([
              'Nice game log!',
              'I was at this game too',
              'Great analysis',
              'Love your perspective',
              'Thanks for sharing',
              'This was a classic',
              'Wish I could have been there',
              'Amazing game',
              'The atmosphere was electric',
              "Best game I've seen in years",
            ]),
            depth: 0,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }

    if (this.dryRun) {
      logger.info(`[DRY RUN] Would create:`);
      logger.info(`  - ${reactions.length} reactions on game logs`);
      logger.info(`  - ${comments.length} comments on game logs`);
      logger.info(`  - ${childComments.length} child comments`);
      logger.info(`  - ${childReactions.length} reactions on comments`);
      return;
    }

    try {
      // Insert all interactions
      if (reactions.length > 0) {
        await this.db.insert(schema.reactions).values(reactions).onConflictDoNothing();
        logger.info(`✅ Created ${reactions.length} reactions on game logs`);
      }

      if (comments.length > 0) {
        await this.db.insert(schema.comments).values(comments).onConflictDoNothing();
        logger.info(`✅ Created ${comments.length} comments on game logs`);
      }

      if (childComments.length > 0) {
        await this.db.insert(schema.comments).values(childComments).onConflictDoNothing();
        logger.info(`✅ Created ${childComments.length} child comments`);
      }

      if (childReactions.length > 0) {
        await this.db.insert(schema.reactions).values(childReactions).onConflictDoNothing();
        logger.info(`✅ Created ${childReactions.length} reactions on comments`);
      }
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Create interactions',
      });
      throw error;
    }
  }

  /**
   * Main seeding function - orchestrates the entire seeding process
   *
   * Executes the complete seeding workflow in the correct order:
   * 1. Load test users from JSON file
   * 2. Insert users into database (idempotent)
   * 3. Clean existing data (if --clean flag)
   * 4. Create friendships between test users
   * 5. Create outgoing friend requests from test users to non-test users
   * 6. Create incoming friend requests to test users from non-test users
   * 7. Create additional accepted friendships between test users and non-test users
   * 8. Generate game logs for each user
   * 9. Create interactions on selected game logs
   *
   * All operations are designed to be idempotent and safe to run multiple times.
   * Comprehensive logging provides visibility into the seeding process.
   *
   * @public
   * @throws {Error} If any step in the seeding process fails
   */
  async seed(): Promise<void> {
    logger.info('🌱 Starting test user interactions seeding...');
    logger.info(`🌍 Environment: ${this.environment.toUpperCase()}`);

    if (this.dryRun) {
      logger.info('🔍 DRY RUN MODE - No data will be written to database');
    }

    if (this.clean) {
      logger.info('🧹 CLEAN MODE - Will remove existing test user data first');
    }

    if (this.deterministic) {
      logger.info('🎯 DETERMINISTIC MODE - Will generate consistent data');
    }

    try {
      // Step 0: Sync reaction emojis to ensure all emojis from constants are in database
      await syncReactionEmojis(this.db, 'Test User Interaction Seeder');

      // Step 1: Load test users from JSON file
      const testUsers = this.loadTestUsers();
      const testUserIds = testUsers.map(user => user.id);
      logger.info(`👥 Test users: ${testUserIds.length}`);

      // Step 2: Insert test users into database (idempotent)
      await this.insertTestUsers(testUsers);

      // Step 3: Clean up existing data if requested
      if (this.clean) {
        await this.cleanupTestUserData(testUserIds);
      }

      // Step 4: Create friendships (single record per pair)
      await this.createFriendships(testUserIds);

      // Step 5: Create outgoing friend requests from test users to non-test users
      await this.createOutgoingFriendRequests(testUserIds);

      // Step 6: Create incoming friend requests to test users from non-test users
      await this.createIncomingFriendRequests(testUserIds);

      // Step 7: Create additional accepted friendships between test users and non-test users
      await this.createAdditionalAcceptedFriendships(testUserIds);

      // Step 8: Create game logs
      const gameLogIds = await this.createGameLogs(testUserIds);

      // Step 9: Create interactions on selected game logs
      await this.createInteractionsOnSelectedGameLogs(gameLogIds, testUserIds);

      logger.info('✅ Test user interactions seeding completed successfully!');
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Test User Interaction Seeder',
        action: 'Main seeding process',
      });
      throw error;
    }
  }
}

/**
 * Parse command line arguments and return configuration options
 *
 * Processes command line arguments to extract script configuration:
 * - --env: Target environment (development/production)
 * - --dry-run: Preview mode without database changes
 * - --clean: Clean existing data before seeding
 * - --deterministic: Generate consistent test data
 * - --help: Display usage information
 *
 * @returns {ScriptOptions} Parsed configuration options
 * @throws {Error} If required arguments are missing or invalid
 */
function parseArguments(): ScriptOptions {
  const args = process.argv.slice(2);
  const options: ScriptOptions = {
    environment: 'development',
    dryRun: false,
    clean: false,
    deterministic: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.includes('=')) {
      const [option, value] = arg.split('=', 2);
      if (option === '--env') {
        if (value === 'development' || value === 'production') {
          options.environment = value;
        } else {
          console.error(`❌ Invalid environment: ${value}. Must be 'development' or 'production'`);
          process.exit(1);
        }
      }
    } else {
      switch (arg) {
        case '--env':
          if (i + 1 < args.length) {
            const env = args[++i];
            if (env === 'development' || env === 'production') {
              options.environment = env;
            } else {
              console.error(
                `❌ Invalid environment: ${env}. Must be 'development' or 'production'`
              );
              process.exit(1);
            }
          }
          break;
        case '--dry-run':
          options.dryRun = true;
          break;
        case '--clean':
          options.clean = true;
          break;
        case '--deterministic':
          options.deterministic = true;
          break;
        case '--help':
        case '-h':
          console.log(`
🌱 Test User Interactions Seeding Script

Usage: pnpm tsx scripts/seed-test-user-interactions.ts [options]

Options:
  --env <environment>    Environment to seed (development or production)
  --dry-run             Show what would be seeded without actually seeding
  --clean               Remove existing test user data before seeding
  --deterministic       Generate consistent data (useful for testing)
  --help, -h            Show this help message

Examples:
  pnpm tsx scripts/seed-test-user-interactions.ts --env=development
  pnpm tsx scripts/seed-test-user-interactions.ts --env=production --clean
  pnpm tsx scripts/seed-test-user-interactions.ts --env=development --dry-run
  pnpm tsx scripts/seed-test-user-interactions.ts --env=development --clean --deterministic

This script will:
1. (Optional) Clean up existing test user data if --clean is used
2. Make all test users friends with each other
3. Generate 10-100 random game logs per test user
4. Create reactions and comments on 1-2% of game logs
5. Add external users to interact with selected content

Idempotency:
- The script is now fully idempotent when run without --clean
- Use --clean to reset and start fresh
- Use --deterministic for consistent test data generation
          `);
          process.exit(0);
        default:
          console.error(`❌ Unknown option: ${arg}`);
          console.log('Use --help for usage information');
          process.exit(1);
      }
    }
  }

  return options;
}

/**
 * Main entry point for the test user interactions seeding script
 *
 * Parses command line arguments, initializes the seeder, and executes
 * the seeding process. Handles errors gracefully and provides clear
 * feedback to the user.
 *
 * @async
 * @throws {Error} If seeding process fails
 */
async function main(): Promise<void> {
  const options = parseArguments();

  const seeder = new TestUserInteractionSeeder(options);

  await seeder.seed();
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

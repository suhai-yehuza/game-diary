import { and, eq, sql, isNull, count, desc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { reactions, users } from '@/lib/db/schema';

/**
 * Reactions SQL Queries
 *
 * Centralized collection of all SQL queries related to reactions.
 * Includes reaction CRUD operations, reaction counts, and reaction grouping.
 */

/**
 * Get reactions by target ID and type
 */
export async function getReactionsByTargetQuery(
  targetId: string,
  targetType: string,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      id: reactions.id,
      emoji: reactions.emoji,
      user_id: reactions.user_id,
      target_id: reactions.target_id,
      target_type: reactions.target_type,
      created_at: reactions.created_at,
      updated_at: reactions.updated_at,
      // User data
      user: {
        id: users.id,
        username: users.username,
        first_name: users.first_name,
        last_name: users.last_name,
        image_url: users.image_url,
        isAdmin: users.isAdmin,
      },
    })
    .from(reactions)
    .innerJoin(users, eq(reactions.user_id, users.id))
    .where(
      and(
        eq(reactions.target_id, targetId),
        eq(reactions.target_type, targetType),
        isNull(reactions.deleted_at)
      )
    )
    .orderBy(desc(reactions.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get reaction by ID
 */
export async function getReactionByIdQuery(reactionId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({
      id: reactions.id,
      emoji: reactions.emoji,
      user_id: reactions.user_id,
      target_id: reactions.target_id,
      target_type: reactions.target_type,
      created_at: reactions.created_at,
      updated_at: reactions.updated_at,
      // User data
      user: {
        id: users.id,
        username: users.username,
        first_name: users.first_name,
        last_name: users.last_name,
        image_url: users.image_url,
        isAdmin: users.isAdmin,
      },
    })
    .from(reactions)
    .innerJoin(users, eq(reactions.user_id, users.id))
    .where(and(eq(reactions.id, reactionId), isNull(reactions.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get reaction counts for multiple target IDs
 */
export async function getReactionCountsQuery(targetIds: string[]) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (targetIds.length === 0) {
    return new Map();
  }

  const counts = await database
    .select({
      target_id: reactions.target_id,
      count: count(),
    })
    .from(reactions)
    .where(and(sql`${reactions.target_id} = ANY(${targetIds})`, isNull(reactions.deleted_at)))
    .groupBy(reactions.target_id);

  return new Map(counts.map(c => [c.target_id, c.count]));
}

/**
 * Get reaction count for a single target ID
 */
export async function getReactionCountQuery(targetId: string): Promise<number> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({ count: count() })
    .from(reactions)
    .where(and(eq(reactions.target_id, targetId), isNull(reactions.deleted_at)));

  return result[0]?.count || 0;
}

/**
 * Get reactions grouped by emoji for a target
 */
export async function getReactionsGroupedByEmojiQuery(targetId: string, targetType: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      emoji: reactions.emoji,
      count: count(),
      users: sql<string[]>`ARRAY_AGG(${users.username})`,
    })
    .from(reactions)
    .innerJoin(users, eq(reactions.user_id, users.id))
    .where(
      and(
        eq(reactions.target_id, targetId),
        eq(reactions.target_type, targetType),
        isNull(reactions.deleted_at)
      )
    )
    .groupBy(reactions.emoji)
    .orderBy(desc(count()));
}

/**
 * Get user's reaction for a specific target
 */
export async function getUserReactionQuery(userId: string, targetId: string, targetType: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(reactions)
    .where(
      and(
        eq(reactions.user_id, userId),
        eq(reactions.target_id, targetId),
        eq(reactions.target_type, targetType),
        isNull(reactions.deleted_at)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Get reactions by user ID
 */
export async function getReactionsByUserIdQuery(userId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      id: reactions.id,
      emoji: reactions.emoji,
      user_id: reactions.user_id,
      target_id: reactions.target_id,
      target_type: reactions.target_type,
      created_at: reactions.created_at,
      updated_at: reactions.updated_at,
    })
    .from(reactions)
    .where(and(eq(reactions.user_id, userId), isNull(reactions.deleted_at)))
    .orderBy(desc(reactions.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get recent reactions
 */
export async function getRecentReactionsQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      id: reactions.id,
      emoji: reactions.emoji,
      user_id: reactions.user_id,
      target_id: reactions.target_id,
      target_type: reactions.target_type,
      created_at: reactions.created_at,
      updated_at: reactions.updated_at,
      // User data
      user: {
        id: users.id,
        username: users.username,
        first_name: users.first_name,
        last_name: users.last_name,
        image_url: users.image_url,
        isAdmin: users.isAdmin,
      },
    })
    .from(reactions)
    .innerJoin(users, eq(reactions.user_id, users.id))
    .where(isNull(reactions.deleted_at))
    .orderBy(desc(reactions.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get reaction statistics
 */
export async function getReactionStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({
      totalCount: count(),
      uniqueEmojis: sql<number>`COUNT(DISTINCT ${reactions.emoji})`,
      mostPopularEmoji: sql<string>`(
        SELECT emoji
        FROM reactions
        WHERE deleted_at IS NULL
        GROUP BY emoji
        ORDER BY COUNT(*) DESC
        LIMIT 1
      )`,
    })
    .from(reactions)
    .where(isNull(reactions.deleted_at));

  return (
    result[0] || {
      totalCount: 0,
      uniqueEmojis: 0,
      mostPopularEmoji: null,
    }
  );
}

/**
 * Get reaction counts by emoji
 */
export async function getReactionCountsByEmojiQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      emoji: reactions.emoji,
      count: count(),
    })
    .from(reactions)
    .where(isNull(reactions.deleted_at))
    .groupBy(reactions.emoji)
    .orderBy(desc(count()));
}

/**
 * Get reaction counts by target type
 */
export async function getReactionCountsByTargetTypeQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      target_type: reactions.target_type,
      count: count(),
    })
    .from(reactions)
    .where(isNull(reactions.deleted_at))
    .groupBy(reactions.target_type);
}

/**
 * Get reaction counts by user
 */
export async function getReactionCountsByUserQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      user_id: reactions.user_id,
      count: count(),
      // User data
      user: {
        id: users.id,
        username: users.username,
        first_name: users.first_name,
        last_name: users.last_name,
        image_url: users.image_url,
        isAdmin: users.isAdmin,
      },
    })
    .from(reactions)
    .innerJoin(users, eq(reactions.user_id, users.id))
    .where(isNull(reactions.deleted_at))
    .groupBy(
      reactions.user_id,
      users.id,
      users.username,
      users.first_name,
      users.last_name,
      users.image_url,
      users.isAdmin
    )
    .orderBy(desc(count()))
    .limit(limit)
    .offset(offset);
}

/**
 * Get reactions with user data for multiple targets
 */
export async function getReactionsForTargetsQuery(targetIds: string[], targetType: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (targetIds.length === 0) {
    return [];
  }

  return database
    .select({
      id: reactions.id,
      emoji: reactions.emoji,
      user_id: reactions.user_id,
      target_id: reactions.target_id,
      target_type: reactions.target_type,
      created_at: reactions.created_at,
      updated_at: reactions.updated_at,
      // User data
      user: {
        id: users.id,
        username: users.username,
        first_name: users.first_name,
        last_name: users.last_name,
        image_url: users.image_url,
        isAdmin: users.isAdmin,
      },
    })
    .from(reactions)
    .innerJoin(users, eq(reactions.user_id, users.id))
    .where(
      and(
        sql`${reactions.target_id} = ANY(${targetIds})`,
        eq(reactions.target_type, targetType),
        isNull(reactions.deleted_at)
      )
    )
    .orderBy(desc(reactions.created_at));
}

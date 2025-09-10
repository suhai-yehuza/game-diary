import { and, eq, sql, isNull, count, desc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { publicReactions } from '@/lib/db/schema';

/**
 * Public Reactions SQL Queries
 *
 * Centralized collection of all SQL queries related to public reactions.
 * Includes public reaction CRUD operations, reaction counts, and reaction grouping.
 */

/**
 * Get public reactions by target ID and type
 */
export async function getPublicReactionsByTargetQuery(
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
    .select()
    .from(publicReactions)
    .where(
      and(
        eq(publicReactions.target_id, targetId),
        eq(publicReactions.target_type, targetType as never),
        isNull(publicReactions.deleted_at)
      )
    )
    .orderBy(desc(publicReactions.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get public reaction by ID
 */
export async function getPublicReactionByIdQuery(reactionId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(publicReactions)
    .where(and(eq(publicReactions.id, reactionId), isNull(publicReactions.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get public reaction counts for multiple target IDs
 */
export async function getPublicReactionCountsQuery(targetIds: string[]) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (targetIds.length === 0) {
    return new Map();
  }

  const counts = await database
    .select({
      target_id: publicReactions.target_id,
      count: count(),
    })
    .from(publicReactions)
    .where(
      and(sql`${publicReactions.target_id} = ANY(${targetIds})`, isNull(publicReactions.deleted_at))
    )
    .groupBy(publicReactions.target_id);

  return new Map(counts.map(c => [c.target_id, c.count]));
}

/**
 * Get public reaction count for a single target ID
 */
export async function getPublicReactionCountQuery(targetId: string): Promise<number> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({ count: count() })
    .from(publicReactions)
    .where(and(eq(publicReactions.target_id, targetId), isNull(publicReactions.deleted_at)));

  return result[0]?.count || 0;
}

/**
 * Get public reactions grouped by emoji for a target
 */
export async function getPublicReactionsGroupedByEmojiQuery(targetId: string, targetType: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      emoji: publicReactions.emoji,
      count: count(),
      anonymous_names: sql<string[]>`ARRAY_AGG(${publicReactions.anonymous_name})`,
    })
    .from(publicReactions)
    .where(
      and(
        eq(publicReactions.target_id, targetId),
        eq(publicReactions.target_type, targetType as never),
        isNull(publicReactions.deleted_at)
      )
    )
    .groupBy(publicReactions.emoji)
    .orderBy(desc(count()));
}

/**
 * Get public reaction by anonymous name for a specific target
 */
export async function getPublicReactionByAnonymousNameQuery(
  anonymousName: string,
  targetId: string,
  targetType: string
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(publicReactions)
    .where(
      and(
        eq(publicReactions.anonymous_name, anonymousName),
        eq(publicReactions.target_id, targetId),
        eq(publicReactions.target_type, targetType as never),
        isNull(publicReactions.deleted_at)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Get public reactions by anonymous name
 */
export async function getPublicReactionsByAnonymousNameQuery(
  anonymousName: string,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(publicReactions)
    .where(
      and(eq(publicReactions.anonymous_name, anonymousName), isNull(publicReactions.deleted_at))
    )
    .orderBy(desc(publicReactions.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get recent public reactions
 */
export async function getRecentPublicReactionsQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(publicReactions)
    .where(isNull(publicReactions.deleted_at))
    .orderBy(desc(publicReactions.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get public reaction statistics
 */
export async function getPublicReactionStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({
      totalCount: count(),
      uniqueEmojis: sql<number>`COUNT(DISTINCT ${publicReactions.emoji})`,
      mostPopularEmoji: sql<string>`(
        SELECT emoji
        FROM public_reactions
        WHERE deleted_at IS NULL
        GROUP BY emoji
        ORDER BY COUNT(*) DESC
        LIMIT 1
      )`,
    })
    .from(publicReactions)
    .where(isNull(publicReactions.deleted_at));

  return (
    result[0] || {
      totalCount: 0,
      uniqueEmojis: 0,
      mostPopularEmoji: null,
    }
  );
}

/**
 * Get public reaction counts by emoji
 */
export async function getPublicReactionCountsByEmojiQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      emoji: publicReactions.emoji,
      count: count(),
    })
    .from(publicReactions)
    .where(isNull(publicReactions.deleted_at))
    .groupBy(publicReactions.emoji)
    .orderBy(desc(count()));
}

/**
 * Get public reaction counts by target type
 */
export async function getPublicReactionCountsByTargetTypeQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      target_type: publicReactions.target_type,
      count: count(),
    })
    .from(publicReactions)
    .where(isNull(publicReactions.deleted_at))
    .groupBy(publicReactions.target_type);
}

/**
 * Get public reaction counts by anonymous name
 */
export async function getPublicReactionCountsByAnonymousNameQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      anonymous_name: publicReactions.anonymous_name,
      count: count(),
    })
    .from(publicReactions)
    .where(isNull(publicReactions.deleted_at))
    .groupBy(publicReactions.anonymous_name)
    .orderBy(desc(count()))
    .limit(limit)
    .offset(offset);
}

/**
 * Get public reactions with anonymous name data for multiple targets
 */
export async function getPublicReactionsForTargetsQuery(targetIds: string[], targetType: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (targetIds.length === 0) {
    return [];
  }

  return database
    .select()
    .from(publicReactions)
    .where(
      and(
        sql`${publicReactions.target_id} = ANY(${targetIds})`,
        eq(publicReactions.target_type, targetType as never),
        isNull(publicReactions.deleted_at)
      )
    )
    .orderBy(desc(publicReactions.created_at));
}

/**
 * Get public reactions by date range
 */
export async function getPublicReactionsByDateRangeQuery(
  startDate: string,
  endDate: string,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(publicReactions)
    .where(
      and(
        isNull(publicReactions.deleted_at),
        sql`${publicReactions.created_at} >= ${startDate}`,
        sql`${publicReactions.created_at} <= ${endDate}`
      )
    )
    .orderBy(desc(publicReactions.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get public reactions by emoji
 */
export async function getPublicReactionsByEmojiQuery(emoji: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(publicReactions)
    .where(and(eq(publicReactions.emoji, emoji), isNull(publicReactions.deleted_at)))
    .orderBy(desc(publicReactions.created_at))
    .limit(limit)
    .offset(offset);
}

import { and, sql, isNull, count } from 'drizzle-orm';

import { db } from '@/lib/db';
import { comments, reactions, publicComments, publicReactions } from '@/lib/db/schema';

/**
 * Cache SQL Queries
 *
 * Centralized collection of all SQL queries related to caching and performance optimization.
 * Includes count queries, batch operations, and cache warming queries.
 */

/**
 * Get comment counts for multiple parent IDs (for caching)
 */
export async function getCommentCountsForCacheQuery(parentIds: string[]) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (parentIds.length === 0) {
    return new Map();
  }

  const counts = await database
    .select({
      parent_id: comments.parent_id,
      count: count(),
    })
    .from(comments)
    .where(and(sql`${comments.parent_id} = ANY(${parentIds})`, isNull(comments.deleted_at)))
    .groupBy(comments.parent_id);

  return new Map(counts.map(c => [c.parent_id, c.count]));
}

/**
 * Get reaction counts for multiple target IDs (for caching)
 */
export async function getReactionCountsForCacheQuery(targetIds: string[]) {
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
 * Get public comment counts for multiple parent IDs (for caching)
 */
export async function getPublicCommentCountsForCacheQuery(parentIds: string[]) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (parentIds.length === 0) {
    return new Map();
  }

  const counts = await database
    .select({
      parent_id: publicComments.parent_id,
      count: count(),
    })
    .from(publicComments)
    .where(
      and(sql`${publicComments.parent_id} = ANY(${parentIds})`, isNull(publicComments.deleted_at))
    )
    .groupBy(publicComments.parent_id);

  return new Map(counts.map(c => [c.parent_id, c.count]));
}

/**
 * Get public reaction counts for multiple target IDs (for caching)
 */
export async function getPublicReactionCountsForCacheQuery(targetIds: string[]) {
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
 * Get all comment counts (for cache warming)
 */
export async function getAllCommentCountsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      parent_id: comments.parent_id,
      count: count(),
    })
    .from(comments)
    .where(isNull(comments.deleted_at))
    .groupBy(comments.parent_id);
}

/**
 * Get all reaction counts (for cache warming)
 */
export async function getAllReactionCountsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      target_id: reactions.target_id,
      count: count(),
    })
    .from(reactions)
    .where(isNull(reactions.deleted_at))
    .groupBy(reactions.target_id);
}

/**
 * Get all public comment counts (for cache warming)
 */
export async function getAllPublicCommentCountsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      parent_id: publicComments.parent_id,
      count: count(),
    })
    .from(publicComments)
    .where(isNull(publicComments.deleted_at))
    .groupBy(publicComments.parent_id);
}

/**
 * Get all public reaction counts (for cache warming)
 */
export async function getAllPublicReactionCountsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      target_id: publicReactions.target_id,
      count: count(),
    })
    .from(publicReactions)
    .where(isNull(publicReactions.deleted_at))
    .groupBy(publicReactions.target_id);
}

/**
 * Get cache statistics
 */
export async function getCacheStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      (SELECT COUNT(DISTINCT parent_id) FROM comments WHERE deleted_at IS NULL) as unique_comment_parents,
      (SELECT COUNT(DISTINCT target_id) FROM reactions WHERE deleted_at IS NULL) as unique_reaction_targets,
      (SELECT COUNT(DISTINCT parent_id) FROM public_comments WHERE deleted_at IS NULL) as unique_public_comment_parents,
      (SELECT COUNT(DISTINCT target_id) FROM public_reactions WHERE deleted_at IS NULL) as unique_public_reaction_targets,
      (SELECT COUNT(*) FROM comments WHERE deleted_at IS NULL) as total_comments,
      (SELECT COUNT(*) FROM reactions WHERE deleted_at IS NULL) as total_reactions,
      (SELECT COUNT(*) FROM public_comments WHERE deleted_at IS NULL) as total_public_comments,
      (SELECT COUNT(*) FROM public_reactions WHERE deleted_at IS NULL) as total_public_reactions
  `);

  return (
    result.rows[0] || {
      unique_comment_parents: 0,
      unique_reaction_targets: 0,
      unique_public_comment_parents: 0,
      unique_public_reaction_targets: 0,
      total_comments: 0,
      total_reactions: 0,
      total_public_comments: 0,
      total_public_reactions: 0,
    }
  );
}

/**
 * Get cache hit/miss statistics (placeholder for future implementation)
 */
export function getCacheHitMissStatisticsQuery() {
  // This would typically query a cache system like Redis
  // For now, return placeholder data
  return {
    cache_hits: 0,
    cache_misses: 0,
    hit_rate: 0,
    total_requests: 0,
  };
}

/**
 * Warm cache for specific parent IDs
 */
export async function warmCacheForParentIdsQuery(parentIds: string[]) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (parentIds.length === 0) {
    return {
      commentCounts: new Map(),
      reactionCounts: new Map(),
      publicCommentCounts: new Map(),
      publicReactionCounts: new Map(),
    };
  }

  const [commentCounts, reactionCounts, publicCommentCounts, publicReactionCounts] =
    await Promise.all([
      getCommentCountsForCacheQuery(parentIds),
      getReactionCountsForCacheQuery(parentIds),
      getPublicCommentCountsForCacheQuery(parentIds),
      getPublicReactionCountsForCacheQuery(parentIds),
    ]);

  return {
    commentCounts,
    reactionCounts,
    publicCommentCounts,
    publicReactionCounts,
  };
}

/**
 * Get cache performance metrics
 */
export async function getCachePerformanceMetricsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM comments WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '1 hour') as comments_last_hour,
      (SELECT COUNT(*) FROM reactions WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '1 hour') as reactions_last_hour,
      (SELECT COUNT(*) FROM public_comments WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '1 hour') as public_comments_last_hour,
      (SELECT COUNT(*) FROM public_reactions WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '1 hour') as public_reactions_last_hour
  `);

  return (
    result.rows[0] || {
      comments_last_hour: 0,
      reactions_last_hour: 0,
      public_comments_last_hour: 0,
      public_reactions_last_hour: 0,
    }
  );
}

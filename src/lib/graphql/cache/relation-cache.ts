import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { comments, reactions, publicComments, publicReactions } from '@/lib/db/schema';

// Simple in-memory cache for relation counts
// In production, consider using Redis or a more robust caching solution
const relationCountCache = new Map<string, { count: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to generate cache key
function getCacheKey(table: string, field: string, value: string): string {
  return `${table}:${field}:${value}`;
}

// Helper function to check if cache entry is valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

// Cache for comment counts
export const commentCountCache = {
  get: (parentId: string): number | null => {
    const key = getCacheKey('comments', 'parent_id', parentId);
    const cached = relationCountCache.get(key);

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.count;
    }

    return null;
  },

  set: (parentId: string, count: number): void => {
    const key = getCacheKey('comments', 'parent_id', parentId);
    relationCountCache.set(key, { count, timestamp: Date.now() });
  },

  invalidate: (parentId: string): void => {
    const key = getCacheKey('comments', 'parent_id', parentId);
    relationCountCache.delete(key);
  },

  // Batch load comment counts with caching
  batchLoad: async (parentIds: string[]): Promise<Map<string, number>> => {
    const result = new Map<string, number>();
    const uncachedIds: string[] = [];

    // Check cache first
    for (const parentId of parentIds) {
      const cached = commentCountCache.get(parentId);
      if (cached !== null) {
        result.set(parentId, cached);
      } else {
        uncachedIds.push(parentId);
      }
    }

    // Load uncached counts from database
    if (uncachedIds.length > 0) {
      const database = db();
      if (database) {
        const counts = await database
          .select({
            parent_id: comments.parent_id,
            count: sql<number>`count(*)`,
          })
          .from(comments)
          .where(sql`${comments.parent_id} = ANY(${uncachedIds})`)
          .groupBy(comments.parent_id);

        // Cache the results
        for (const count of counts) {
          commentCountCache.set(count.parent_id, count.count);
          result.set(count.parent_id, count.count);
        }

        // Set 0 for IDs not found in database
        for (const parentId of uncachedIds) {
          if (!result.has(parentId)) {
            commentCountCache.set(parentId, 0);
            result.set(parentId, 0);
          }
        }
      }
    }

    return result;
  },
};

// Cache for reaction counts
export const reactionCountCache = {
  get: (targetId: string): number | null => {
    const key = getCacheKey('reactions', 'target_id', targetId);
    const cached = relationCountCache.get(key);

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.count;
    }

    return null;
  },

  set: (targetId: string, count: number): void => {
    const key = getCacheKey('reactions', 'target_id', targetId);
    relationCountCache.set(key, { count, timestamp: Date.now() });
  },

  invalidate: (targetId: string): void => {
    const key = getCacheKey('reactions', 'target_id', targetId);
    relationCountCache.delete(key);
  },

  // Batch load reaction counts with caching
  batchLoad: async (targetIds: string[]): Promise<Map<string, number>> => {
    const result = new Map<string, number>();
    const uncachedIds: string[] = [];

    // Check cache first
    for (const targetId of targetIds) {
      const cached = reactionCountCache.get(targetId);
      if (cached !== null) {
        result.set(targetId, cached);
      } else {
        uncachedIds.push(targetId);
      }
    }

    // Load uncached counts from database
    if (uncachedIds.length > 0) {
      const database = db();
      if (database) {
        const counts = await database
          .select({
            target_id: reactions.target_id,
            count: sql<number>`count(*)`,
          })
          .from(reactions)
          .where(sql`${reactions.target_id} = ANY(${uncachedIds})`)
          .groupBy(reactions.target_id);

        // Cache the results
        for (const count of counts) {
          reactionCountCache.set(count.target_id, count.count);
          result.set(count.target_id, count.count);
        }

        // Set 0 for IDs not found in database
        for (const targetId of uncachedIds) {
          if (!result.has(targetId)) {
            reactionCountCache.set(targetId, 0);
            result.set(targetId, 0);
          }
        }
      }
    }

    return result;
  },
};

// Cache for public comment counts
export const publicCommentCountCache = {
  get: (parentId: string): number | null => {
    const key = getCacheKey('public_comments', 'parent_id', parentId);
    const cached = relationCountCache.get(key);

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.count;
    }

    return null;
  },

  set: (parentId: string, count: number): void => {
    const key = getCacheKey('public_comments', 'parent_id', parentId);
    relationCountCache.set(key, { count, timestamp: Date.now() });
  },

  invalidate: (parentId: string): void => {
    const key = getCacheKey('public_comments', 'parent_id', parentId);
    relationCountCache.delete(key);
  },

  // Batch load public comment counts with caching
  batchLoad: async (parentIds: string[]): Promise<Map<string, number>> => {
    const result = new Map<string, number>();
    const uncachedIds: string[] = [];

    // Check cache first
    for (const parentId of parentIds) {
      const cached = publicCommentCountCache.get(parentId);
      if (cached !== null) {
        result.set(parentId, cached);
      } else {
        uncachedIds.push(parentId);
      }
    }

    // Load uncached counts from database
    if (uncachedIds.length > 0) {
      const database = db();
      if (database) {
        const counts = await database
          .select({
            parent_id: publicComments.parent_id,
            count: sql<number>`count(*)`,
          })
          .from(publicComments)
          .where(sql`${publicComments.parent_id} = ANY(${uncachedIds})`)
          .groupBy(publicComments.parent_id);

        // Cache the results
        for (const count of counts) {
          publicCommentCountCache.set(count.parent_id, count.count);
          result.set(count.parent_id, count.count);
        }

        // Set 0 for IDs not found in database
        for (const parentId of uncachedIds) {
          if (!result.has(parentId)) {
            publicCommentCountCache.set(parentId, 0);
            result.set(parentId, 0);
          }
        }
      }
    }

    return result;
  },
};

// Cache for public reaction counts
export const publicReactionCountCache = {
  get: (targetId: string): number | null => {
    const key = getCacheKey('public_reactions', 'target_id', targetId);
    const cached = relationCountCache.get(key);

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.count;
    }

    return null;
  },

  set: (targetId: string, count: number): void => {
    const key = getCacheKey('public_reactions', 'target_id', targetId);
    relationCountCache.set(key, { count, timestamp: Date.now() });
  },

  invalidate: (targetId: string): void => {
    const key = getCacheKey('public_reactions', 'target_id', targetId);
    relationCountCache.delete(key);
  },

  // Batch load public reaction counts with caching
  batchLoad: async (targetIds: string[]): Promise<Map<string, number>> => {
    const result = new Map<string, number>();
    const uncachedIds: string[] = [];

    // Check cache first
    for (const targetId of targetIds) {
      const cached = publicReactionCountCache.get(targetId);
      if (cached !== null) {
        result.set(targetId, cached);
      } else {
        uncachedIds.push(targetId);
      }
    }

    // Load uncached counts from database
    if (uncachedIds.length > 0) {
      const database = db();
      if (database) {
        const counts = await database
          .select({
            target_id: publicReactions.target_id,
            count: sql<number>`count(*)`,
          })
          .from(publicReactions)
          .where(sql`${publicReactions.target_id} = ANY(${uncachedIds})`)
          .groupBy(publicReactions.target_id);

        // Cache the results
        for (const count of counts) {
          publicReactionCountCache.set(count.target_id, count.count);
          result.set(count.target_id, count.count);
        }

        // Set 0 for IDs not found in database
        for (const targetId of uncachedIds) {
          if (!result.has(targetId)) {
            publicReactionCountCache.set(targetId, 0);
            result.set(targetId, 0);
          }
        }
      }
    }

    return result;
  },
};

// Utility to clear all caches
export const clearAllCaches = (): void => {
  relationCountCache.clear();
};

// Utility to get cache statistics
export const getCacheStats = () => {
  const _now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const [_key, value] of relationCountCache.entries()) {
    if (isCacheValid(value.timestamp)) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }

  return {
    totalEntries: relationCountCache.size,
    validEntries,
    expiredEntries,
    cacheHitRate: relationCountCache.size > 0 ? (validEntries / relationCountCache.size) * 100 : 0,
  };
};

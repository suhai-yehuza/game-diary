import { and, eq, sql, isNull, count, desc, asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { publicComments } from '@/lib/db/schema';
import { TARGET_TYPES } from '@/types';

/**
 * Public Comments SQL Queries
 *
 * Centralized collection of all SQL queries related to public comments.
 * Includes public comment CRUD operations, replies, and comment counts.
 */

/**
 * Get public comments by parent ID and type
 */
export async function getPublicCommentsByParentQuery(
  parentId: string,
  parentType: string,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(publicComments)
    .where(
      and(
        eq(publicComments.parent_id, parentId),
        eq(publicComments.parent_type, parentType as never),
        isNull(publicComments.deleted_at)
      )
    )
    .orderBy(asc(publicComments.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get public comment by ID
 */
export async function getPublicCommentByIdQuery(commentId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(publicComments)
    .where(and(eq(publicComments.id, commentId), isNull(publicComments.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get public comment replies (child public comments)
 */
export async function getPublicCommentRepliesQuery(commentId: string, limit = 20, offset = 0) {
  return getPublicCommentsByParentQuery(commentId, TARGET_TYPES.COMMENT, limit, offset);
}

/**
 * Get public comments with search
 */
export async function getPublicCommentsWithSearchQuery(
  searchTerm: string,
  parentId?: string,
  parentType?: string,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const conditions = [isNull(publicComments.deleted_at)];
  const searchPattern = `%${searchTerm}%`;

  if (parentId && parentType) {
    conditions.push(eq(publicComments.parent_id, parentId));
    conditions.push(eq(publicComments.parent_type, parentType as never));
  }

  conditions.push(sql`${publicComments.content} ILIKE ${searchPattern}`);

  return database
    .select()
    .from(publicComments)
    .where(and(...conditions))
    .orderBy(desc(publicComments.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get public comment counts for multiple parent IDs
 */
export async function getPublicCommentCountsQuery(parentIds: string[]) {
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
 * Get public comment count for a single parent ID
 */
export async function getPublicCommentCountQuery(parentId: string): Promise<number> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({ count: count() })
    .from(publicComments)
    .where(and(eq(publicComments.parent_id, parentId), isNull(publicComments.deleted_at)));

  return result[0]?.count || 0;
}

/**
 * Get public comments by anonymous name
 */
export async function getPublicCommentsByAnonymousNameQuery(
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
    .from(publicComments)
    .where(and(eq(publicComments.anonymous_name, anonymousName), isNull(publicComments.deleted_at)))
    .orderBy(desc(publicComments.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get recent public comments
 */
export async function getRecentPublicCommentsQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(publicComments)
    .where(isNull(publicComments.deleted_at))
    .orderBy(desc(publicComments.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get public comment statistics
 */
export async function getPublicCommentStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({
      totalCount: count(),
      averageDepth: sql<number>`AVG(${publicComments.depth})`,
      maxDepth: sql<number>`MAX(${publicComments.depth})`,
    })
    .from(publicComments)
    .where(isNull(publicComments.deleted_at));

  return (
    result[0] || {
      totalCount: 0,
      averageDepth: 0,
      maxDepth: 0,
    }
  );
}

/**
 * Get public comment counts by parent type
 */
export async function getPublicCommentCountsByParentTypeQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      parent_type: publicComments.parent_type,
      count: count(),
    })
    .from(publicComments)
    .where(isNull(publicComments.deleted_at))
    .groupBy(publicComments.parent_type);
}

/**
 * Get public comment counts by anonymous name
 */
export async function getPublicCommentCountsByAnonymousNameQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      anonymous_name: publicComments.anonymous_name,
      count: count(),
    })
    .from(publicComments)
    .where(isNull(publicComments.deleted_at))
    .groupBy(publicComments.anonymous_name)
    .orderBy(desc(count()))
    .limit(limit)
    .offset(offset);
}

/**
 * Get public comment with reaction counts
 */
export async function getPublicCommentWithReactionCountsQuery(commentId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      c.id,
      c.content,
      c.anonymous_name,
      c.parent_id,
      c.parent_type,
      c.depth,
      c.created_at,
      c.updated_at,
      COUNT(r.id) as reaction_count
    FROM public_comments c
    LEFT JOIN public_reactions r ON r.target_id = c.id
      AND r.target_type = ${TARGET_TYPES.COMMENT}
      AND r.deleted_at IS NULL
    WHERE c.id = ${commentId}
      AND c.deleted_at IS NULL
    GROUP BY c.id, c.content, c.anonymous_name, c.parent_id, c.parent_type, c.depth, c.created_at, c.updated_at
  `);

  return result.rows[0] || null;
}

/**
 * Get public comments by depth
 */
export async function getPublicCommentsByDepthQuery(depth: number, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(publicComments)
    .where(and(eq(publicComments.depth, depth), isNull(publicComments.deleted_at)))
    .orderBy(desc(publicComments.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get public comments by date range
 */
export async function getPublicCommentsByDateRangeQuery(
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
    .from(publicComments)
    .where(
      and(
        isNull(publicComments.deleted_at),
        sql`${publicComments.created_at} >= ${startDate}`,
        sql`${publicComments.created_at} <= ${endDate}`
      )
    )
    .orderBy(desc(publicComments.created_at))
    .limit(limit)
    .offset(offset);
}

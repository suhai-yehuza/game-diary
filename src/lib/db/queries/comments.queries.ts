import { and, eq, sql, isNull, count, desc, asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { comments, users } from '@/lib/db/schema';
import { TARGET_TYPES } from '@/types';

/**
 * Comments SQL Queries
 *
 * Centralized collection of all SQL queries related to comments.
 * Includes comment CRUD operations, replies, and comment counts.
 */

/**
 * Get comments by parent ID and type
 */
export async function getCommentsByParentQuery(
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
    .select({
      id: comments.id,
      content: comments.content,
      user_id: comments.user_id,
      parent_id: comments.parent_id,
      parent_type: comments.parent_type,
      depth: comments.depth,
      created_at: comments.created_at,
      updated_at: comments.updated_at,
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
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(
      and(
        eq(comments.parent_id, parentId),
        eq(comments.parent_type, parentType),
        isNull(comments.deleted_at)
      )
    )
    .orderBy(asc(comments.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get comment by ID
 */
export async function getCommentByIdQuery(commentId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({
      id: comments.id,
      content: comments.content,
      user_id: comments.user_id,
      parent_id: comments.parent_id,
      parent_type: comments.parent_type,
      depth: comments.depth,
      created_at: comments.created_at,
      updated_at: comments.updated_at,
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
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(and(eq(comments.id, commentId), isNull(comments.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get comment replies (child comments)
 */
export async function getCommentRepliesQuery(commentId: string, limit = 20, offset = 0) {
  return getCommentsByParentQuery(commentId, TARGET_TYPES.COMMENT, limit, offset);
}

/**
 * Get comments with search
 */
export async function getCommentsWithSearchQuery(
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

  const conditions = [isNull(comments.deleted_at)];
  const searchPattern = `%${searchTerm}%`;

  if (parentId && parentType) {
    conditions.push(eq(comments.parent_id, parentId));
    conditions.push(eq(comments.parent_type, parentType));
  }

  conditions.push(sql`${comments.content} ILIKE ${searchPattern}`);

  return database
    .select({
      id: comments.id,
      content: comments.content,
      user_id: comments.user_id,
      parent_id: comments.parent_id,
      parent_type: comments.parent_type,
      depth: comments.depth,
      created_at: comments.created_at,
      updated_at: comments.updated_at,
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
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(and(...conditions))
    .orderBy(desc(comments.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get comment counts for multiple parent IDs
 */
export async function getCommentCountsQuery(parentIds: string[]) {
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
 * Get comment count for a single parent ID
 */
export async function getCommentCountQuery(parentId: string): Promise<number> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({ count: count() })
    .from(comments)
    .where(and(eq(comments.parent_id, parentId), isNull(comments.deleted_at)));

  return result[0]?.count || 0;
}

/**
 * Get comments by user ID
 */
export async function getCommentsByUserIdQuery(userId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      id: comments.id,
      content: comments.content,
      user_id: comments.user_id,
      parent_id: comments.parent_id,
      parent_type: comments.parent_type,
      depth: comments.depth,
      created_at: comments.created_at,
      updated_at: comments.updated_at,
    })
    .from(comments)
    .where(and(eq(comments.user_id, userId), isNull(comments.deleted_at)))
    .orderBy(desc(comments.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get recent comments
 */
export async function getRecentCommentsQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      id: comments.id,
      content: comments.content,
      user_id: comments.user_id,
      parent_id: comments.parent_id,
      parent_type: comments.parent_type,
      depth: comments.depth,
      created_at: comments.created_at,
      updated_at: comments.updated_at,
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
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(isNull(comments.deleted_at))
    .orderBy(desc(comments.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get comment statistics
 */
export async function getCommentStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({
      totalCount: count(),
      averageDepth: sql<number>`AVG(${comments.depth})`,
      maxDepth: sql<number>`MAX(${comments.depth})`,
    })
    .from(comments)
    .where(isNull(comments.deleted_at));

  return (
    result[0] || {
      totalCount: 0,
      averageDepth: 0,
      maxDepth: 0,
    }
  );
}

/**
 * Get comment counts by parent type
 */
export async function getCommentCountsByParentTypeQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      parent_type: comments.parent_type,
      count: count(),
    })
    .from(comments)
    .where(isNull(comments.deleted_at))
    .groupBy(comments.parent_type);
}

/**
 * Get comment counts by user
 */
export async function getCommentCountsByUserQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      user_id: comments.user_id,
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
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(isNull(comments.deleted_at))
    .groupBy(
      comments.user_id,
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
 * Get comment with reaction counts
 */
export async function getCommentWithReactionCountsQuery(commentId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      c.id,
      c.content,
      c.user_id,
      c.parent_id,
      c.parent_type,
      c.depth,
      c.created_at,
      c.updated_at,
      u.username,
      u.first_name,
      u.last_name,
      u.image_url,
      u.isAdmin,
      COUNT(r.id) as reaction_count
    FROM comments c
    INNER JOIN users u ON c.user_id = u.id
    LEFT JOIN reactions r ON r.target_id = c.id
      AND r.target_type = ${TARGET_TYPES.COMMENT}
      AND r.deleted_at IS NULL
    WHERE c.id = ${commentId}
      AND c.deleted_at IS NULL
    GROUP BY c.id, c.content, c.user_id, c.parent_id, c.parent_type, c.depth, c.created_at, c.updated_at,
             u.username, u.first_name, u.last_name, u.image_url, u.isAdmin
  `);

  return result.rows[0] || null;
}

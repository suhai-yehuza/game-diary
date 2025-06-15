import { and, eq, sql } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { logger } from '@lib/core/logger';
import { API_CONFIG } from '@src/lib/config/api.config';
import * as schema from '@src/lib/db/schema';
import { createConnection, parseCursor, handleResolverError } from '@src/lib/graphql/utils';
import type { IContext } from '@src/lib/types/component.types';

// Helper function to calculate comment depth
async function getCommentDepth(
  commentId: string,
  db: NeonHttpDatabase<typeof schema>,
  depth = 0
): Promise<number> {
  if (depth >= API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH) {
    return depth;
  }

  const comment = await db
    .select()
    .from(schema.comments)
    .where(eq(schema.comments.id, commentId))
    .limit(1)
    .then((rows: Array<typeof schema.comments.$inferSelect>) => rows[0]);

  if (!comment || comment.parentType !== 'comment') {
    return depth;
  }

  return getCommentDepth(comment.parentId, db, depth + 1);
}

export const comments = async (
  _parent: unknown,
  args: {
    filters?: { parentId?: string; parentType?: string };
    pagination?: { first?: number; after?: string; last?: number };
  },
  { db }: IContext
) => {
  try {
    const { filters, pagination } = args;
    const { parentId, parentType } = filters || {};
    const { first = 10, after, last } = pagination || {};

    if (!parentId) {
      throw new Error('parentId is required');
    }

    // Build the query conditions
    const conditions = [eq(schema.comments.parentId, parentId)];

    // Add parentType filter if provided
    if (parentType) {
      conditions.push(eq(schema.comments.parentType, parentType as 'game_log' | 'comment'));
    }

    // Get the total count
    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.comments)
      .where(and(...conditions));

    const totalCount = countResult?.count || 0;

    // Calculate offset from cursor
    const offset = after ? parseCursor(after) : 0;

    // Execute the query with proper offset and limit
    const query = db
      .select()
      .from(schema.comments)
      .where(and(...conditions))
      .orderBy(schema.comments.createdAt)
      .offset(offset)
      .limit(first || last || 10);

    const items = await query;

    // Map the results
    const mappedComments = items.map(comment => ({
      id: comment.id,
      userId: comment.userId,
      parentId: comment.parentId,
      parentType: comment.parentType,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      deletedAt: comment.deletedAt,
      reactions: [], // Will be resolved by Comment type resolver
    }));

    return createConnection(mappedComments, totalCount, { first, after, last });
  } catch (error) {
    handleResolverError(error, 'fetch comments');
  }
};

// Export Comment type resolver
export const Comment = {
  user: async (parent: { userId: string | null }, _args: unknown, { db }: IContext) => {
    if (!parent.userId) return null;
    try {
      const users = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, parent.userId))
        .limit(1);

      const user = users[0];
      if (!user) return null;

      // Return UserSummary format
      return {
        id: user.id,
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        emailAddress: user.emailAddress || '',
        imageUrl: user.imageUrl || undefined,
        __typename: 'UserSummary',
      };
    } catch (error) {
      logger.error('Error loading user for comment:', error);
      return null;
    }
  },
  reactions: async (parent: { id: string }, _args: Record<string, unknown>, { db }: IContext) => {
    try {
      // For comments, we'll return a limited set of reactions
      // The frontend can load more if needed via a separate query
      const reactions = await db
        .select()
        .from(schema.reactions)
        .where(eq(schema.reactions.targetId, parent.id))
        .orderBy(schema.reactions.createdAt)
        .limit(10); // Limit to 10 reactions for comments

      return reactions.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        userId: reaction.userId,
        targetId: reaction.targetId,
        targetType: reaction.targetType,
        createdAt: reaction.createdAt,
        updatedAt: reaction.updatedAt,
      }));
    } catch (error) {
      logger.error('Error fetching reactions for comment:', error);
      return [];
    }
  },
  childComments: async (
    parent: { id: string },
    args: { first?: number; after?: string },
    { db }: IContext
  ) => {
    try {
      const { first = 10, after } = args;

      // Check current depth
      const currentDepth = await getCommentDepth(parent.id, db);
      if (currentDepth >= API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH) {
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        };
      }

      // Get child comments
      const conditions = [
        eq(schema.comments.parentId, parent.id),
        eq(schema.comments.parentType, 'comment'),
      ];

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.comments)
        .where(and(...conditions));

      const totalCount = countResult?.count || 0;

      // Calculate offset from cursor
      const offset = after ? parseCursor(after) : 0;

      // Execute query
      const items = await db
        .select()
        .from(schema.comments)
        .where(and(...conditions))
        .orderBy(schema.comments.createdAt)
        .offset(offset)
        .limit(first);

      // Map results
      const mappedComments = items.map(comment => ({
        id: comment.id,
        userId: comment.userId,
        parentId: comment.parentId,
        parentType: comment.parentType,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
      }));

      return createConnection(mappedComments, totalCount, { first, after });
    } catch (error) {
      logger.error('Error fetching child comments:', error);
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }
  },
  depth: async (
    parent: { id: string; parentId: string; parentType: string },
    _args: Record<string, unknown>,
    { db }: IContext
  ) => {
    try {
      // If parent is a game_log or the root, depth is 0
      if (parent.parentType !== 'comment') {
        return 0;
      }

      // Calculate depth by traversing up the comment tree
      return await getCommentDepth(parent.parentId, db, 1);
    } catch (error) {
      logger.error('Error calculating comment depth:', error);
      return 0;
    }
  },
};

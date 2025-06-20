import { and, eq, isNull, sql } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { API_CONFIG } from '@/lib/config/api.config';
import * as schema from '@/lib/db/schema';
import { createConnection, parseCursor, handleResolverError } from '@/lib/graphql/utils';
import type { IContext } from '@/lib/types';
import { logger } from '@lib/core/logger';

// Helper function to calculate comment depth
async function getCommentDepth(
  parentId: string | null,
  db: NeonHttpDatabase<typeof schema>,
  currentDepth: number = 0
): Promise<number> {
  if (!parentId || currentDepth > 10) return currentDepth; // Prevent infinite recursion

  try {
    const parent = await db.query.comments.findFirst({
      where: eq(schema.comments.id, parentId),
    });

    if (!parent || !parent.parentId) return currentDepth;
    return await getCommentDepth(parent.parentId, db, currentDepth + 1);
  } catch (error) {
    logger.error('Error calculating comment depth:', error);
    return 0;
  }
}

export const commentResolvers = {
  Query: {
    comments: async (
      _: unknown,
      {
        parentId,
        parentType,
        first,
        after,
      }: { parentId: string; parentType: string; first?: number; after?: string },
      context: IContext
    ) => {
      const { db } = context;
      if (!db) throw new Error('Database connection not available');

      try {
        const limit = Math.min(
          first || API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
          API_CONFIG.pagination.HUGE_SIZE
        );
        const offset = after ? parseInt(Buffer.from(after, 'base64').toString()) : 0;

        const comments = await db
          .select()
          .from(schema.comments)
          .where(
            and(
              eq(schema.comments.parentId, parentId),
              eq(schema.comments.parentType, parentType as 'game_log' | 'comment'),
              isNull(schema.comments.deletedAt)
            )
          )
          .limit(limit + 1)
          .offset(offset);

        const edges = comments.slice(0, limit);

        const totalCount = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(schema.comments)
          .where(
            and(
              eq(schema.comments.parentId, parentId),
              eq(schema.comments.parentType, parentType as 'game_log' | 'comment'),
              isNull(schema.comments.deletedAt)
            )
          );

        return createConnection(edges, totalCount[0]?.count || 0, { first, after });
      } catch (error) {
        return handleResolverError(error, 'Failed to fetch comments');
      }
    },
  },

  Comment: {
    user: async (parent: { userId: string }, _: unknown, context: IContext) => {
      const { loaders } = context;
      if (!loaders?.userLoader) return null;

      try {
        return await loaders.userLoader.load(parent.userId);
      } catch (error) {
        logger.error('Error loading user for comment:', error);
        return null;
      }
    },

    reactions: async (parent: { id: string }, _: unknown, context: IContext) => {
      const { db } = context;
      if (!db) return [];

      try {
        return await db
          .select()
          .from(schema.reactions)
          .where(
            and(
              eq(schema.reactions.targetId, parent.id),
              eq(schema.reactions.targetType, 'comment')
            )
          );
      } catch (error) {
        logger.error('Error fetching reactions for comment:', error);
        return [];
      }
    },

    childComments: async (
      parent: { id: string },
      { first = 10, after }: { first?: number; after?: string },
      context: IContext
    ) => {
      const { db } = context;
      if (!db) {
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

      try {
        const offset = after ? parseCursor(after) : 0;
        const limit = Math.min(first, 50);

        const childComments = await db
          .select()
          .from(schema.comments)
          .where(and(eq(schema.comments.parentId, parent.id), isNull(schema.comments.deletedAt)))
          .limit(limit + 1)
          .offset(offset);

        const totalCount = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(schema.comments)
          .where(and(eq(schema.comments.parentId, parent.id), isNull(schema.comments.deletedAt)));

        const edges = childComments.slice(0, limit);

        const mappedComments = await Promise.all(
          edges.map(async comment => ({
            ...comment,
            depth: await getCommentDepth(comment.parentId, db as NeonHttpDatabase<typeof schema>),
          }))
        );

        return createConnection(mappedComments, totalCount[0]?.count || 0, { first, after });
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

    depth: async (parent: { parentId: string | null }, _: unknown, context: IContext) => {
      const { db } = context;
      if (!db || !parent.parentId) return 0;

      try {
        return await getCommentDepth(parent.parentId, db as NeonHttpDatabase<typeof schema>, 1);
      } catch (error) {
        logger.error('Error calculating comment depth:', error);
        return 0;
      }
    },
  },

  Mutation: {
    createComment: async (
      _: unknown,
      { input }: { input: { content: string; parentId: string; parentType: string } },
      context: IContext
    ) => {
      const { db, user } = context;
      if (!db) throw new Error('Database connection not available');
      if (!user) throw new Error('Authentication required');

      try {
        const [comment] = await db
          .insert(schema.comments)
          .values({
            userId: user.id,
            parentId: input.parentId,
            parentType: input.parentType as 'game_log' | 'comment',
            content: input.content,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return comment;
      } catch (error) {
        return handleResolverError(error, 'Failed to create comment');
      }
    },

    updateComment: async (
      _: unknown,
      { id, input }: { id: string; input: { content: string } },
      context: IContext
    ) => {
      const { db, user } = context;
      if (!db) throw new Error('Database connection not available');
      if (!user) throw new Error('Authentication required');

      try {
        const [comment] = await db
          .update(schema.comments)
          .set({
            content: input.content,
            updatedAt: new Date(),
          })
          .where(and(eq(schema.comments.id, id), eq(schema.comments.userId, user.id)))
          .returning();

        return comment;
      } catch (error) {
        return handleResolverError(error, 'Failed to update comment');
      }
    },

    deleteComment: async (_: unknown, { id }: { id: string }, context: IContext) => {
      const { db, user } = context;
      if (!db) throw new Error('Database connection not available');
      if (!user) throw new Error('Authentication required');

      try {
        await db
          .update(schema.comments)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(schema.comments.id, id), eq(schema.comments.userId, user.id)));

        return true;
      } catch (error) {
        logger.error('Failed to delete comment:', error);
        return false;
      }
    },
  },
};

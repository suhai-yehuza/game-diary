import { eq, and, desc, sql, isNull } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { comments, reactions } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '@/lib/types';

// Comment Query Resolvers
export const commentQueryResolvers = {
  // Get comments with filters and pagination
  comments: async (
    _parent: unknown,
    args: {
      filters?: {
        parentId?: string;
        parentType?: string;
        userId?: string;
        search?: string;
      };
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { filters, pagination } = args;
    const limit = pagination?.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

    // Add a small delay to prevent overwhelming the database
    if (limit > API_CONFIG.pagination.DEFAULT_PAGE_SIZE) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const whereConditions = [];

    // Always filter out soft deleted comments
    whereConditions.push(isNull(comments.deleted_at));

    if (filters?.parentId) {
      whereConditions.push(eq(comments.parent_id, filters.parentId));
    }

    if (filters?.parentType) {
      whereConditions.push(eq(comments.parent_type, filters.parentType as 'GAME_LOG' | 'COMMENT'));
    }

    if (filters?.userId) {
      whereConditions.push(eq(comments.user_id, filters.userId));
    }

    if (filters?.search) {
      whereConditions.push(sql`${comments.content} ILIKE ${`%${filters.search}%`}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    try {
      // Get the paginated results
      const commentsData = await db()?.query.comments.findMany({
        where: whereClause,
        limit,
        orderBy: [desc(comments.created_at)],
        with: {
          user: true,
        },
      });

      // Get the total count for pagination
      const totalCountResult = await db()
        ?.select({ count: sql<number>`count(*)` })
        .from(comments)
        .where(whereClause ?? undefined);
      const totalCount = totalCountResult?.[0]?.count ?? 0;

      const edges =
        commentsData?.map(comment => ({
          cursor: comment.id,
          node: {
            id: comment.id,
            content: comment.content,
            user_id: comment.user_id,
            parent_id: comment.parent_id,
            parent_type: comment.parent_type,
            depth: comment.depth,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            deleted_at: comment.deleted_at,
            user: {
              id: comment.user?.id ?? '',
              username: comment.user?.username ?? '',
              first_name: comment.user?.first_name ?? '',
              last_name: comment.user?.last_name ?? '',
              email_address: null,
              phone_number: null,
              image_url: comment.user?.image_url ?? null,
            },
            reactions: [], // Reactions will be fetched separately via the reactions query
          },
        })) ?? [];

      return {
        edges,
        pageInfo: {
          hasNextPage: edges.length === limit,
          hasPreviousPage: false,
          startCursor: edges[0]?.cursor ?? null,
          endCursor: edges[edges.length - 1]?.cursor ?? null,
        },
        totalCount: totalCount,
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  },
};

// Comment Type Resolvers
export const commentResolver = {
  // Resolve childComments field for a comment
  childComments: async (
    parent: { id: string },
    args: {
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const limit = args.pagination?.first ?? API_CONFIG.pagination.DEFAULT_COMMENT_PAGE_SIZE;

    // Get child comments for this comment
    const childCommentsData = await db()?.query.comments.findMany({
      where: and(eq(comments.parent_id, parent.id), eq(comments.parent_type, 'COMMENT')),
      limit,
      orderBy: [desc(comments.created_at)],
      with: {
        user: true,
      },
    });

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(and(eq(comments.parent_id, parent.id), eq(comments.parent_type, 'COMMENT')));
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      childCommentsData?.map(comment => ({
        cursor: comment.id,
        node: {
          id: comment.id,
          content: comment.content,
          user_id: comment.user_id,
          parent_id: comment.parent_id,
          parent_type: comment.parent_type,
          depth: comment.depth,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          deleted_at: comment.deleted_at,
          user: {
            id: comment.user?.id ?? '',
            username: comment.user?.username ?? '',
            first_name: comment.user?.first_name ?? '',
            last_name: comment.user?.last_name ?? '',
            email_address: null,
            phone_number: null,
            image_url: comment.user?.image_url ?? null,
          },
          reactions: [], // Reactions will be fetched separately via the reactions query
        },
      })) ?? [];

    return {
      edges,
      pageInfo: {
        hasNextPage: edges.length === limit,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
      },
      totalCount: totalCount,
    };
  },

  // Resolve totalChildCommentCount field for a comment
  totalChildCommentCount: async (
    parent: { id: string },
    _args: unknown,
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const totalCountResult = await db()
        ?.select({ count: sql<number>`count(*)` })
        .from(comments)
        .where(and(eq(comments.parent_id, parent.id), eq(comments.parent_type, 'COMMENT')));

      return totalCountResult?.[0]?.count ?? 0;
    } catch (error) {
      console.error('Error fetching child comment count:', error);
      return 0;
    }
  },

  // Resolve totalReactionCount field for a comment
  totalReactionCount: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const totalCountResult = await db()
        ?.select({ count: sql<number>`count(*)` })
        .from(reactions)
        .where(
          and(
            eq(reactions.target_id, parent.id),
            eq(reactions.target_type, 'COMMENT'),
            isNull(reactions.deleted_at)
          )
        );

      return totalCountResult?.[0]?.count ?? 0;
    } catch (error) {
      console.error('Error fetching reaction count:', error);
      return 0;
    }
  },
};

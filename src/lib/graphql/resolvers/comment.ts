import { eq, and, desc, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { comments } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '@/lib/types/dbTypes';

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
    const limit = pagination?.first ?? 20;

    const whereConditions = [];

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

    const commentsData = await db()?.query.comments.findMany({
      where: whereClause,
      limit,
      orderBy: [desc(comments.created_at)],
      with: {
        user: true,
      },
    });

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
      totalCount: edges.length,
    };
  },
};

// Comment Type Resolvers
export const commentResolver = {
  // Add any comment-specific field resolvers here
};

import { eq, and, desc, sql, ilike } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import type { TARGET_TYPES } from '@/lib/constants';
import { db } from '@/lib/db';
import { publicComments, publicReactions } from '@/lib/db/schema';
import type { GraphQLContext } from '@/types';

// Public Comment Query Resolvers
export const publicCommentQueryResolvers = {
  // Get public comments with filters and pagination
  publicComments: async (
    _parent: unknown,
    args: {
      filters?: {
        parentId?: string;
        parentType?: string;
        userId?: string;
        anonymousName?: string;
        isApproved?: boolean;
        search?: string;
      };
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    _context: GraphQLContext
  ) => {
    const { filters, pagination } = args;
    const limit = pagination?.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

    const whereConditions = [];

    if (filters?.parentId) {
      whereConditions.push(eq(publicComments.parent_id, filters.parentId));
    }

    if (filters?.parentType) {
      whereConditions.push(
        eq(
          publicComments.parent_type,
          filters.parentType as (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES]
        )
      );
    }

    if (filters?.userId) {
      whereConditions.push(eq(publicComments.user_id, filters.userId));
    }

    if (filters?.anonymousName) {
      whereConditions.push(ilike(publicComments.anonymous_name, `%${filters.anonymousName}%`));
    }

    if (filters?.isApproved !== undefined) {
      whereConditions.push(eq(publicComments.is_approved, filters.isApproved));
    }

    if (filters?.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      whereConditions.push(ilike(publicComments.content, term));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const comments = await db()?.query.publicComments.findMany({
      where: whereClause,
      limit,
      orderBy: [desc(publicComments.created_at)],
      with: {
        user: true,
      },
    });

    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicComments)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      comments?.map(comment => ({
        cursor: comment.id,
        node: {
          id: comment.id,
          content: comment.content,
          user: comment.user
            ? {
                id: comment.user.id,
                username: comment.user.username,
                first_name: comment.user.first_name,
                last_name: comment.user.last_name,
                image_url: comment.user.image_url,
              }
            : null,
          user_id: comment.user_id,
          anonymous_name: comment.anonymous_name,
          anonymous_email: comment.anonymous_email,
          parent_id: comment.parent_id,
          parent_type: comment.parent_type,
          depth: comment.depth,
          is_approved: comment.is_approved,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          deleted_at: comment.deleted_at,
        },
      })) || [];

    return {
      edges,
      pageInfo: {
        hasNextPage: edges.length === limit,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: totalCount,
    };
  },
};

// Public Comment Type Resolvers
export const publicCommentResolver = {
  // Get child comments for a public comment
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
    _context: GraphQLContext
  ) => {
    const limit = args.pagination?.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

    const childComments = await db()?.query.publicComments.findMany({
      where: and(
        eq(publicComments.parent_id, parent.id),
        eq(publicComments.parent_type, 'COMMENT')
      ),
      limit,
      orderBy: [desc(publicComments.created_at)],
      with: {
        user: true,
      },
    });

    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicComments)
      .where(
        and(eq(publicComments.parent_id, parent.id), eq(publicComments.parent_type, 'COMMENT'))
      );
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      childComments?.map(comment => ({
        cursor: comment.id,
        node: {
          id: comment.id,
          content: comment.content,
          user: comment.user
            ? {
                id: comment.user.id,
                username: comment.user.username,
                first_name: comment.user.first_name,
                last_name: comment.user.last_name,
                image_url: comment.user.image_url,
              }
            : null,
          user_id: comment.user_id,
          anonymous_name: comment.anonymous_name,
          anonymous_email: comment.anonymous_email,
          parent_id: comment.parent_id,
          parent_type: comment.parent_type,
          depth: comment.depth,
          is_approved: comment.is_approved,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          deleted_at: comment.deleted_at,
        },
      })) || [];

    return {
      edges,
      pageInfo: {
        hasNextPage: edges.length === limit,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: totalCount,
    };
  },

  // Get total child comment count
  totalChildCommentCount: async (
    parent: { id: string },
    _args: unknown,
    _context: GraphQLContext
  ) => {
    const result = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicComments)
      .where(
        and(eq(publicComments.parent_id, parent.id), eq(publicComments.parent_type, 'COMMENT'))
      );
    return result?.[0]?.count ?? 0;
  },

  // Get reactions for a public comment
  reactions: async (parent: { id: string }, _args: unknown, _context: GraphQLContext) => {
    const reactions = await db()?.query.publicReactions.findMany({
      where: and(
        eq(publicReactions.target_id, parent.id),
        eq(publicReactions.target_type, 'COMMENT')
      ),
      with: {
        user: true,
      },
    });

    return (
      reactions?.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        user: reaction.user
          ? {
              id: reaction.user.id,
              username: reaction.user.username,
              first_name: reaction.user.first_name,
              last_name: reaction.user.last_name,
              image_url: reaction.user.image_url,
            }
          : null,
        user_id: reaction.user_id,
        anonymous_name: reaction.anonymous_name,
        anonymous_email: reaction.anonymous_email,
        target_id: reaction.target_id,
        target_type: reaction.target_type,
        is_approved: reaction.is_approved,
        created_at: reaction.created_at,
        updated_at: reaction.updated_at,
        deleted_at: reaction.deleted_at,
      })) || []
    );
  },

  // Get total reaction count
  totalReactionCount: async (parent: { id: string }, _args: unknown, _context: GraphQLContext) => {
    const result = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicReactions)
      .where(
        and(eq(publicReactions.target_id, parent.id), eq(publicReactions.target_type, 'COMMENT'))
      );
    return result?.[0]?.count ?? 0;
  },
};

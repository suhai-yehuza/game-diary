import { eq, and, sql, isNull, desc } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { comments, reactions } from '@/lib/db/schema';
import { type IEnhancedGraphQLContext } from '@/lib/graphql/dataloaders';
import { AuthorizationError } from '@/lib/graphql/errors';
import { mapUserForGraphQL } from '@/lib/graphql/resolvers/utils/user-mapping';
import { errorHandlers } from '@/lib/utils/error-handler';
import { generateUUIDv7 } from '@/lib/utils/id-generator';
import type { GraphQLContext, TARGET_TYPES } from '@/types';

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
      const commentsData =
        (await db()?.query.comments.findMany({
          where: whereClause,
          limit,
          orderBy: [desc(comments.created_at)],
          with: {
            user: true,
          },
        })) ?? [];

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
            user: comment.user
              ? {
                  ...mapUserForGraphQL(comment.user),
                  email_address: null,
                  phone_number: null,
                }
              : null,
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
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Fetch comments',
      });
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
    const childCommentsData =
      (await db()?.query.comments.findMany({
        where: and(eq(comments.parent_id, parent.id), eq(comments.parent_type, 'COMMENT')),
        limit,
        orderBy: [desc(comments.created_at)],
        with: {
          user: true,
        },
      })) ?? [];

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
          user: comment.user
            ? {
                ...mapUserForGraphQL(comment.user),
                email_address: null,
                phone_number: null,
                isAdmin: Array.isArray(comment.user)
                  ? (comment.user[0]?.isAdmin ?? false)
                  : (comment.user?.isAdmin ?? false), // Ensure isAdmin is always present
              }
            : null,
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
    context: IEnhancedGraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // If MOCK_MODE is enabled, return 0 for child comment count
    if (process.env.MOCK_MODE === 'true') {
      return 0;
    }

    // Use DataLoader for batch loading comment counts
    if (context.dataLoaders?.commentCountLoader) {
      return context.dataLoaders.commentCountLoader.load(parent.id);
    }

    // Fallback to direct query if DataLoader not available
    try {
      const database = db();
      if (!database) {
        return 0;
      }

      const totalCountResult = await database
        .select({ count: sql<number>`count(*)` })
        .from(comments)
        .where(and(eq(comments.parent_id, parent.id), eq(comments.parent_type, 'COMMENT')));

      return totalCountResult?.[0]?.count ?? 0;
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Fetch child comment count',
        timestamp: new Date().toISOString(),
      });
      return 0;
    }
  },

  // Resolve totalReactionCount field for a comment
  totalReactionCount: async (
    parent: { id: string },
    _args: unknown,
    context: IEnhancedGraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // If MOCK_MODE is enabled, return 0 for reaction count
    if (process.env.MOCK_MODE === 'true') {
      return 0;
    }

    // Use DataLoader for batch loading reaction counts
    if (context.dataLoaders?.reactionCountLoader) {
      return context.dataLoaders.reactionCountLoader.load(parent.id);
    }

    // Fallback to direct query if DataLoader not available
    try {
      const database = db();
      if (!database) {
        return 0;
      }

      const totalCountResult = await database
        .select({ count: sql<number>`count(*)` })
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
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Fetch reaction count',
        timestamp: new Date().toISOString(),
      });
      return 0;
    }
  },
};

// Comment Mutation Resolvers
export const commentMutationResolvers = {
  // Create a new comment
  createComment: async (
    _parent: unknown,
    args: {
      input: {
        content: string;
        parentId: string;
        parentType: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const commentId = generateUUIDv7();

      // Calculate depth based on parent type
      let depth = 0;
      if (args.input.parentType === 'COMMENT') {
        // If replying to a comment, get the parent comment's depth and add 1
        const parentComment = await db()?.query.comments.findFirst({
          where: eq(comments.id, args.input.parentId),
        });
        depth = (parentComment?.depth ?? 0) + 1;
      }

      await db()
        ?.insert(comments)
        .values({
          id: commentId,
          user_id: context.user.id,
          parent_id: args.input.parentId,
          parent_type: args.input.parentType as keyof typeof TARGET_TYPES,
          content: args.input.content,
          depth,
        })
        .returning();

      // Invalidate game logs cache to ensure UI updates
      try {
        const { simpleCacheService } = await import('@/lib/cache');
        simpleCacheService.invalidate({
          pattern: 'game-logs:*',
        });
        console.log('✅ Game logs cache invalidated after comment create');
      } catch (cacheError) {
        console.warn('⚠️ Failed to invalidate game logs cache:', cacheError);
      }

      // Also invalidate specific game log caches
      // Cache invalidation handled by Apollo Client's optimistic updates

      // Fetch the created comment with user data
      const createdComment = await db()?.query.comments.findFirst({
        where: eq(comments.id, commentId),
        with: {
          user: true,
        },
      });

      return {
        comment: createdComment
          ? {
              id: createdComment.id,
              content: createdComment.content,
              user_id: createdComment.user_id,
              parent_id: createdComment.parent_id,
              parent_type: createdComment.parent_type,
              depth: createdComment.depth,
              created_at: createdComment.created_at,
              updated_at: createdComment.updated_at,
              deleted_at: createdComment.deleted_at,
              user: createdComment.user
                ? {
                    ...mapUserForGraphQL(createdComment.user),
                    email_address: null,
                    phone_number: null,
                    isAdmin: false, // Default value since isAdmin is not available
                  }
                : null,
              reactions: [], // Reactions will be fetched separately via the reactions query
            }
          : null,
        errors: [],
      };
    } catch {
      return {
        comment: null,
        errors: [{ message: 'Failed to create comment', code: 'CREATE_COMMENT_ERROR' }],
      };
    }
  },

  // Update a comment
  updateComment: async (
    _parent: unknown,
    args: {
      id: string;
      input: {
        content: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      // Check if user owns the comment
      const existingComment = await db()?.query.comments.findFirst({
        where: eq(comments.id, args.id),
      });

      if (!existingComment || existingComment.user_id !== context.user.id) {
        throw new AuthorizationError('Access denied to this comment');
      }

      await db()
        ?.update(comments)
        .set({
          content: args.input.content,
          updated_at: new Date(),
        })
        .where(eq(comments.id, args.id))
        .returning();

      // Fetch the updated comment with user data
      const updatedCommentWithUser = await db()?.query.comments.findFirst({
        where: eq(comments.id, args.id),
        with: {
          user: true,
        },
      });

      return {
        comment: updatedCommentWithUser
          ? {
              id: updatedCommentWithUser.id,
              content: updatedCommentWithUser.content,
              user_id: updatedCommentWithUser.user_id,
              parent_id: updatedCommentWithUser.parent_id,
              parent_type: updatedCommentWithUser.parent_type,
              depth: updatedCommentWithUser.depth,
              created_at: updatedCommentWithUser.created_at,
              updated_at: updatedCommentWithUser.updated_at,
              deleted_at: updatedCommentWithUser.deleted_at,
              user: updatedCommentWithUser.user
                ? {
                    ...mapUserForGraphQL(updatedCommentWithUser.user),
                    email_address: null,
                    phone_number: null,
                    isAdmin: false, // Default value since isAdmin is not available
                  }
                : null,
              reactions: [], // Reactions will be fetched separately via the reactions query
            }
          : null,
        errors: [],
      };
    } catch {
      return {
        comment: null,
        errors: [{ message: 'Failed to update comment', code: 'UPDATE_COMMENT_ERROR' }],
      };
    }
  },

  // Delete a comment
  deleteComment: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      // Check if user owns the comment
      const existingComment = await db()?.query.comments.findFirst({
        where: eq(comments.id, args.id),
      });

      if (!existingComment || existingComment.user_id !== context.user.id) {
        throw new AuthorizationError('Access denied to this comment');
      }

      await db()?.delete(comments).where(eq(comments.id, args.id));

      // Invalidate game logs cache to ensure UI updates
      try {
        const { simpleCacheService } = await import('@/lib/cache');
        simpleCacheService.invalidate({
          pattern: 'game-logs:*',
        });
        console.log('✅ Game logs cache invalidated after comment delete');
      } catch (cacheError) {
        console.warn('⚠️ Failed to invalidate game logs cache:', cacheError);
      }

      // Also invalidate specific game log caches
      // Cache invalidation handled by Apollo Client's optimistic updates

      return {
        success: true,
        errors: [],
      };
    } catch {
      return {
        success: false,
        errors: [{ message: 'Failed to delete comment', code: 'DELETE_COMMENT_ERROR' }],
      };
    }
  },
};

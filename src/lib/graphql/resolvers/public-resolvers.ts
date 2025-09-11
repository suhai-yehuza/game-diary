import { randomBytes } from 'crypto';

import { eq, and, desc, sql, ilike, isNull } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import type { TARGET_TYPES } from '@/lib/constants';
import { db } from '@/lib/db';
import { publicComments, publicReactions, users } from '@/lib/db/schema';
import { AuthorizationError, NotFoundError, ValidationError } from '@/lib/graphql/errors';
import { mapUserForGraphQL } from '@/lib/graphql/resolvers/utils/user-mapping';
import { errorHandlers } from '@/lib/utils/error-handler';
import { generateRandomAnonymousName } from '@/lib/utils/random-names';
import type { GraphQLContext } from '@/types';

// Generate a unique identifier
function generateId(): string {
  return randomBytes(16).toString('hex');
}

// Helper function to fetch user data
async function fetchUserData(userId: string) {
  const userResult = await db()?.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return userResult
    ? {
        id: userResult.id,
        username: userResult.username,
        first_name: userResult.first_name,
        last_name: userResult.last_name,
        image_url: userResult.image_url,
      }
    : null;
}

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
          user: mapUserForGraphQL(comment.user),
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

// Public Reaction Query Resolvers
export const publicReactionQueryResolvers = {
  // Get public reactions for a specific target
  publicReactions: async (
    _parent: unknown,
    args: {
      targetId: string;
      targetType: string;
    },
    _context: GraphQLContext
  ) => {
    const { targetId, targetType } = args;

    const reactions = await db()?.query.publicReactions.findMany({
      where: and(
        eq(publicReactions.target_id, targetId),
        eq(
          publicReactions.target_type,
          targetType as (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES]
        )
      ),
      with: {
        user: true,
      },
    });

    return (
      reactions?.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        user: mapUserForGraphQL(reaction.user),
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
          user: mapUserForGraphQL(comment.user),
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
        user: mapUserForGraphQL(reaction.user),
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
        and(
          eq(publicReactions.target_id, parent.id),
          eq(publicReactions.target_type, 'COMMENT'),
          isNull(publicReactions.deleted_at) // Only count non-deleted reactions
        )
      );
    return result?.[0]?.count ?? 0;
  },
};

// Public Comment Mutation Resolvers
export const publicCommentMutationResolvers = {
  // Create an anonymous comment
  createPublicComment: async (
    _parent: unknown,
    args: {
      input: {
        content: string;
        parentId: string;
        parentType: string;
        anonymousName?: string;
        anonymousEmail?: string;
      };
    },
    context: GraphQLContext
  ) => {
    const { input } = args;
    const userId = context.user?.id;

    // Generate random anonymous name if user is not authenticated and no name provided
    let anonymousName = input.anonymousName?.trim();
    if (!userId && !anonymousName) {
      anonymousName = generateRandomAnonymousName({
        useBasketballTerms: true,
        includeNumbers: true,
        maxLength: 20,
      });
    }

    // Validate content
    if (!input.content?.trim()) {
      throw new ValidationError('Comment content is required');
    }

    const commentId = generateId();
    const now = new Date();

    const newComment = await db()
      ?.insert(publicComments)
      .values({
        id: commentId,
        user_id: userId || null,
        anonymous_name: anonymousName || null,
        anonymous_email: input.anonymousEmail?.trim() || null,
        parent_id: input.parentId,
        parent_type: input.parentType as (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES],
        content: input.content.trim(),
        depth: 0, // Top-level comment
        is_approved: true, // Auto-approve for now
        created_at: now,
        updated_at: now,
      })
      .returning();

    if (!newComment?.[0]) {
      errorHandlers.database('Failed to create comment', {
        component: 'createPublicComment',
        action: 'insert',
        userId,
      });
      throw new Error('Failed to create comment');
    }

    const comment = newComment[0];

    // Invalidate game logs cache to ensure UI updates
    try {
      const { simpleCacheService } = await import('@/lib/cache');
      simpleCacheService.invalidate({
        pattern: 'game-logs:*',
      });
      console.log('✅ Game logs cache invalidated after anonymous comment create');
    } catch (cacheError) {
      console.warn('⚠️ Failed to invalidate game logs cache:', cacheError);
    }

    // Fetch the user if authenticated
    let user = null;
    if (comment.user_id) {
      user = await fetchUserData(comment.user_id);
    }

    return {
      id: comment.id,
      content: comment.content,
      user,
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
    };
  },

  // Update an anonymous comment
  updatePublicComment: async (
    _parent: unknown,
    args: {
      id: string;
      input: {
        content: string;
      };
    },
    context: GraphQLContext
  ) => {
    const { id, input } = args;
    const userId = context.user?.id;

    // Validate content
    if (!input.content?.trim()) {
      throw new ValidationError('Comment content is required');
    }

    // Check if comment exists and user has permission to edit
    const existingComment = await db()?.query.publicComments.findFirst({
      where: eq(publicComments.id, id),
    });

    if (!existingComment) {
      throw new NotFoundError('Comment', id);
    }

    // Check permissions: user must be the author (authenticated user) or must be anonymous
    if (userId && existingComment.user_id !== userId) {
      errorHandlers.authentication('Permission denied for comment update', {
        component: 'updatePublicComment',
        action: 'update',
        userId,
      });
      throw new AuthorizationError('You do not have permission to edit this comment');
    }

    // For anonymous users, we can't verify identity, so we'll allow updates
    // In a real app, you might want to implement a token-based system for anonymous users
    if (!userId && existingComment.user_id) {
      errorHandlers.authentication('Anonymous user trying to edit authenticated comment', {
        component: 'updatePublicComment',
        action: 'update',
      });
      throw new AuthorizationError('You do not have permission to edit this comment');
    }

    const updatedComment = await db()
      ?.update(publicComments)
      .set({
        content: input.content.trim(),
        updated_at: new Date(),
      })
      .where(eq(publicComments.id, id))
      .returning();

    if (!updatedComment?.[0]) {
      errorHandlers.database('Failed to update comment', {
        component: 'updatePublicComment',
        action: 'update',
        userId,
      });
      throw new Error('Failed to update comment');
    }

    const comment = updatedComment[0];

    // Fetch the user if authenticated
    let user = null;
    if (comment.user_id) {
      user = await fetchUserData(comment.user_id);
    }

    return {
      id: comment.id,
      content: comment.content,
      user,
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
    };
  },

  // Delete an anonymous comment
  deletePublicComment: async (
    _parent: unknown,
    args: {
      id: string;
    },
    context: GraphQLContext
  ) => {
    const { id } = args;
    const userId = context.user?.id;

    // Check if comment exists and user has permission to delete
    const existingComment = await db()?.query.publicComments.findFirst({
      where: eq(publicComments.id, id),
    });

    if (!existingComment) {
      throw new NotFoundError('Comment', id);
    }

    // Check permissions: user must be the author (authenticated user) or anonymous name must match
    if (userId && existingComment.user_id !== userId) {
      errorHandlers.authentication('Permission denied for comment deletion', {
        component: 'deletePublicComment',
        action: 'delete',
        userId,
      });
      throw new AuthorizationError('You do not have permission to delete this comment');
    }

    if (!userId && existingComment.anonymous_name) {
      errorHandlers.authentication('Anonymous user trying to delete authenticated comment', {
        component: 'deletePublicComment',
        action: 'delete',
      });
      throw new AuthorizationError('You do not have permission to delete this comment');
    }

    await db()?.delete(publicComments).where(eq(publicComments.id, id));

    // Invalidate game logs cache to ensure UI updates
    try {
      const { simpleCacheService } = await import('@/lib/cache');
      simpleCacheService.invalidate({
        pattern: 'game-logs:*',
      });
      console.log('✅ Game logs cache invalidated after anonymous comment delete');
    } catch (cacheError) {
      console.warn('⚠️ Failed to invalidate game logs cache:', cacheError);
    }

    return {
      success: true,
    };
  },
};

// Public Reaction Mutation Resolvers
export const publicReactionMutationResolvers = {
  // Create an anonymous reaction
  createPublicReaction: async (
    _parent: unknown,
    args: {
      input: {
        emoji: string;
        targetId: string;
        targetType: string;
        anonymousName?: string;
        anonymousEmail?: string;
      };
    },
    context: GraphQLContext
  ) => {
    const { input } = args;
    const userId = context.user?.id;

    // Generate random anonymous name if user is not authenticated and no name provided
    let anonymousName = input.anonymousName?.trim();
    if (!userId && !anonymousName) {
      anonymousName = generateRandomAnonymousName({
        useBasketballTerms: true,
        includeNumbers: true,
        maxLength: 20,
      });
    }

    // Validate emoji
    if (!input.emoji?.trim()) {
      throw new ValidationError('Reaction emoji is required');
    }

    const reactionId = generateId();
    const now = new Date();

    const newReaction = await db()
      ?.insert(publicReactions)
      .values({
        id: reactionId,
        user_id: userId || null,
        anonymous_name: anonymousName || null,
        anonymous_email: input.anonymousEmail?.trim() || null,
        target_id: input.targetId,
        target_type: input.targetType as (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES],
        emoji: input.emoji.trim(),
        is_approved: true, // Auto-approve for now
        created_at: now,
        updated_at: now,
      })
      .returning();

    if (!newReaction?.[0]) {
      errorHandlers.database('Failed to create reaction', {
        component: 'createPublicReaction',
        action: 'insert',
        userId,
      });
      throw new Error('Failed to create reaction');
    }

    const reaction = newReaction[0];

    // Fetch the user if authenticated
    let user = null;
    if (reaction.user_id) {
      user = await fetchUserData(reaction.user_id);
    }

    // Invalidate game logs cache to ensure UI updates
    try {
      const { simpleCacheService } = await import('@/lib/cache');
      simpleCacheService.invalidate({
        pattern: 'game-logs:*',
      });
      console.log('✅ Game logs cache invalidated after anonymous reaction create');
    } catch (cacheError) {
      console.warn('⚠️ Failed to invalidate game logs cache:', cacheError);
    }

    return {
      id: reaction.id,
      emoji: reaction.emoji,
      user,
      user_id: reaction.user_id,
      anonymous_name: reaction.anonymous_name,
      anonymous_email: reaction.anonymous_email,
      target_id: reaction.target_id,
      target_type: reaction.target_type,
      is_approved: reaction.is_approved,
      created_at: reaction.created_at,
      updated_at: reaction.updated_at,
      deleted_at: reaction.deleted_at,
    };
  },

  // Delete an anonymous reaction
  deletePublicReaction: async (
    _parent: unknown,
    args: {
      id: string;
    },
    context: GraphQLContext
  ) => {
    const { id } = args;
    const userId = context.user?.id;

    // Check if reaction exists and user has permission to delete
    const existingReaction = await db()?.query.publicReactions.findFirst({
      where: eq(publicReactions.id, id),
    });

    if (!existingReaction) {
      throw new NotFoundError('Reaction', id);
    }

    // Check permissions: user must be the author (authenticated user) or anonymous name must match
    if (userId && existingReaction.user_id !== userId) {
      throw new AuthorizationError('You do not have permission to delete this reaction');
    }

    if (!userId && existingReaction.anonymous_name) {
      throw new AuthorizationError('You do not have permission to delete this reaction');
    }

    await db()?.delete(publicReactions).where(eq(publicReactions.id, id));

    // Invalidate game logs cache to ensure UI updates
    try {
      const { simpleCacheService } = await import('@/lib/cache');
      simpleCacheService.invalidate({
        pattern: 'game-logs:*',
      });
      console.log('✅ Game logs cache invalidated after anonymous reaction delete');
    } catch (cacheError) {
      console.warn('⚠️ Failed to invalidate game logs cache:', cacheError);
    }

    return {
      success: true,
    };
  },
};

// Legacy exports for backward compatibility
export const anonymousUserCommentMutationResolvers = publicCommentMutationResolvers;
export const anonymousUserReactionMutationResolvers = publicReactionMutationResolvers;

import { randomBytes } from 'crypto';

import { eq } from 'drizzle-orm';

import type { TARGET_TYPES } from '@/lib/constants';
import { db } from '@/lib/db';
import { publicComments, publicReactions, users } from '@/lib/db/schema';
import { AuthorizationError, NotFoundError, ValidationError } from '@/lib/graphql/errors';
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

// Public Comment Mutation Resolvers
export const publicCommentMutationResolvers = {
  // Create a public comment
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

  // Update a public comment
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

  // Delete a public comment
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

    return {
      success: true,
    };
  },
};

// Public Reaction Mutation Resolvers
export const publicReactionMutationResolvers = {
  // Create a public reaction
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
      const userResult = await db()?.query.users.findFirst({
        where: eq(users.id, reaction.user_id),
      });
      user = userResult
        ? {
            id: userResult.id,
            username: userResult.username,
            first_name: userResult.first_name,
            last_name: userResult.last_name,
            image_url: userResult.image_url,
          }
        : null;
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

  // Delete a public reaction
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

    return {
      success: true,
    };
  },
};

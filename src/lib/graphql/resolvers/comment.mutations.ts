import { eq, and, isNull } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import type { z } from 'zod';

import { logger } from '@lib/core/logger';
import { invalidateRelatedCaches } from '@src/lib/cache/index';
import { db } from '@src/lib/db';
import * as schema from '@src/lib/db/schema';
import {
  AuthenticationError,
  BusinessLogicError,
  NotFoundError,
  ValidationError,
} from '@src/lib/graphql/errors';
import type { IContext } from '@src/lib/types/component.types';
import type {
  MutationCreateCommentArgs,
  MutationUpdateCommentArgs,
  MutationDeleteCommentArgs,
} from '@src/lib/types/generated/graphql';
import { createCommentSchema, updateCommentSchema } from '@src/lib/validations/comment';

import { ensureUserExists } from './utils';

// Helper functions
const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message);
  }
  return result.data;
};

const checkAuth = (user: IContext['user']) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }
  return user;
};

const handleError = (error: unknown, operation: string) => {
  logger.error(`Error ${operation}:`, error);
  if (error instanceof GraphQLError) {
    throw error;
  }
  throw new BusinessLogicError(`Failed to ${operation}`, `${operation.toUpperCase()}_ERROR`);
};

// Helper to calculate comment depth
const getDepth = async (commentId: string, currentDepth = 0): Promise<number> => {
  const comments = await db
    .select()
    .from(schema.comments)
    .where(eq(schema.comments.id, commentId))
    .limit(1);

  const comment = comments[0];
  if (!comment) return currentDepth;

  if (!comment.parentId) return currentDepth;

  return getDepth(comment.parentId, currentDepth + 1);
};

// Comment Mutations
export const createComment = async (
  _parent: unknown,
  { input }: MutationCreateCommentArgs,
  context: IContext
) => {
  try {
    const user = checkAuth(context.user);

    // Ensure user exists in database
    const dbUser = await ensureUserExists(user);
    if (!dbUser) {
      throw new AuthenticationError('Failed to verify user');
    }

    // Validate input
    const validatedInput = validateInput(createCommentSchema, input);

    // Calculate depth if this is a reply
    let depth = 0;
    if (validatedInput.parentId) {
      depth = await getDepth(validatedInput.parentId);
      if (depth >= 3) {
        throw new BusinessLogicError(
          'Maximum comment depth reached. Cannot reply to this comment.',
          'MAX_DEPTH_REACHED'
        );
      }
    }

    // Create comment
    const [comment] = await db
      .insert(schema.comments)
      .values({
        userId: user.id,
        content: validatedInput.content,
        parentId: validatedInput.parentId,
        parentType: validatedInput.parentType,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Invalidate related caches
    if (context.redis) {
      await invalidateRelatedCaches(context.redis, 'user', user.id);
    }

    return { comment, errors: null };
  } catch (error) {
    return handleError(error, 'create comment');
  }
};

export const updateComment = async (
  _parent: unknown,
  { id, input }: MutationUpdateCommentArgs,
  context: IContext
) => {
  try {
    const user = checkAuth(context.user);

    // Validate input
    const validatedInput = validateInput(updateCommentSchema, input);

    // Check if comment exists and belongs to user
    const comments = await db
      .select()
      .from(schema.comments)
      .where(
        and(
          eq(schema.comments.id, id),
          eq(schema.comments.userId, user.id),
          isNull(schema.comments.deletedAt)
        )
      )
      .limit(1);

    const comment = comments[0];
    if (!comment) {
      throw new NotFoundError('Comment', id);
    }

    // Update comment
    const [updatedComment] = await db
      .update(schema.comments)
      .set({
        content: validatedInput.content,
        updatedAt: new Date(),
      })
      .where(eq(schema.comments.id, id))
      .returning();

    // Invalidate related caches
    if (context.redis) {
      await invalidateRelatedCaches(context.redis, 'user', user.id);
    }

    return { comment: updatedComment, errors: null };
  } catch (error) {
    return handleError(error, 'update comment');
  }
};

export const deleteComment = async (
  _parent: unknown,
  { id }: MutationDeleteCommentArgs,
  context: IContext
) => {
  try {
    const user = checkAuth(context.user);

    // Check if comment exists and belongs to user
    const comments = await db
      .select()
      .from(schema.comments)
      .where(
        and(
          eq(schema.comments.id, id),
          eq(schema.comments.userId, user.id),
          isNull(schema.comments.deletedAt)
        )
      )
      .limit(1);

    const comment = comments[0];
    if (!comment) {
      throw new NotFoundError('Comment', id);
    }

    // Soft delete comment
    await db
      .update(schema.comments)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.comments.id, id));

    // Invalidate related caches
    if (context.redis) {
      await invalidateRelatedCaches(context.redis, 'user', user.id);
    }

    return { success: true, errors: null };
  } catch (error) {
    return handleError(error, 'delete comment');
  }
};

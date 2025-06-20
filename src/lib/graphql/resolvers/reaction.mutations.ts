import { eq, and, isNull } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import type { z } from 'zod';

import { logger } from '@lib/core/logger';
import { invalidateRelatedCaches, getCache } from '@src/lib/cache';
import { db } from '@src/lib/db';
import * as schema from '@src/lib/db/schema';
import {
  AuthenticationError,
  BusinessLogicError,
  NotFoundError,
  ValidationError,
} from '@src/lib/graphql/errors';
import type {
  IContext,
  MutationCreateReactionArgs,
  MutationDeleteReactionArgs,
} from '@src/lib/types';
import { createReactionSchema } from '@src/lib/validations/reaction';

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

// Reaction Mutations
export const createReaction = async (
  _parent: unknown,
  { input }: MutationCreateReactionArgs,
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
    const validatedInput = validateInput(createReactionSchema, {
      ...input,
      targetType: input.targetType,
    });

    // Check if target exists
    const targetExists = await db
      .select()
      .from(validatedInput.targetType === 'game_log' ? schema.game_logs : schema.comments)
      .where(
        and(
          eq(
            validatedInput.targetType === 'game_log' ? schema.game_logs.id : schema.comments.id,
            validatedInput.targetId
          ),
          isNull(
            validatedInput.targetType === 'game_log'
              ? schema.game_logs.deletedAt
              : schema.comments.deletedAt
          )
        )
      )
      .limit(1);

    if (targetExists.length === 0) {
      throw new NotFoundError(
        validatedInput.targetType === 'game_log' ? 'GameLog' : 'Comment',
        validatedInput.targetId
      );
    }

    // Check if user already has a reaction for this target
    const existingReaction = await db
      .select()
      .from(schema.reactions)
      .where(
        and(
          eq(schema.reactions.userId, user.id),
          eq(schema.reactions.targetId, validatedInput.targetId),
          eq(schema.reactions.targetType, validatedInput.targetType)
        )
      )
      .limit(1);

    if (existingReaction.length > 0) {
      throw new BusinessLogicError(
        'You already have a reaction for this target. Each user can only have one reaction per target.',
        'DUPLICATE_REACTION'
      );
    }

    // Create reaction
    const [reaction] = await db
      .insert(schema.reactions)
      .values({
        userId: user.id,
        emoji: validatedInput.emoji,
        targetId: validatedInput.targetId,
        targetType: validatedInput.targetType,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Invalidate related caches
    if (context.redis) {
      const cache = getCache();
      await cache.initializeRedis();
      await invalidateRelatedCaches(
        cache,
        validatedInput.targetType === 'game_log' ? 'game_log' : 'user',
        validatedInput.targetId
      );
    }

    return { reaction, errors: null };
  } catch (error) {
    return handleError(error, 'create reaction');
  }
};

export const deleteReaction = async (
  _parent: unknown,
  { id }: MutationDeleteReactionArgs,
  context: IContext
) => {
  try {
    const user = checkAuth(context.user);

    // Check if reaction exists and belongs to user
    const reactions = await db
      .select()
      .from(schema.reactions)
      .where(and(eq(schema.reactions.id, id), eq(schema.reactions.userId, user.id)))
      .limit(1);

    const reaction = reactions[0];
    if (!reaction) {
      throw new NotFoundError('Reaction', id);
    }

    // Delete reaction
    await db.delete(schema.reactions).where(eq(schema.reactions.id, id));

    // Invalidate related caches
    if (context.redis) {
      const cache = getCache();
      await cache.initializeRedis();
      await invalidateRelatedCaches(
        cache,
        reaction.targetType === 'game_log' ? 'game_log' : 'user',
        reaction.targetId
      );
    }

    return { success: true, errors: null };
  } catch (error) {
    return handleError(error, 'delete reaction');
  }
};

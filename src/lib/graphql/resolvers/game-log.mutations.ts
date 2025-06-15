import { eq, and, isNull } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import type { z } from 'zod';

import { logger } from '@lib/core/logger';
import { invalidateRelatedCaches } from '@src/lib/cache';
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
  MutationCreateGameLogArgs,
  MutationUpdateGameLogArgs,
  MutationDeleteGameLogArgs,
} from '@src/lib/types/generated/graphql';
import { createGameLogSchema, updateGameLogSchema } from '@src/lib/validations/game-log';

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

// Game Log Mutations
export const createGameLog = async (
  _parent: unknown,
  { input }: MutationCreateGameLogArgs,
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
    const validatedInput = validateInput(createGameLogSchema, input);

    // Validate game exists
    const games = await db
      .select()
      .from(schema.nba_games)
      .where(eq(schema.nba_games.id, validatedInput.gameId))
      .limit(1);
    const game = games[0];

    if (!game) {
      throw new NotFoundError('Game', validatedInput.gameId);
    }

    // Ensure watchedDate is a proper Date object
    const watchedDate =
      validatedInput.watchedDate instanceof Date
        ? validatedInput.watchedDate
        : new Date(validatedInput.watchedDate);

    // Check if user already has a game log for this game
    const existingGameLog = await db
      .select()
      .from(schema.game_logs)
      .where(
        and(
          eq(schema.game_logs.userId, user.id),
          eq(schema.game_logs.gameId, validatedInput.gameId)
        )
      )
      .limit(1);

    if (existingGameLog.length > 0) {
      throw new BusinessLogicError(
        'You already have a game log for this game. Each user can only create one game log per game.',
        'DUPLICATE_GAME_LOG'
      );
    }

    // Create game log
    const [gameLog] = await db
      .insert(schema.game_logs)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        gameId: validatedInput.gameId,
        ratingForGame: validatedInput.ratingForGame,
        notes: validatedInput.notes,
        tags: validatedInput.tags,
        watchedDate,
        watchedSetting: validatedInput.watchedSetting,
        watchedLocation: validatedInput.watchedLocation,
        watchedScope: validatedInput.watchedScope,
        classification: validatedInput.classification,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Invalidate related caches
    if (context.redis) {
      await invalidateRelatedCaches(context.redis, 'game_log', validatedInput.gameId);
    }

    return { gameLog, errors: null };
  } catch (error) {
    return handleError(error, 'create game log');
  }
};

export const updateGameLog = async (
  _parent: unknown,
  { id, input }: MutationUpdateGameLogArgs,
  context: IContext
) => {
  try {
    const user = checkAuth(context.user);

    // Validate input
    const validatedInput = validateInput(updateGameLogSchema, input);

    // Check if game log exists and belongs to user
    const gameLogs = await db
      .select()
      .from(schema.game_logs)
      .where(
        and(
          eq(schema.game_logs.id, id),
          eq(schema.game_logs.userId, user.id),
          isNull(schema.game_logs.deletedAt)
        )
      )
      .limit(1);

    const gameLog = gameLogs[0];
    if (!gameLog) {
      throw new NotFoundError('GameLog', id);
    }

    // Update game log
    const [updatedGameLog] = await db
      .update(schema.game_logs)
      .set({
        ratingForGame: validatedInput.ratingForGame ?? gameLog.ratingForGame,
        notes: validatedInput.notes ?? gameLog.notes,
        tags: validatedInput.tags ?? gameLog.tags,
        watchedDate: validatedInput.watchedDate
          ? new Date(validatedInput.watchedDate)
          : gameLog.watchedDate,
        watchedSetting: validatedInput.watchedSetting ?? gameLog.watchedSetting,
        watchedLocation: validatedInput.watchedLocation ?? gameLog.watchedLocation,
        watchedScope: validatedInput.watchedScope ?? gameLog.watchedScope,
        classification: validatedInput.classification ?? gameLog.classification,
        updatedAt: new Date(),
      })
      .where(eq(schema.game_logs.id, id))
      .returning();

    // Invalidate related caches
    if (context.redis) {
      await invalidateRelatedCaches(context.redis, 'game_log', gameLog.gameId);
    }

    return { gameLog: updatedGameLog, errors: null };
  } catch (error) {
    return handleError(error, 'update game log');
  }
};

export const deleteGameLog = async (
  _parent: unknown,
  { id }: MutationDeleteGameLogArgs,
  context: IContext
) => {
  try {
    const user = checkAuth(context.user);

    // Check if game log exists and belongs to user
    const gameLogs = await db
      .select()
      .from(schema.game_logs)
      .where(
        and(
          eq(schema.game_logs.id, id),
          eq(schema.game_logs.userId, user.id),
          isNull(schema.game_logs.deletedAt)
        )
      )
      .limit(1);

    const gameLog = gameLogs[0];
    if (!gameLog) {
      throw new NotFoundError('GameLog', id);
    }

    // Soft delete game log
    await db
      .update(schema.game_logs)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.game_logs.id, id));

    // Invalidate related caches
    if (context.redis) {
      await invalidateRelatedCaches(context.redis, 'game_log', gameLog.gameId);
    }

    return { success: true, errors: null };
  } catch (error) {
    return handleError(error, 'delete game log');
  }
};

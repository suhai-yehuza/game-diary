import { eq, and } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

import { getCache, invalidateRelatedCaches } from '@/lib/cache';
import { db } from '@/lib/db';
import { schema, comments } from '@/lib/db/schema';
import { Context } from '@/lib/graphql/context';
import {
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  ForeignKeyViolationError,
  NotFoundError,
  ValidationError,
} from '@/lib/graphql/errors';
import { transformUser } from '@/lib/graphql/resolvers/transformers';
import { mapUserData } from '@/lib/graphql/resolvers/users/index';
import { WatchedSettingValue, REACTION_EMOJIS, ReactionEmojiKey } from '@/lib/types/config.types';
import {
  Friendship,
  MutationcreateGameLogArgs,
  MutationupdateGameLogArgs,
  MutationdeleteGameLogArgs,
  MutationcreateCommentArgs,
  MutationupdateCommentArgs,
  MutationdeleteCommentArgs,
  MutationcreateReactionArgs,
  MutationdeleteReactionArgs,
  User as DBUser,
  ParentType,
  Classification,
  ReactionEmojiType,
} from '@/lib/types/generated/graphql';
import type { SendFriendRequestInput } from '@/lib/types/graphql.types';
import { generateUUID } from '@/lib/utils/index.processing';
import { createCommentSchema } from '@/lib/validations/comment';
import { sendFriendRequestSchema } from '@/lib/validations/friendship';
import { gameTypeEnum, gameLogInputSchema } from '@/lib/validations/game';

// Define the actual comments table structure to match the database
const actualCommentsTable = pgTable('comments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }),
  content: text('content').notNull(),
  targetId: varchar('targetId', { length: 255 }).notNull(),
  targetType: varchar('targetType', { length: 50 }).notNull(),
  parentId: varchar('parentId', { length: 255 }),
  parentType: varchar('parentType', { length: 50 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
});

// Define the actual reactions table structure to match the database
const actualReactionsTable = pgTable('reactions', {
  id: text('id').primaryKey(),
  userId: text('userId'),
  targetId: text('targetId').notNull(),
  targetType: varchar('targetType', { length: 50 }).notNull(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Helper functions
const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message);
  }
  return result.data;
};

const checkAuth = (user: Context['user']) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }
  return user;
};

const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  if (error instanceof GraphQLError) {
    throw error;
  }
  throw new BusinessLogicError(`Failed to ${operation}`, `${operation.toUpperCase()}_ERROR`);
};

function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// Helper to map ReactionEmojiType to emoji
const REACTION_EMOJI_MAP: Record<string, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  LAUGH: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😠',
  FIRE: '🔥',
  CLAP: '👏',
  EYES: '👀',
  ROCKET: '🚀',
  MUSCLE: '💪',
  GOAT: '🐐',
  BULLSEYE: '🎯',
  THUMBS_DOWN: '👎',
  BASKETBALL: '🏀',
  SOCCER: '⚽',
  FOOTBALL: '🏈',
  BASEBALL: '⚾',
  TENNIS: '🎾',
  GOLF: '⛳',
};

// Helper to fetch full user from DB
async function getFullUser(db: typeof import('@/lib/db').db, userId: string) {
  return db.query.users.findFirst({ where: eq(schema.users.id, userId) });
}

// Game Log Mutations
export const createGameLog = async (
  _parent: unknown,
  { input }: MutationcreateGameLogArgs,
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    const validatedInput = validateInput(gameLogInputSchema, input);

    // Fetch the full user data from the database
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.id, user.id),
    });

    if (!dbUser) {
      throw new NotFoundError('User', user.id);
    }

    // Validate game exists and is accessible
    const game = await db.query.nba_games.findFirst({
      where: eq(schema.nba_games.id, validatedInput.gameId),
    });

    if (!game) {
      throw new NotFoundError('Game', validatedInput.gameId);
    }

    // Validate game type
    try {
      const gameWithType = { ...game, gameType: 'nba' };
      gameTypeEnum.parse(gameWithType.gameType);
    } catch (error) {
      console.log('Error parsing game type:', error);
      throw new BusinessLogicError('Game type nba is not supported', 'UNSUPPORTED_GAME_TYPE');
    }

    try {
      const [gameLog] = await db
        .insert(schema.game_logs)
        .values({
          userId: user.id,
          gameId: validatedInput.gameId,
          watchedSetting: validatedInput.watchedSetting as WatchedSettingValue,
          watchedDate: validatedInput.watchedDate || new Date(),
          watchedLocation: validatedInput.watchedLocation || '',
          ratingForGame: validatedInput.ratingForGame || 0,
          ratingStars: validatedInput.ratingStars?.toString() || '',
          watchedCount: validatedInput.watchedCount || 0,
          notes: validatedInput.notes || '',
          tags: validatedInput.tags || [],
          classification: validatedInput.classification || 'protected',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Invalidate related caches
      if (context.redis) {
        const cache = getCache();
        await cache.initializeRedis();
        await invalidateRelatedCaches(cache, 'game_log', gameLog.id, {
          playerId: nullToUndefined(gameLog.userId),
        });
      }

      // Fetch the related game from the DB with proper type checking
      const nbaGame = await db.query.nba_games.findFirst({
        where: (nba_games, { eq }) => eq(nba_games.id, gameLog.gameId),
      });

      if (!nbaGame) {
        throw new NotFoundError('Game', gameLog.gameId);
      }

      // Type-safe team ID extraction
      const teams = nbaGame.teams || {};
      const homeTeamId =
        typeof teams === 'object' &&
        teams !== null &&
        'home' in teams &&
        teams.home &&
        typeof teams.home === 'object' &&
        'id' in teams.home
          ? teams.home.id
          : null;
      const awayTeamId =
        typeof teams === 'object' &&
        teams !== null &&
        'visitors' in teams &&
        teams.visitors &&
        typeof teams.visitors === 'object' &&
        'id' in teams.visitors
          ? teams.visitors.id
          : null;

      // Validate team IDs
      if (!homeTeamId || !awayTeamId) {
        throw new BusinessLogicError('Game is missing team information', 'INVALID_GAME_DATA');
      }

      const mappedGame = {
        id: nbaGame.id,
        date:
          typeof nbaGame.date === 'string'
            ? nbaGame.date
            : nbaGame.date instanceof Date
              ? nbaGame.date.toISOString()
              : '',
        status: typeof nbaGame.status === 'string' ? nbaGame.status : String(nbaGame.status ?? ''),
        arena: typeof nbaGame.arena === 'string' ? nbaGame.arena : String(nbaGame.arena ?? ''),
        league: typeof nbaGame.league === 'string' ? nbaGame.league : String(nbaGame.league ?? ''),
        season: typeof nbaGame.season === 'number' ? nbaGame.season : Number(nbaGame.season ?? 0),
        stage: typeof nbaGame.stage === 'number' ? nbaGame.stage : Number(nbaGame.stage ?? 0),
        periods: nbaGame.periods ?? [],
        scores: nbaGame.scores ?? [],
        officials: Array.isArray(nbaGame.officials) ? nbaGame.officials.map(String) : [],
        timesTied: typeof nbaGame.timesTied === 'number' ? nbaGame.timesTied : null,
        leadChanges: typeof nbaGame.leadChanges === 'number' ? nbaGame.leadChanges : null,
        nugget: typeof nbaGame.nugget === 'string' ? nbaGame.nugget : null,
        createdAt:
          typeof nbaGame.createdAt === 'string'
            ? nbaGame.createdAt
            : nbaGame.createdAt instanceof Date
              ? nbaGame.createdAt.toISOString()
              : '',
        updatedAt:
          typeof nbaGame.updatedAt === 'string'
            ? nbaGame.updatedAt
            : nbaGame.updatedAt instanceof Date
              ? nbaGame.updatedAt.toISOString()
              : '',
        homeTeamId:
          typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
        awayTeamId:
          typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
        teams,
        isCompleted: nbaGame.status?.long === 'Finished',
      };

      return {
        gameLog: {
          id: gameLog.id,
          gameId: gameLog.gameId,
          userId: gameLog.userId || '',
          game: mappedGame,
          user: transformUser({
            id: dbUser.id,
            username: dbUser.username,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
            emailAddress: dbUser.emailAddress,
            imageUrl: dbUser.imageUrl,
            createdAt: dbUser.createdAt,
            updatedAt: dbUser.updatedAt,
          } as DBUser),
          classification: gameLog.classification as Classification,
          notes: gameLog.notes || undefined,
          rating: gameLog.ratingForGame,
          ratingStars: gameLog.ratingStars ? parseInt(gameLog.ratingStars) : undefined,
          tags: gameLog.tags || [],
          watchedCount: gameLog.watchedCount,
          watchedDate: gameLog.watchedDate,
          watchedLocation: gameLog.watchedLocation || undefined,
          watchedSetting: gameLog.watchedSetting as WatchedSettingValue,
          createdAt: gameLog.createdAt,
          updatedAt: gameLog.updatedAt,
        },
      };
    } catch (error) {
      handleError(error, 'create game log');
    }
  } catch (error) {
    handleError(error, 'create game log');
  }
};

export const updateGameLog = async (
  _parent: unknown,
  { id, input }: MutationupdateGameLogArgs,
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    const validatedInput = validateInput(gameLogInputSchema, input);

    // Fetch the game log
    const gameLog = await db.query.game_logs.findFirst({
      where: eq(schema.game_logs.id, id),
    });

    if (!gameLog) {
      throw new NotFoundError('GameLog', id);
    }

    // Check ownership
    if (gameLog.userId !== user.id) {
      throw new AuthorizationError('Not authorized to update this game log');
    }

    // Update the game log
    const [updatedGameLog] = await db
      .update(schema.game_logs)
      .set({
        watchedSetting: validatedInput.watchedSetting as WatchedSettingValue,
        watchedDate: validatedInput.watchedDate || new Date(),
        watchedLocation: validatedInput.watchedLocation || '',
        ratingForGame: validatedInput.ratingForGame || 0,
        ratingStars: validatedInput.ratingStars?.toString() || '',
        watchedCount: validatedInput.watchedCount || 0,
        notes: validatedInput.notes || '',
        tags: validatedInput.tags || [],
        classification: validatedInput.classification || 'protected',
        updatedAt: new Date(),
      })
      .where(eq(schema.game_logs.id, id))
      .returning();

    // Invalidate related caches
    if (context.redis) {
      const cache = getCache();
      await cache.initializeRedis();
      await invalidateRelatedCaches(cache, 'game_log', updatedGameLog.id, {
        playerId: nullToUndefined(updatedGameLog.userId),
      });
    }

    return {
      gameLog: {
        id: updatedGameLog.id,
        gameId: updatedGameLog.gameId,
        userId: updatedGameLog.userId || '',
        classification: updatedGameLog.classification as Classification,
        notes: updatedGameLog.notes || undefined,
        rating: updatedGameLog.ratingForGame,
        ratingStars: updatedGameLog.ratingStars ? parseInt(updatedGameLog.ratingStars) : undefined,
        tags: updatedGameLog.tags || [],
        watchedCount: updatedGameLog.watchedCount,
        watchedDate: updatedGameLog.watchedDate,
        watchedLocation: updatedGameLog.watchedLocation || undefined,
        watchedSetting: updatedGameLog.watchedSetting as WatchedSettingValue,
        createdAt: updatedGameLog.createdAt,
        updatedAt: updatedGameLog.updatedAt,
      },
    };
  } catch (error) {
    handleError(error, 'update game log');
  }
};

export const deleteGameLog = async (
  _parent: unknown,
  { id }: MutationdeleteGameLogArgs,
  { user, redis }: Context
) => {
  try {
    const gameLog = await db.query.game_logs.findFirst({
      where: eq(schema.game_logs.id, id),
    });

    if (!gameLog) {
      throw new NotFoundError('GameLog', id);
    }

    // Check ownership
    if (gameLog.userId !== user?.id) {
      throw new AuthorizationError('Not authorized to delete this game log');
    }

    // Delete the game log
    await db.delete(schema.game_logs).where(eq(schema.game_logs.id, id));

    // Invalidate related caches
    if (redis) {
      const cache = getCache();
      await cache.initializeRedis();
      await invalidateRelatedCaches(cache, 'game_log', id, {
        playerId: nullToUndefined(gameLog.userId),
      });
    }

    return { success: true };
  } catch (error) {
    handleError(error, 'delete game log');
  }
};

// Comment Mutations
export const createComment = async (
  _parent: unknown,
  { input }: MutationcreateCommentArgs,
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    const validatedInput = validateInput(createCommentSchema, input);
    const [comment] = await db
      .insert(actualCommentsTable)
      .values({
        id: generateUUID(),
        userId: user.id,
        content: validatedInput.content,
        targetId: validatedInput.parentId,
        targetType: validatedInput.parentType,
        parentId: validatedInput.parentId,
        parentType: validatedInput.parentType,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    const fullUser = await getFullUser(db, user.id);
    return {
      comment: {
        id: comment.id,
        content: comment.content,
        userId: comment.userId || '',
        targetId: comment.parentId,
        targetType: comment.parentType as ParentType,
        parentId: comment.parentId || '',
        parentType: comment.parentType as ParentType,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        user: fullUser ? transformUser(mapUserData(fullUser)) : null,
        reactions: [],
      },
    };
  } catch (error) {
    handleError(error, 'create comment');
  }
};

export const updateComment = async (
  _parent: unknown,
  { id, input }: MutationupdateCommentArgs,
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    const validatedInput = validateInput(createCommentSchema, input);
    // Fetch the comment
    const comment = await db.query.comments.findFirst({
      where: eq(schema.comments.id, id),
    });
    if (!comment) {
      throw new NotFoundError('Comment', id);
    }
    // Check ownership
    if (comment.userId !== user.id) {
      throw new AuthorizationError('Not authorized to update this comment');
    }
    // Update the comment
    const [updatedComment] = await db
      .update(schema.comments)
      .set({
        content: validatedInput.content,
        updatedAt: new Date(),
      })
      .where(eq(schema.comments.id, id))
      .returning();
    const fullUser = await getFullUser(db, user.id);
    return {
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        userId: updatedComment.userId || '',
        targetId: updatedComment.parentId,
        targetType: updatedComment.parentType as ParentType,
        parentId: updatedComment.parentId || '',
        parentType: updatedComment.parentType as ParentType,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        deletedAt: updatedComment.deletedAt,
        user: fullUser ? transformUser(mapUserData(fullUser)) : null,
        reactions: [],
      },
    };
  } catch (error) {
    handleError(error, 'update comment');
  }
};

export const deleteComment = async (
  _parent: unknown,
  { id }: MutationdeleteCommentArgs,
  { user }: Context
) => {
  try {
    const comment = await db.query.comments.findFirst({
      where: eq(schema.comments.id, id),
    });

    if (!comment) {
      throw new NotFoundError('Comment', id);
    }

    // Check ownership
    if (comment.userId !== user?.id) {
      throw new AuthorizationError('Not authorized to delete this comment');
    }

    // Delete the comment
    await db.delete(schema.comments).where(eq(schema.comments.id, id));

    return { success: true };
  } catch (error) {
    handleError(error, 'delete comment');
  }
};

// Reaction Mutations
export const createReaction = async (
  _parent: unknown,
  { input }: MutationcreateReactionArgs,
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    if (!(input.emoji in REACTION_EMOJIS)) {
      throw new ValidationError('Invalid emoji');
    }
    const existingReaction = await db.query.reactions.findFirst({
      where: and(
        eq(schema.reactions.userId, user.id),
        eq(schema.reactions.targetId, input.targetId),
        eq(schema.reactions.targetType, input.targetType)
      ),
    });
    if (existingReaction) {
      throw new BusinessLogicError('Reaction already exists', 'DUPLICATE_REACTION');
    }
    const emoji = REACTION_EMOJIS[input.emoji as ReactionEmojiKey];
    const [reaction] = await db
      .insert(schema.reactions)
      .values({
        id: generateUUID(),
        userId: user.id,
        targetId: input.targetId,
        targetType: input.targetType,
        emoji,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    const fullUser = await getFullUser(db, user.id);
    return {
      reaction: {
        id: reaction.id,
        emoji: reaction.emoji as ReactionEmojiType,
        userId: reaction.userId || '',
        targetId: reaction.targetId,
        targetType: reaction.targetType as ParentType,
        createdAt: reaction.createdAt,
        updatedAt: reaction.updatedAt,
        user: fullUser ? transformUser(mapUserData(fullUser)) : null,
      },
    };
  } catch (error) {
    handleError(error, 'create reaction');
  }
};

export const deleteReaction = async (
  _parent: unknown,
  { id }: MutationdeleteReactionArgs,
  context: Context
) => {
  try {
    const user = checkAuth(context.user);

    // Fetch the reaction
    const reaction = await db.query.reactions.findFirst({
      where: eq(schema.reactions.id, id),
    });

    if (!reaction) {
      throw new NotFoundError('Reaction', id);
    }

    // Check ownership
    if (reaction.userId !== user.id) {
      throw new AuthorizationError('Not authorized to delete this reaction');
    }

    // Delete the reaction
    await db.delete(schema.reactions).where(eq(schema.reactions.id, id));

    return { success: true };
  } catch (error) {
    handleError(error, 'delete reaction');
  }
};

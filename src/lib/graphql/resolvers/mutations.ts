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
  BusinessLogicError,
  ForeignKeyViolationError,
  NotFoundError,
  ValidationError,
} from '@/lib/graphql/errors';
import { transformUser } from '@/lib/graphql/resolvers/transformers';
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
          ratingForGame: gameLog.ratingForGame,
          ratingStars: gameLog.ratingStars ? parseInt(gameLog.ratingStars) : undefined,
          tags: gameLog.tags || [],
          watchedDate: gameLog.watchedDate,
          watchedLocation: gameLog.watchedLocation || undefined,
          watchedCount: gameLog.watchedCount,
          watchedSetting: gameLog.watchedSetting,
          comments: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
          reactions: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
          createdAt: gameLog.createdAt,
          updatedAt: gameLog.updatedAt,
          deletedAt: gameLog.deletedAt || null,
        },
        errors: [],
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('foreign key')) {
        throw new ForeignKeyViolationError(
          'Invalid game or user reference',
          'game_logs',
          error.message.includes('userId') ? 'userId' : 'gameId'
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in mutation:', error);
    throw new BusinessLogicError('Failed to perform mutation', 'MUTATION_ERROR');
  }
};

export const updateGameLog = async (
  _parent: unknown,
  { id, input }: MutationupdateGameLogArgs,
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    const validatedInput = validateInput(gameLogInputSchema.partial(), input);

    const existingLog = await db.query.game_logs.findFirst({
      where: and(eq(schema.game_logs.id, id), eq(schema.game_logs.userId, user.id)),
    });

    if (!existingLog) {
      throw new NotFoundError('GameLog', id);
    }

    const [updatedLog] = await db
      .update(schema.game_logs)
      .set({
        watchedSetting: validatedInput.watchedSetting
          ? (validatedInput.watchedSetting as WatchedSettingValue)
          : undefined,
        watchedDate: validatedInput.watchedDate || existingLog.watchedDate,
        watchedLocation: validatedInput.watchedLocation || existingLog.watchedLocation,
        ratingForGame: validatedInput.ratingForGame ?? existingLog.ratingForGame,
        ratingStars: validatedInput.ratingStars?.toString() || existingLog.ratingStars,
        watchedCount: validatedInput.watchedCount ?? existingLog.watchedCount,
        notes: validatedInput.notes || existingLog.notes,
        tags: validatedInput.tags || existingLog.tags || [],
        classification: validatedInput.classification || existingLog.classification,
        updatedAt: new Date(),
      })
      .where(eq(schema.game_logs.id, id))
      .returning();

    // Invalidate related caches
    if (context.redis) {
      const cache = getCache();
      await cache.initializeRedis();
      await invalidateRelatedCaches(cache, 'game_log', updatedLog.id, {
        playerId: nullToUndefined(updatedLog.userId),
      });
    }

    // Fetch the related game from the DB
    const game = await db.query.nba_games.findFirst({
      where: (nba_games, { eq }) => eq(nba_games.id, updatedLog.gameId),
    });
    if (!game) {
      throw new NotFoundError('Game', updatedLog.gameId);
    }
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.id, updatedLog.userId ?? user.id),
    });
    if (!dbUser) {
      throw new NotFoundError('User', updatedLog.userId ?? user.id);
    }
    const teams = game.teams || {};
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
    const mappedGame = {
      id: game.id,
      date:
        typeof game.date === 'string'
          ? game.date
          : game.date instanceof Date
            ? game.date.toISOString()
            : '',
      status: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
      arena: typeof game.arena === 'string' ? game.arena : String(game.arena ?? ''),
      league: typeof game.league === 'string' ? game.league : String(game.league ?? ''),
      season: typeof game.season === 'number' ? game.season : Number(game.season ?? 0),
      stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
      periods: game.periods ?? [],
      scores: game.scores ?? [],
      officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
      timesTied: typeof game.timesTied === 'number' ? game.timesTied : null,
      leadChanges: typeof game.leadChanges === 'number' ? game.leadChanges : null,
      nugget: typeof game.nugget === 'string' ? game.nugget : null,
      createdAt:
        typeof game.createdAt === 'string'
          ? game.createdAt
          : game.createdAt instanceof Date
            ? game.createdAt.toISOString()
            : '',
      updatedAt:
        typeof game.updatedAt === 'string'
          ? game.updatedAt
          : game.updatedAt instanceof Date
            ? game.updatedAt.toISOString()
            : '',
      homeTeamId:
        typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
      awayTeamId:
        typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
      teams,
      isCompleted: game.status?.long === 'Finished',
    };

    return {
      gameLog: {
        id: updatedLog.id,
        userId: updatedLog.userId ?? '',
        gameId: updatedLog.gameId,
        watchedSetting: updatedLog.watchedSetting as WatchedSettingValue,
        watchedDate: updatedLog.watchedDate,
        watchedLocation: updatedLog.watchedLocation,
        rating: updatedLog.ratingForGame,
        ratingStars: updatedLog.ratingStars,
        watchedCount: updatedLog.watchedCount,
        notes: updatedLog.notes,
        classification: updatedLog.classification,
        createdAt: updatedLog.createdAt,
        updatedAt: updatedLog.updatedAt,
        deletedAt: updatedLog.deletedAt,
        tags: updatedLog.tags,
        game: mappedGame,
        user: {
          id: dbUser.id,
          username: dbUser.username,
          emailAddress: dbUser.emailAddress,
          imageUrl: dbUser.imageUrl,
          initiated_friendships: [],
          received_friendships: [],
          gameLogs: [],
          comments: [],
          reactions: [],
        },
        comments: [],
        reactions: [],
      },
      errors: [],
    };
  } catch (error) {
    handleError(error, 'update game log');
    return {
      gameLog: null,
      errors: [
        {
          message: 'Failed to update game log',
          code: 'UPDATE_GAME_LOG_ERROR',
        },
      ],
    };
  }
};

export const deleteGameLog = async (
  _parent: unknown,
  { id }: MutationdeleteGameLogArgs,
  { user, redis }: Context
) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }

  try {
    const existingLog = await db.query.game_logs.findFirst({
      where: and(eq(schema.game_logs.id, id), eq(schema.game_logs.userId, user.id)),
    });

    if (!existingLog) {
      throw new NotFoundError('GameLog', id);
    }

    await db.delete(schema.game_logs).where(eq(schema.game_logs.id, id));

    // Invalidate related caches
    if (redis) {
      const cache = getCache();
      await cache.initializeRedis();
      await invalidateRelatedCaches(cache, 'game_log', id, {
        playerId: nullToUndefined(existingLog.userId),
      });
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error deleting game log:', error);
    return {
      success: false,
      error: {
        message: 'Failed to delete game log',
        code: 'GAME_LOG_DELETE_ERROR',
      },
    };
  }
};

export const createComment = async (
  _parent: unknown,
  { input }: MutationcreateCommentArgs,
  context: Context
) => {
  const { user, db } = context;
  const authenticatedUser = checkAuth(user);

  try {
    // Validate input directly without transformation
    const validatedInput = validateInput(createCommentSchema, input);

    // Verify the user exists in the database
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.id, authenticatedUser.id),
    });

    if (!dbUser) {
      throw new NotFoundError('User', authenticatedUser.id);
    }

    console.log('Creating comment for user:', authenticatedUser.id, 'User exists:', !!dbUser);

    // Insert the comment using the properly defined table schema
    const [comment] = await db
      .insert(actualCommentsTable)
      .values({
        id: generateUUID(),
        userId: authenticatedUser.id,
        parentId: validatedInput.parentId,
        parentType: validatedInput.parentType.toLowerCase(),
        targetId: validatedInput.parentId,
        targetType: validatedInput.parentType.toLowerCase(),
        content: validatedInput.content,
      })
      .returning();

    if (!comment) {
      throw new Error('Failed to create comment - no comment returned from database');
    }

    // Transform the comment to match the GraphQL schema
    return {
      comment: {
        id: comment.id,
        parentId: comment.parentId || '',
        parentType: (comment.parentType as ParentType) || 'game_log',
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        reactions: [],
        user: {
          id: authenticatedUser.id,
          username: authenticatedUser.username || '',
          emailAddress: authenticatedUser.emailAddress || '',
          imageUrl: authenticatedUser.imageUrl || '',
          comments: [],
          gameLogs: [],
          initiated_friendships: [],
          reactions: [],
          received_friendships: [],
          __typename: 'UserSummary' as const,
        },
        userId: comment.userId || authenticatedUser.id,
        __typename: 'Comment' as const,
      },
      errors: [],
    };
  } catch (error) {
    console.error('Error creating comment:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        comment: null,
        errors: [
          {
            message: error.errors[0].message,
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        ],
      };
    }

    // Handle database errors
    if (error instanceof Error) {
      return {
        comment: null,
        errors: [
          {
            message: error.message,
            code: 'COMMENT_CREATE_ERROR',
            details: error.stack,
          },
        ],
      };
    }

    // Handle unknown errors
    return {
      comment: null,
      errors: [
        {
          message: 'Failed to create comment',
          code: 'COMMENT_CREATE_ERROR',
          details: String(error),
        },
      ],
    };
  }
};

export const updateComment = async (
  _parent: unknown,
  { id, input }: MutationupdateCommentArgs,
  context: Context
) => {
  const { user, db } = context;
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }

  try {
    const existingComment = await db.query.comments.findFirst({
      where: and(eq(comments.id, id), eq(comments.userId, user.id)),
    });

    if (!existingComment) {
      return {
        comment: null,
        errors: [
          {
            message: 'Comment not found',
            code: 'COMMENT_NOT_FOUND',
          },
        ],
      };
    }

    const [updatedComment] = await db
      .update(comments)
      .set({
        content: input.content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();

    if (!updatedComment) {
      return {
        comment: null,
        errors: [
          {
            message: 'Failed to update comment',
            code: 'COMMENT_UPDATE_ERROR',
          },
        ],
      };
    }

    return {
      comment: {
        id: updatedComment.id,
        parentId: updatedComment.parentId || '',
        parentType: (updatedComment.parentType as ParentType) || 'game_log',
        content: updatedComment.content,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        deletedAt: updatedComment.deletedAt,
        reactions: [],
        user: {
          id: user.id,
          username: user.username,
          emailAddress: user.emailAddress,
          imageUrl: user.imageUrl,
          firstName: user.firstName,
          lastName: user.lastName,
          comments: [],
          gameLogs: [],
          initiated_friendships: [],
          reactions: [],
          received_friendships: [],
          __typename: 'UserSummary' as const,
        },
        userId: updatedComment.userId || user.id,
        __typename: 'Comment' as const,
      },
      errors: [],
    };
  } catch (error) {
    if (error instanceof GraphQLError) {
      return {
        comment: null,
        errors: [error],
      };
    }
    return {
      comment: null,
      errors: [
        {
          message: 'Failed to update comment',
          code: 'COMMENT_UPDATE_ERROR',
        },
      ],
    };
  }
};

export const deleteComment = async (
  _parent: unknown,
  { id }: MutationdeleteCommentArgs,
  { user }: Context
) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }

  try {
    const existingComment = await db.query.comments.findFirst({
      where: and(eq(comments.id, id), eq(comments.userId, user.id)),
    });

    if (!existingComment) {
      throw new NotFoundError('Comment', id);
    }

    await db.delete(comments).where(eq(comments.id, id));

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return {
      success: false,
      error: {
        message: 'Failed to delete comment',
        code: 'COMMENT_DELETE_ERROR',
      },
    };
  }
};

export const sendFriendRequest = async (
  _parent: unknown,
  { input }: { input: SendFriendRequestInput },
  context: Context
) => {
  const validatedInput = sendFriendRequestSchema.parse(input);
  const { user, db } = context;
  if (!user) throw new AuthenticationError('Not authenticated');

  const dbUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .then(rows => rows[0]);
  if (!dbUser) throw new AuthenticationError('User not found');

  const [friendship] = await db
    .insert(schema.friendships)
    .values({
      id: generateUUID(),
      friendId: validatedInput.subscriberId,
      userId: user.id,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const recipient = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, validatedInput.subscriberId))
    .then(rows => rows[0]);
  if (!recipient) throw new NotFoundError('User', validatedInput.subscriberId);

  // Map status string to GraphQL enum
  const statusMap: Record<string, string> = {
    pending: 'PENDING',
    connected: 'ACCEPTED',
    rejected: 'REJECTED',
    severed: 'BLOCKED',
  };

  return {
    friendship: {
      id: friendship.id,
      subscriberId: friendship.friendId || '',
      userId: friendship.userId || '',
      status: statusMap[friendship.status] || 'PENDING',
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
      initiator: transformUser({
        id: dbUser.id,
        username: dbUser.username,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        emailAddress: dbUser.emailAddress,
        imageUrl: dbUser.imageUrl,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      } as DBUser),
      recipient: transformUser({
        id: recipient.id,
        username: recipient.username,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        emailAddress: recipient.emailAddress,
        imageUrl: recipient.imageUrl,
        createdAt: recipient.createdAt,
        updatedAt: recipient.updatedAt,
      } as DBUser),
      __typename: 'Friendship' as const,
    } as Friendship,
    errors: [],
  };
};

export const createReaction = async (
  _parent: unknown,
  { input }: MutationcreateReactionArgs,
  context: Context
) => {
  const { user, db } = context;
  const authenticatedUser = checkAuth(user);

  try {
    // Validate that the emoji key is valid
    if (!(input.emoji in REACTION_EMOJIS)) {
      throw new ValidationError(`Invalid emoji: ${input.emoji}`);
    }

    // Convert emoji key to character for storage
    const emojiCharacter = REACTION_EMOJIS[input.emoji as ReactionEmojiKey];

    // Check if user already has a reaction on this target
    const existingReaction = await db.query.reactions.findFirst({
      where: and(
        eq(schema.reactions.userId, authenticatedUser.id),
        eq(schema.reactions.targetId, input.targetId),
        eq(schema.reactions.targetType, input.targetType.toLowerCase() as 'game_log' | 'comment'),
        eq(schema.reactions.emoji, emojiCharacter)
      ),
    });

    // If reaction exists, remove it (toggle off)
    if (existingReaction) {
      await db.delete(actualReactionsTable).where(eq(actualReactionsTable.id, existingReaction.id));

      return {
        reaction: null, // Return null to indicate the reaction was removed
        errors: [],
      };
    }

    // Verify the user exists
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.id, authenticatedUser.id),
    });

    if (!dbUser) {
      throw new NotFoundError('User', authenticatedUser.id);
    }

    // Insert the reaction using the properly defined table schema (toggle on)
    const [reaction] = await db
      .insert(actualReactionsTable)
      .values({
        id: generateUUID(),
        userId: authenticatedUser.id,
        targetId: input.targetId,
        targetType: input.targetType.toLowerCase(),
        emoji: emojiCharacter,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!reaction) {
      throw new Error('Failed to create reaction - no reaction returned from database');
    }

    return {
      reaction: {
        id: reaction.id,
        emoji: input.emoji as ReactionEmojiType,
        targetId: reaction.targetId || '',
        targetType: reaction.targetType as ParentType,
        userId: reaction.userId || authenticatedUser.id,
        user: {
          id: authenticatedUser.id,
          username: authenticatedUser.username || '',
          emailAddress: authenticatedUser.emailAddress || '',
          imageUrl: authenticatedUser.imageUrl || '',
          comments: [],
          gameLogs: [],
          initiated_friendships: [],
          reactions: [],
          received_friendships: [],
          __typename: 'UserSummary' as const,
        },
        createdAt: reaction.createdAt,
        updatedAt: reaction.updatedAt,
        __typename: 'Reaction' as const,
      },
      errors: [],
    };
  } catch (error) {
    console.error('Error creating reaction:', error);
    return {
      reaction: null,
      errors: [
        {
          message: error instanceof Error ? error.message : 'Failed to create reaction',
          code: 'REACTION_CREATE_ERROR',
          details: error instanceof Error ? error.stack : String(error),
        },
      ],
    };
  }
};

export const deleteReaction = async (
  _parent: unknown,
  { id }: MutationdeleteReactionArgs,
  context: Context
) => {
  const { user, db } = context;
  const authenticatedUser = checkAuth(user);

  try {
    // Check if the reaction exists and belongs to the user
    const existingReaction = await db.query.reactions.findFirst({
      where: and(eq(schema.reactions.id, id), eq(schema.reactions.userId, authenticatedUser.id)),
    });

    if (!existingReaction) {
      throw new NotFoundError('Reaction', id);
    }

    // Delete using the simplified table definition to avoid circular references
    await db.delete(actualReactionsTable).where(eq(actualReactionsTable.id, id));

    return {
      success: true,
      errors: [],
    };
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return {
      success: false,
      errors: [
        {
          message: error instanceof Error ? error.message : 'Failed to delete reaction',
          code: 'REACTION_DELETE_ERROR',
          details: error instanceof Error ? error.stack : String(error),
        },
      ],
    };
  }
};

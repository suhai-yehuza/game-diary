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
  user_id: varchar('user_id', { length: 255 }),
  content: text('content').notNull(),
  target_id: varchar('target_id', { length: 255 }).notNull(),
  target_type: varchar('target_type', { length: 50 }).notNull(),
  parent_id: varchar('parent_id', { length: 255 }),
  parent_type: varchar('parent_type', { length: 50 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

// Define the actual reactions table structure to match the database
const actualReactionsTable = pgTable('reactions', {
  id: text('id').primaryKey(),
  user_id: text('user_id'),
  target_id: text('target_id').notNull(),
  target_type: varchar('target_type', { length: 50 }).notNull(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
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
      where: eq(schema.nba_games.id, validatedInput.game_id),
    });

    if (!game) {
      throw new NotFoundError('Game', validatedInput.game_id);
    }

    // Validate game type
    try {
      const gameWithType = { ...game, game_type: 'nba' };
      gameTypeEnum.parse(gameWithType.game_type);
    } catch (error) {
      console.log('Error parsing game type:', error);
      throw new BusinessLogicError('Game type nba is not supported', 'UNSUPPORTED_GAME_TYPE');
    }

    try {
      const [gameLog] = await db
        .insert(schema.game_logs)
        .values({
          user_id: user.id,
          game_id: validatedInput.game_id,
          watched_setting: validatedInput.watched_setting as WatchedSettingValue,
          watched_date: validatedInput.watched_date || new Date(),
          watched_location: validatedInput.watched_location || '',
          rating_for_game: validatedInput.rating_for_game || 0,
          rating_stars: validatedInput.rating_stars?.toString() || '',
          watched_count: validatedInput.watched_count || 0,
          notes: validatedInput.notes || '',
          tags: validatedInput.tags || [],
          classification: validatedInput.classification || 'protected',
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      // Invalidate related caches
      if (context.redis) {
        const cache = getCache();
        await cache.initializeRedis();
        await invalidateRelatedCaches(cache, 'game_log', gameLog.id, {
          playerId: nullToUndefined(gameLog.user_id),
        });
      }

      // Fetch the related game from the DB with proper type checking
      const nbaGame = await db.query.nba_games.findFirst({
        where: (nba_games, { eq }) => eq(nba_games.id, gameLog.game_id),
      });

      if (!nbaGame) {
        throw new NotFoundError('Game', gameLog.game_id);
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
        season_id:
          typeof nbaGame.season_id === 'number'
            ? nbaGame.season_id
            : Number(nbaGame.season_id ?? 0),
        stage: typeof nbaGame.stage === 'number' ? nbaGame.stage : Number(nbaGame.stage ?? 0),
        periods: nbaGame.periods ?? [],
        scores: nbaGame.scores ?? [],
        officials: Array.isArray(nbaGame.officials) ? nbaGame.officials.map(String) : [],
        timesTied: typeof nbaGame.times_tied === 'number' ? nbaGame.times_tied : null,
        leadChanges: typeof nbaGame.lead_changes === 'number' ? nbaGame.lead_changes : null,
        nugget: typeof nbaGame.nugget === 'string' ? nbaGame.nugget : null,
        created_at:
          typeof nbaGame.created_at === 'string'
            ? nbaGame.created_at
            : nbaGame.created_at instanceof Date
              ? nbaGame.created_at.toISOString()
              : '',
        updated_at:
          typeof nbaGame.updated_at === 'string'
            ? nbaGame.updated_at
            : nbaGame.updated_at instanceof Date
              ? nbaGame.updated_at.toISOString()
              : '',
        homeTeamId:
          typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
        awayTeamId:
          typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
        teams,
        isCompleted: nbaGame.status === 'Final' || nbaGame.status === 'Completed',
      };

      return {
        gameLog: {
          id: gameLog.id,
          gameId: gameLog.game_id,
          userId: gameLog.user_id || '',
          game: mappedGame,
          user: transformUser({
            id: dbUser.id,
            username: dbUser.username,
            first_name: dbUser.first_name,
            last_name: dbUser.last_name,
            email_address: dbUser.email_address,
            imageUrl: dbUser.image_url,
            created_at: dbUser.created_at,
            updated_at: dbUser.updated_at,
          } as DBUser),
          classification: gameLog.classification as Classification,
          notes: gameLog.notes || undefined,
          rating: gameLog.rating_for_game,
          ratingForGame: gameLog.rating_for_game,
          ratingStars: gameLog.rating_stars ? parseInt(gameLog.rating_stars) : undefined,
          tags: gameLog.tags || [],
          watchedDate: gameLog.watched_date,
          watchedLocation: gameLog.watched_location || undefined,
          watchedCount: gameLog.watched_count,
          watchedSetting: gameLog.watched_setting,
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
          created_at: gameLog.created_at,
          updated_at: gameLog.updated_at,
          deleted_at: gameLog.deleted_at || null,
        },
        errors: [],
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('foreign key')) {
        throw new ForeignKeyViolationError(
          'Invalid game or user reference',
          'game_logs',
          error.message.includes('user_id') ? 'user_id' : 'game_id'
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
      where: and(eq(schema.game_logs.id, id), eq(schema.game_logs.user_id, user.id)),
    });

    if (!existingLog) {
      throw new NotFoundError('GameLog', id);
    }

    const [updatedLog] = await db
      .update(schema.game_logs)
      .set({
        watched_setting: validatedInput.watched_setting
          ? (validatedInput.watched_setting as WatchedSettingValue)
          : undefined,
        watched_date: validatedInput.watched_date || existingLog.watched_date,
        watched_location: validatedInput.watched_location || existingLog.watched_location,
        rating_for_game: validatedInput.rating_for_game ?? existingLog.rating_for_game,
        rating_stars: validatedInput.rating_stars?.toString() || existingLog.rating_stars,
        watched_count: validatedInput.watched_count ?? existingLog.watched_count,
        notes: validatedInput.notes || existingLog.notes,
        tags: validatedInput.tags || existingLog.tags || [],
        classification: validatedInput.classification || existingLog.classification,
        updated_at: new Date(),
      })
      .where(eq(schema.game_logs.id, id))
      .returning();

    // Invalidate related caches
    if (context.redis) {
      const cache = getCache();
      await cache.initializeRedis();
      await invalidateRelatedCaches(cache, 'game_log', updatedLog.id, {
        playerId: nullToUndefined(updatedLog.user_id),
      });
    }

    // Fetch the related game from the DB
    const game = await db.query.nba_games.findFirst({
      where: (nba_games, { eq }) => eq(nba_games.id, updatedLog.game_id),
    });
    if (!game) {
      throw new NotFoundError('Game', updatedLog.game_id);
    }
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.id, updatedLog.user_id ?? user.id),
    });
    if (!dbUser) {
      throw new NotFoundError('User', updatedLog.user_id ?? user.id);
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
      season_id: typeof game.season_id === 'number' ? game.season_id : Number(game.season_id ?? 0),
      stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
      periods: game.periods ?? [],
      scores: game.scores ?? [],
      officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
      timesTied: typeof game.times_tied === 'number' ? game.times_tied : null,
      leadChanges: typeof game.lead_changes === 'number' ? game.lead_changes : null,
      nugget: typeof game.nugget === 'string' ? game.nugget : null,
      created_at:
        typeof game.created_at === 'string'
          ? game.created_at
          : game.created_at instanceof Date
            ? game.created_at.toISOString()
            : '',
      updated_at:
        typeof game.updated_at === 'string'
          ? game.updated_at
          : game.updated_at instanceof Date
            ? game.updated_at.toISOString()
            : '',
      homeTeamId:
        typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
      awayTeamId:
        typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
      teams,
      isCompleted: game.status === 'Final' || game.status === 'Completed',
    };

    return {
      gameLog: {
        id: updatedLog.id,
        userId: updatedLog.user_id ?? '',
        gameId: updatedLog.game_id,
        watchedSetting: updatedLog.watched_setting as WatchedSettingValue,
        watchedDate: updatedLog.watched_date,
        watchedLocation: updatedLog.watched_location,
        rating: updatedLog.rating_for_game,
        ratingStars: updatedLog.rating_stars,
        watchedCount: updatedLog.watched_count,
        notes: updatedLog.notes,
        classification: updatedLog.classification,
        created_at: updatedLog.created_at,
        updated_at: updatedLog.updated_at,
        deleted_at: updatedLog.deleted_at,
        tags: updatedLog.tags,
        game: mappedGame,
        user: {
          id: dbUser.id,
          username: dbUser.username,
          email_address: dbUser.email_address,
          imageUrl: dbUser.image_url,
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
      where: and(eq(schema.game_logs.id, id), eq(schema.game_logs.user_id, user.id)),
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
        playerId: nullToUndefined(existingLog.user_id),
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
        user_id: authenticatedUser.id,
        parent_id: validatedInput.parent_id,
        parent_type: validatedInput.parent_type.toLowerCase(),
        target_id: validatedInput.parent_id,
        target_type: validatedInput.parent_type.toLowerCase(),
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
        parent_id: comment.parent_id || '',
        parent_type: (comment.parent_type as ParentType) || 'game_log',
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        deleted_at: comment.deleted_at,
        reactions: [],
        user: {
          id: authenticatedUser.id,
          username: authenticatedUser.username || '',
          email_address: authenticatedUser.email_address || '',
          imageUrl: authenticatedUser.image_url || '',
          comments: [],
          gameLogs: [],
          initiated_friendships: [],
          reactions: [],
          received_friendships: [],
          __typename: 'UserSummary' as const,
        },
        userId: comment.user_id || authenticatedUser.id,
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
      where: and(eq(comments.id, id), eq(comments.user_id, user.id)),
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
        updated_at: new Date(),
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
        parent_id: updatedComment.parent_id || '',
        parent_type: (updatedComment.parent_type as ParentType) || 'game_log',
        content: updatedComment.content,
        created_at: updatedComment.created_at,
        updated_at: updatedComment.updated_at,
        deleted_at: updatedComment.deleted_at,
        reactions: [],
        user: {
          id: user.id,
          username: user.username,
          email_address: user.email_address,
          imageUrl: user.image_url,
          first_name: user.first_name,
          last_name: user.last_name,
          comments: [],
          gameLogs: [],
          initiated_friendships: [],
          reactions: [],
          received_friendships: [],
          __typename: 'UserSummary' as const,
        },
        userId: updatedComment.user_id || user.id,
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
      where: and(eq(comments.id, id), eq(comments.user_id, user.id)),
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
      friend_id: validatedInput.subscriberId,
      user_id: user.id,
      status: 'PENDING',
      created_at: new Date(),
      updated_at: new Date(),
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
      subscriberId: friendship.friend_id || '',
      userId: friendship.user_id || '',
      status: statusMap[friendship.status] || 'PENDING',
      created_at: friendship.created_at,
      updated_at: friendship.updated_at,
      initiator: transformUser({
        id: dbUser.id,
        username: dbUser.username,
        first_name: dbUser.first_name,
        last_name: dbUser.last_name,
        email_address: dbUser.email_address,
        imageUrl: dbUser.image_url,
        created_at: dbUser.created_at,
        updated_at: dbUser.updated_at,
      } as DBUser),
      recipient: transformUser({
        id: recipient.id,
        username: recipient.username,
        first_name: recipient.first_name,
        last_name: recipient.last_name,
        email_address: recipient.email_address,
        imageUrl: recipient.image_url,
        created_at: recipient.created_at,
        updated_at: recipient.updated_at,
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
        eq(schema.reactions.user_id, authenticatedUser.id),
        eq(schema.reactions.target_id, input.targetId),
        eq(schema.reactions.target_type, input.targetType.toLowerCase() as 'game_log' | 'comment'),
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
        user_id: authenticatedUser.id,
        target_id: input.targetId,
        target_type: input.targetType.toLowerCase(),
        emoji: emojiCharacter,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    if (!reaction) {
      throw new Error('Failed to create reaction - no reaction returned from database');
    }

    return {
      reaction: {
        id: reaction.id,
        emoji: input.emoji as ReactionEmojiType,
        targetId: reaction.target_id || '',
        targetType: reaction.target_type as ParentType,
        userId: reaction.user_id || authenticatedUser.id,
        user: {
          id: authenticatedUser.id,
          username: authenticatedUser.username || '',
          email_address: authenticatedUser.email_address || '',
          imageUrl: authenticatedUser.image_url || '',
          comments: [],
          gameLogs: [],
          initiated_friendships: [],
          reactions: [],
          received_friendships: [],
          __typename: 'UserSummary' as const,
        },
        created_at: reaction.created_at,
        updated_at: reaction.updated_at,
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
      where: and(eq(schema.reactions.id, id), eq(schema.reactions.user_id, authenticatedUser.id)),
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

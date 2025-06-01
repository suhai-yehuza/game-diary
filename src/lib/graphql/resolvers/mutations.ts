import { eq, and } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

import { getCache, invalidateRelatedCaches } from '@/lib/cache';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { Context } from '@/lib/graphql/context';
import {
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  NotFoundError,
  ValidationError,
} from '@/lib/graphql/errors';
import { transformUser } from '@/lib/graphql/resolvers/transformers';
import { mapUserData } from '@/lib/graphql/resolvers/users/index';
import { getEmojiKey } from '@/lib/graphql/resolvers/common/utils';
import { API_CONFIG } from '@/lib/config/api.config';
import {
  WatchedSettingValue,
  REACTION_EMOJIS,
  ReactionEmojiKey,
  WATCHED_SCOPE,
  CLASSIFICATION,
} from '@/lib/types/config.types';
import {
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
import { generateUUID } from '@/lib/utils/index.processing';
import { createCommentSchema, updateCommentSchema } from '@/lib/validations/comment';
import { gameTypeEnum } from '@/lib/validations/game';

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

// Helper to fetch full user from DB
async function getFullUser(db: typeof import('@/lib/db').db, userId: string) {
  const users = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return users[0] || null;
}

// Helper to ensure user exists in database (create if not)
async function ensureUserExists(user: Context['user']) {
  if (!user) return null;
  
  // Check if user already exists
  const existingUsers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .limit(1);
    
  if (existingUsers.length > 0) return existingUsers[0];
  
  // Create user if not exists
  const [newUser] = await db.insert(schema.users).values({
    id: user.id,
    username: user.username || `user_${user.id.slice(-8)}`,
    firstName: user.firstName || 'Unknown',
    lastName: user.lastName || 'User',
    emailAddress: user.emailAddress || `${user.id}@placeholder.com`,
    imageUrl: user.imageUrl || '',
    inboundFriendshipIds: [],
    outboundFriendshipIds: [],
    banned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    timestamp: new Date(),
    last_sign_in_at: null,
    password_enabled: false,
    two_factor_enabled: false,
    email_verified: false,
    email_verification_strategy: null,
    external_id: null,
    external_accounts: [],
    deletedAt: null,
  }).returning();
  
  return newUser;
}

// Game Log Mutations
export const createGameLog = async (
  _parent: unknown,
  { input }: MutationcreateGameLogArgs,
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    const validatedInput = {
      ...input,
      watchedScope: input.watchedScope,
    };

    // Ensure user exists in database
    const dbUser = await ensureUserExists(user);
    if (!dbUser) {
      throw new AuthenticationError('Failed to verify user');
    }

    // Validate game exists and is accessible
    const games = await db
      .select()
      .from(schema.nba_games)
      .where(eq(schema.nba_games.id, validatedInput.gameId))
      .limit(1);
    const game = games[0];

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
          watchedScope: validatedInput.watchedScope || WATCHED_SCOPE.FULL_GAME,
          notes: validatedInput.notes || '',
          tags: validatedInput.tags || [],
          classification: validatedInput.classification || CLASSIFICATION.PROTECTED,
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
      const nbaGames = await db
        .select()
        .from(schema.nba_games)
        .where(eq(schema.nba_games.id, gameLog.gameId))
        .limit(1);
      const nbaGame = nbaGames[0];

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
          watchedScope: gameLog.watchedScope,
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
    const validatedInput = {
      ...input,
      watchedScope: input.watchedScope,
    };

    // Fetch the game log
    const gameLogs = await db
      .select()
      .from(schema.game_logs)
      .where(eq(schema.game_logs.id, id))
      .limit(1);
    const gameLog = gameLogs[0];

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
        watchedScope: validatedInput.watchedScope || WATCHED_SCOPE.FULL_GAME,
        notes: validatedInput.notes || '',
        tags: validatedInput.tags || [],
        classification: validatedInput.classification || CLASSIFICATION.PROTECTED,
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
        watchedScope: updatedGameLog.watchedScope,
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
    const gameLogs = await db
      .select()
      .from(schema.game_logs)
      .where(eq(schema.game_logs.id, id))
      .limit(1);
    const gameLog = gameLogs[0];

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
    
    // Ensure user exists in database
    const dbUser = await ensureUserExists(user);
    if (!dbUser) {
      throw new AuthenticationError('Failed to verify user');
    }
    
    const validatedInput = validateInput(createCommentSchema, input);
    
    // If this is a reply to another comment, check the depth
    if (validatedInput.parentType === 'comment') {
      // Helper function to calculate depth
      const getDepth = async (commentId: string, currentDepth = 0): Promise<number> => {
        if (currentDepth >= API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH) {
          return currentDepth;
        }
        
        const parentComments = await db
          .select()
          .from(schema.comments)
          .where(eq(schema.comments.id, commentId))
          .limit(1);
        const parentComment = parentComments[0];
        
        if (!parentComment || parentComment.parentType !== 'comment') {
          return currentDepth;
        }
        
        return getDepth(parentComment.parentId, currentDepth + 1);
      };
      
      const parentDepth = await getDepth(validatedInput.parentId);
      
      if (parentDepth >= API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH) {
        throw new ValidationError(
          `Comments can only be nested up to ${API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH} levels deep`
        );
      }
    }
    
    const [comment] = await db
      .insert(schema.comments)
      .values({
        id: generateUUID(),
        userId: dbUser.id,
        content: validatedInput.content,
        parentId: validatedInput.parentId,
        parentType: validatedInput.parentType as 'game_log' | 'comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      
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
        user: dbUser ? transformUser(mapUserData(dbUser)) : null,
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
    const validatedInput = validateInput(updateCommentSchema, input);
    // Fetch the comment
    const comments = await db
      .select()
      .from(schema.comments)
      .where(eq(schema.comments.id, id))
      .limit(1);
    const comment = comments[0];
    
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
    const comments = await db
      .select()
      .from(schema.comments)
      .where(eq(schema.comments.id, id))
      .limit(1);
    const comment = comments[0];

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
    
    // Ensure user exists in database
    const dbUser = await ensureUserExists(user);
    if (!dbUser) {
      throw new AuthenticationError('Failed to verify user');
    }
    
    if (!(input.emoji in REACTION_EMOJIS)) {
      throw new ValidationError('Invalid emoji');
    }
    
    const emoji = REACTION_EMOJIS[input.emoji as ReactionEmojiKey];
    
    // Check for existing reaction with the same emoji type
    const existingReactions = await db
      .select()
      .from(schema.reactions)
      .where(and(
        eq(schema.reactions.userId, dbUser.id),
        eq(schema.reactions.targetId, input.targetId),
        eq(schema.reactions.targetType, input.targetType),
        eq(schema.reactions.emoji, emoji)
      ))
      .limit(1);
    const existingReaction = existingReactions[0];
    
    if (existingReaction) {
      // Delete the existing reaction (toggle off)
      await db.delete(schema.reactions).where(eq(schema.reactions.id, existingReaction.id));
      return {
        reaction: null,
      };
    }
    
    // Create new reaction
    const [reaction] = await db
      .insert(schema.reactions)
      .values({
        id: generateUUID(),
        userId: dbUser.id,
        targetId: input.targetId,
        targetType: input.targetType,
        emoji,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      
    return {
      reaction: {
        id: reaction.id,
        emoji: getEmojiKey(reaction.emoji),
        userId: reaction.userId || '',
        targetId: reaction.targetId,
        targetType: reaction.targetType as ParentType,
        createdAt: reaction.createdAt,
        updatedAt: reaction.updatedAt,
        user: dbUser ? transformUser(mapUserData(dbUser)) : null,
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
    const reactions = await db
      .select()
      .from(schema.reactions)
      .where(eq(schema.reactions.id, id))
      .limit(1);
    const reaction = reactions[0];

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

// Friendship Mutations
export const sendFriendRequest = async (
  _parent: unknown,
  { userId }: { userId: string },
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    
    // Ensure user exists in database
    const dbUser = await ensureUserExists(user);
    if (!dbUser) {
      throw new AuthenticationError('Failed to verify user');
    }
    
    // Check if target user exists
    const targetUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    const targetUser = targetUsers[0];
    
    if (!targetUser) {
      throw new NotFoundError('User', userId);
    }
    
    // Check if already friends or request exists
    const existingFriendships = await db
      .select()
      .from(schema.friendships)
      .where(
        and(
          eq(schema.friendships.userId, dbUser.id),
          eq(schema.friendships.friendId, userId)
        )
      )
      .limit(1);
      
    if (existingFriendships.length > 0) {
      const existing = existingFriendships[0];
      if (existing.status === 'Accepted') {
        throw new BusinessLogicError('Already friends with this user', 'ALREADY_FRIENDS');
      } else if (existing.status === 'Pending') {
        throw new BusinessLogicError('Friend request already sent', 'REQUEST_ALREADY_SENT');
      }
    }
    
    // Check for reverse friendship (if the target user sent a request to current user)
    const reverseFriendships = await db
      .select()
      .from(schema.friendships)
      .where(
        and(
          eq(schema.friendships.userId, userId),
          eq(schema.friendships.friendId, dbUser.id)
        )
      )
      .limit(1);
      
    if (reverseFriendships.length > 0 && reverseFriendships[0].status === 'Pending') {
      // Auto-accept if there's a pending request from the target user
      const [updatedFriendship] = await db
        .update(schema.friendships)
        .set({
          status: 'Accepted',
          updatedAt: new Date(),
        })
        .where(eq(schema.friendships.id, reverseFriendships[0].id))
        .returning();
        
      return {
        friendship: {
          id: updatedFriendship.id,
          subscriberId: updatedFriendship.userId || '',
          userId: updatedFriendship.friendId || '',
          status: 'Accepted',
          createdAt: updatedFriendship.createdAt,
          updatedAt: updatedFriendship.updatedAt,
          initiator: transformUser(mapUserData(targetUser)),
          recipient: transformUser(mapUserData(dbUser)),
        },
        errors: null,
      };
    }
    
    // Create new friend request
    const [friendship] = await db
      .insert(schema.friendships)
      .values({
        id: generateUUID(),
        userId: dbUser.id,
        friendId: userId,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      
    return {
      friendship: {
        id: friendship.id,
        subscriberId: friendship.userId || '',
        userId: friendship.friendId || '',
        status: 'Pending',
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
        initiator: transformUser(mapUserData(dbUser)),
        recipient: transformUser(mapUserData(targetUser)),
      },
      errors: null,
    };
  } catch (error) {
    if (error instanceof GraphQLError) {
      return {
        friendship: null,
        errors: [error],
      };
    }
    return {
      friendship: null,
      errors: [new BusinessLogicError('Failed to send friend request', 'FRIEND_REQUEST_ERROR')],
    };
  }
};

export const acceptFriendRequest = async (
  _parent: unknown,
  { friendshipId }: { friendshipId: string },
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    
    const friendships = await db
      .select()
      .from(schema.friendships)
      .where(eq(schema.friendships.id, friendshipId))
      .limit(1);
    const friendship = friendships[0];
    
    if (!friendship) {
      throw new NotFoundError('Friendship', friendshipId);
    }
    
    // Check if user is the recipient of the request (friendId)
    if (friendship.friendId !== user.id) {
      throw new AuthorizationError('Not authorized to accept this friend request');
    }
    
    if (friendship.status !== 'Pending') {
      throw new BusinessLogicError('Friend request is not pending', 'REQUEST_NOT_PENDING');
    }
    
    // Update friendship status
    const [updatedFriendship] = await db
      .update(schema.friendships)
      .set({
        status: 'Accepted',
        updatedAt: new Date(),
      })
      .where(eq(schema.friendships.id, friendshipId))
      .returning();
      
    // Fetch users
    const initiatorUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, updatedFriendship.userId || ''))
      .limit(1);
    const recipientUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, updatedFriendship.friendId || ''))
      .limit(1);
      
    return {
      friendship: {
        id: updatedFriendship.id,
        subscriberId: updatedFriendship.userId || '',
        userId: updatedFriendship.friendId || '',
        status: 'Accepted',
        createdAt: updatedFriendship.createdAt,
        updatedAt: updatedFriendship.updatedAt,
        initiator: transformUser(mapUserData(initiatorUsers[0])),
        recipient: transformUser(mapUserData(recipientUsers[0])),
      },
      errors: null,
    };
  } catch (error) {
    if (error instanceof GraphQLError) {
      return {
        friendship: null,
        errors: [error],
      };
    }
    return {
      friendship: null,
      errors: [new BusinessLogicError('Failed to accept friend request', 'ACCEPT_REQUEST_ERROR')],
    };
  }
};

export const rejectFriendRequest = async (
  _parent: unknown,
  { friendshipId }: { friendshipId: string },
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    
    const friendships = await db
      .select()
      .from(schema.friendships)
      .where(eq(schema.friendships.id, friendshipId))
      .limit(1);
    const friendship = friendships[0];
    
    if (!friendship) {
      throw new NotFoundError('Friendship', friendshipId);
    }
    
    // Check if user is the recipient of the request
    if (friendship.friendId !== user.id) {
      throw new AuthorizationError('Not authorized to reject this friend request');
    }
    
    if (friendship.status !== 'Pending') {
      throw new BusinessLogicError('Friend request is not pending', 'REQUEST_NOT_PENDING');
    }
    
    // Update friendship status
    const [updatedFriendship] = await db
      .update(schema.friendships)
      .set({
        status: 'Rejected',
        updatedAt: new Date(),
      })
      .where(eq(schema.friendships.id, friendshipId))
      .returning();
      
    // Fetch users
    const initiatorUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, updatedFriendship.userId || ''))
      .limit(1);
    const recipientUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, updatedFriendship.friendId || ''))
      .limit(1);
      
    return {
      friendship: {
        id: updatedFriendship.id,
        subscriberId: updatedFriendship.userId || '',
        userId: updatedFriendship.friendId || '',
        status: 'Rejected',
        createdAt: updatedFriendship.createdAt,
        updatedAt: updatedFriendship.updatedAt,
        initiator: transformUser(mapUserData(initiatorUsers[0])),
        recipient: transformUser(mapUserData(recipientUsers[0])),
      },
      errors: null,
    };
  } catch (error) {
    if (error instanceof GraphQLError) {
      return {
        friendship: null,
        errors: [error],
      };
    }
    return {
      friendship: null,
      errors: [new BusinessLogicError('Failed to reject friend request', 'REJECT_REQUEST_ERROR')],
    };
  }
};

export const removeFriend = async (
  _parent: unknown,
  { friendshipId }: { friendshipId: string },
  context: Context
) => {
  try {
    const user = checkAuth(context.user);
    
    const friendships = await db
      .select()
      .from(schema.friendships)
      .where(eq(schema.friendships.id, friendshipId))
      .limit(1);
    const friendship = friendships[0];
    
    if (!friendship) {
      throw new NotFoundError('Friendship', friendshipId);
    }
    
    // Check if user is part of this friendship
    if (friendship.friendId !== user.id && friendship.userId !== user.id) {
      throw new AuthorizationError('Not authorized to remove this friend');
    }
    
    // Delete the friendship
    await db.delete(schema.friendships).where(eq(schema.friendships.id, friendshipId));
    
    return {
      success: true,
      errors: null,
    };
  } catch (error) {
    if (error instanceof GraphQLError) {
      return {
        success: false,
        errors: [error],
      };
    }
    return {
      success: false,
      errors: [new BusinessLogicError('Failed to remove friend', 'REMOVE_FRIEND_ERROR')],
    };
  }
};

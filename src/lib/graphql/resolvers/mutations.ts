import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/lib/db';
import { nba_games, game_logs, comments, reactions, friendships, users } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { TARGET_TYPES } from '@/lib/types';
import { FRIENDSHIP_STATUS } from '@/lib/types';
import type { GraphQLContext } from '@/lib/types/dbTypes';

// Game Mutations
export const gameMutationResolvers = {
  // Create a new game
  createGame: async (
    _parent: unknown,
    args: {
      input: {
        date: Date;
        home_team_id: string;
        away_team_id: string;
        game_type: string;
        nba_game_id?: string;
        status: string;
        home_team_score?: number;
        away_team_score?: number;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const gameId = nanoid();
      const newGame = await db()
        ?.insert(nba_games)
        .values({
          id: gameId,
          date: args.input.date,
          home_team_id: args.input.home_team_id,
          away_team_id: args.input.away_team_id,
          game_type: args.input.game_type,
          nba_game_id: args.input.nba_game_id,
          status: args.input.status,
          home_team_score: args.input.home_team_score,
          away_team_score: args.input.away_team_score,
        })
        .returning();

      return {
        game: newGame?.[0]
          ? {
              id: newGame[0].id,
              date: newGame[0].date,
              status: newGame[0].status,
              game_type: newGame[0].game_type,
              nba_game_id: newGame[0].nba_game_id,
              home_team_id: newGame[0].home_team_id,
              away_team_id: newGame[0].away_team_id,
              home_team_score: newGame[0].home_team_score,
              away_team_score: newGame[0].away_team_score,
              created_at: newGame[0].created_at,
              updated_at: newGame[0].updated_at,
            }
          : null,
        errors: [],
      };
    } catch (error) {
      return {
        game: null,
        errors: [{ message: 'Failed to create game', code: 'CREATE_GAME_ERROR' }],
      };
    }
  },

  // Create a new game log
  createGameLog: async (
    _parent: unknown,
    args: {
      input: {
        gameId: string;
        rating_for_game: number;
        notes?: string;
        tags?: string[];
        watched_date?: Date;
        watched_setting?: string;
        watched_location?: string;
        watched_scope?: string;
        classification: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const gameLogId = nanoid();
      const newGameLog = await db()
        ?.insert(game_logs)
        .values({
          id: gameLogId,
          user_id: context.user.id,
          game_id: args.input.gameId,
          rating_for_game: args.input.rating_for_game,
          notes: args.input.notes,
          tags: args.input.tags,
          watched_date: args.input.watched_date ?? new Date(),
          watched_setting: args.input.watched_setting,
          watched_location: args.input.watched_location,
          watched_scope: args.input.watched_scope,
          classification: args.input.classification,
        })
        .returning();

      return {
        gameLog: newGameLog?.[0]
          ? {
              id: newGameLog[0].id,
              rating_for_game: newGameLog[0].rating_for_game,
              notes: newGameLog[0].notes,
              tags: newGameLog[0].tags,
              watched_date: newGameLog[0].watched_date,
              watched_setting: newGameLog[0].watched_setting,
              watched_location: newGameLog[0].watched_location,
              watched_scope: newGameLog[0].watched_scope,
              classification: newGameLog[0].classification,
              created_at: newGameLog[0].created_at,
              updated_at: newGameLog[0].updated_at,
              deleted_at: newGameLog[0].deleted_at,
            }
          : null,
        errors: [],
      };
    } catch (error) {
      return {
        gameLog: null,
        errors: [{ message: 'Failed to create game log', code: 'CREATE_GAME_LOG_ERROR' }],
      };
    }
  },

  // Update a game log
  updateGameLog: async (
    _parent: unknown,
    args: {
      id: string;
      input: {
        rating_for_game?: number;
        notes?: string;
        tags?: string[];
        watched_date?: Date;
        watched_setting?: string;
        watched_location?: string;
        watched_scope?: string;
        classification?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      // Check if user owns the game log
      const existingGameLog = await db()?.query.game_logs.findFirst({
        where: eq(game_logs.id, args.id),
      });

      if (!existingGameLog || existingGameLog.user_id !== context.user.id) {
        throw new AuthorizationError('Access denied to this game log');
      }

      const updatedGameLog = await db()
        ?.update(game_logs)
        .set({
          ...args.input,
          updated_at: new Date(),
        })
        .where(eq(game_logs.id, args.id))
        .returning();

      return {
        gameLog: updatedGameLog?.[0]
          ? {
              id: updatedGameLog[0].id,
              rating_for_game: updatedGameLog[0].rating_for_game,
              notes: updatedGameLog[0].notes,
              tags: updatedGameLog[0].tags,
              watched_date: updatedGameLog[0].watched_date,
              watched_setting: updatedGameLog[0].watched_setting,
              watched_location: updatedGameLog[0].watched_location,
              watched_scope: updatedGameLog[0].watched_scope,
              classification: updatedGameLog[0].classification,
              created_at: updatedGameLog[0].created_at,
              updated_at: updatedGameLog[0].updated_at,
              deleted_at: updatedGameLog[0].deleted_at,
            }
          : null,
        errors: [],
      };
    } catch (error) {
      return {
        gameLog: null,
        errors: [{ message: 'Failed to update game log', code: 'UPDATE_GAME_LOG_ERROR' }],
      };
    }
  },

  // Delete a game log
  deleteGameLog: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      // Check if user owns the game log
      const existingGameLog = await db()?.query.game_logs.findFirst({
        where: eq(game_logs.id, args.id),
      });

      if (!existingGameLog || existingGameLog.user_id !== context.user.id) {
        throw new AuthorizationError('Access denied to this game log');
      }

      await db()?.delete(game_logs).where(eq(game_logs.id, args.id));

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ message: 'Failed to delete game log', code: 'DELETE_GAME_LOG_ERROR' }],
      };
    }
  },
};

// Comment Mutations
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
      const commentId = nanoid();
      const newComment = await db()
        ?.insert(comments)
        .values({
          id: commentId,
          user_id: context.user.id,
          parent_id: args.input.parentId,
          parent_type: args.input.parentType as keyof typeof TARGET_TYPES,
          content: args.input.content,
          depth: 0, // Default depth for top-level comments
        })
        .returning();

      return {
        comment: newComment?.[0]
          ? {
              id: newComment[0].id,
              content: newComment[0].content,
              user_id: newComment[0].user_id,
              parent_id: newComment[0].parent_id,
              parent_type: newComment[0].parent_type,
              depth: newComment[0].depth,
              created_at: newComment[0].created_at,
              updated_at: newComment[0].updated_at,
              deleted_at: newComment[0].deleted_at,
            }
          : null,
        errors: [],
      };
    } catch (error) {
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

      const updatedComment = await db()
        ?.update(comments)
        .set({
          content: args.input.content,
          updated_at: new Date(),
        })
        .where(eq(comments.id, args.id))
        .returning();

      return {
        comment: updatedComment?.[0]
          ? {
              id: updatedComment[0].id,
              content: updatedComment[0].content,
              user_id: updatedComment[0].user_id,
              parent_id: updatedComment[0].parent_id,
              parent_type: updatedComment[0].parent_type,
              depth: updatedComment[0].depth,
              created_at: updatedComment[0].created_at,
              updated_at: updatedComment[0].updated_at,
              deleted_at: updatedComment[0].deleted_at,
            }
          : null,
        errors: [],
      };
    } catch (error) {
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

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ message: 'Failed to delete comment', code: 'DELETE_COMMENT_ERROR' }],
      };
    }
  },
};

// Reaction Mutations
export const reactionMutationResolvers = {
  // Create a new reaction
  createReaction: async (
    _parent: unknown,
    args: {
      input: {
        emoji: string;
        targetId: string;
        targetType: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const reactionId = nanoid();
      const newReaction = await db()
        ?.insert(reactions)
        .values({
          id: reactionId,
          user_id: context.user.id,
          target_id: args.input.targetId,
          target_type: args.input.targetType as keyof typeof TARGET_TYPES,
          emoji: args.input.emoji as
            | '👍'
            | '👎'
            | '❤️'
            | '😂'
            | '😮'
            | '😢'
            | '😠'
            | '🔥'
            | '👏'
            | '👀'
            | '🚀'
            | '💪'
            | '🐐'
            | '🎯'
            | '🏀'
            | '⚽'
            | '🏈'
            | '⚾'
            | '🎾'
            | '⛳',
        })
        .returning();

      return {
        reaction: newReaction?.[0]
          ? {
              id: newReaction[0].id,
              emoji: newReaction[0].emoji,
              user_id: newReaction[0].user_id,
              target_id: newReaction[0].target_id,
              target_type: newReaction[0].target_type,
              created_at: newReaction[0].created_at,
              updated_at: newReaction[0].updated_at,
            }
          : null,
        errors: [],
      };
    } catch (error) {
      return {
        reaction: null,
        errors: [{ message: 'Failed to create reaction', code: 'CREATE_REACTION_ERROR' }],
      };
    }
  },

  // Delete a reaction
  deleteReaction: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      // Check if user owns the reaction
      const existingReaction = await db()?.query.reactions.findFirst({
        where: eq(reactions.id, args.id),
      });

      if (!existingReaction || existingReaction.user_id !== context.user.id) {
        throw new AuthorizationError('Access denied to this reaction');
      }

      await db()?.delete(reactions).where(eq(reactions.id, args.id));

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ message: 'Failed to delete reaction', code: 'DELETE_REACTION_ERROR' }],
      };
    }
  },
};

// Friendship Mutations
export const friendshipMutationResolvers = {
  // Send friend request
  sendFriendRequest: async (
    _parent: unknown,
    args: { userId: string },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    if (context.user.id === args.userId) {
      return {
        friendship: null,
        errors: [
          { message: 'Cannot send friend request to yourself', code: 'SELF_FRIEND_REQUEST' },
        ],
      };
    }

    try {
      const friendshipId = nanoid();
      const newFriendship = await db()
        ?.insert(friendships)
        .values({
          id: friendshipId,
          user_id: context.user.id,
          friend_id: args.userId,
          status: FRIENDSHIP_STATUS.PENDING,
        })
        .returning();

      return {
        friendship: newFriendship?.[0]
          ? {
              id: newFriendship[0].id,
              status: newFriendship[0].status,
              created_at: newFriendship[0].created_at,
              updated_at: newFriendship[0].updated_at,
            }
          : null,
        errors: [],
      };
    } catch (error) {
      return {
        friendship: null,
        errors: [{ message: 'Failed to send friend request', code: 'SEND_FRIEND_REQUEST_ERROR' }],
      };
    }
  },

  // Accept friend request
  acceptFriendRequest: async (
    _parent: unknown,
    args: { friendshipId: string },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const updatedFriendship = await db()
        ?.update(friendships)
        .set({
          status: FRIENDSHIP_STATUS.ACCEPTED,
          updated_at: new Date(),
        })
        .where(
          and(eq(friendships.id, args.friendshipId), eq(friendships.friend_id, context.user.id))
        )
        .returning();

      return {
        friendship: updatedFriendship?.[0]
          ? {
              id: updatedFriendship[0].id,
              status: updatedFriendship[0].status,
              created_at: updatedFriendship[0].created_at,
              updated_at: updatedFriendship[0].updated_at,
            }
          : null,
        errors: [],
      };
    } catch (error) {
      return {
        friendship: null,
        errors: [
          { message: 'Failed to accept friend request', code: 'ACCEPT_FRIEND_REQUEST_ERROR' },
        ],
      };
    }
  },

  // Reject friend request
  rejectFriendRequest: async (
    _parent: unknown,
    args: { friendshipId: string },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      const updatedFriendship = await db()
        ?.update(friendships)
        .set({
          status: FRIENDSHIP_STATUS.REJECTED,
          updated_at: new Date(),
        })
        .where(
          and(eq(friendships.id, args.friendshipId), eq(friendships.friend_id, context.user.id))
        )
        .returning();

      return {
        friendship: updatedFriendship?.[0]
          ? {
              id: updatedFriendship[0].id,
              status: updatedFriendship[0].status,
              created_at: updatedFriendship[0].created_at,
              updated_at: updatedFriendship[0].updated_at,
            }
          : null,
        errors: [],
      };
    } catch (error) {
      return {
        friendship: null,
        errors: [
          { message: 'Failed to reject friend request', code: 'REJECT_FRIEND_REQUEST_ERROR' },
        ],
      };
    }
  },

  // Remove friend
  removeFriend: async (
    _parent: unknown,
    args: { friendshipId: string },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      await db()
        ?.delete(friendships)
        .where(
          and(eq(friendships.id, args.friendshipId), eq(friendships.user_id, context.user.id))
        );

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ message: 'Failed to remove friend', code: 'REMOVE_FRIEND_ERROR' }],
      };
    }
  },
};

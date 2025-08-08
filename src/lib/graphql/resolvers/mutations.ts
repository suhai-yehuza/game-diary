import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { nba_games, comments, reactions } from '@/lib/db/schema';
import type { REACTION_EMOJIS } from '@/lib/db/schema/constants';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { TARGET_TYPES, GraphQLContext } from '@/lib/types';
import { generateUUIDv7 } from '@/lib/utils/id-generator';

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
      const gameId = generateUUIDv7();
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
    } catch {
      return {
        game: null,
        errors: [{ message: 'Failed to create game', code: 'CREATE_GAME_ERROR' }],
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
      const commentId = generateUUIDv7();
      await db()
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

      // Fetch the created comment with user data
      const createdComment = await db()?.query.comments.findFirst({
        where: eq(comments.id, commentId),
        with: {
          user: true,
        },
      });

      return {
        comment: createdComment
          ? {
              id: createdComment.id,
              content: createdComment.content,
              user_id: createdComment.user_id,
              parent_id: createdComment.parent_id,
              parent_type: createdComment.parent_type,
              depth: createdComment.depth,
              created_at: createdComment.created_at,
              updated_at: createdComment.updated_at,
              deleted_at: createdComment.deleted_at,
              user: {
                id: createdComment.user?.id ?? '',
                username: createdComment.user?.username ?? '',
                first_name: createdComment.user?.first_name ?? '',
                last_name: createdComment.user?.last_name ?? '',
                email_address: null,
                phone_number: null,
                image_url: createdComment.user?.image_url ?? null,
              },
              reactions: [], // Reactions will be fetched separately via the reactions query
            }
          : null,
        errors: [],
      };
    } catch {
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

      await db()
        ?.update(comments)
        .set({
          content: args.input.content,
          updated_at: new Date(),
        })
        .where(eq(comments.id, args.id))
        .returning();

      // Fetch the updated comment with user data
      const updatedCommentWithUser = await db()?.query.comments.findFirst({
        where: eq(comments.id, args.id),
        with: {
          user: true,
        },
      });

      return {
        comment: updatedCommentWithUser
          ? {
              id: updatedCommentWithUser.id,
              content: updatedCommentWithUser.content,
              user_id: updatedCommentWithUser.user_id,
              parent_id: updatedCommentWithUser.parent_id,
              parent_type: updatedCommentWithUser.parent_type,
              depth: updatedCommentWithUser.depth,
              created_at: updatedCommentWithUser.created_at,
              updated_at: updatedCommentWithUser.updated_at,
              deleted_at: updatedCommentWithUser.deleted_at,
              user: {
                id: updatedCommentWithUser.user?.id ?? '',
                username: updatedCommentWithUser.user?.username ?? '',
                first_name: updatedCommentWithUser.user?.first_name ?? '',
                last_name: updatedCommentWithUser.user?.last_name ?? '',
                email_address: null,
                phone_number: null,
                image_url: updatedCommentWithUser.user?.image_url ?? null,
              },
              reactions: [], // Reactions will be fetched separately via the reactions query
            }
          : null,
        errors: [],
      };
    } catch {
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
    } catch {
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
      const reactionId = generateUUIDv7();
      const newReaction = await db()
        ?.insert(reactions)
        .values({
          id: reactionId,
          user_id: context.user.id,
          target_id: args.input.targetId,
          target_type: args.input.targetType as keyof typeof TARGET_TYPES,
          emoji: args.input.emoji as (typeof REACTION_EMOJIS)[keyof typeof REACTION_EMOJIS],
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
              user: {
                id: context.user.id,
                username: context.user.username || '',
                first_name: context.user.firstName || '',
                last_name: context.user.lastName || '',
                email_address: context.user.email || null,
                phone_number: null,
                image_url: null,
              },
            }
          : null,
        errors: [],
      };
    } catch {
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
    } catch {
      return {
        success: false,
        errors: [{ message: 'Failed to delete reaction', code: 'DELETE_REACTION_ERROR' }],
      };
    }
  },
};

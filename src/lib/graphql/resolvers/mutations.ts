import { eq, and } from 'drizzle-orm';

import type { REACTION_EMOJIS } from '@/lib/constants';
import { isValidReactionEmoji, isValidTargetType } from '@/lib/constants';
import { db } from '@/lib/db';
import { basketball_games, comments, reactions } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { errorHandlers } from '@/lib/utils/error-handler';
import { generateUUIDv7 } from '@/lib/utils/id-generator';
import type { GraphQLContext, TARGET_TYPES } from '@/types';

// Game Mutations
export const gameMutationResolvers = {
  // Create a new game
  createGame: async (
    _parent: unknown,
    args: {
      input: {
        date: Date;
        teams?: Record<string, unknown>;
        game_type: string;
        basketball_game_id?: string;
        season?: string;
        status: string;
        scores?: Record<string, unknown>;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      // Generate the new formatted ID if we have season and basketball_game_id
      let gameId: string;
      if (args.input.season && args.input.basketball_game_id) {
        gameId = `${args.input.season}-${args.input.basketball_game_id}`;
      } else {
        gameId = generateUUIDv7();
      }

      const newGame = await db()
        ?.insert(basketball_games)
        .values({
          id: gameId,
          date: args.input.date,
          teams: args.input.teams,
          game_type: args.input.game_type,
          season: args.input.season,
          basketball_game_id: args.input.basketball_game_id,
          game_status: typeof args.input.status === 'string' ? args.input.status : 'scheduled',
          status: args.input.status,
          scores: args.input.scores,
        })
        .returning();

      return {
        game: newGame?.[0]
          ? {
              id: newGame[0].id,
              date: newGame[0].date,
              status: newGame[0].status,
              game_type: newGame[0].game_type,
              season: newGame[0].season,
              basketball_game_id: newGame[0].basketball_game_id,
              teams: newGame[0].teams,
              scores: newGame[0].scores,
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
                isAdmin: false, // Default value since isAdmin is not available
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
                isAdmin: false, // Default value since isAdmin is not available
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

    // If MOCK_MODE is enabled, validate input and return appropriate response
    if (process.env.MOCK_MODE === 'true') {
      // Validate emoji
      if (!args.input.emoji || args.input.emoji.trim() === '') {
        return {
          reaction: null,
          errors: [
            { message: 'Reaction emoji is required', code: 'VALIDATION_ERROR', field: 'emoji' },
          ],
        };
      }

      // Validate targetId
      if (!args.input.targetId || args.input.targetId.trim() === '') {
        return {
          reaction: null,
          errors: [
            { message: 'Target ID is required', code: 'VALIDATION_ERROR', field: 'targetId' },
          ],
        };
      }

      // Validate targetType
      if (!args.input.targetType || args.input.targetType.trim() === '') {
        return {
          reaction: null,
          errors: [
            { message: 'Target type is required', code: 'VALIDATION_ERROR', field: 'targetType' },
          ],
        };
      }

      // Check for invalid emojis (basic validation)
      if (!isValidReactionEmoji(args.input.emoji)) {
        return {
          reaction: null,
          errors: [{ message: 'Invalid emoji', code: 'VALIDATION_ERROR', field: 'emoji' }],
        };
      }

      // Check for invalid target types
      if (!isValidTargetType(args.input.targetType)) {
        return {
          reaction: null,
          errors: [
            { message: 'Invalid target type', code: 'VALIDATION_ERROR', field: 'targetType' },
          ],
        };
      }

      // Validate targetId length (max 255 characters)
      if (args.input.targetId && args.input.targetId.length > 255) {
        return {
          reaction: null,
          errors: [
            {
              message: 'Target ID is too long (max 255 characters)',
              code: 'VALIDATION_ERROR',
              field: 'targetId',
            },
          ],
        };
      }

      // If validation passes, return a mock reaction
      return {
        reaction: {
          id: `mock-reaction-${Date.now()}`,
          emoji: args.input.emoji,
          user_id: context.user.id,
          target_id: args.input.targetId,
          target_type: args.input.targetType,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          user: {
            id: context.user.id,
            username: context.user.username || '',
            first_name: context.user.firstName || '',
            last_name: context.user.lastName || '',
            email_address: context.user.email || null,
            phone_number: null,
            image_url: null,
            isAdmin: false,
          },
        },
        errors: [],
      };
    }

    try {
      // First, check if there's an existing soft-deleted reaction we can reactivate
      const existingReaction = await db()?.query.reactions.findFirst({
        where: and(
          eq(reactions.user_id, context.user.id),
          eq(reactions.target_id, args.input.targetId),
          eq(reactions.target_type, args.input.targetType as keyof typeof TARGET_TYPES),
          eq(
            reactions.emoji,
            args.input.emoji as (typeof REACTION_EMOJIS)[keyof typeof REACTION_EMOJIS]
          )
        ),
      });

      let reactionResult;

      if (existingReaction?.deleted_at) {
        // Reactivate the soft-deleted reaction
        const reactivatedReaction = await db()
          ?.update(reactions)
          .set({
            deleted_at: null,
            updated_at: new Date(),
          })
          .where(eq(reactions.id, existingReaction.id))
          .returning();

        reactionResult = reactivatedReaction?.[0];
      } else if (!existingReaction) {
        // Create a new reaction only if none exists
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

        reactionResult = newReaction?.[0];
      } else {
        // Reaction already exists and is not deleted - return the existing reaction
        reactionResult = existingReaction;
      }

      return {
        reaction: reactionResult
          ? {
              id: reactionResult.id,
              emoji: reactionResult.emoji,
              user_id: reactionResult.user_id,
              target_id: reactionResult.target_id,
              target_type: reactionResult.target_type,
              created_at: reactionResult.created_at,
              updated_at: reactionResult.updated_at,
              deleted_at: reactionResult.deleted_at,
              user: {
                id: context.user.id,
                username: context.user.username || '',
                first_name: context.user.firstName || '',
                last_name: context.user.lastName || '',
                email_address: context.user.email || null,
                phone_number: null,
                image_url: null,
                isAdmin: false, // Default value since isAdmin is not available
              },
            }
          : null,
        errors: [],
      };
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Create reaction',
      });
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

      // Soft delete by setting deleted_at
      await db()
        ?.update(reactions)
        .set({
          deleted_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(reactions.id, args.id));

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

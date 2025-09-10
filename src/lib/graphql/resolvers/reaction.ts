import { eq, and, isNull } from 'drizzle-orm';

import type { REACTION_EMOJIS } from '@/lib/constants';
import { isValidReactionEmoji, isValidTargetType } from '@/lib/constants';
import { db } from '@/lib/db';
import { reactions } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { errorHandlers } from '@/lib/utils/error-handler';
import { generateUUIDv7 } from '@/lib/utils/id-generator';
import type { GraphQLContext, TARGET_TYPES } from '@/types';

// Reaction Query Resolvers
export const reactionQueryResolvers = {
  // Get reactions for a specific target
  reactions: async (
    _parent: unknown,
    args: { targetId: string; targetType: string },
    context: GraphQLContext
  ) => {
    console.log('🎯 reactions query called:', {
      targetId: args.targetId,
      targetType: args.targetType,
    });

    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // If MOCK_MODE is enabled, return empty array for reactions
    if (process.env.MOCK_MODE === 'true') {
      return [];
    }

    const reactionsData = await db()?.query.reactions.findMany({
      where: and(
        eq(reactions.target_id, args.targetId),
        eq(reactions.target_type, args.targetType as 'GAME_LOG' | 'COMMENT'),
        isNull(reactions.deleted_at)
      ),
      columns: {
        id: true,
        emoji: true,
        user_id: true,
        target_id: true,
        target_type: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            image_url: true,
            isAdmin: true,
          },
        },
      },
    });

    const result =
      reactionsData?.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        user_id: reaction.user_id,
        target_id: reaction.target_id,
        target_type: reaction.target_type,
        created_at: reaction.created_at,
        updated_at: reaction.updated_at,
        deleted_at: reaction.deleted_at,
        user: {
          id: reaction.user?.id ?? '',
          username: reaction.user?.username ?? '',
          first_name: reaction.user?.first_name ?? '',
          last_name: reaction.user?.last_name ?? '',
          email_address: null,
          phone_number: null,
          image_url: reaction.user?.image_url ?? null,
          isAdmin: reaction.user?.isAdmin ?? false, // Ensure isAdmin is always present
        },
      })) ?? [];

    console.log('🎯 reactions query result:', {
      targetId: args.targetId,
      count: result.length,
      reactions: result.slice(0, 3), // Show first 3 reactions
    });

    return result;
  },
};

// Reaction Type Resolvers
export const reactionResolver = {
  // Add any reaction-specific field resolvers here
};

// Reaction Mutation Resolvers
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
      // Check if there's an existing reaction (including soft-deleted ones)
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
        // Reaction already exists and is active - this shouldn't happen due to unique constraint
        // but if it does, return the existing reaction
        reactionResult = existingReaction;
      }

      // Invalidate game logs cache to ensure UI updates
      try {
        const { simpleCacheService } = await import('@/lib/cache');
        simpleCacheService.invalidate({
          pattern: 'game-logs:*',
        });
        console.log('✅ Game logs cache invalidated after reaction create');
      } catch (cacheError) {
        console.warn('⚠️ Failed to invalidate game logs cache:', cacheError);
      }

      // Also invalidate specific game log caches
      // Cache invalidation handled by Apollo Client's optimistic updates

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

      // Invalidate game logs cache to ensure UI updates
      try {
        const { simpleCacheService } = await import('@/lib/cache');
        simpleCacheService.invalidate({
          pattern: 'game-logs:*',
        });
        console.log('✅ Game logs cache invalidated after reaction delete');
      } catch (cacheError) {
        console.warn('⚠️ Failed to invalidate game logs cache:', cacheError);
      }

      // Also invalidate specific game log caches
      // Cache invalidation handled by Apollo Client's optimistic updates

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

import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/lib/db';
import { friendships } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { FRIENDSHIP_STATUS } from '@/lib/types';
import type { GraphQLContext } from '@/lib/types/dbTypes';

// Friendship Mutation Resolvers
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      return {
        success: false,
        errors: [{ message: 'Failed to remove friend', code: 'REMOVE_FRIEND_ERROR' }],
      };
    }
  },
};

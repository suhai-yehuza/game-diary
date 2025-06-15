import { eq, and, isNull } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import type { z } from 'zod';

import { logger } from '@lib/core/logger';
import { getCache } from '@src/lib/cache';
import { db } from '@src/lib/db';
import * as schema from '@src/lib/db/schema';
import {
  AuthenticationError,
  BusinessLogicError,
  NotFoundError,
  ValidationError,
} from '@src/lib/graphql/errors';
import type { IContext } from '@src/lib/types/component.types';
import { FRIENDSHIP_STATUS } from '@src/lib/types/config.types';
import type {
  MutationSendFriendRequestArgs,
  MutationAcceptFriendRequestArgs,
  MutationRejectFriendRequestArgs,
  MutationRemoveFriendArgs,
} from '@src/lib/types/generated/graphql';
import { sendFriendRequestSchema, friendshipIdSchema } from '@src/lib/validations/friendship';

import { ensureUserExists } from './utils';

// Helper functions
const validateInput = (schema: z.ZodTypeAny, input: unknown) => {
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

// Friendship Mutations
export const sendFriendRequest = async (
  _parent: unknown,
  { userId }: MutationSendFriendRequestArgs,
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
    validateInput(sendFriendRequestSchema, { userId });

    // Check if target user exists
    const targetUsers = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.id, userId), isNull(schema.users.deletedAt)))
      .limit(1);

    const targetUser = targetUsers[0];
    if (!targetUser) {
      throw new NotFoundError('User', userId);
    }

    // Check if friendship already exists
    const existingFriendship = await db
      .select()
      .from(schema.friendships)
      .where(and(eq(schema.friendships.userId, user.id), eq(schema.friendships.friendId, userId)))
      .limit(1);

    if (existingFriendship.length > 0) {
      throw new BusinessLogicError(
        'A friendship request already exists between these users.',
        'DUPLICATE_FRIENDSHIP'
      );
    }

    // Create friendship
    const [friendship] = await db
      .insert(schema.friendships)
      .values({
        userId: user.id,
        friendId: userId,
        status: FRIENDSHIP_STATUS.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Update user friendship IDs
    await db
      .update(schema.users)
      .set({
        outboundFriendshipIds: [...(dbUser.outboundFriendshipIds || []), friendship.id],
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));

    await db
      .update(schema.users)
      .set({
        inboundFriendshipIds: [...(targetUser.inboundFriendshipIds || []), friendship.id],
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    // Invalidate related caches
    const cache = getCache();
    await cache.del(`user:${user.id}`);
    await cache.del(`user:${userId}`);

    return { friendship, errors: null };
  } catch (error) {
    return handleError(error, 'send friend request');
  }
};

export const acceptFriendRequest = async (
  _parent: unknown,
  { friendshipId }: MutationAcceptFriendRequestArgs,
  context: IContext
) => {
  try {
    const user = checkAuth(context.user);

    // Validate input
    validateInput(friendshipIdSchema, { friendshipId });

    // Check if friendship exists and belongs to user
    const friendships = await db
      .select()
      .from(schema.friendships)
      .where(
        and(
          eq(schema.friendships.id, friendshipId),
          eq(schema.friendships.friendId, user.id),
          eq(schema.friendships.status, FRIENDSHIP_STATUS.PENDING)
        )
      )
      .limit(1);

    const friendship = friendships[0];
    if (!friendship) {
      throw new NotFoundError('Friendship', friendshipId);
    }

    // Update friendship status
    const [updatedFriendship] = await db
      .update(schema.friendships)
      .set({
        status: FRIENDSHIP_STATUS.ACCEPTED,
        updatedAt: new Date(),
      })
      .where(eq(schema.friendships.id, friendshipId))
      .returning();

    // Invalidate related caches
    const cache = getCache();
    await cache.del(`user:${user.id}`);
    await cache.del(`user:${friendship.userId}`);

    return { friendship: updatedFriendship, errors: null };
  } catch (error) {
    return handleError(error, 'accept friend request');
  }
};

export const rejectFriendRequest = async (
  _parent: unknown,
  { friendshipId }: MutationRejectFriendRequestArgs,
  context: IContext
) => {
  try {
    const user = checkAuth(context.user);

    // Validate input
    validateInput(friendshipIdSchema, { friendshipId });

    // Check if friendship exists and belongs to user
    const friendships = await db
      .select()
      .from(schema.friendships)
      .where(
        and(
          eq(schema.friendships.id, friendshipId),
          eq(schema.friendships.friendId, user.id),
          eq(schema.friendships.status, FRIENDSHIP_STATUS.PENDING)
        )
      )
      .limit(1);

    const friendship = friendships[0];
    if (!friendship) {
      throw new NotFoundError('Friendship', friendshipId);
    }

    // Update friendship status
    const [updatedFriendship] = await db
      .update(schema.friendships)
      .set({
        status: FRIENDSHIP_STATUS.REJECTED,
        updatedAt: new Date(),
      })
      .where(eq(schema.friendships.id, friendshipId))
      .returning();

    // Invalidate related caches
    const cache = getCache();
    await cache.del(`user:${user.id}`);
    await cache.del(`user:${friendship.userId}`);

    return { friendship: updatedFriendship, errors: null };
  } catch (error) {
    return handleError(error, 'reject friend request');
  }
};

export const removeFriend = async (
  _parent: unknown,
  { friendshipId }: MutationRemoveFriendArgs,
  context: IContext
) => {
  try {
    const user = checkAuth(context.user);

    // Validate input
    validateInput(friendshipIdSchema, { friendshipId });

    // Check if friendship exists and involves user
    const friendships = await db
      .select()
      .from(schema.friendships)
      .where(
        and(
          eq(schema.friendships.id, friendshipId),
          eq(schema.friendships.status, FRIENDSHIP_STATUS.ACCEPTED),
          eq(schema.friendships.userId, user.id)
        )
      )
      .limit(1);

    const friendship = friendships[0];
    if (!friendship) {
      throw new NotFoundError('Friendship', friendshipId);
    }

    // Delete friendship
    await db.delete(schema.friendships).where(eq(schema.friendships.id, friendshipId));

    // Update user friendship IDs
    const [initiator] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, String(user.id)))
      .limit(1);

    const [recipient] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, String(friendship.friendId)))
      .limit(1);

    if (initiator) {
      await db
        .update(schema.users)
        .set({
          outboundFriendshipIds: initiator.outboundFriendshipIds?.filter(id => id !== friendshipId),
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, String(user.id)));
    }

    if (recipient) {
      await db
        .update(schema.users)
        .set({
          inboundFriendshipIds: recipient.inboundFriendshipIds?.filter(id => id !== friendshipId),
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, String(friendship.friendId)));
    }

    // Invalidate related caches
    const cache = getCache();
    await cache.del(`user:${user.id}`);
    await cache.del(`user:${friendship.friendId}`);

    return { success: true, errors: null };
  } catch (error) {
    return handleError(error, 'remove friend');
  }
};

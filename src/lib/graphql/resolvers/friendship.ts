import { eq, and, or, desc, asc, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { friendships } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { FRIENDSHIP_STATUS } from '@/lib/types';
import type { GraphQLContext } from '@/lib/types';
import { generateUUIDv7 } from '@/lib/utils/id-generator';

// Friendship Query Resolvers
export const friendshipQueryResolvers = {
  // Get user friendships with filters
  userFriendships: async (
    _parent: unknown,
    args: {
      filters?: {
        status?: string;
        userId?: string;
        friendId?: string;
        isInitiator?: boolean;
        isRecipient?: boolean;
        createdAfter?: Date;
        createdBefore?: Date;
        orderBy?: string;
      };
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { filters, pagination } = args;
    const limit = pagination?.first ?? 20;
    const offset = 0; // Simple pagination for now

    const whereConditions = [];

    // Always filter by current user
    whereConditions.push(
      or(eq(friendships.user_id, context.user.id), eq(friendships.friend_id, context.user.id))
    );

    if (filters?.status) {
      whereConditions.push(
        eq(
          friendships.status,
          filters.status as (typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS]
        )
      );
    }

    if (filters?.userId) {
      whereConditions.push(eq(friendships.user_id, filters.userId));
    }

    if (filters?.friendId) {
      whereConditions.push(eq(friendships.friend_id, filters.friendId));
    }

    if (filters?.isInitiator) {
      whereConditions.push(eq(friendships.user_id, context.user.id));
    }

    if (filters?.isRecipient) {
      whereConditions.push(eq(friendships.friend_id, context.user.id));
    }

    if (filters?.createdAfter) {
      whereConditions.push(sql`${friendships.created_at} >= ${filters.createdAfter}`);
    }

    if (filters?.createdBefore) {
      whereConditions.push(sql`${friendships.created_at} <= ${filters.createdBefore}`);
    }

    const orderBy =
      filters?.orderBy === 'created_at_desc'
        ? desc(friendships.created_at)
        : asc(friendships.created_at);

    try {
      const friendshipsResult = await db()?.query.friendships.findMany({
        where: and(...whereConditions),
        orderBy: [orderBy],
        limit,
        offset,
        with: {
          user: true,
          friend: true,
        },
      });

      const totalCount = await db()
        ?.select({ count: sql<number>`count(*)` })
        .from(friendships)
        .where(and(...whereConditions));

      const edges =
        friendshipsResult?.map(friendship => ({
          node: {
            id: friendship.id,
            status: friendship.status,
            created_at: friendship.created_at,
            updated_at: friendship.updated_at,
            initiator: {
              id: friendship.user_id,
              username: friendship.user?.username ?? '',
              first_name: friendship.user?.first_name ?? '',
              last_name: friendship.user?.last_name ?? '',
              email_address: null, // Don't expose email
              image_url: friendship.user?.image_url ?? null,
              created_at: friendship.user?.created_at ?? null,
            },
            recipient: {
              id: friendship.friend_id,
              username: friendship.friend?.username ?? '',
              first_name: friendship.friend?.first_name ?? '',
              last_name: friendship.friend?.last_name ?? '',
              email_address: null, // Don't expose email
              image_url: friendship.friend?.image_url ?? null,
              created_at: friendship.friend?.created_at ?? null,
            },
          },
          cursor: friendship.id,
        })) || [];

      return {
        edges,
        pageInfo: {
          hasNextPage: edges.length === limit,
          hasPreviousPage: false,
          startCursor: edges[0]?.cursor || null,
          endCursor: edges[edges.length - 1]?.cursor || null,
        },
        totalCount: totalCount?.[0]?.count || 0,
      };
    } catch (error) {
      console.error('Error fetching user friendships:', error);
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }
  },

  // Get friendship requests (pending friendships where current user is recipient)
  friendshipRequests: async (
    _parent: unknown,
    args: {
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { pagination } = args;
    const limit = pagination?.first ?? 20;
    const offset = 0;

    try {
      const requestsResult = await db()?.query.friendships.findMany({
        where: and(
          eq(friendships.friend_id, context.user.id),
          eq(friendships.status, FRIENDSHIP_STATUS.PENDING)
        ),
        orderBy: [desc(friendships.created_at)],
        limit,
        offset,
        with: {
          user: true, // The initiator
          friend: true, // The recipient (current user)
        },
      });

      const totalCount = await db()
        ?.select({ count: sql<number>`count(*)` })
        .from(friendships)
        .where(
          and(
            eq(friendships.friend_id, context.user.id),
            eq(friendships.status, FRIENDSHIP_STATUS.PENDING)
          )
        );

      const edges =
        requestsResult?.map(friendship => ({
          node: {
            id: friendship.id,
            status: friendship.status,
            created_at: friendship.created_at,
            updated_at: friendship.updated_at,
            initiator: {
              id: friendship.user_id,
              username: friendship.user?.username ?? '',
              first_name: friendship.user?.first_name ?? '',
              last_name: friendship.user?.last_name ?? '',
              email_address: null,
              image_url: friendship.user?.image_url ?? null,
              created_at: friendship.user?.created_at ?? null,
            },
            recipient: {
              id: friendship.friend_id,
              username: friendship.friend?.username ?? '',
              first_name: friendship.friend?.first_name ?? '',
              last_name: friendship.friend?.last_name ?? '',
              email_address: null,
              image_url: friendship.friend?.image_url ?? null,
              created_at: friendship.friend?.created_at ?? null,
            },
          },
          cursor: friendship.id,
        })) || [];

      return {
        edges,
        pageInfo: {
          hasNextPage: edges.length === limit,
          hasPreviousPage: false,
          startCursor: edges[0]?.cursor || null,
          endCursor: edges[edges.length - 1]?.cursor || null,
        },
        totalCount: totalCount?.[0]?.count || 0,
      };
    } catch (error) {
      console.error('Error fetching friendship requests:', error);
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }
  },

  // Get friendship status between current user and another user
  friendshipStatus: async (_parent: unknown, args: { userId: string }, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    if (context.user.id === args.userId) {
      return {
        status: null,
        friendshipId: null,
        isInitiator: false,
      };
    }

    try {
      const friendship = await db()?.query.friendships.findFirst({
        where: or(
          and(eq(friendships.user_id, context.user.id), eq(friendships.friend_id, args.userId)),
          and(eq(friendships.user_id, args.userId), eq(friendships.friend_id, context.user.id))
        ),
      });

      if (!friendship) {
        return {
          status: null,
          friendshipId: null,
          isInitiator: false,
        };
      }

      return {
        status: friendship.status,
        friendshipId: friendship.id,
        isInitiator: friendship.user_id === context.user.id,
      };
    } catch (error) {
      console.error('Error fetching friendship status:', error);
      return {
        status: null,
        friendshipId: null,
        isInitiator: false,
      };
    }
  },
};

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
      const friendshipId = generateUUIDv7();
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

import { eq, and, or, desc, asc, sql, isNull } from 'drizzle-orm';

import { db } from '@/lib/db';
import { friendships } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { FRIENDSHIP_STATUS } from '@/lib/types';
import type { GraphQLContext } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';
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

    // Always filter out soft deleted friendships
    whereConditions.push(isNull(friendships.deleted_at));

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
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Fetch user friendships',
      });
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
          isNull(friendships.deleted_at),
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
            isNull(friendships.deleted_at),
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
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Fetch friendship requests',
      });
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
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Fetch friendship status',
      });
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
      // Check if a friendship already exists between these users
      const existingFriendship = await db()
        ?.select()
        .from(friendships)
        .where(
          or(
            and(eq(friendships.user_id, context.user.id), eq(friendships.friend_id, args.userId)),
            and(eq(friendships.user_id, args.userId), eq(friendships.friend_id, context.user.id))
          )
        )
        .limit(1);

      if (existingFriendship && existingFriendship.length > 0) {
        const friendship = existingFriendship[0];

        if (friendship.status === 'PENDING') {
          if (friendship.user_id === context.user.id) {
            return {
              friendship: null,
              errors: [
                {
                  message: 'Friend request already sent to this user',
                  code: 'DUPLICATE_FRIEND_REQUEST',
                },
              ],
            };
          } else {
            return {
              friendship: null,
              errors: [
                {
                  message: 'This user has already sent you a friend request',
                  code: 'INCOMING_FRIEND_REQUEST',
                },
              ],
            };
          }
        } else if (friendship.status === 'ACCEPTED') {
          return {
            friendship: null,
            errors: [
              { message: 'You are already friends with this user', code: 'ALREADY_FRIENDS' },
            ],
          };
        } else if (friendship.status === 'REJECTED') {
          return {
            friendship: null,
            errors: [
              { message: 'Friend request was previously rejected', code: 'PREVIOUSLY_REJECTED' },
            ],
          };
        }
      }

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

      if (newFriendship?.[0]) {
        // Fetch the complete friendship with user data
        const completeFriendship = await db()?.query.friendships.findFirst({
          where: eq(friendships.id, newFriendship[0].id),
          with: {
            user: true,
            friend: true,
          },
        });

        return {
          friendship: completeFriendship
            ? {
                id: completeFriendship.id,
                status: completeFriendship.status,
                created_at: completeFriendship.created_at,
                updated_at: completeFriendship.updated_at,
                initiator: {
                  id: completeFriendship.user_id,
                  username: completeFriendship.user?.username ?? '',
                  first_name: completeFriendship.user?.first_name ?? '',
                  last_name: completeFriendship.user?.last_name ?? '',
                  email_address: null, // Don't expose email
                  image_url: completeFriendship.user?.image_url ?? null,
                  created_at: completeFriendship.user?.created_at ?? null,
                },
                recipient: {
                  id: completeFriendship.friend_id,
                  username: completeFriendship.friend?.username ?? '',
                  first_name: completeFriendship.friend?.first_name ?? '',
                  last_name: completeFriendship.friend?.last_name ?? '',
                  email_address: null, // Don't expose email
                  image_url: completeFriendship.friend?.image_url ?? null,
                  created_at: completeFriendship.friend?.created_at ?? null,
                },
              }
            : null,
          errors: [],
        };
      }

      return {
        friendship: null,
        errors: [],
      };
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Send friend request',
      });
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

      if (updatedFriendship?.[0]) {
        // Fetch the complete friendship with user data
        const completeFriendship = await db()?.query.friendships.findFirst({
          where: eq(friendships.id, updatedFriendship[0].id),
          with: {
            user: true,
            friend: true,
          },
        });

        return {
          friendship: completeFriendship
            ? {
                id: completeFriendship.id,
                status: completeFriendship.status,
                created_at: completeFriendship.created_at,
                updated_at: completeFriendship.updated_at,
                initiator: {
                  id: completeFriendship.user_id,
                  username: completeFriendship.user?.username ?? '',
                  first_name: completeFriendship.user?.first_name ?? '',
                  last_name: completeFriendship.user?.last_name ?? '',
                  email_address: null, // Don't expose email
                  image_url: completeFriendship.user?.image_url ?? null,
                  created_at: completeFriendship.user?.created_at ?? null,
                },
                recipient: {
                  id: completeFriendship.friend_id,
                  username: completeFriendship.friend?.username ?? '',
                  first_name: completeFriendship.friend?.first_name ?? '',
                  last_name: completeFriendship.friend?.last_name ?? '',
                  email_address: null, // Don't expose email
                  image_url: completeFriendship.friend?.image_url ?? null,
                  created_at: completeFriendship.friend?.created_at ?? null,
                },
              }
            : null,
          errors: [],
        };
      }

      return {
        friendship: null,
        errors: [],
      };
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Accept friend request',
      });
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

      if (updatedFriendship?.[0]) {
        // Fetch the complete friendship with user data
        const completeFriendship = await db()?.query.friendships.findFirst({
          where: eq(friendships.id, updatedFriendship[0].id),
          with: {
            user: true,
            friend: true,
          },
        });

        return {
          friendship: completeFriendship
            ? {
                id: completeFriendship.id,
                status: completeFriendship.status,
                created_at: completeFriendship.created_at,
                updated_at: completeFriendship.updated_at,
                initiator: {
                  id: completeFriendship.user_id,
                  username: completeFriendship.user?.username ?? '',
                  first_name: completeFriendship.user?.first_name ?? '',
                  last_name: completeFriendship.user?.last_name ?? '',
                  email_address: null, // Don't expose email
                  image_url: completeFriendship.user?.image_url ?? null,
                  created_at: completeFriendship.user?.created_at ?? null,
                },
                recipient: {
                  id: completeFriendship.friend_id,
                  username: completeFriendship.friend?.username ?? '',
                  first_name: completeFriendship.friend?.first_name ?? '',
                  last_name: completeFriendship.friend?.last_name ?? '',
                  email_address: null, // Don't expose email
                  image_url: completeFriendship.friend?.image_url ?? null,
                  created_at: completeFriendship.friend?.created_at ?? null,
                },
              }
            : null,
          errors: [],
        };
      }

      return {
        friendship: null,
        errors: [],
      };
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Reject friend request',
      });
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
      // Check if the friendship exists and the user is part of it
      const existingFriendship = await db()?.query.friendships.findFirst({
        where: and(
          eq(friendships.id, args.friendshipId),
          or(eq(friendships.user_id, context.user.id), eq(friendships.friend_id, context.user.id))
        ),
      });

      if (!existingFriendship) {
        return {
          success: false,
          errors: [
            { message: 'Friendship not found or access denied', code: 'FRIENDSHIP_NOT_FOUND' },
          ],
        };
      }

      // Delete the friendship (user can be either user_id or friend_id)
      const deletedFriendship = await db()
        ?.delete(friendships)
        .where(
          and(
            eq(friendships.id, args.friendshipId),
            or(eq(friendships.user_id, context.user.id), eq(friendships.friend_id, context.user.id))
          )
        )
        .returning();

      if (deletedFriendship && deletedFriendship.length > 0) {
        return {
          success: true,
          errors: [],
        };
      } else {
        return {
          success: false,
          errors: [{ message: 'Failed to remove friend', code: 'REMOVE_FRIEND_ERROR' }],
        };
      }
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Remove friend',
      });
      return {
        success: false,
        errors: [{ message: 'Failed to remove friend', code: 'REMOVE_FRIEND_ERROR' }],
      };
    }
  },
};

import { eq } from 'drizzle-orm';

import * as schema from '@/lib/db/schema';
import type { Context } from '@/lib/types/context.types';
import type {
  Friendship,
  FriendshipStatus,
  Resolvers,
  UserSummary,
} from '@/lib/types/generated/graphql';

import { handleResolverError } from '../common/utils';

export const User: Resolvers['User'] = {
  friendships: async (parent, _args, { db }: Context) => {
    try {
      // Fetch friendships where this user is the recipient
      const friendships = await db
        .select()
        .from(schema.friendships)
        .where(eq(schema.friendships.friendId, parent.id))
        .orderBy(schema.friendships.createdAt);

      // Map to GraphQL format
      return friendships.map(friendship => ({
        id: friendship.id,
        status: friendship.status as FriendshipStatus,
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
        subscriberId: friendship.userId || '',
        userId: friendship.friendId || '',
        initiator: { id: friendship.userId || '' } as UserSummary,
        recipient: { id: friendship.friendId || '' } as UserSummary,
      }));
    } catch (error) {
      handleResolverError(error, 'fetch user friendships');
      return [];
    }
  },

  initiatedFriendships: async (parent, _args, { db }: Context) => {
    try {
      // Fetch friendships where this user is the initiator
      const friendships = await db
        .select()
        .from(schema.friendships)
        .where(eq(schema.friendships.userId, parent.id))
        .orderBy(schema.friendships.createdAt);

      // Map to GraphQL format with full user data
      const friendshipsWithUsers = await Promise.all(
        friendships.map(async friendship => {
          const [initiatorData, recipientData] = await Promise.all([
            db
              .select()
              .from(schema.users)
              .where(eq(schema.users.id, friendship.userId || ''))
              .limit(1),
            db
              .select()
              .from(schema.users)
              .where(eq(schema.users.id, friendship.friendId || ''))
              .limit(1),
          ]);

          return {
            id: friendship.id,
            status: friendship.status as FriendshipStatus,
            createdAt: friendship.createdAt,
            updatedAt: friendship.updatedAt,
            subscriberId: friendship.userId || '',
            userId: friendship.friendId || '',
            initiator: initiatorData[0]
              ? {
                  id: initiatorData[0].id,
                  username: initiatorData[0].username,
                  emailAddress: initiatorData[0].emailAddress,
                  imageUrl: initiatorData[0].imageUrl,
                  firstName: initiatorData[0].firstName,
                  lastName: initiatorData[0].lastName,
                  createdAt: initiatorData[0].createdAt,
                  updatedAt: initiatorData[0].updatedAt,
                }
              : null,
            recipient: recipientData[0]
              ? {
                  id: recipientData[0].id,
                  username: recipientData[0].username,
                  emailAddress: recipientData[0].emailAddress,
                  imageUrl: recipientData[0].imageUrl,
                  firstName: recipientData[0].firstName,
                  lastName: recipientData[0].lastName,
                  createdAt: recipientData[0].createdAt,
                  updatedAt: recipientData[0].updatedAt,
                }
              : null,
          };
        })
      );

      return friendshipsWithUsers.filter(f => f.initiator && f.recipient) as Friendship[];
    } catch (error) {
      handleResolverError(error, 'fetch user initiated friendships');
      return [];
    }
  },

  // Other fields can use default resolvers
};

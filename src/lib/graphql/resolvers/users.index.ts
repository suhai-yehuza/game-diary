import { and, eq, gt, lt, or, sql, gte, lte, desc, asc, type InferSelectModel } from 'drizzle-orm';

import * as schema from '@/lib/db/schema';
import { BusinessLogicError } from '@/lib/graphql/errors';
import { createConnection, parseCursor } from '@/lib/graphql/utils';
import type { Context } from '@/lib/types/component.types';
import type {
  DBUser,
  Friendship,
  FriendshipStatus,
  UserSummary,
} from '@/lib/types/generated/graphql';
import type { PaginationArgs, UserFilters, UserSearchFilters } from '@/lib/types/resolver.types';

import { handleResolverError } from '../utils';

// Helper function to map user data from either DatabaseRow or InferSelectModel<typeof schema.users>
export function mapUserData(user: InferSelectModel<typeof schema.users>): DBUser {
  return {
    id: user.id,
    username: user.username || '',
    emailAddress: user.emailAddress || '',
    imageUrl: user.imageUrl || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    inboundFriendshipIds: user.inboundFriendshipIds || [],
    outboundFriendshipIds: user.outboundFriendshipIds || [],
    banned: user.banned || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
    last_sign_in_at: user.last_sign_in_at,
    password_enabled: user.password_enabled || false,
    two_factor_enabled: user.two_factor_enabled || false,
    email_verified: user.email_verified || false,
    email_verification_strategy: user.email_verification_strategy,
    external_id: user.external_id || '',
    timestamp: user.timestamp,
    comments: [],
    reactions: [],
    gameLogs: [],
    friendships: [],
    initiatedFriendships: [],
    __typename: 'DBUser',
  };
}

export const searchUsers = async (
  _parent: unknown,
  args: PaginationArgs & { searchTerm?: string; filters?: UserSearchFilters },
  { db, user: _currentUser }: Context
) => {
  try {
    const { first = 20, after, searchTerm, filters } = args;
    const limit = first || 20;
    const offset = after ? parseCursor(after) : 0;

    // Build query conditions
    const conditions = [];

    // Search term - search in username, firstName, lastName, emailAddress
    if (searchTerm && searchTerm.trim()) {
      const searchPattern = `%${searchTerm.trim()}%`;
      conditions.push(
        or(
          sql`${schema.users.username} ILIKE ${searchPattern}`,
          sql`${schema.users.firstName} ILIKE ${searchPattern}`,
          sql`${schema.users.lastName} ILIKE ${searchPattern}`,
          sql`${schema.users.emailAddress} ILIKE ${searchPattern}`,
          sql`CONCAT(${schema.users.firstName}, ' ', ${schema.users.lastName}) ILIKE ${searchPattern}`
        )
      );
    }

    // Filter by join date
    if (filters?.joinedAfter) {
      conditions.push(gte(schema.users.createdAt, filters.joinedAfter));
    }
    if (filters?.joinedBefore) {
      conditions.push(lte(schema.users.createdAt, filters.joinedBefore));
    }

    // Filter by email verification
    if (filters?.isVerified !== undefined && filters.isVerified !== null) {
      conditions.push(eq(schema.users.email_verified, filters.isVerified));
    }

    // Add game log filters
    if (filters?.hasGameLogs === true || filters?.minGameLogs) {
      const minLogs = filters.minGameLogs || 1;
      conditions.push(
        sql`(
          SELECT COUNT(*) 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        ) >= ${minLogs}`
      );
    } else if (filters?.hasGameLogs === false) {
      conditions.push(
        sql`(
          SELECT COUNT(*) 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        ) = 0`
      );
    }

    // Build the query
    const query = db
      .select({
        user: schema.users,
        gameLogCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        )`,
      })
      .from(schema.users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Apply ordering
    let orderByClause;
    switch (filters?.orderBy) {
      case 'USERNAME_ASC':
        orderByClause = asc(schema.users.username);
        break;
      case 'USERNAME_DESC':
        orderByClause = desc(schema.users.username);
        break;
      case 'CREATED_AT_ASC':
        orderByClause = asc(schema.users.createdAt);
        break;
      case 'CREATED_AT_DESC':
        orderByClause = desc(schema.users.createdAt);
        break;
      case 'GAME_LOGS_DESC':
        orderByClause = desc(sql`(
          SELECT COUNT(*) 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        )`);
        break;
      case 'GAME_LOGS_ASC':
        orderByClause = asc(sql`(
          SELECT COUNT(*) 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        )`);
        break;
      default:
        orderByClause = desc(schema.users.createdAt);
    }

    // Execute query with ordering, offset, and limit
    const results = await query.orderBy(orderByClause).offset(offset).limit(limit);

    // Map users with game log data
    const mappedUsers = await Promise.all(
      results.map(async result => {
        const userData = mapUserData(result.user);

        // Fetch game log IDs for this user (limit to avoid performance issues)
        const gameLogs = await db
          .select({ id: schema.game_logs.id })
          .from(schema.game_logs)
          .where(eq(schema.game_logs.userId, result.user.id))
          .limit(100);

        return {
          ...userData,
          gameLogs,
        };
      })
    );

    // Get total count for pagination info
    const totalCountQuery = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(schema.users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = totalCountQuery[0]?.count || 0;

    return createConnection(mappedUsers, totalCount, args);
  } catch (error) {
    handleResolverError(error, 'search users');
  }
};

export const users = async (
  _parent: unknown,
  args: PaginationArgs & { filters?: UserFilters },
  { db }: Context
) => {
  try {
    const { first = 10, after, last, before, filters } = args;

    // Build the query
    const conditions = [];
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${schema.users.firstName} ILIKE ${searchTerm}`,
          sql`${schema.users.lastName} ILIKE ${searchTerm}`,
          sql`${schema.users.emailAddress} ILIKE ${searchTerm}`,
          sql`${schema.users.username} ILIKE ${searchTerm}`
        )
      );
    }
    if (after) {
      conditions.push(gt(schema.users.id, after));
    }
    if (before) {
      conditions.push(lt(schema.users.id, before));
    }

    const limit = last || first || 10;
    const query = db
      .select()
      .from(schema.users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(schema.users.createdAt)
      .limit(limit + 1);

    // Execute query
    const items = await query;

    // Check if there are more items
    const hasNextPage = items.length > limit;
    const actualItems = hasNextPage ? items.slice(0, -1) : items;

    const mappedUsers = actualItems.map(mapUserData);

    return createConnection(mappedUsers, actualItems.length, args);
  } catch (error) {
    handleResolverError(error, 'fetch users');
  }
};

export const user = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  try {
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1)
      .then(rows => rows[0]);

    if (!user) throw new BusinessLogicError(`User with id ${id} not found`, 'USER_NOT_FOUND');

    return mapUserData(user);
  } catch (error) {
    handleResolverError(error, 'fetch user');
  }
};

export const me = async (_parent: unknown, _args: unknown, { db, user }: Context) => {
  try {
    if (!user) throw new BusinessLogicError('Not authenticated', 'NOT_AUTHENTICATED');

    const userData = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1)
      .then(rows => rows[0]);

    if (!userData) throw new BusinessLogicError('User not found', 'USER_NOT_FOUND');

    return mapUserData(userData);
  } catch (error) {
    handleResolverError(error, 'fetch current user');
  }
};

export const friendships = async (parent: DBUser, _args: unknown, { db }: Context) => {
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
};

export const initiatedFriendships = async (parent: DBUser, _args: unknown, { db }: Context) => {
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
};

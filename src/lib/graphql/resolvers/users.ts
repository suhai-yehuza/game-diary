import { and, eq, gt, lt, or, sql, gte, lte, desc, asc } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

import * as schema from '@src/lib/db/schema';
import { mapDbUserToUser } from '@src/lib/db/schema/user-schemas';
import { BusinessLogicError } from '@src/lib/graphql/errors';
import { createConnection, parseCursor, handleResolverError } from '@src/lib/graphql/utils';
import type {
  IContext,
  DbUser,
  Friendship,
  FriendshipStatus,
  UserSummary,
  IPaginationArgs,
  IUserFilters,
  IUserSearchFilters,
} from '@src/lib/types';

// Helper function to map user data from either DatabaseRow or InferSelectModel<typeof schema.users>
export function mapUserData(user: InferSelectModel<typeof schema.users>): DbUser {
  return {
    id: user.id,
    username: user.username || '',
    emailAddress: user.emailAddress || '',
    image_url: user.image_url || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    inboundFriendshipIds: user.inboundFriendshipIds || [],
    outboundFriendshipIds: user.outboundFriendshipIds || [],
    banned: user.banned || false,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    deletedAt: user.deletedAt?.toISOString() || null,
    last_sign_in_at: user.last_sign_in_at?.toISOString() || null,
    password_enabled: user.password_enabled || false,
    two_factor_enabled: user.two_factor_enabled || false,
    email_verified: user.email_verified || false,
    email_verification_strategy: user.email_verification_strategy,
    external_id: user.external_id || '',
    comments: [],
    reactions: [],
    gameLogs: [],
    friendships: [],
    initiatedFriendships: [],
    ...mapDbUserToUser(user),
  };
}

export const searchUsers = async (
  _parent: unknown,
  args: IPaginationArgs & { searchTerm?: string; filters?: IUserSearchFilters },
  { db, user: _currentUser }: IContext
) => {
  try {
    const { first = 20, after, searchTerm, filters } = args;
    const limit = first || 20;
    const offset = after ? parseCursor(after) : 0;

    // Build query conditions
    const conditions = [];

    // Search term - search in username, first_name, last_name, emailAddress
    if (searchTerm && searchTerm.trim()) {
      const searchPattern = `%${searchTerm.trim()}%`;
      conditions.push(
        or(
          sql`${schema.users.username} ILIKE ${searchPattern}`,
          sql`${schema.users.first_name} ILIKE ${searchPattern}`,
          sql`${schema.users.last_name} ILIKE ${searchPattern}`,
          sql`${schema.users.emailAddress} ILIKE ${searchPattern}`,
          sql`CONCAT(${schema.users.first_name}, ' ', ${schema.users.last_name}) ILIKE ${searchPattern}`
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

    if (!db) {
      throw new Error('Database connection not available');
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
      results.map(
        async (result: { user: InferSelectModel<typeof schema.users>; gameLogCount: number }) => {
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
        }
      )
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
  args: IPaginationArgs & { filters?: IUserFilters },
  { db }: IContext
) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const { first = 10, after, last, before, filters } = args;

    // Build the query
    const conditions = [];
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${schema.users.first_name} ILIKE ${searchTerm}`,
          sql`${schema.users.last_name} ILIKE ${searchTerm}`,
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

export const user = async (_parent: unknown, { id }: { id: string }, { db }: IContext) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1)
      .then((rows: InferSelectModel<typeof schema.users>[]) => rows[0]);

    if (!user) throw new BusinessLogicError(`User with id ${id} not found`, 'USER_NOT_FOUND');

    return mapUserData(user);
  } catch (error) {
    handleResolverError(error, 'fetch user');
  }
};

export const me = async (_parent: unknown, _args: unknown, { db, user }: IContext) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    if (!user) throw new BusinessLogicError('Not authenticated', 'NOT_AUTHENTICATED');

    const userData = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1)
      .then((rows: InferSelectModel<typeof schema.users>[]) => rows[0]);

    if (!userData) throw new BusinessLogicError('User not found', 'USER_NOT_FOUND');

    return mapUserData(userData);
  } catch (error) {
    handleResolverError(error, 'fetch current user');
  }
};

export const friendships = async (parent: DbUser, _args: unknown, { db }: IContext) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    // Fetch friendships where this user is the recipient
    const friendships = await db
      .select()
      .from(schema.friendships)
      .where(eq(schema.friendships.friendId, parent.id))
      .orderBy(schema.friendships.createdAt);

    // Map to GraphQL format
    return friendships.map((friendship: InferSelectModel<typeof schema.friendships>) => ({
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

export const initiatedFriendships = async (parent: DbUser, _args: unknown, { db }: IContext) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    // Fetch friendships where this user is the initiator
    const friendships = await db
      .select()
      .from(schema.friendships)
      .where(eq(schema.friendships.userId, parent.id))
      .orderBy(schema.friendships.createdAt);

    // Map to GraphQL format with full user data
    const friendshipsWithUsers = await Promise.all(
      friendships.map(async (friendship: InferSelectModel<typeof schema.friendships>) => {
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
          createdAt: friendship.createdAt.toISOString(),
          updatedAt: friendship.updatedAt.toISOString(),
          subscriberId: friendship.userId || '',
          userId: friendship.friendId || '',
          initiator: initiatorData[0]
            ? {
                ...mapDbUserToUser(initiatorData[0]),
              }
            : null,
          recipient: recipientData[0]
            ? {
                ...mapDbUserToUser(recipientData[0]),
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

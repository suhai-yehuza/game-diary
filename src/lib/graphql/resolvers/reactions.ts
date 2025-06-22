import { and, eq, sql } from 'drizzle-orm';

import { logger } from '@lib/core/logger';
import * as schema from '@src/lib/db/schema';
import { mapDbUserToUser } from '@src/lib/db/schema/user-schemas';
import {
  createConnection,
  parseCursor,
  handleResolverError,
  getEmojiKey,
} from '@src/lib/graphql/utils';
import type { IContext, IPaginationArgs } from '@src/lib/types';

export const reactions = async (
  _parent: unknown,
  args: IPaginationArgs & { targetId: string },
  { db }: IContext
) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const { first = 10, after, last, targetId } = args;

    if (!targetId) {
      throw new Error('targetId is required');
    }

    // Build the query conditions
    const conditions = [eq(schema.reactions.targetId, targetId)];

    // Get the total count
    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.reactions)
      .where(and(...conditions));

    const totalCount = countResult?.count || 0;

    // Calculate offset from cursor
    const offset = after ? parseCursor(after) : 0;

    // Execute the query with proper offset and limit
    const query = db
      .select()
      .from(schema.reactions)
      .where(and(...conditions))
      .orderBy(schema.reactions.createdAt)
      .offset(offset)
      .limit(first || last || 10);

    // Execute query
    const items = await query;

    // Return connection
    return createConnection(items, totalCount, args);
  } catch (error) {
    handleResolverError(error, 'fetch reactions');
  }
};

// Type resolver to convert emoji character to enum key and load user data
export const Reaction = {
  emoji: (parent: { emoji: string }) => getEmojiKey(parent.emoji),
  user: async (parent: { userId: string | null }, _args: unknown, { db }: IContext) => {
    if (!parent.userId || !db) return null;
    try {
      const users = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, parent.userId))
        .limit(1);

      const user = users[0];
      if (!user) return null;

      // Return UserSummary format
      return {
        id: user.id,
        username: user.username || '',
        ...mapDbUserToUser(user),
        __typename: 'UserSummary',
      };
    } catch (error) {
      logger.error('Error loading user for reaction:', error);
      return null;
    }
  },
};

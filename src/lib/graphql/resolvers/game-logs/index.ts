import { and, eq, sql } from 'drizzle-orm';

import * as schema from '@/lib/db/schema';
import { createConnection, parseCursor } from '@/lib/graphql/utils/pagination';
import type { Context } from '@/lib/types/context.types';
import type { GameLogFilters } from '@/lib/types/generated/graphql';

import type { PaginationArgs } from '../common/types';
import { handleResolverError } from '../common/utils';

// Helper function to safely parse ratingStars
const parseRatingStars = (value: string | null | undefined): number | null => {
  if (!value || value === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

export const gameLog = async (
  _parent: unknown,
  { userId, gameId }: { userId: string; gameId: string },
  { db }: Context
) => {
  try {
    const conditions = [eq(schema.game_logs.userId, userId), eq(schema.game_logs.gameId, gameId)];

    const gameLog = await db
      .select()
      .from(schema.game_logs)
      .where(and(...conditions))
      .limit(1)
      .then(rows => rows[0]);

    if (!gameLog) {
      return null;
    }

    return {
      id: gameLog.id,
      userId: gameLog.userId,
      gameId: gameLog.gameId,
      watchedSetting: gameLog.watchedSetting,
      watchedDate: gameLog.watchedDate,
      watchedLocation: gameLog.watchedLocation,
      ratingForGame: gameLog.ratingForGame,
      ratingStars: parseRatingStars(gameLog.ratingStars),
      watchedScope: gameLog.watchedScope,
      notes: gameLog.notes,
      tags: gameLog.tags,
      classification: gameLog.classification,
      createdAt: gameLog.createdAt,
      updatedAt: gameLog.updatedAt,
      deletedAt: gameLog.deletedAt,
    };
  } catch (error) {
    handleResolverError(error, 'fetch game log');
  }
};

export const gameLogs = async (
  _parent: unknown,
  args: PaginationArgs & { filters?: GameLogFilters },
  { db }: Context
) => {
  try {
    const { first = 10, after, last, before, filters } = args;

    // Build the query conditions
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(schema.game_logs.userId, filters.userId));
    }
    
    if (filters?.gameId) {
      conditions.push(eq(schema.game_logs.gameId, filters.gameId));
    }
    
    if (filters?.classification) {
      conditions.push(eq(schema.game_logs.classification, filters.classification));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get the total count
    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.game_logs)
      .where(whereClause);
    
    const totalCount = countResult?.count || 0;

    // Calculate offset from cursor
    const offset = after ? parseCursor(after) : 0;

    // Execute the query with proper offset and limit
    const query = db
      .select()
      .from(schema.game_logs)
      .where(whereClause)
      .orderBy(schema.game_logs.createdAt)
      .offset(offset)
      .limit(first || last || 10);

    const items = await query;

    // Map the results
    const mappedLogs = items.map(log => ({
      id: log.id,
      userId: log.userId,
      gameId: log.gameId,
      watchedSetting: log.watchedSetting,
      watchedDate: log.watchedDate,
      watchedLocation: log.watchedLocation,
      ratingForGame: log.ratingForGame,
      ratingStars: parseRatingStars(log.ratingStars),
      watchedScope: log.watchedScope,
      notes: log.notes,
      tags: log.tags,
      classification: log.classification,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      deletedAt: log.deletedAt,
    }));

    return createConnection(mappedLogs, totalCount, args);
  } catch (error) {
    handleResolverError(error, 'fetch game logs');
  }
};

// Export GameLog type resolver
export const GameLog = {
  user: async (parent: any, _args: any, { loaders }: Context) => {
    if (!parent.userId || !loaders) return null;
    // Type assertion since we know these loaders exist from createLoaders
    return (loaders as any).user.load(parent.userId);
  },
  game: async (parent: any, _args: any, { loaders }: Context) => {
    if (!parent.gameId || !loaders) return null;
    // Type assertion since we know these loaders exist from createLoaders
    return (loaders as any).game.load(parent.gameId);
  },
  comments: async (parent: any, args: any, { db }: Context) => {
    // TODO: Implement comments pagination
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
  },
  reactions: async (parent: any, args: any, { db }: Context) => {
    // TODO: Implement reactions pagination
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
  },
};

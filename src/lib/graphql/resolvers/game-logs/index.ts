import { and, eq, sql, gte, lte, like, or, isNotNull, desc, asc } from 'drizzle-orm';

import * as schema from '@/lib/db/schema';
import { createConnection, parseCursor } from '@/lib/graphql/utils/pagination';
import type { Context } from '@/lib/types/component.types';
import type { GameLogFilters } from '@/lib/types/generated/graphql';

import type { PaginationArgs } from '../common/types';
import { handleResolverError } from '../common/utils';
import { import { logger } from '@/lib/logger'; } from '@/lib/logger';
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

export const gameLogById = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  try {
    const gameLog = await db
      .select()
      .from(schema.game_logs)
      .where(eq(schema.game_logs.id, id))
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
      watchedScope: gameLog.watchedScope,
      notes: gameLog.notes,
      tags: gameLog.tags,
      classification: gameLog.classification,
      createdAt: gameLog.createdAt,
      updatedAt: gameLog.updatedAt,
      deletedAt: gameLog.deletedAt,
    };
  } catch (error) {
    handleResolverError(error, 'fetch game log by id');
  }
};

export const gameLogs = async (
  _parent: unknown,
  args: PaginationArgs & { filters?: GameLogFilters },
  { db }: Context
) => {
  try {
    const { first = 10, after, last, filters } = args;

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

    // Search text - search in notes, tags, and location
    if (filters?.searchText) {
      const searchTerm = `%${filters.searchText}%`;
      conditions.push(
        or(
          like(schema.game_logs.notes, searchTerm),
          like(schema.game_logs.watchedLocation, searchTerm),
          sql`${schema.game_logs.tags}::text LIKE ${searchTerm}`
        )
      );
    }

    // Rating filters
    if (filters?.minRating) {
      conditions.push(gte(schema.game_logs.ratingForGame, filters.minRating));
    }

    if (filters?.maxRating) {
      conditions.push(lte(schema.game_logs.ratingForGame, filters.maxRating));
    }

    // Watched setting filter
    if (filters?.watchedSetting) {
      conditions.push(eq(schema.game_logs.watchedSetting, filters.watchedSetting));
    }

    // Watched location filter
    if (filters?.watchedLocation) {
      conditions.push(like(schema.game_logs.watchedLocation, `%${filters.watchedLocation}%`));
    }

    // Tags filter - check if any of the provided tags are in the game log tags
    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map(tag => sql`${tag} = ANY(${schema.game_logs.tags})`);
      conditions.push(or(...tagConditions));
    }

    // Has notes filter
    if (filters?.hasNotes === true) {
      conditions.push(isNotNull(schema.game_logs.notes));
      conditions.push(sql`${schema.game_logs.notes} != ''`);
    } else if (filters?.hasNotes === false) {
      conditions.push(or(eq(schema.game_logs.notes, ''), sql`${schema.game_logs.notes} IS NULL`));
    }

    // Date range filter
    if (filters?.watchedDateRange) {
      if (filters.watchedDateRange.start) {
        conditions.push(gte(schema.game_logs.watchedDate, filters.watchedDateRange.start));
      }
      if (filters.watchedDateRange.end) {
        conditions.push(lte(schema.game_logs.watchedDate, filters.watchedDateRange.end));
      }
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

    // Determine sort order
    let orderByClause;
    const sortDirection = filters?.sortDirection === 'ASC' ? asc : desc;

    switch (filters?.sortBy) {
      case 'WATCHED_DATE':
        orderByClause = sortDirection(schema.game_logs.watchedDate);
        break;
      case 'RATING':
        orderByClause = sortDirection(schema.game_logs.ratingForGame);
        break;
      case 'CREATED_AT':
      default:
        orderByClause = sortDirection(schema.game_logs.createdAt);
        break;
    }

    // Execute the query with proper offset and limit
    const query = db
      .select()
      .from(schema.game_logs)
      .where(whereClause)
      .orderBy(orderByClause)
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
  user: async (
    parent: { userId: string },
    _args: Record<string, unknown>,
    { loaders }: Context
  ) => {
    if (!parent.userId || !loaders) return null;
    return loaders.user?.load(parent.userId) || null;
  },
  game: async (
    parent: { gameId: string },
    _args: Record<string, unknown>,
    { loaders }: Context
  ) => {
    if (!parent.gameId || !loaders) return null;
    return loaders.game?.load(parent.gameId) || null;
  },
  comments: async (parent: { id: string }, args: { first?: number }, { db }: Context) => {
    try {
      const limit = args.first || 100;
      const comments = await db
        .select()
        .from(schema.comments)
        .where(eq(schema.comments.parentId, parent.id))
        .orderBy(schema.comments.createdAt)
        .limit(limit);

      const edges = comments.map((comment, index) => ({
        cursor: Buffer.from(index.toString()).toString('base64'),
        node: comment,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: comments.length === limit,
          hasPreviousPage: false,
          startCursor: edges[0]?.cursor || null,
          endCursor: edges[edges.length - 1]?.cursor || null,
        },
        totalCount: comments.length,
      };
    } catch (error) {
      logger.error('Error fetching comments for game log:', error);
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
  reactions: async (parent: { id: string }, args: { first?: number }, { db }: Context) => {
    try {
      const limit = args.first || 20; // Default to 20 reactions

      // Get total count of reactions
      const [countResult] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.reactions)
        .where(eq(schema.reactions.targetId, parent.id));

      const totalCount = countResult?.count || 0;

      // Fetch limited reactions
      const reactions = await db
        .select()
        .from(schema.reactions)
        .where(eq(schema.reactions.targetId, parent.id))
        .orderBy(schema.reactions.createdAt)
        .limit(limit);

      const edges = reactions.map((reaction, index) => ({
        cursor: Buffer.from(index.toString()).toString('base64'),
        node: {
          id: reaction.id,
          emoji: reaction.emoji,
          userId: reaction.userId,
          targetId: reaction.targetId,
          targetType: reaction.targetType,
          createdAt: reaction.createdAt,
          updatedAt: reaction.updatedAt,
        },
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: reactions.length < totalCount,
          hasPreviousPage: false,
          startCursor: edges[0]?.cursor || null,
          endCursor: edges[edges.length - 1]?.cursor || null,
        },
        totalCount, // Always return accurate total count
      };
    } catch (error) {
      logger.error('Error fetching reactions for game log:', error);
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
};

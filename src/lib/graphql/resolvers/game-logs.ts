import { and, eq, sql, gte, lte, like, or, isNotNull, desc, asc, ilike } from 'drizzle-orm';

import { CACHE_KEYS } from '@src/lib/cache';
import { withCache } from '@src/lib/db';
import * as schema from '@src/lib/db/schema';
import { createConnection, parseCursor } from '@src/lib/graphql/utils';
import { logger } from 'lib/core/logger';
import type { Context } from '@src/lib/types/component.types';
import type { GameLogFilters } from '@src/lib/types/generated/graphql';
import type { PaginationArgs } from '@src/lib/types/resolver.types';

import { handleResolverError } from '../utils';

export const gameLog = async (
  _parent: unknown,
  { id }: { id: string },
  { db }: Context
) => {
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
    handleResolverError(error, 'fetch game log');
  }
};

export const gameLogs = async (
  _parent: unknown,
  args: PaginationArgs & { filters?: GameLogFilters },
  { db }: Context
) => {
  try {
    const { first = 10, after, last, filters } = args;

    // If only userId is provided as a filter and no pagination, use cache
    const isSimpleUserQuery =
      filters &&
      typeof filters.userId === 'string' &&
      Object.keys(filters).length === 1 &&
      filters.userId &&
      !after &&
      !last &&
      first === 10;
    if (isSimpleUserQuery && filters.userId) {
      const userId = filters.userId;
      return withCache(CACHE_KEYS.USER_GAME_LOGS(userId), async () => {
        // Build the query conditions
        const conditions = [eq(schema.game_logs.userId, userId)];
        const whereClause = and(...conditions);

        // Get the total count
        const [countResult] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(schema.game_logs)
          .where(whereClause);

        const totalCount = countResult?.count || 0;

        // Execute the query
        const items = await db
          .select()
          .from(schema.game_logs)
          .where(whereClause)
          .orderBy(desc(schema.game_logs.createdAt))
          .limit(1000); // Arbitrary high limit for all logs

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
      });
    }

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

    // Search text - search in notes, tags, location, and team info
    if (filters?.searchText) {
      const searchTerm = `%${filters.searchText}%`;
      conditions.push(
        or(
          like(schema.game_logs.notes, searchTerm),
          like(schema.game_logs.watchedLocation, searchTerm),
          sql`${schema.game_logs.tags}::text LIKE ${searchTerm}`,
          // Team info in nba_games JSONB (use ilike for case-insensitive search)
          ilike(sql`nba_games.teams->'home'->>'name'`, searchTerm),
          ilike(sql`nba_games.teams->'home'->>'nickname'`, searchTerm),
          ilike(sql`nba_games.teams->'home'->>'city'`, searchTerm),
          ilike(sql`nba_games.teams->'visitors'->>'name'`, searchTerm),
          ilike(sql`nba_games.teams->'visitors'->>'nickname'`, searchTerm),
          ilike(sql`nba_games.teams->'visitors'->>'city'`, searchTerm)
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
      .leftJoin(schema.nba_games, eq(schema.game_logs.gameId, schema.nba_games.id))
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

    // When building the main query, join game_logs to nba_games
    const baseQuery = db
      .select()
      .from(schema.game_logs)
      .leftJoin(schema.nba_games, eq(schema.game_logs.gameId, schema.nba_games.id))
      .where(and(...conditions));

    // Execute the query with proper offset and limit
    const query = baseQuery
      .orderBy(orderByClause)
      .offset(offset)
      .limit(first || last || 10);

    const items = await query;

    // Map the results
    const mappedLogs = items.map(log => ({
      id: log.game_logs.id,
      userId: log.game_logs.userId,
      gameId: log.game_logs.gameId,
      watchedSetting: log.game_logs.watchedSetting,
      watchedDate: log.game_logs.watchedDate,
      watchedLocation: log.game_logs.watchedLocation,
      ratingForGame: log.game_logs.ratingForGame,
      watchedScope: log.game_logs.watchedScope,
      notes: log.game_logs.notes,
      tags: log.game_logs.tags,
      classification: log.game_logs.classification,
      createdAt: log.game_logs.createdAt,
      updatedAt: log.game_logs.updatedAt,
      deletedAt: log.game_logs.deletedAt,
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
    if (!parent.userId || !loaders) {
      throw new Error('User ID is required for GameLog');
    }
    const user = await loaders.userLoader?.load(parent.userId);
    if (!user) {
      throw new Error(`User with ID ${parent.userId} not found`);
    }
    return user;
  },
  game: async (
    parent: { gameId: string },
    _args: Record<string, unknown>,
    { loaders }: Context
  ) => {
    if (!parent.gameId || !loaders) {
      throw new Error('Game ID is required for GameLog');
    }
    const game = await loaders.gameLoader?.load(parent.gameId);
    if (!game) {
      throw new Error(`Game with ID ${parent.gameId} not found`);
    }
    return game;
  },
  comments: async (parent: { id: string }, args: { first?: number; after?: string }, { db }: any) => {
    const { first = 10, after } = args;
    if (!parent.id) return { edges: [], pageInfo: { hasNextPage: false, endCursor: null }, totalCount: 0 };

    // Fetch all comments for this game log, ordered by createdAt
    const allComments = await db
      .select()
      .from(schema.comments)
      .where(eq(schema.comments.parentId, parent.id))
      .orderBy(desc(schema.comments.createdAt));

    // Find the index of the comment after which to start
    let startIndex = 0;
    if (after) {
      startIndex = allComments.findIndex((c: any) => c.id === after) + 1;
    }
    const paginatedComments = allComments.slice(startIndex, startIndex + first);

    const edges = paginatedComments.map((comment: any) => ({
      cursor: comment.id,
      node: comment,
    }));

    const hasNextPage = startIndex + first < allComments.length;
    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor,
      },
      totalCount: allComments.length,
    };
  },
  reactions: async (parent, _args, { db }) => {
    if (!parent.id) return [];
    const reactions = await db
      .select()
      .from(schema.reactions)
      .where(eq(schema.reactions.targetId, parent.id));
    return reactions || [];
  },
};

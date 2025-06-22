import { and, eq, sql, gte, lte, like, or, isNotNull, desc, asc, ilike } from 'drizzle-orm';

import { seedLogger } from '@lib/core/logger';
import { CACHE_KEYS } from '@src/lib/cache';
import { withCache } from '@src/lib/db';
import * as schema from '@src/lib/db/schema';
import { mapDbUserToUser } from '@src/lib/db/schema/user-schemas';
import { createConnection, parseCursor, handleResolverError } from '@src/lib/graphql/utils';
import type { IContext, GameLogFilters, IPaginationArgs, IGameLog } from '@src/lib/types';

export const gameLog = async (
  _parent: unknown,
  { id }: { id: string },
  { db }: IContext
): Promise<IGameLog | null> => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const gameLog = await db
      .select()
      .from(schema.game_logs)
      .where(eq(schema.game_logs.id, id))
      .then((rows: Record<string, unknown>[]) => rows[0]);

    if (!gameLog) {
      return null;
    }

    return {
      id: String(gameLog.id),
      gameId: String(gameLog.gameId),
      userId: String(gameLog.userId),
      watchedSetting:
        ((gameLog as Record<string, unknown>).watchedSetting as string | null) || null,
      watchedScope: ((gameLog as Record<string, unknown>).watchedScope as string | null) || null,
      watchedDate:
        ((gameLog as Record<string, unknown>).watchedDate as Date | string | null) || new Date(),
      watchedLocation:
        ((gameLog as Record<string, unknown>).watchedLocation as string | null) || null,
      ratingForGame: Number((gameLog as Record<string, unknown>).ratingForGame || 0),
      notes: ((gameLog as Record<string, unknown>).notes as string | null) || null,
      tags: ((gameLog as Record<string, unknown>).tags as string[] | null) || null,
      classification:
        ((gameLog as Record<string, unknown>).classification as
          | 'Private'
          | 'Protected'
          | 'Public'
          | null) || 'Protected',
      deletedAt: ((gameLog as Record<string, unknown>).deletedAt as Date | null) || null,
      playerId: String(gameLog.userId),
      teamId: String(gameLog.teamId || ''),
      points: Number(gameLog.points || 0),
      rebounds: Number(gameLog.rebounds || 0),
      assists: Number(gameLog.assists || 0),
      steals: Number(gameLog.steals || 0),
      blocks: Number(gameLog.blocks || 0),
      turnovers: Number(gameLog.turnovers || 0),
      fouls: Number(gameLog.fouls || 0),
      minutes: Number(gameLog.minutes || 0),
      fgMade: Number(gameLog.fgMade || 0),
      fgAttempted: Number(gameLog.fgAttempted || 0),
      threePointMade: Number(gameLog.threePointMade || 0),
      threePointAttempted: Number(gameLog.threePointAttempted || 0),
      ftMade: Number(gameLog.ftMade || 0),
      ftAttempted: Number(gameLog.ftAttempted || 0),
      plusMinus: Number(gameLog.plusMinus || 0),
      createdAt: gameLog.createdAt as Date,
      updatedAt: gameLog.updatedAt as Date,
      user: gameLog.user as IGameLog['user'],
    };
  } catch (error) {
    handleResolverError(error, 'gameLog');
    return null;
  }
};

export const gameLogs = async (
  _parent: unknown,
  args: IPaginationArgs & { filters?: GameLogFilters },
  { db }: IContext
) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

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
        const mappedLogs = items.map((log: typeof schema.game_logs.$inferSelect) => ({
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
        conditions.push(
          gte(schema.game_logs.watchedDate, new Date(filters.watchedDateRange.start))
        );
      }
      if (filters.watchedDateRange.end) {
        conditions.push(lte(schema.game_logs.watchedDate, new Date(filters.watchedDateRange.end)));
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
    const mappedLogs = items.map(
      (log: {
        game_logs: typeof schema.game_logs.$inferSelect;
        nba_games: typeof schema.nba_games.$inferSelect | null;
      }) => ({
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
      })
    );

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
    { loaders, db }: IContext
  ) => {
    if (!parent.userId) {
      throw new Error('User ID is required for GameLog');
    }

    // Try to use the loader first
    if (loaders?.userLoader) {
      try {
        const user = await loaders.userLoader.load(parent.userId);
        if (user) {
          if (typeof user !== 'object' || user === null || Object.keys(user).length === 0)
            return null;
          return mapDbUserToUser(user as Record<string, unknown>);
        }
      } catch (error) {
        seedLogger.warn('Failed to load user from loader, falling back to direct query:', error);
      }
    }

    // Fallback to direct database query
    if (!db) {
      throw new Error('Database connection not available');
    }

    try {
      const users = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, parent.userId))
        .limit(1);

      const user = users[0];
      if (!user) {
        throw new Error(`User with ID ${parent.userId} not found`);
      }

      if (typeof user !== 'object' || user === null || Object.keys(user).length === 0) return null;
      return mapDbUserToUser(user as Record<string, unknown>);
    } catch {
      seedLogger.error('Failed to fetch user');
    }
  },
};

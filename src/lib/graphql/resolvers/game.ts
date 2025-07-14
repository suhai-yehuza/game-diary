import { eq, and, desc, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { nba_games, game_logs } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '@/lib/types/dbTypes';

// Game Query Resolvers
export const gameQueryResolvers = {
  // Get game by ID
  game: async (_parent: unknown, args: { id: string }, _context: GraphQLContext) => {
    const game = await db()?.query.nba_games.findFirst({
      where: eq(nba_games.id, args.id),
    });

    if (!game) {
      return null;
    }

    return {
      id: game.id,
      date: game.date,
      status: game.status,
      game_type: game.game_type,
      nba_game_id: game.nba_game_id,
      home_team_id: game.home_team_id,
      away_team_id: game.away_team_id,
      home_team_score: game.home_team_score,
      away_team_score: game.away_team_score,
      created_at: game.created_at,
      updated_at: game.updated_at,
    };
  },

  // Get games with filters and pagination
  games: async (
    _parent: unknown,
    args: {
      filters?: {
        dateRange?: { start: Date; end?: Date };
        status?: string;
        teamId?: string;
        search?: string;
        season?: number;
        arena?: string;
      };
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    _context: GraphQLContext
  ) => {
    const { filters, pagination } = args;
    const limit = pagination?.first || 20;

    const whereConditions = [];

    if (filters?.dateRange) {
      if (filters.dateRange.end) {
        whereConditions.push(
          sql`${nba_games.date} >= ${filters.dateRange.start} AND ${nba_games.date} <= ${filters.dateRange.end}`
        );
      } else {
        whereConditions.push(sql`${nba_games.date} >= ${filters.dateRange.start}`);
      }
    }

    if (filters?.status) {
      whereConditions.push(eq(nba_games.status, filters.status));
    }

    if (filters?.teamId) {
      whereConditions.push(
        sql`(${nba_games.home_team_id} = ${filters.teamId} OR ${nba_games.away_team_id} = ${filters.teamId})`
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const games = await db()?.query.nba_games.findMany({
      where: whereClause,
      limit,
      orderBy: [desc(nba_games.date)],
    });

    const edges =
      games?.map(game => ({
        cursor: game.id,
        node: {
          id: game.id,
          date: game.date,
          status: game.status,
          game_type: game.game_type,
          nba_game_id: game.nba_game_id,
          home_team_id: game.home_team_id,
          away_team_id: game.away_team_id,
          home_team_score: game.home_team_score,
          away_team_score: game.away_team_score,
          created_at: game.created_at,
          updated_at: game.updated_at,
        },
      })) || [];

    return {
      edges,
      pageInfo: {
        hasNextPage: edges.length === limit,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: edges.length,
    };
  },

  // Get live games
  liveGames: async (
    _parent: unknown,
    args: { first?: number; after?: string },
    _context: GraphQLContext
  ) => {
    const limit = args.first ?? 20;

    const games = await db()?.query.nba_games.findMany({
      where: eq(nba_games.status, 'LIVE'),
      limit,
      orderBy: [desc(nba_games.date)],
    });

    const edges =
      games?.map(game => ({
        cursor: game.id,
        node: {
          id: game.id,
          date: game.date,
          status: game.status,
          game_type: game.game_type,
          nba_game_id: game.nba_game_id,
          home_team_id: game.home_team_id,
          away_team_id: game.away_team_id,
          home_team_score: game.home_team_score,
          away_team_score: game.away_team_score,
          created_at: game.created_at,
          updated_at: game.updated_at,
        },
      })) || [];

    return {
      edges,
      pageInfo: {
        hasNextPage: edges.length === limit,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: edges.length,
    };
  },

  // Get game log by ID
  gameLog: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const gameLog = await db()?.query.game_logs.findFirst({
      where: eq(game_logs.id, args.id),
      with: {
        user: true,
      },
    });

    if (!gameLog) {
      return null;
    }

    // Check if user can access this game log based on classification
    const canAccess =
      gameLog.user_id === context.user.id ||
      gameLog.classification === 'PUBLIC' ||
      (gameLog.classification === 'PROTECTED' && gameLog.user_id === context.user.id);

    if (!canAccess) {
      throw new AuthorizationError('Access denied to this game log');
    }

    return {
      id: gameLog.id,
      rating_for_game: gameLog.rating_for_game,
      notes: gameLog.notes,
      tags: gameLog.tags,
      watched_date: gameLog.watched_date,
      watched_setting: gameLog.watched_setting,
      watched_location: gameLog.watched_location,
      watched_scope: gameLog.watched_scope,
      classification: gameLog.classification,
      created_at: gameLog.created_at,
      updated_at: gameLog.updated_at,
      deleted_at: gameLog.deleted_at,
      user: {
        id: gameLog.user?.id || '',
        username: gameLog.user?.username || '',
        first_name: gameLog.user?.first_name || '',
        last_name: gameLog.user?.last_name || '',
        email_address: null, // Don't expose email in game log context
        phone_number: null, // Don't expose phone in game log context
        image_url: gameLog.user?.image_url || null,
      },
    };
  },

  // Get game logs with filters and pagination
  gameLogs: async (
    _parent: unknown,
    args: {
      filters?: {
        userId?: string;
        gameId?: string;
        dateRange?: { start: Date; end?: Date };
        classification?: string;
        search?: string;
        searchText?: string;
        minRating?: number;
        maxRating?: number;
        watchedSetting?: string;
        watchedLocation?: string;
        tags?: string[];
        hasNotes?: boolean;
        watchedDateRange?: { start: Date; end?: Date };
        sortBy?: string;
        sortDirection?: string;
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
    const limit = pagination?.first || 20;

    const whereConditions = [];

    // Filter by user (default to current user if not specified)
    const targetUserId = filters?.userId || context.user.id;
    whereConditions.push(eq(game_logs.user_id, targetUserId));

    if (filters?.gameId) {
      whereConditions.push(eq(game_logs.game_id, filters.gameId));
    }

    if (filters?.classification) {
      whereConditions.push(eq(game_logs.classification, filters.classification));
    }

    if (filters?.minRating) {
      whereConditions.push(sql`${game_logs.rating_for_game} >= ${filters.minRating}`);
    }

    if (filters?.maxRating) {
      whereConditions.push(sql`${game_logs.rating_for_game} <= ${filters.maxRating}`);
    }

    if (filters?.watchedSetting) {
      whereConditions.push(eq(game_logs.watched_setting, filters.watchedSetting));
    }

    if (filters?.hasNotes) {
      whereConditions.push(sql`${game_logs.notes} IS NOT NULL AND ${game_logs.notes} != ''`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const gameLogs = await db()?.query.game_logs.findMany({
      where: whereClause,
      limit,
      orderBy: [desc(game_logs.created_at)],
      with: {
        user: true,
      },
    });

    const edges =
      gameLogs?.map(gameLog => ({
        cursor: gameLog.id,
        node: {
          id: gameLog.id,
          rating_for_game: gameLog.rating_for_game,
          notes: gameLog.notes,
          tags: gameLog.tags,
          watched_date: gameLog.watched_date,
          watched_setting: gameLog.watched_setting,
          watched_location: gameLog.watched_location,
          watched_scope: gameLog.watched_scope,
          classification: gameLog.classification,
          created_at: gameLog.created_at,
          updated_at: gameLog.updated_at,
          deleted_at: gameLog.deleted_at,
          user: {
            id: gameLog.user?.id ?? '',
            username: gameLog.user?.username ?? '',
            first_name: gameLog.user?.first_name ?? '',
            last_name: gameLog.user?.last_name ?? '',
            email_address: null,
            phone_number: null,
            image_url: gameLog.user?.image_url ?? null,
          },
        },
      })) || [];

    return {
      edges,
      pageInfo: {
        hasNextPage: edges.length === limit,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: edges.length,
    };
  },
};

// Game Type Resolvers
export const gameResolver = {
  // Add any game-specific field resolvers here
};

export const gameLogResolver = {
  // Add any game log-specific field resolvers here
};

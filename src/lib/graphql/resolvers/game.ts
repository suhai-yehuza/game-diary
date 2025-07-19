import { eq, and, desc, sql } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/api.config';
import { db } from '@/lib/db';
import { nba_games } from '@/lib/db/schema';
import type { GraphQLContext } from '@/lib/types/dbTypes';

// Game Query Resolvers (for nba_games table)
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
    const limit = pagination?.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

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

    // Get the paginated results
    const games = await db()?.query.nba_games.findMany({
      where: whereClause,
      limit,
      orderBy: [desc(nba_games.date)],
    });

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(nba_games)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

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
      totalCount: totalCount,
    };
  },

  // Get live games
  liveGames: async (
    _parent: unknown,
    args: { first?: number; after?: string },
    _context: GraphQLContext
  ) => {
    const limit = args.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

    // Get the paginated results
    const games = await db()?.query.nba_games.findMany({
      where: eq(nba_games.status, 'LIVE'),
      limit,
      orderBy: [desc(nba_games.date)],
    });

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(nba_games)
      .where(eq(nba_games.status, 'LIVE'));
    const totalCount = totalCountResult?.[0]?.count ?? 0;

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
      totalCount: totalCount,
    };
  },
};

// Game Type Resolvers
export const gameResolver = {
  // Add any game-specific field resolvers here
};

import { eq, and, desc, sql, inArray } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { nba_games, teams } from '@/lib/db/schema';
import type { GraphQLContext } from '@/lib/types/db.types';

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

    // Fetch team data
    const teamIds = [game.home_team_id, game.away_team_id];
    const teamData =
      (await db()?.query.teams.findMany({
        where: inArray(teams.id, teamIds),
      })) ?? [];

    const teamMap = new Map(teamData.map(team => [team.id, team]));
    const homeTeam = teamMap.get(game.home_team_id);
    const awayTeam = teamMap.get(game.away_team_id);

    return {
      id: game.id,
      date: game.date,
      status: game.status,
      game_type: game.game_type,
      nba_game_id: game.nba_game_id,
      home_team_id: game.home_team_id,
      away_team_id: game.away_team_id,
      home_team: homeTeam
        ? {
            id: homeTeam.id,
            name: homeTeam.name,
            nickname: homeTeam.nickname ?? undefined,
            code: homeTeam.code ?? undefined,
            city: homeTeam.city ?? undefined,
            logo: homeTeam.logo ?? undefined,
            all_star: homeTeam.all_star,
            nba_franchise: homeTeam.nba_franchise,
            conference: homeTeam.conference ?? undefined,
            created_at: homeTeam.created_at,
            updated_at: homeTeam.updated_at,
          }
        : null,
      away_team: awayTeam
        ? {
            id: awayTeam.id,
            name: awayTeam.name,
            nickname: awayTeam.nickname ?? undefined,
            code: awayTeam.code ?? undefined,
            city: awayTeam.city ?? undefined,
            logo: awayTeam.logo ?? undefined,
            all_star: awayTeam.all_star,
            nba_franchise: awayTeam.nba_franchise,
            conference: awayTeam.conference ?? undefined,
            created_at: awayTeam.created_at,
            updated_at: awayTeam.updated_at,
          }
        : null,
      home_team_score: game.home_team_score,
      away_team_score: game.away_team_score,
      average_rating: game.average_rating ? Number(game.average_rating) : undefined,
      total_ratings: game.total_ratings,
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

    // Fetch team data for all games
    const teamIds = games?.flatMap(game => [game.home_team_id, game.away_team_id]) ?? [];
    const uniqueTeamIds = [...new Set(teamIds)];
    const teamData =
      uniqueTeamIds.length > 0
        ? ((await db()?.query.teams.findMany({
            where: inArray(teams.id, uniqueTeamIds),
          })) ?? [])
        : [];

    const teamMap = new Map(teamData.map(team => [team.id, team]));

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(nba_games)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      games?.map(game => {
        const homeTeam = teamMap.get(game.home_team_id);
        const awayTeam = teamMap.get(game.away_team_id);

        return {
          cursor: game.id,
          node: {
            id: game.id,
            date: game.date,
            status: game.status,
            game_type: game.game_type,
            nba_game_id: game.nba_game_id,
            home_team_id: game.home_team_id,
            away_team_id: game.away_team_id,
            home_team: homeTeam
              ? {
                  id: homeTeam.id,
                  name: homeTeam.name,
                  nickname: homeTeam.nickname ?? undefined,
                  code: homeTeam.code ?? undefined,
                  city: homeTeam.city ?? undefined,
                  logo: homeTeam.logo ?? undefined,
                  all_star: homeTeam.all_star,
                  nba_franchise: homeTeam.nba_franchise,
                  conference: homeTeam.conference ?? undefined,
                  created_at: homeTeam.created_at,
                  updated_at: homeTeam.updated_at,
                }
              : null,
            away_team: awayTeam
              ? {
                  id: awayTeam.id,
                  name: awayTeam.name,
                  nickname: awayTeam.nickname ?? undefined,
                  code: awayTeam.code ?? undefined,
                  city: awayTeam.city ?? undefined,
                  logo: awayTeam.logo ?? undefined,
                  all_star: awayTeam.all_star,
                  nba_franchise: awayTeam.nba_franchise,
                  conference: awayTeam.conference ?? undefined,
                  created_at: awayTeam.created_at,
                  updated_at: awayTeam.updated_at,
                }
              : null,
            home_team_score: game.home_team_score,
            away_team_score: game.away_team_score,
            average_rating: game.average_rating ? Number(game.average_rating) : undefined,
            total_ratings: game.total_ratings,
            created_at: game.created_at,
            updated_at: game.updated_at,
          },
        };
      }) || [];

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

    // Fetch team data for all games
    const teamIds = games?.flatMap(game => [game.home_team_id, game.away_team_id]) ?? [];
    const uniqueTeamIds = [...new Set(teamIds)];
    const teamData =
      uniqueTeamIds.length > 0
        ? ((await db()?.query.teams.findMany({
            where: inArray(teams.id, uniqueTeamIds),
          })) ?? [])
        : [];

    const teamMap = new Map(teamData.map(team => [team.id, team]));

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(nba_games)
      .where(eq(nba_games.status, 'LIVE'));
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      games?.map(game => {
        const homeTeam = teamMap.get(game.home_team_id);
        const awayTeam = teamMap.get(game.away_team_id);

        return {
          cursor: game.id,
          node: {
            id: game.id,
            date: game.date,
            status: game.status,
            game_type: game.game_type,
            nba_game_id: game.nba_game_id,
            home_team_id: game.home_team_id,
            away_team_id: game.away_team_id,
            home_team: homeTeam
              ? {
                  id: homeTeam.id,
                  name: homeTeam.name,
                  nickname: homeTeam.nickname ?? undefined,
                  code: homeTeam.code ?? undefined,
                  city: homeTeam.city ?? undefined,
                  logo: homeTeam.logo ?? undefined,
                  all_star: homeTeam.all_star,
                  nba_franchise: homeTeam.nba_franchise,
                  conference: homeTeam.conference ?? undefined,
                  created_at: homeTeam.created_at,
                  updated_at: homeTeam.updated_at,
                }
              : null,
            away_team: awayTeam
              ? {
                  id: awayTeam.id,
                  name: awayTeam.name,
                  nickname: awayTeam.nickname ?? undefined,
                  code: awayTeam.code ?? undefined,
                  city: awayTeam.city ?? undefined,
                  logo: awayTeam.logo ?? undefined,
                  all_star: awayTeam.all_star,
                  nba_franchise: awayTeam.nba_franchise,
                  conference: awayTeam.conference ?? undefined,
                  created_at: awayTeam.created_at,
                  updated_at: awayTeam.updated_at,
                }
              : null,
            home_team_score: game.home_team_score,
            away_team_score: game.away_team_score,
            average_rating: game.average_rating ? Number(game.average_rating) : undefined,
            total_ratings: game.total_ratings,
            created_at: game.created_at,
            updated_at: game.updated_at,
          },
        };
      }) || [];

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

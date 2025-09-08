import { eq, and, desc, sql } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { basketball_games, publicComments, publicReactions } from '@/lib/db/schema';
import type { GraphQLContext, IGameTeamsDataResolver } from '@/types';

// Define interfaces for JSONB data structures

// Game Query Resolvers (for basketball_games table)
export const gameQueryResolvers = {
  // Get game by ID
  game: async (_parent: unknown, args: { id: string }, _context: GraphQLContext) => {
    const game = await db()?.query.basketball_games.findFirst({
      where: eq(basketball_games.id, args.id),
    });

    if (!game) {
      return null;
    }

    // Return optimized game data - JSONB fields contain comprehensive information
    // Transform teams JSON into home_team and away_team properties for component compatibility
    const teamsData = game.teams as IGameTeamsDataResolver | null;
    const homeTeam = teamsData?.home || {};
    const awayTeam = teamsData?.away || {};

    return {
      id: game.id,
      date: game.date,
      status: game.status,
      game_type: game.game_type,
      season: game.season,
      basketball_game_id: game.basketball_game_id,
      teams: game.teams,
      home_team: homeTeam,
      away_team: awayTeam,
      scores: game.scores,
      arena: game.arena,
      periods: game.periods,
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
          sql`${basketball_games.date} >= ${filters.dateRange.start} AND ${basketball_games.date} <= ${filters.dateRange.end}`
        );
      } else {
        whereConditions.push(sql`${basketball_games.date} >= ${filters.dateRange.start}`);
      }
    }

    if (filters?.status) {
      whereConditions.push(eq(basketball_games.status, filters.status));
    }

    if (filters?.teamId) {
      whereConditions.push(
        sql`((${basketball_games.teams}->'home'->>'id')::text = ${filters.teamId} OR (${basketball_games.teams}->'away'->>'id')::text = ${filters.teamId})`
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get the paginated results
    const games = await db()?.query.basketball_games.findMany({
      where: whereClause,
      limit,
      orderBy: [desc(basketball_games.date)],
    });

    // No need to fetch team data separately - JSONB fields contain comprehensive information

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(basketball_games)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      games?.map(game => {
        // Transform teams JSON into home_team and away_team properties for component compatibility
        const teamsData = game.teams as IGameTeamsDataResolver | null;
        const homeTeam = teamsData?.home || {};
        const awayTeam = teamsData?.away || {};

        return {
          cursor: game.id,
          node: {
            id: game.id,
            date: game.date,
            status: game.status,
            game_type: game.game_type,
            season: game.season,
            basketball_game_id: game.basketball_game_id,
            teams: game.teams,
            home_team: homeTeam,
            away_team: awayTeam,
            scores: game.scores,
            arena: game.arena,
            periods: game.periods,
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
    const games = await db()?.query.basketball_games.findMany({
      where: eq(basketball_games.status, 'LIVE'),
      limit,
      orderBy: [desc(basketball_games.date)],
    });

    // No need to fetch team data separately - JSONB fields contain comprehensive information

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(basketball_games)
      .where(eq(basketball_games.status, 'LIVE'));
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      games?.map(game => {
        // Transform teams JSON into home_team and away_team properties for component compatibility
        const teamsData = game.teams as IGameTeamsDataResolver | null;
        const homeTeam = teamsData?.home || {};
        const awayTeam = teamsData?.away || {};

        return {
          cursor: game.id,
          node: {
            id: game.id,
            date: game.date,
            status: game.status,
            game_type: game.game_type,
            season: game.season,
            basketball_game_id: game.basketball_game_id,
            teams: game.teams,
            home_team: homeTeam,
            away_team: awayTeam,
            scores: game.scores,
            arena: game.arena,
            periods: game.periods,
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
  // Get public comments for a game
  publicComments: async (
    parent: { id: string },
    args: {
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    _context: GraphQLContext
  ) => {
    const limit = args.pagination?.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

    const comments = await db()?.query.publicComments.findMany({
      where: and(
        eq(publicComments.parent_id, parent.id),
        eq(publicComments.parent_type, 'BASKETBALL_GAME')
      ),
      limit,
      orderBy: [desc(publicComments.created_at)],
      with: {
        user: true,
      },
    });

    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicComments)
      .where(
        and(
          eq(publicComments.parent_id, parent.id),
          eq(publicComments.parent_type, 'BASKETBALL_GAME')
        )
      );
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      comments?.map(comment => ({
        cursor: comment.id,
        node: {
          id: comment.id,
          content: comment.content,
          user: comment.user
            ? {
                id: comment.user.id,
                username: comment.user.username,
                first_name: comment.user.first_name,
                last_name: comment.user.last_name,
                image_url: comment.user.image_url,
              }
            : null,
          user_id: comment.user_id,
          anonymous_name: comment.anonymous_name,
          anonymous_email: comment.anonymous_email,
          parent_id: comment.parent_id,
          parent_type: comment.parent_type,
          depth: comment.depth,
          is_approved: comment.is_approved,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          deleted_at: comment.deleted_at,
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

  // Get total public comment count for a game
  totalPublicCommentCount: async (
    parent: { id: string },
    _args: unknown,
    _context: GraphQLContext
  ) => {
    const result = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicComments)
      .where(
        and(
          eq(publicComments.parent_id, parent.id),
          eq(publicComments.parent_type, 'BASKETBALL_GAME')
        )
      );
    return result?.[0]?.count ?? 0;
  },

  // Get public reactions for a game
  publicReactions: async (parent: { id: string }, _args: unknown, _context: GraphQLContext) => {
    const reactions = await db()?.query.publicReactions.findMany({
      where: and(
        eq(publicReactions.target_id, parent.id),
        eq(publicReactions.target_type, 'BASKETBALL_GAME')
      ),
      with: {
        user: true,
      },
    });

    return (
      reactions?.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        user: reaction.user
          ? {
              id: reaction.user.id,
              username: reaction.user.username,
              first_name: reaction.user.first_name,
              last_name: reaction.user.last_name,
              image_url: reaction.user.image_url,
            }
          : null,
        user_id: reaction.user_id,
        anonymous_name: reaction.anonymous_name,
        anonymous_email: reaction.anonymous_email,
        target_id: reaction.target_id,
        target_type: reaction.target_type,
        is_approved: reaction.is_approved,
        created_at: reaction.created_at,
        updated_at: reaction.updated_at,
        deleted_at: reaction.deleted_at,
      })) || []
    );
  },

  // Get total public reaction count for a game
  totalPublicReactionCount: async (
    parent: { id: string },
    _args: unknown,
    _context: GraphQLContext
  ) => {
    const result = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicReactions)
      .where(
        and(
          eq(publicReactions.target_id, parent.id),
          eq(publicReactions.target_type, 'BASKETBALL_GAME')
        )
      );
    return result?.[0]?.count ?? 0;
  },
};

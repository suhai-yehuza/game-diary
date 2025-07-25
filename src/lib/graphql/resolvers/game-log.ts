import { eq, and, desc, sql, inArray } from 'drizzle-orm';

import { API_CONFIG, getRapidApiConfig } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { game_logs, nba_games, teams } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { FRIENDSHIP_STATUS, CLASSIFICATION } from '@/lib/types';
import type { GraphQLContext } from '@/lib/types/db.types';
import type { IGameResponse, IGamesApiResponse } from '@/lib/types/externalApi.types';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { generateUUIDv7 } from '@/lib/utils/id-generator';

// Simple in-memory cache for friendship checks
// In production, consider using Redis or a more robust caching solution
const friendshipCache = new Map<string, boolean>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to generate cache key for friendship check
function getFriendshipCacheKey(userId1: string, userId2: string): string {
  // Sort IDs to ensure consistent cache key regardless of order
  const [id1, id2] = [userId1, userId2].sort();
  return `friendship:${id1}:${id2}`;
}

// Helper function to check friendship status with caching
async function checkFriendshipStatus(userId1: string, userId2: string): Promise<boolean> {
  const cacheKey = getFriendshipCacheKey(userId1, userId2);

  // Check cache first
  const cached = friendshipCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Query database
  const friendship = await db()?.execute(sql`
    SELECT EXISTS(
      SELECT 1 FROM friendships
      WHERE status = ${FRIENDSHIP_STATUS.ACCEPTED}
      AND (
        (user_id = ${userId1} AND friend_id = ${userId2})
        OR
        (user_id = ${userId2} AND friend_id = ${userId1})
      )
    ) as is_friend
  `);

  const isFriend = Boolean(friendship?.rows?.[0]?.is_friend);

  // Cache the result
  friendshipCache.set(cacheKey, isFriend);

  // Set cache expiration
  setTimeout(() => {
    friendshipCache.delete(cacheKey);
  }, CACHE_TTL);

  return isFriend;
}

// Game Log Query Resolvers (for game_logs table)
export const gameLogQueryResolvers = {
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
    let canAccess = false;

    // Owner can always access
    if (gameLog.user_id === context.user.id) {
      canAccess = true;
    }
    // Public game logs can be accessed by anyone
    else if (gameLog.classification === CLASSIFICATION.PUBLIC) {
      canAccess = true;
    }
    // Protected game logs can only be accessed by friends
    else if (gameLog.classification === CLASSIFICATION.PROTECTED) {
      // Use cached friendship check for better performance
      canAccess = await checkFriendshipStatus(context.user.id, gameLog.user_id ?? '');
    }

    if (!canAccess) {
      throw new AuthorizationError('Access denied to this game log');
    }

    return {
      id: gameLog.id,
      rating_for_game: gameLog.rating_for_game,
      notes: gameLog.notes,
      tags: gameLog.tags,
      watched_date: gameLog.watched_date ? new Date(gameLog.watched_date) : undefined,
      watched_setting: gameLog.watched_setting,
      watched_location: gameLog.watched_location,
      watched_scope: gameLog.watched_scope,
      classification: gameLog.classification,
      created_at: gameLog.created_at ? new Date(gameLog.created_at) : undefined,
      updated_at: gameLog.updated_at ? new Date(gameLog.updated_at) : undefined,
      deleted_at: gameLog.deleted_at ? new Date(gameLog.deleted_at) : undefined,
      user: {
        id: gameLog.user?.id ?? '',
        username: gameLog.user?.username ?? '',
        first_name: gameLog.user?.first_name ?? '',
        last_name: gameLog.user?.last_name ?? '',
        email_address: null, // Don't expose email in game log context
        phone_number: null, // Don't expose phone in game log context
        image_url: gameLog.user?.image_url ?? null,
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
    const limit = pagination?.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

    const whereConditions = [];

    // Only filter by user if userId is explicitly provided
    if (filters?.userId) {
      whereConditions.push(eq(game_logs.user_id, filters.userId));
    }

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

    console.log('🔍 Where conditions:', whereConditions.length);

    // Get the paginated results
    const gameLogs = await db()?.query.game_logs.findMany({
      where: whereClause,
      limit: 1000, // fetch enough to paginate in-memory
      orderBy: [desc(game_logs.created_at)],
      with: {
        user: true,
      },
    });

    // Cursor-based pagination: skip logs up to and including the 'after' cursor
    let paginatedLogs = gameLogs;
    if (pagination?.after) {
      const afterIndex = gameLogs.findIndex(log => log.id === pagination.after);
      if (afterIndex !== -1) {
        paginatedLogs = gameLogs.slice(afterIndex + 1);
      }
    }
    paginatedLogs = paginatedLogs.slice(0, limit);

    // Fetch game data for all game logs
    const gameIds = paginatedLogs?.map(log => log.game_id) ?? [];
    const games =
      gameIds.length > 0
        ? ((await db()?.query.nba_games.findMany({
            where: inArray(nba_games.id, gameIds),
          })) ?? [])
        : [];

    const gameMap = new Map(games.map(game => [game.id, game]));

    // Fetch team data for all games
    const teamIds = games.flatMap(game => [game.home_team_id, game.away_team_id]);
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
      .from(game_logs)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      paginatedLogs?.map(gameLog => {
        const game = gameMap.get(gameLog.game_id);
        const homeTeam = game ? teamMap.get(game.home_team_id) : null;
        const awayTeam = game ? teamMap.get(game.away_team_id) : null;

        return {
          cursor: gameLog.id,
          node: {
            id: gameLog.id,
            game_id: gameLog.game_id,
            game: game
              ? {
                  id: game.id,
                  date: game.date ? new Date(game.date) : undefined,
                  status: game.status,
                  game_type: game.game_type,
                  nba_game_id: game.nba_game_id ?? undefined,
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
                        created_at: homeTeam.created_at ? new Date(homeTeam.created_at) : undefined,
                        updated_at: homeTeam.updated_at ? new Date(homeTeam.updated_at) : undefined,
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
                        created_at: awayTeam.created_at ? new Date(awayTeam.created_at) : undefined,
                        updated_at: awayTeam.updated_at ? new Date(awayTeam.updated_at) : undefined,
                      }
                    : null,
                  home_team_score: game.home_team_score ?? undefined,
                  away_team_score: game.away_team_score ?? undefined,
                  average_rating: game.average_rating ? Number(game.average_rating) : undefined,
                  total_ratings: game.total_ratings ?? undefined,
                  created_at: game.created_at ? new Date(game.created_at) : undefined,
                  updated_at: game.updated_at ? new Date(game.updated_at) : undefined,
                }
              : null,
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

  // Search game logs with advanced filtering
  searchGameLogs: async (
    _parent: unknown,
    args: {
      first?: number;
      after?: string;
      searchTerm?: string;
      searchField?: string;
      filters?: {
        search?: string;
        userId?: string;
        gameId?: string;
        minRating?: number;
        maxRating?: number;
        watchedSetting?: string;
        classification?: string;
        dateRange?: { start: Date; end?: Date };
        orderBy?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const {
      first = API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
      after,
      searchTerm = '',
      searchField = 'all',
    } = args;

    const whereConditions = [];

    // Add search conditions based on searchField
    if (searchTerm?.trim()) {
      const trimmedSearch = searchTerm.trim().toLowerCase();

      if (searchField === 'all' || !searchField) {
        // Search across multiple fields
        whereConditions.push(
          sql`(
            LOWER(${game_logs.user_id}) LIKE ${`%${trimmedSearch}%`} OR
            LOWER(${game_logs.game_id}) LIKE ${`%${trimmedSearch}%`} OR
            LOWER(${game_logs.watched_setting}) LIKE ${`%${trimmedSearch}%`} OR
            CAST(${game_logs.rating_for_game} AS TEXT) LIKE ${`%${trimmedSearch}%`}
          )`
        );
      } else if (searchField === 'user_id') {
        whereConditions.push(sql`LOWER(${game_logs.user_id}) LIKE ${`%${trimmedSearch}%`}`);
      } else if (searchField === 'game_id') {
        whereConditions.push(sql`LOWER(${game_logs.game_id}) LIKE ${`%${trimmedSearch}%`}`);
      } else if (searchField === 'rating_for_game') {
        whereConditions.push(
          sql`CAST(${game_logs.rating_for_game} AS TEXT) LIKE ${`%${trimmedSearch}%`}`
        );
      } else if (searchField === 'watched_setting') {
        whereConditions.push(sql`LOWER(${game_logs.watched_setting}) LIKE ${`%${trimmedSearch}%`}`);
      }
    }

    // Add cursor-based pagination
    if (after) {
      whereConditions.push(sql`${game_logs.id} > ${after}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    console.log('🔍 Where conditions:', whereConditions.length);

    // Get the paginated results
    const gameLogs = await db()?.query.game_logs.findMany({
      where: whereClause,
      limit: 1000, // fetch enough to paginate in-memory
      orderBy: [desc(game_logs.created_at)],
      with: {
        user: true,
      },
    });

    // Cursor-based pagination: skip logs up to and including the 'after' cursor
    let paginatedLogs = gameLogs;
    if (after) {
      const afterIndex = gameLogs.findIndex(log => log.id === after);
      if (afterIndex !== -1) {
        paginatedLogs = gameLogs.slice(afterIndex + 1);
      }
    }
    paginatedLogs = paginatedLogs.slice(0, first);

    console.log('🔍 Found game logs:', paginatedLogs?.length || 0);

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(game_logs)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    console.log('🔍 Total count:', totalCount);

    const edges =
      paginatedLogs?.map(gameLog => ({
        cursor: gameLog.id,
        node: {
          id: gameLog.id,
          game_id: gameLog.game_id ?? '',
          rating_for_game: gameLog.rating_for_game,
          notes: gameLog.notes,
          tags: gameLog.tags,
          watched_date: gameLog.watched_date ? new Date(gameLog.watched_date) : undefined,
          watched_setting: gameLog.watched_setting,
          watched_location: gameLog.watched_location,
          watched_scope: gameLog.watched_scope,
          classification: gameLog.classification,
          created_at: gameLog.created_at ? new Date(gameLog.created_at) : undefined,
          updated_at: gameLog.updated_at ? new Date(gameLog.updated_at) : undefined,
          deleted_at: gameLog.deleted_at ? new Date(gameLog.deleted_at) : undefined,
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
        hasNextPage: edges.length === first,
        hasPreviousPage: !!after,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: totalCount,
    };
  },

  // Get game logs from friends only
  friendsGameLogs: async (
    _parent: unknown,
    args: {
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

    const { pagination } = args;
    const limit = pagination?.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

    // Get all friends of the current user (both directions of friendship)
    const friendsQuery = await db()?.execute(sql`
      SELECT DISTINCT
        CASE
          WHEN f.user_id = ${context.user.id} THEN f.friend_id
          WHEN f.friend_id = ${context.user.id} THEN f.user_id
        END as friend_user_id
      FROM friendships f
      WHERE f.status = ${FRIENDSHIP_STATUS.ACCEPTED}
      AND (f.user_id = ${context.user.id} OR f.friend_id = ${context.user.id})
    `);

    const friendIds = friendsQuery?.rows?.map(row => row.friend_user_id).filter(Boolean) ?? [];

    if (friendIds.length === 0) {
      // No friends, return empty result
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

    // Build where conditions for game logs from friends
    const whereConditions = [
      sql`${game_logs.user_id} = ANY(${friendIds})`,
      sql`${game_logs.classification} = ${CLASSIFICATION.PROTECTED}`,
    ];

    // Add cursor-based pagination
    if (pagination?.after) {
      whereConditions.push(sql`${game_logs.id} > ${pagination.after}`);
    }

    const whereClause = and(...whereConditions);

    // Get the paginated results
    const gameLogs = await db()?.query.game_logs.findMany({
      where: whereClause,
      limit: 1000, // fetch enough to paginate in-memory
      orderBy: [desc(game_logs.created_at)],
      with: {
        user: true,
      },
    });

    // Cursor-based pagination: skip logs up to and including the 'after' cursor
    let paginatedLogs = gameLogs;
    if (pagination?.after) {
      const afterIndex = gameLogs.findIndex(log => log.id === pagination.after);
      if (afterIndex !== -1) {
        paginatedLogs = gameLogs.slice(afterIndex + 1);
      }
    }
    paginatedLogs = paginatedLogs.slice(0, limit);

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(game_logs)
      .where(whereClause);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      paginatedLogs?.map(gameLog => ({
        cursor: gameLog.id,
        node: {
          id: gameLog.id,
          game_id: gameLog.game_id,
          rating_for_game: gameLog.rating_for_game,
          notes: gameLog.notes,
          tags: gameLog.tags,
          watched_date: gameLog.watched_date ? new Date(gameLog.watched_date) : undefined,
          watched_setting: gameLog.watched_setting,
          watched_location: gameLog.watched_location,
          watched_scope: gameLog.watched_scope,
          classification: gameLog.classification,
          created_at: gameLog.created_at ? new Date(gameLog.created_at) : undefined,
          updated_at: gameLog.updated_at ? new Date(gameLog.updated_at) : undefined,
          deleted_at: gameLog.deleted_at ? new Date(gameLog.deleted_at) : undefined,
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
      totalCount: totalCount,
    };
  },
};

// Game Log Mutation Resolvers
export const gameLogMutationResolvers = {
  // Create a new game log
  createGameLog: async (
    _parent: unknown,
    args: {
      input: {
        gameId: string;
        rating_for_game: number;
        notes?: string;
        tags?: string[];
        watched_date?: Date;
        watched_setting?: string;
        watched_location?: string;
        watched_scope?: string;
        classification: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // Upsert NBA game if not exists
    const nbaGame = await db()?.query.nba_games.findFirst({
      where: eq(nba_games.id, args.input.gameId),
    });

    if (!nbaGame) {
      try {
        const apiClient = createRapidAPIClient(getRapidApiConfig());
        // Fetch game details from external API
        const apiData = await apiClient.fetch<IGamesApiResponse>('/games', {
          id: args.input.gameId,
        });
        const game: IGameResponse | undefined = apiData?.response?.[0];
        if (!game) {
          return {
            gameLog: null,
            errors: [{ message: 'NBA game not found in external API', code: 'NBA_GAME_NOT_FOUND' }],
          };
        }
        // Insert NBA game into DB
        await db()
          ?.insert(nba_games)
          .values({
            id: game.id?.toString() ?? args.input.gameId,
            game_type: 'nba',
            nba_game_id: game.id?.toString() ?? args.input.gameId,
            date: new Date(game.date.start),
            home_team_id: game.teams.home.id?.toString() ?? 'missing-home-team-id',
            away_team_id: game.teams.visitors.id?.toString() ?? 'missing-away-team-id',
            home_team_score: game.scores?.home?.points ?? null,
            away_team_score: game.scores?.visitors?.points ?? null,
            status:
              game.status.short === 'FT'
                ? 'FINISHED'
                : game.status.short === 'LIVE'
                  ? 'LIVE'
                  : 'SCHEDULED',
          })
          .onConflictDoNothing();
      } catch {
        return {
          gameLog: null,
          errors: [
            { message: 'Failed to fetch or insert NBA game', code: 'NBA_GAME_UPSERT_ERROR' },
          ],
        };
      }
    }

    try {
      const gameLogId = generateUUIDv7();
      const newGameLogArr = await db()
        ?.insert(game_logs)
        .values({
          id: gameLogId,
          user_id: context.user.id,
          game_id: args.input.gameId,
          rating_for_game: args.input.rating_for_game,
          notes: args.input.notes,
          tags: args.input.tags,
          watched_date: args.input.watched_date ? new Date(args.input.watched_date) : new Date(),
          watched_setting: args.input.watched_setting,
          watched_location: args.input.watched_location,
          watched_scope: args.input.watched_scope,
          classification: args.input.classification,
        })
        .returning();

      const newGameLog = newGameLogArr?.[0];
      let user = null;
      if (newGameLog && context.user) {
        user = await db()?.query.users.findFirst({
          where: sql`id = ${context.user.id}`,
        });
      }

      return {
        gameLog: newGameLog
          ? {
              id: newGameLog.id,
              game_id: newGameLog.game_id,
              rating_for_game: newGameLog.rating_for_game,
              notes: newGameLog.notes,
              tags: newGameLog.tags,
              watched_date: newGameLog.watched_date ? new Date(newGameLog.watched_date) : undefined,
              watched_setting: newGameLog.watched_setting,
              watched_location: newGameLog.watched_location,
              watched_scope: newGameLog.watched_scope,
              classification: newGameLog.classification,
              created_at: newGameLog.created_at ? new Date(newGameLog.created_at) : undefined,
              updated_at: newGameLog.updated_at ? new Date(newGameLog.updated_at) : undefined,
              deleted_at: newGameLog.deleted_at ? new Date(newGameLog.deleted_at) : undefined,
              user: user
                ? {
                    id: user.id,
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    image_url: user.image_url,
                  }
                : null,
            }
          : null,
        errors: [],
      };
    } catch (error) {
      console.error('Failed to create game log:', error);
      return {
        gameLog: null,
        errors: [
          {
            message: error instanceof Error ? error.message : String(error),
            code: 'CREATE_GAME_LOG_ERROR',
          },
        ],
      };
    }
  },

  // Update a game log
  updateGameLog: async (
    _parent: unknown,
    args: {
      id: string;
      input: {
        rating_for_game?: number;
        notes?: string;
        tags?: string[];
        watched_date?: Date;
        watched_setting?: string;
        watched_location?: string;
        watched_scope?: string;
        classification?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      // Validate input
      const errors = [];

      if (
        args.input.rating_for_game !== undefined &&
        (args.input.rating_for_game < 1 || args.input.rating_for_game > 5)
      ) {
        errors.push({
          message: 'Rating must be between 1 and 5',
          code: 'INVALID_RATING',
          field: 'rating_for_game',
        });
      }

      if (args.input.watched_date !== undefined) {
        try {
          const date = new Date(args.input.watched_date);
          if (isNaN(date.getTime())) {
            errors.push({
              message: 'Invalid watched_date format',
              code: 'INVALID_DATE',
              field: 'watched_date',
            });
          }
        } catch {
          errors.push({
            message: 'Invalid watched_date format',
            code: 'INVALID_DATE',
            field: 'watched_date',
          });
        }
      }

      if (errors.length > 0) {
        return {
          gameLog: null,
          errors,
        };
      }

      // Check if user owns the game log
      const existingGameLog = await db()?.query.game_logs.findFirst({
        where: eq(game_logs.id, args.id),
      });

      if (!existingGameLog || existingGameLog.user_id !== context.user.id) {
        throw new AuthorizationError('Access denied to this game log');
      }

      // Prepare update data with proper date handling
      const updateData = { ...args.input } as typeof args.input & { updated_at: Date };

      // Convert watched_date to proper format if it exists
      if (updateData.watched_date !== undefined) {
        updateData.watched_date = new Date(updateData.watched_date);
      }

      updateData.updated_at = new Date();

      const updatedGameLog = await db()
        ?.update(game_logs)
        .set(updateData)
        .where(eq(game_logs.id, args.id))
        .returning();

      // Fetch the updated game log with user data
      const updatedGameLogWithUser = updatedGameLog?.[0]
        ? await db()?.query.game_logs.findFirst({
            where: eq(game_logs.id, args.id),
            with: {
              user: true,
            },
          })
        : null;

      return {
        gameLog: updatedGameLogWithUser
          ? {
              id: updatedGameLogWithUser.id,
              game_id: updatedGameLogWithUser.game_id,
              user: updatedGameLogWithUser.user,
              rating_for_game: updatedGameLogWithUser.rating_for_game,
              notes: updatedGameLogWithUser.notes,
              tags: updatedGameLogWithUser.tags,
              watched_date: updatedGameLogWithUser.watched_date
                ? new Date(updatedGameLogWithUser.watched_date)
                : undefined,
              watched_setting: updatedGameLogWithUser.watched_setting,
              watched_location: updatedGameLogWithUser.watched_location,
              watched_scope: updatedGameLogWithUser.watched_scope,
              classification: updatedGameLogWithUser.classification,
              created_at: updatedGameLogWithUser.created_at
                ? new Date(updatedGameLogWithUser.created_at)
                : undefined,
              updated_at: updatedGameLogWithUser.updated_at
                ? new Date(updatedGameLogWithUser.updated_at)
                : undefined,
              deleted_at: updatedGameLogWithUser.deleted_at
                ? new Date(updatedGameLogWithUser.deleted_at)
                : undefined,
            }
          : null,
        errors: [],
      };
    } catch (err) {
      // Only log critical errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('UpdateGameLog resolver error:', err);
      }
      return {
        gameLog: null,
        errors: [
          {
            message: err instanceof Error ? err.message : String(err),
            code: 'UPDATE_GAME_LOG_ERROR',
            field: null,
          },
        ],
      };
    }
  },

  // Delete a game log
  deleteGameLog: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    try {
      // Check if user owns the game log
      const existingGameLog = await db()?.query.game_logs.findFirst({
        where: eq(game_logs.id, args.id),
      });

      if (!existingGameLog || existingGameLog.user_id !== context.user.id) {
        throw new AuthorizationError('Access denied to this game log');
      }

      await db()?.delete(game_logs).where(eq(game_logs.id, args.id));

      return {
        success: true,
        errors: [],
      };
    } catch {
      return {
        success: false,
        errors: [{ message: 'Failed to delete game log', code: 'DELETE_GAME_LOG_ERROR' }],
      };
    }
  },
};

// Game Log Type Resolvers
export const gameLogResolver = {
  comments: (_parent: unknown, _args: unknown, _context: unknown) => ({
    edges: [],
    pageInfo: {
      hasNextPage: false,
      endCursor: null,
    },
    totalCount: 0,
  }),
  reactions: (_parent: unknown, _args: unknown, _context: unknown) => {
    // Always return an array (empty if no reactions)
    return [];
  },
  // Resolve the game field to ensure date fields are properly converted
  game: async (parent: { game_id?: string }, _args: unknown, _context: unknown) => {
    if (!parent.game_id) return null;

    const game = await db()?.query.nba_games.findFirst({
      where: eq(nba_games.id, parent.game_id),
    });

    if (!game) return null;

    // Fetch team data
    const homeTeam = await db()?.query.teams.findFirst({
      where: eq(teams.id, game.home_team_id),
    });

    const awayTeam = await db()?.query.teams.findFirst({
      where: eq(teams.id, game.away_team_id),
    });

    return {
      id: game.id,
      date: game.date ? new Date(game.date) : undefined,
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
            created_at: homeTeam.created_at ? new Date(homeTeam.created_at) : undefined,
            updated_at: homeTeam.updated_at ? new Date(homeTeam.updated_at) : undefined,
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
            created_at: awayTeam.created_at ? new Date(awayTeam.created_at) : undefined,
            updated_at: awayTeam.updated_at ? new Date(awayTeam.updated_at) : undefined,
          }
        : null,
      home_team_score: game.home_team_score,
      away_team_score: game.away_team_score,
      average_rating: game.average_rating ? Number(game.average_rating) : undefined,
      total_ratings: game.total_ratings,
      created_at: game.created_at ? new Date(game.created_at) : undefined,
      updated_at: game.updated_at ? new Date(game.updated_at) : undefined,
    };
  },
};

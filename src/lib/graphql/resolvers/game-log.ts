import { eq, and, desc, sql } from 'drizzle-orm';

import { API_CONFIG, getRapidApiConfig } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { game_logs, nba_games } from '@/lib/db/schema';
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

    // Get the paginated results
    const gameLogs = await db()?.query.game_logs.findMany({
      where: whereClause,
      limit,
      orderBy: [desc(game_logs.created_at)],
      with: {
        user: true,
      },
    });

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(game_logs)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      gameLogs?.map(gameLog => ({
        cursor: gameLog.id,
        node: {
          id: gameLog.id,
          game_id: gameLog.game_id, // Ensure game_id is included
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
      limit: first,
      orderBy: [desc(game_logs.created_at)],
      with: {
        user: true,
      },
    });

    console.log('🔍 Found game logs:', gameLogs?.length || 0);

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(game_logs)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    console.log('🔍 Total count:', totalCount);

    const edges =
      gameLogs?.map(gameLog => ({
        cursor: gameLog.id,
        node: {
          id: gameLog.id,
          game_id: gameLog.game_id ?? '',
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
      limit,
      orderBy: [desc(game_logs.created_at)],
      with: {
        user: true,
      },
    });

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(game_logs)
      .where(whereClause);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      gameLogs?.map(gameLog => ({
        cursor: gameLog.id,
        node: {
          id: gameLog.id,
          game_id: gameLog.game_id,
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
              rating_for_game: newGameLog.rating_for_game,
              notes: newGameLog.notes,
              tags: newGameLog.tags,
              watched_date: newGameLog.watched_date,
              watched_setting: newGameLog.watched_setting,
              watched_location: newGameLog.watched_location,
              watched_scope: newGameLog.watched_scope,
              classification: newGameLog.classification,
              created_at: newGameLog.created_at,
              updated_at: newGameLog.updated_at,
              deleted_at: newGameLog.deleted_at,
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
      // Check if user owns the game log
      const existingGameLog = await db()?.query.game_logs.findFirst({
        where: eq(game_logs.id, args.id),
      });

      if (!existingGameLog || existingGameLog.user_id !== context.user.id) {
        throw new AuthorizationError('Access denied to this game log');
      }

      const updatedGameLog = await db()
        ?.update(game_logs)
        .set({
          ...args.input,
          updated_at: new Date(),
        })
        .where(eq(game_logs.id, args.id))
        .returning();

      return {
        gameLog: updatedGameLog?.[0]
          ? {
              id: updatedGameLog[0].id,
              rating_for_game: updatedGameLog[0].rating_for_game,
              notes: updatedGameLog[0].notes,
              tags: updatedGameLog[0].tags,
              watched_date: updatedGameLog[0].watched_date,
              watched_setting: updatedGameLog[0].watched_setting,
              watched_location: updatedGameLog[0].watched_location,
              watched_scope: updatedGameLog[0].watched_scope,
              classification: updatedGameLog[0].classification,
              created_at: updatedGameLog[0].created_at,
              updated_at: updatedGameLog[0].updated_at,
              deleted_at: updatedGameLog[0].deleted_at,
            }
          : null,
        errors: [],
      };
    } catch {
      return {
        gameLog: null,
        errors: [{ message: 'Failed to update game log', code: 'UPDATE_GAME_LOG_ERROR' }],
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
  // Add any game log-specific field resolvers here
};

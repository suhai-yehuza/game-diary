import { eq, and, isNull, desc, count, inArray } from 'drizzle-orm';

import { db } from '@/lib/db';
import { checkFriendshipStatusQuery, executeUltraFastGameLogQuery } from '@/lib/db/queries';
import { game_logs, basketball_games, comments, reactions, friendships } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { ErrorHandler, errorHandlers } from '@/lib/utils/error-handler';
import { generateUUIDv7 } from '@/lib/utils/id-generator';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@/types';
import type { GraphQLContext, ITeamsData } from '@/types';

// Helper function to get database instance
const getDb = () => {
  const dbInstance = db();
  if (!dbInstance) {
    throw new Error('Database not available');
  }
  return dbInstance;
};

// Simple in-memory cache for friendship checks
const friendshipCache = new Map<string, boolean>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

// Helper function to check if cache entry is still valid
const isCacheValid = (key: string): boolean => {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL;
};

// Helper function to get cached friendship status
const getCachedFriendshipStatus = (userId1: string, userId2: string): boolean | null => {
  const key = `${userId1}-${userId2}`;
  if (isCacheValid(key)) {
    return friendshipCache.get(key) ?? null;
  }
  return null;
};

// Helper function to cache friendship status
const setCachedFriendshipStatus = (userId1: string, userId2: string, status: boolean): void => {
  const key = `${userId1}-${userId2}`;
  friendshipCache.set(key, status);
  cacheTimestamps.set(key, Date.now());
};

// Helper function to check friendship status
async function _checkFriendshipStatus(userId1: string, userId2: string): Promise<boolean> {
  // Check cache first
  const cached = getCachedFriendshipStatus(userId1, userId2);
  if (cached !== null) {
    return cached;
  }

  try {
    const result = await checkFriendshipStatusQuery(userId1, userId2);
    const isFriends = result;

    // Cache the result
    setCachedFriendshipStatus(userId1, userId2, isFriends);

    return isFriends;
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return false;
  }
}

// Helper function to get team objects from game data
function getTeamObjects(game: unknown): { homeTeam: unknown; awayTeam: unknown } {
  const gameObj = game as Record<string, unknown>;
  if (!gameObj?.teams) {
    return { homeTeam: null, awayTeam: null };
  }

  const teams = gameObj.teams as ITeamsData;
  return {
    homeTeam: teams.home || null,
    awayTeam: teams.away || null,
  };
}

// Consolidated Game Log Query Resolvers
export const gameLogQueryResolvers = {
  // Get a single game log by ID (simplified approach)
  gameLog: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = args;

    try {
      // Use a simple query to get the basic game log data
      // Let the field resolvers handle comments, reactions, and other related data
      const gameLog = await getDb()
        ?.select()
        .from(game_logs)
        .where(and(eq(game_logs.id, id), isNull(game_logs.deleted_at)))
        .limit(1);

      if (!gameLog || gameLog.length === 0) {
        return null;
      }

      return gameLog[0];
    } catch (error) {
      console.error('Error fetching game log:', error);
      throw new Error('Failed to fetch game log');
    }
  },

  // Main gameLogs query (from adaptive resolver with optimized performance)
  async gameLogs(
    parent: unknown,
    args: {
      filters?: { userId?: string; classification?: string; gameId?: string; hasNotes?: boolean };
      pagination?: { first?: number; after?: string };
    },
    context: GraphQLContext
  ) {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { filters, pagination } = args;
    const first = pagination?.first ?? 20;

    // Build WHERE conditions
    const whereConditions = ['gl.deleted_at IS NULL'];

    if (filters?.userId) {
      whereConditions.push(`gl.user_id = '${filters.userId}'`);
    }

    if (filters?.classification) {
      whereConditions.push(`gl.classification = '${filters.classification}'`);
    }

    if (filters?.gameId) {
      whereConditions.push(`gl.game_id = '${filters.gameId}'`);
    }

    if (filters?.hasNotes) {
      whereConditions.push("gl.notes IS NOT NULL AND gl.notes != ''");
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Use optimized query
    const result = await executeUltraFastGameLogQuery(whereClause, first);

    const gameLogs = Array.isArray(result) ? result : [];

    return {
      edges: gameLogs.map((gameLog, index) => ({
        cursor: gameLog.id || `cursor-${index}`,
        node: gameLog,
      })),
      pageInfo: {
        hasNextPage: gameLogs.length >= first,
        endCursor: gameLogs.length > 0 ? gameLogs[gameLogs.length - 1].id : null,
      },
      totalCount: gameLogs.length,
    };
  },

  // Friends game logs query (from optimized resolver)
  async friendsGameLogs(
    parent: unknown,
    args: { pagination?: { first?: number; after?: string } },
    context: GraphQLContext
  ) {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { pagination } = args;
    const first = pagination?.first ?? 20;
    const userId = context.user.id;

    try {
      // Get user's friends
      const friendsResult = await getDb()
        .select({ friendId: friendships.friend_id })
        .from(friendships)
        .where(and(eq(friendships.user_id, userId), eq(friendships.status, 'accepted')));

      const friendIds = friendsResult
        .map(f => f.friendId)
        .filter((id): id is string => id !== null);

      if (friendIds.length === 0) {
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
          totalCount: 0,
        };
      }

      // Get friends' game logs
      const gameLogsResult = await getDb()
        .select({
          id: game_logs.id,
          game_id: game_logs.game_id,
          user_id: game_logs.user_id,
          rating_for_game: game_logs.rating_for_game,
          notes: game_logs.notes,
          tags: game_logs.tags,
          watched_date: game_logs.watched_date,
          watched_setting: game_logs.watched_setting,
          watched_location: game_logs.watched_location,
          watched_scope: game_logs.watched_scope,
          classification: game_logs.classification,
          created_at: game_logs.created_at,
          updated_at: game_logs.updated_at,
        })
        .from(game_logs)
        .where(and(isNull(game_logs.deleted_at), inArray(game_logs.user_id, friendIds)))
        .orderBy(desc(game_logs.created_at))
        .limit(first);

      const edges = gameLogsResult.map(gameLog => ({
        node: gameLog,
        cursor: gameLog.id,
        __typename: 'GameLogEdge',
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: gameLogsResult.length >= first,
          endCursor: edges[edges.length - 1]?.cursor || null,
        },
        totalCount: gameLogsResult.length,
      };
    } catch (error) {
      console.error('Error fetching friends game logs:', error);
      throw new Error('Failed to fetch friends game logs');
    }
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
        classification?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { input } = args;

    const result = await ErrorHandler.getInstance().handleAsync(
      async () => {
        // Check if game exists
        const game = await getDb()
          ?.select()
          .from(basketball_games)
          .where(eq(basketball_games.id, input.gameId))
          .limit(1);

        if (!game || game.length === 0) {
          return {
            gameLog: null,
            errors: [{ message: 'Game not found' }],
          };
        }

        // Check if user already has a game log for this game
        const existingGameLog = await getDb()
          ?.select()
          .from(game_logs)
          .where(
            and(eq(game_logs.game_id, input.gameId), eq(game_logs.user_id, context.user?.id ?? ''))
          )
          .limit(1);

        if (existingGameLog && existingGameLog.length > 0) {
          return {
            gameLog: null,
            errors: [{ message: 'You already have a game log for this game' }],
          };
        }

        // Ensure watched_date is a proper Date object
        let watchedDate: Date;
        if (input.watched_date) {
          if (input.watched_date instanceof Date) {
            watchedDate = input.watched_date;
          } else {
            // Try to parse the date string
            const parsedDate = new Date(input.watched_date);
            if (isNaN(parsedDate.getTime())) {
              // If parsing fails, use current date
              watchedDate = new Date();
            } else {
              watchedDate = parsedDate;
            }
          }
        } else {
          watchedDate = new Date();
        }

        // Create the game log
        const newGameLog = {
          id: generateUUIDv7(),
          game_id: input.gameId,
          user_id: context.user?.id ?? '',
          rating_for_game: input.rating_for_game,
          notes: input.notes || null,
          tags: input.tags || [],
          watched_date: watchedDate,
          watched_setting: input.watched_setting || WATCHED_SETTING.TV,
          watched_location: input.watched_location || null,
          watched_scope: input.watched_scope || WATCHED_SCOPE.FULL_GAME,
          classification: input.classification || CLASSIFICATION.PRIVATE,
          created_at: new Date(),
          updated_at: new Date(),
        };

        try {
          await getDb()?.insert(game_logs).values(newGameLog);
        } catch (dbError) {
          // Handle specific database errors
          if (dbError instanceof Error) {
            if (
              dbError.message.includes('unique constraint') ||
              dbError.message.includes('duplicate key')
            ) {
              return {
                gameLog: null,
                errors: [{ message: 'You already have a game log for this game' }],
              };
            }
            if (dbError.message.includes('foreign key constraint')) {
              return {
                gameLog: null,
                errors: [{ message: 'Invalid game or user reference' }],
              };
            }
          }
          throw dbError; // Re-throw if it's not a constraint violation
        }

        // Invalidate game logs cache
        try {
          const { simpleCacheService } = await import('@/lib/cache');
          simpleCacheService.invalidate({
            pattern: 'game-logs:*',
          });
          console.log('✅ Game logs cache invalidated after create');
        } catch (cacheError) {
          errorHandlers.api(
            cacheError instanceof Error ? cacheError : new Error(String(cacheError)),
            {
              component: 'game-log-resolver',
              action: 'invalidateCache',
              metadata: { operation: 'create', pattern: 'game-logs:*' },
            }
          );
        }

        // Get the game data to include in the response
        const gameData = game[0] as Record<string, unknown>;
        const { homeTeam: _homeTeam, awayTeam: _awayTeam } = getTeamObjects(gameData);

        return {
          gameLog: {
            ...newGameLog,
            game: {
              id: gameData.id,
              date: gameData.date,
            },
          },
          errors: [],
        };
      },
      {
        component: 'GameLogResolver',
        action: 'createGameLog',
        userId: context.user.id,
      }
    );

    return (
      result || {
        gameLog: null,
        errors: [{ message: 'Failed to create game log' }],
      }
    );
  },

  // Update an existing game log
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

    const { id, input } = args;

    const result = await ErrorHandler.getInstance().handleAsync(
      async () => {
        // First, check if the game log exists and belongs to the user
        const existingGameLog = await getDb()?.query.game_logs.findFirst({
          where: and(eq(game_logs.id, id), eq(game_logs.user_id, context.user?.id ?? '')),
        });

        if (!existingGameLog) {
          return {
            gameLog: null,
            errors: [{ message: 'Game log not found or access denied' }],
          };
        }

        // Ensure watched_date is a proper Date object if provided
        const watchedDate = input.watched_date
          ? input.watched_date instanceof Date
            ? input.watched_date
            : new Date(input.watched_date)
          : existingGameLog.watched_date;

        // Update the game log
        await getDb()
          ?.update(game_logs)
          .set({
            rating_for_game: input.rating_for_game ?? existingGameLog.rating_for_game,
            notes: input.notes ?? existingGameLog.notes,
            tags: input.tags ?? existingGameLog.tags,
            watched_date: watchedDate,
            watched_setting: input.watched_setting ?? existingGameLog.watched_setting,
            watched_location: input.watched_location ?? existingGameLog.watched_location,
            watched_scope: input.watched_scope ?? existingGameLog.watched_scope,
            classification: input.classification ?? existingGameLog.classification,
            updated_at: new Date(),
          })
          .where(eq(game_logs.id, id));

        // Invalidate game logs cache to ensure UI updates
        try {
          const { simpleCacheService } = await import('@/lib/cache');
          simpleCacheService.invalidate({
            pattern: 'game-logs:*',
          });
          console.log('✅ Game logs cache invalidated after update');
        } catch (cacheError) {
          errorHandlers.api(
            cacheError instanceof Error ? cacheError : new Error(String(cacheError)),
            {
              component: 'game-log-resolver',
              action: 'invalidateCache',
              metadata: { operation: 'update', pattern: 'game-logs:*' },
            }
          );
        }

        return {
          gameLog: {
            id,
            game_id: existingGameLog.game_id,
            rating_for_game: input.rating_for_game ?? existingGameLog.rating_for_game,
            notes: input.notes ?? existingGameLog.notes,
            tags: input.tags ?? existingGameLog.tags,
            watched_date: watchedDate,
            watched_setting: input.watched_setting ?? existingGameLog.watched_setting,
            watched_location: input.watched_location ?? existingGameLog.watched_location,
            watched_scope: input.watched_scope ?? existingGameLog.watched_scope,
            classification: input.classification ?? existingGameLog.classification,
            created_at: existingGameLog.created_at,
            updated_at: new Date(),
          },
          errors: [],
        };
      },
      {
        component: 'GameLogResolver',
        action: 'updateGameLog',
        userId: context.user.id,
      }
    );

    return (
      result || {
        gameLog: null,
        errors: [{ message: 'Failed to update game log' }],
      }
    );
  },

  // Delete a game log (soft delete)
  deleteGameLog: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = args;

    const result = await ErrorHandler.getInstance().handleAsync(
      async () => {
        // First, check if the game log exists and belongs to the user
        const existingGameLog = await getDb()?.query.game_logs.findFirst({
          where: and(eq(game_logs.id, id), eq(game_logs.user_id, context.user?.id ?? '')),
        });

        if (!existingGameLog) {
          return {
            success: false,
            error: 'Game log not found or access denied',
          };
        }

        // Soft delete the game log
        await getDb()
          ?.update(game_logs)
          .set({
            deleted_at: new Date(),
            updated_at: new Date(),
          })
          .where(eq(game_logs.id, id));

        // Invalidate game logs cache to ensure UI updates
        try {
          const { simpleCacheService } = await import('@/lib/cache');
          simpleCacheService.invalidate({
            pattern: 'game-logs:*',
          });
          console.log('✅ Game logs cache invalidated after delete');
        } catch (cacheError) {
          errorHandlers.api(
            cacheError instanceof Error ? cacheError : new Error(String(cacheError)),
            {
              component: 'game-log-resolver',
              action: 'invalidateCache',
              metadata: { operation: 'delete', pattern: 'game-logs:*' },
            }
          );
        }

        return {
          success: true,
          message: 'Game log deleted successfully',
        };
      },
      {
        component: 'GameLogResolver',
        action: 'deleteGameLog',
        userId: context.user.id,
      }
    );

    return (
      result || {
        success: false,
        error: 'Failed to delete game log',
      }
    );
  },
};

// Game Log Field Resolvers
export const gameLogResolver = {
  // Resolve game field for GameLog
  game: async (parent: {
    game_id: string;
    teams?: unknown;
    game_date?: unknown;
    game_status?: unknown;
    game_season?: unknown;
    game_week?: unknown;
  }) => {
    if (!parent.game_id) return null;

    try {
      // Check if we already have game data from the query (from executeUltraFastGameLogQuery)
      if (parent.teams !== undefined) {
        // We have game data from the query, use it directly
        const { homeTeam, awayTeam } = getTeamObjects(parent);

        return {
          id: parent.game_id,
          date: parent.game_date,
          teams: parent.teams || {},
          status: parent.game_status,
          season: parent.game_season,
          week: parent.game_week,
          home_team: homeTeam,
          away_team: awayTeam,
          home_team_id: (parent as { home_team_id?: string }).home_team_id,
          away_team_id: (parent as { away_team_id?: string }).away_team_id,
        };
      }

      // Fallback: query the database if we don't have the data
      const game = await getDb()
        ?.select()
        .from(basketball_games)
        .where(eq(basketball_games.id, parent.game_id))
        .limit(1);

      if (!game || game.length === 0) return null;

      const gameData = game[0] as Record<string, unknown>;
      const { homeTeam, awayTeam } = getTeamObjects(gameData);

      return {
        id: gameData.id,
        date: gameData.date,
        teams: gameData.teams || {},
        status: gameData.status,
        season: gameData.season,
        week: gameData.stage,
        home_team: homeTeam,
        away_team: awayTeam,
        home_team_id: gameData.home_team_id,
        away_team_id: gameData.away_team_id,
      };
    } catch (error) {
      console.error('Error resolving game field:', error);
      return null;
    }
  },

  // Resolve comments field for GameLog
  comments: async (parent: { id: string }) => {
    if (!parent.id) return [];

    try {
      const commentsResult = await getDb()
        ?.select()
        .from(comments)
        .where(and(eq(comments.parent_id, parent.id), eq(comments.parent_type, 'GAME_LOG')))
        .orderBy(desc(comments.created_at));

      return commentsResult || [];
    } catch (error) {
      console.error('Error resolving comments field:', error);
      return [];
    }
  },

  // Resolve reactions field for GameLog
  reactions: async (parent: { id: string }) => {
    if (!parent.id) return [];

    try {
      const reactionsResult = await getDb()
        ?.select()
        .from(reactions)
        .where(and(eq(reactions.target_id, parent.id), eq(reactions.target_type, 'GAME_LOG')));

      return reactionsResult || [];
    } catch (error) {
      console.error('Error resolving reactions field:', error);
      return [];
    }
  },

  // Resolve total comment count for GameLog
  totalCommentCount: async (parent: { id: string }) => {
    if (!parent.id) return 0;

    try {
      const result = await getDb()
        ?.select({ count: count() })
        .from(comments)
        .where(and(eq(comments.parent_id, parent.id), eq(comments.parent_type, 'GAME_LOG')));

      return result?.[0]?.count || 0;
    } catch (error) {
      console.error('Error resolving total comment count:', error);
      return 0;
    }
  },

  // Resolve total reaction count for GameLog
  totalReactionCount: async (parent: { id: string }) => {
    if (!parent.id) return 0;

    try {
      const result = await getDb()
        ?.select({ count: count() })
        .from(reactions)
        .where(and(eq(reactions.target_id, parent.id), eq(reactions.target_type, 'GAME_LOG')));

      return result?.[0]?.count || 0;
    } catch (error) {
      console.error('Error resolving total reaction count:', error);
      return 0;
    }
  },
};

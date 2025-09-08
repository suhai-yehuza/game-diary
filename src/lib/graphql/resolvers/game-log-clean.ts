import { eq, and, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { game_logs, basketball_games, users } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { generateUUIDv7 } from '@/lib/utils/id-generator';
import { FRIENDSHIP_STATUS, CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@/types';
import type { GraphQLContext, ITeamsData } from '@/types';

// Type for teams data structure

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
async function _checkFriendshipStatus(_userId1: string, _userId2: string): Promise<boolean> {
  const cacheKey = getFriendshipCacheKey(_userId1, _userId2);

  // Check cache first
  const cached = friendshipCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Query database (temporarily using old logic until canonical_id is fully set up)
  const friendship = await db()?.execute(sql`
    SELECT EXISTS(
      SELECT 1 FROM friendships
      WHERE status = ${FRIENDSHIP_STATUS.ACCEPTED}
      AND (
        (user_id = ${_userId1} AND friend_id = ${_userId2})
        OR
        (user_id = ${_userId2} AND friend_id = ${_userId1})
      )
      AND deleted_at IS NULL
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
    const gameLogId = generateUUIDv7();

    const result = await ErrorHandler.getInstance().handleAsync(
      async () => {
        // First, fetch the user data to populate the UserSummary
        const userData = await db()
          ?.select({
            id: users.id,
            username: users.username,
            first_name: users.first_name,
            last_name: users.last_name,
            email_address: users.email_address,
            image_url: users.image_url,
            isAdmin: users.isAdmin,
            created_at: users.created_at,
          })
          .from(users)
          .where(eq(users.id, context.user?.id ?? ''))
          .limit(1);

        if (!userData || userData.length === 0) {
          throw new Error('User not found');
        }

        const user = userData[0];

        // Validate and ensure the game exists in basketball_games table
        let gameIdToUse = input.gameId;

        // Check if gameId is already in season-gameId format (contains a dash)
        if (!input.gameId.includes('-')) {
          // If not in season-gameId format, we need to construct it
          // For now, we'll assume current season - this should be passed from the frontend
          const currentSeason = new Date().getFullYear().toString();
          gameIdToUse = `${currentSeason}-${input.gameId}`;
          console.log(
            '🔍 createGameLog (clean): converted gameId to season-gameId format:',
            gameIdToUse
          );
        } else {
          console.log('🔍 createGameLog (clean): gameId already in correct format:', gameIdToUse);
        }

        // Check if the game exists in basketball_games table using direct query
        const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
        let existingGame = null;

        if (databaseUrl) {
          const { neon } = await import('@neondatabase/serverless');
          const directDb = neon(databaseUrl);
          const gameResults =
            await directDb`SELECT id FROM basketball_games WHERE id = ${gameIdToUse} LIMIT 1`;
          existingGame = gameResults.length > 0 ? [{ id: gameResults[0].id }] : [];
        } else {
          // Fallback to Drizzle if no direct database URL
          existingGame = await db()
            ?.select({ id: basketball_games.id })
            .from(basketball_games)
            .where(eq(basketball_games.id, gameIdToUse))
            .limit(1);
        }

        if (!existingGame || existingGame.length === 0) {
          console.log(
            'Game not found in basketball_games table, cannot create game log for gameId:',
            gameIdToUse
          );
          throw new Error(
            'Game not found. Please ensure the game exists before creating a game log.'
          );
        }

        console.log('Game found in basketball_games table:', existingGame[0].id);

        // Ensure watched_date is a proper Date object
        const watchedDate = input.watched_date
          ? input.watched_date instanceof Date
            ? input.watched_date
            : new Date(input.watched_date)
          : new Date();

        await db()
          ?.insert(game_logs)
          .values({
            id: gameLogId,
            user_id: context.user?.id ?? '',
            game_id: gameIdToUse,
            rating_for_game: input.rating_for_game || 3,
            notes: input.notes || null,
            tags: input.tags || [],
            watched_date: watchedDate,
            watched_setting: input.watched_setting || WATCHED_SETTING.TV,
            watched_location: input.watched_location || '',
            watched_scope: input.watched_scope || WATCHED_SCOPE.FULL_GAME,
            classification: input.classification || CLASSIFICATION.PRIVATE,
          } as typeof game_logs.$inferInsert);

        return {
          gameLog: {
            id: gameLogId,
            game_id: gameIdToUse,
            rating_for_game: input.rating_for_game || 3,
            notes: input.notes,
            tags: input.tags,
            watched_date: watchedDate,
            watched_setting: input.watched_setting,
            watched_location: input.watched_location,
            watched_scope: input.watched_scope,
            classification: input.classification || CLASSIFICATION.PRIVATE,
            user: {
              id: user.id,
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
              email_address: user.email_address,
              image_url: user.image_url,
              isAdmin: user.isAdmin,
              created_at: user.created_at,
            },
            created_at: new Date(),
            updated_at: new Date(),
          },
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
        const existingGameLog = await db()?.query.game_logs.findFirst({
          where: and(eq(game_logs.id, id), eq(game_logs.user_id, context.user?.id ?? '')),
        });

        if (!existingGameLog) {
          return {
            success: false,
            error: 'Game log not found or access denied',
          };
        }

        // Update the game log
        await db()
          ?.update(game_logs)
          .set({
            rating_for_game: input.rating_for_game ?? existingGameLog.rating_for_game,
            notes: input.notes ?? existingGameLog.notes,
            tags: input.tags ?? existingGameLog.tags,
            watched_date: input.watched_date ?? existingGameLog.watched_date,
            watched_setting: input.watched_setting ?? existingGameLog.watched_setting,
            watched_location: input.watched_location ?? existingGameLog.watched_location,
            watched_scope: input.watched_scope ?? existingGameLog.watched_scope,
            classification: input.classification ?? existingGameLog.classification,
            updated_at: new Date(),
          })
          .where(eq(game_logs.id, id));

        return {
          success: true,
          gameLog: {
            id,
            game_id: existingGameLog.game_id,
            rating_for_game: input.rating_for_game ?? existingGameLog.rating_for_game,
            notes: input.notes ?? existingGameLog.notes,
            tags: input.tags ?? existingGameLog.tags,
            watched_date: input.watched_date ?? existingGameLog.watched_date,
            watched_setting: input.watched_setting ?? existingGameLog.watched_setting,
            watched_location: input.watched_location ?? existingGameLog.watched_location,
            watched_scope: input.watched_scope ?? existingGameLog.watched_scope,
            classification: input.classification ?? existingGameLog.classification,
            created_at: existingGameLog.created_at,
            updated_at: new Date(),
          },
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
        success: false,
        error: 'Failed to update game log',
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
        const existingGameLog = await db()?.query.game_logs.findFirst({
          where: and(eq(game_logs.id, id), eq(game_logs.user_id, context.user?.id ?? '')),
        });

        if (!existingGameLog) {
          return {
            success: false,
            error: 'Game log not found or access denied',
          };
        }

        // Soft delete the game log
        await db()
          ?.update(game_logs)
          .set({
            deleted_at: new Date(),
            updated_at: new Date(),
          })
          .where(eq(game_logs.id, id));

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

// Game Log Resolver (for individual game log fields)
export const gameLogResolver = {
  // Resolve the user field for a game log
  user: async (parent: { user_id?: string }) => {
    if (!parent.user_id) return null;

    const user = await db()?.query.users.findFirst({
      where: eq(users.id, parent.user_id),
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: null, // Don't expose email in game log context
      phone_number: null, // Don't expose phone in game log context
      image_url: user.image_url,
      isAdmin: false, // Default value since isAdmin is not available
    };
  },

  // Resolve the game field for a game log
  game: async (parent: { game_id?: string }) => {
    if (!parent.game_id) return null;

    const game = await db()?.query.basketball_games.findFirst({
      where: eq(basketball_games.id, parent.game_id),
    });

    if (!game) return null;

    const teamsData = game.teams as ITeamsData;

    return {
      id: game.id,
      date: game.date ? new Date(game.date) : undefined,
      status: game.status,
      scores: game.scores,
      homeTeam: teamsData?.home
        ? {
            id: teamsData.home.id || '',
            name: teamsData.home.name || '',
            nickname: teamsData.home.nickname || '',
            code: teamsData.home.code || '',
            city: teamsData.home.city || '',
            conference: teamsData.home.conference || '',
            division: teamsData.home.division || '',
            logo_url: teamsData.home.logo_url || '',
          }
        : null,
      awayTeam: teamsData?.away
        ? {
            id: teamsData.away.id || '',
            name: teamsData.away.name || '',
            nickname: teamsData.away.nickname || '',
            code: teamsData.away.code || '',
            city: teamsData.away.city || '',
            conference: teamsData.away.conference || '',
            division: teamsData.away.division || '',
            logo_url: teamsData.away.logo_url || '',
          }
        : null,
    };
  },
};

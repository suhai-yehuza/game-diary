import { eq, and, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  game_logs,
  basketball_games,
  users,
  comments,
  reactions,
  basketball_teams,
} from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { generateUUIDv7 } from '@/lib/utils/id-generator';
import { FRIENDSHIP_STATUS, CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@/types';
import type { GraphQLContext } from '@/types';

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
        }

        // Check if the game exists in basketball_games table
        const existingGame = await db()
          ?.select({ id: basketball_games.id })
          .from(basketball_games)
          .where(eq(basketball_games.id, gameIdToUse))
          .limit(1);

        if (!existingGame || existingGame.length === 0) {
          return {
            success: false,
            error: 'Game not found. Please ensure the game exists before creating a game log.',
          };
        }

        await db()
          ?.insert(game_logs)
          .values({
            id: gameLogId,
            user_id: context.user?.id ?? '',
            game_id: gameIdToUse,
            rating_for_game: input.rating_for_game || 3,
            notes: input.notes || null,
            tags: input.tags || [],
            watched_date: input.watched_date || new Date(),
            watched_setting: input.watched_setting || WATCHED_SETTING.TV,
            watched_location: input.watched_location || '',
            watched_scope: input.watched_scope || WATCHED_SCOPE.FULL_GAME,
            classification: input.classification || CLASSIFICATION.PRIVATE,
          } as typeof game_logs.$inferInsert);

        return {
          success: true,
          gameLog: {
            id: gameLogId,
            game_id: gameIdToUse,
            rating_for_game: input.rating_for_game || 3,
            notes: input.notes,
            tags: input.tags,
            watched_date: input.watched_date,
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
        success: false,
        error: 'Failed to create game log',
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
    if (!parent.user_id) {
      // Return a default user object to satisfy non-nullable requirement
      return {
        id: '',
        username: 'Unknown User',
        first_name: 'Unknown',
        last_name: 'User',
        email_address: null,
        phone_number: null,
        image_url: null,
        isAdmin: false,
      };
    }

    const user = await db()?.query.users.findFirst({
      where: eq(users.id, parent.user_id),
    });

    if (!user) {
      // Return a default user object if user not found
      return {
        id: parent.user_id,
        username: 'Unknown User',
        first_name: 'Unknown',
        last_name: 'User',
        email_address: null,
        phone_number: null,
        image_url: null,
        isAdmin: false,
      };
    }

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
    if (!parent.game_id) {
      // Return a default game object to satisfy non-nullable requirement
      return {
        id: '',
        date: new Date(),
        status: 'UNKNOWN',
        game_type: 'nba',
        season: null,
        basketball_game_id: null,
        teams: null,
        scores: null,
        average_rating: null,
        total_ratings: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        homeTeam: {
          id: '',
          name: 'Unknown Team',
          nickname: null,
          code: null,
          city: null,
          logo: null,
          all_star: false,
          nba_franchise: false,
          conference: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        awayTeam: {
          id: '',
          name: 'Unknown Team',
          nickname: null,
          code: null,
          city: null,
          logo: null,
          all_star: false,
          nba_franchise: false,
          conference: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };
    }

    const game = await ErrorHandler.getInstance().handleAsync(
      async () => {
        if (!parent.game_id) {
          return null;
        }
        return db()?.query.basketball_games.findFirst({
          where: eq(basketball_games.id, parent.game_id),
        });
      },
      {
        component: 'GraphQL Resolver',
        action: 'Fetch NBA game by ID',
        timestamp: new Date().toISOString(),
      }
    );

    if (!game) {
      console.warn('Game not found for game_id:', parent.game_id);
      // Return a default game object if game not found
      return {
        id: parent.game_id,
        date: new Date(),
        status: 'UNKNOWN',
        game_type: 'nba',
        season: null,
        basketball_game_id: parent.game_id,
        teams: null,
        scores: null,
        average_rating: null,
        total_ratings: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        homeTeam: {
          id: '',
          name: 'Unknown Team',
          nickname: null,
          code: null,
          city: null,
          logo: null,
          all_star: false,
          nba_franchise: false,
          conference: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        awayTeam: {
          id: '',
          name: 'Unknown Team',
          nickname: null,
          code: null,
          city: null,
          logo: null,
          all_star: false,
          nba_franchise: false,
          conference: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };
    }

    // Fetch home and away basketball_teams separately since relations are not defined
    let homeTeam = null;
    let awayTeam = null;

    const teamResults = await ErrorHandler.getInstance().handleAsync(
      async () => {
        const teamPromises = [];
        const teamsData = game.teams as {
          home?: { id?: string | number };
          away?: { id?: string | number };
        };
        if (teamsData?.home?.id) {
          teamPromises.push(
            db()
              ?.query.basketball_teams.findFirst({
                where: eq(basketball_teams.id, teamsData.home.id.toString()),
              })
              .then(result => ({ type: 'home', team: result }))
          );
        }
        if (teamsData?.away?.id) {
          teamPromises.push(
            db()
              ?.query.basketball_teams.findFirst({
                where: eq(basketball_teams.id, teamsData.away.id.toString()),
              })
              .then(result => ({ type: 'away', team: result }))
          );
        }

        return Promise.all(teamPromises);
      },
      {
        component: 'GraphQL Resolver',
        action: 'Fetch team data for game',
        timestamp: new Date().toISOString(),
      }
    );

    if (teamResults) {
      teamResults.forEach(result => {
        if (result?.type === 'home') {
          homeTeam = result.team;
        } else if (result?.type === 'away') {
          awayTeam = result.team;
        }
      });
    }

    return {
      id: game.id,
      date: game.date ? new Date(game.date) : undefined,
      status: game.status,
      game_type: game.game_type || 'nba',
      season: game.season,
      basketball_game_id: game.basketball_game_id,
      teams: game.teams,
      scores: game.scores,
      average_rating: game.average_rating ? parseFloat(game.average_rating) : null,
      total_ratings: game.total_ratings,
      created_at: game.created_at ? new Date(game.created_at) : new Date(),
      updated_at: game.updated_at ? new Date(game.updated_at) : new Date(),
      deleted_at: game.deleted_at ? new Date(game.deleted_at) : null,
      home_team: homeTeam
        ? {
            id: (homeTeam as Record<string, unknown>).id,
            name: (homeTeam as Record<string, unknown>).name,
            nickname: (homeTeam as Record<string, unknown>).nickname,
            code: (homeTeam as Record<string, unknown>).code,
            city: (homeTeam as Record<string, unknown>).city,
            logo: (homeTeam as Record<string, unknown>).logo,
            all_star: (homeTeam as Record<string, unknown>).all_star,
            nba_franchise: (homeTeam as Record<string, unknown>).nba_franchise,
            conference: (homeTeam as Record<string, unknown>).conference,
            created_at: (homeTeam as Record<string, unknown>).created_at
              ? new Date((homeTeam as Record<string, unknown>).created_at as string)
              : new Date(),
            updated_at: (homeTeam as Record<string, unknown>).updated_at
              ? new Date((homeTeam as Record<string, unknown>).updated_at as string)
              : new Date(),
          }
        : {
            // Default team object to satisfy non-nullable requirement
            id: 0,
            name: 'Unknown Team',
            nickname: null,
            code: null,
            city: null,
            logo: null,
            all_star: false,
            nba_franchise: false,
            conference: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
      away_team: awayTeam
        ? {
            id: (awayTeam as Record<string, unknown>).id,
            name: (awayTeam as Record<string, unknown>).name,
            nickname: (awayTeam as Record<string, unknown>).nickname,
            code: (awayTeam as Record<string, unknown>).code,
            city: (awayTeam as Record<string, unknown>).city,
            logo: (awayTeam as Record<string, unknown>).logo,
            all_star: (awayTeam as Record<string, unknown>).all_star,
            nba_franchise: (awayTeam as Record<string, unknown>).nba_franchise,
            conference: (awayTeam as Record<string, unknown>).conference,
            created_at: (awayTeam as Record<string, unknown>).created_at
              ? new Date((awayTeam as Record<string, unknown>).created_at as string)
              : new Date(),
            updated_at: (awayTeam as Record<string, unknown>).updated_at
              ? new Date((awayTeam as Record<string, unknown>).updated_at as string)
              : new Date(),
          }
        : {
            // Default team object to satisfy non-nullable requirement
            id: 0,
            name: 'Unknown Team',
            nickname: null,
            code: null,
            city: null,
            logo: null,
            all_star: false,
            nba_franchise: false,
            conference: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
    };
    // If game is null due to error, return a default game object
    if (!game) {
      return {
        id: parent.game_id || '',
        date: new Date(),
        status: 'UNKNOWN',
        game_type: 'nba',
        season: null,
        basketball_game_id: parent.game_id || null,
        teams: null,
        scores: null,
        average_rating: null,
        total_ratings: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        home_team: {
          id: '',
          name: 'Unknown Team',
          nickname: null,
          code: null,
          city: null,
          logo: null,
          all_star: false,
          nba_franchise: false,
          conference: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        away_team: {
          id: '',
          name: 'Unknown Team',
          nickname: null,
          code: null,
          city: null,
          logo: null,
          all_star: false,
          nba_franchise: false,
          conference: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };
    }
  },

  // Resolve totalCommentCount field for a game log
  totalCommentCount: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // If MOCK_MODE is enabled, return 0 for comment count
    if (process.env.MOCK_MODE === 'true') {
      return 0;
    }

    const totalCountResult = await ErrorHandler.getInstance().handleAsync(
      async () => {
        const database = db();
        if (!database) {
          return 0;
        }

        const result = await database
          .select({ count: sql<number>`count(*)` })
          .from(comments)
          .where(and(eq(comments.parent_id, parent.id), eq(comments.parent_type, 'GAME_LOG')));

        return result?.[0]?.count ?? 0;
      },
      {
        component: 'GraphQL Resolver',
        action: 'Fetch game log comment count',
        timestamp: new Date().toISOString(),
      }
    );

    return totalCountResult ?? 0;
  },

  // Resolve comments field for a game log
  comments: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // If MOCK_MODE is enabled, return empty connection for comments
    if (process.env.MOCK_MODE === 'true') {
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

    const result = await ErrorHandler.getInstance().handleAsync(
      async () => {
        const database = db();
        if (!database) {
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

        const commentsData = await database
          .select({
            id: comments.id,
            content: comments.content,
            user_id: comments.user_id,
            parent_id: comments.parent_id,
            parent_type: comments.parent_type,
            depth: comments.depth,
            created_at: comments.created_at,
            updated_at: comments.updated_at,
            deleted_at: comments.deleted_at,
          })
          .from(comments)
          .where(and(eq(comments.parent_id, parent.id), eq(comments.parent_type, 'GAME_LOG')));

        const edges = commentsData.map(comment => ({
          cursor: comment.id,
          node: comment,
        }));

        return {
          edges,
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: edges.length > 0 ? edges[0].cursor : null,
            endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          },
          totalCount: commentsData.length,
        };
      },
      {
        component: 'GraphQL Resolver',
        action: 'Fetch game log comments',
        timestamp: new Date().toISOString(),
      }
    );

    return (
      result ?? {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      }
    );
  },

  // Resolve reactions field for a game log
  reactions: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // If MOCK_MODE is enabled, return empty array for reactions
    if (process.env.MOCK_MODE === 'true') {
      return [];
    }

    const reactionsData = await ErrorHandler.getInstance().handleAsync(
      async () => {
        const database = db();
        if (!database) {
          return [];
        }

        const result = await database
          .select({
            id: reactions.id,
            emoji: reactions.emoji,
            user_id: reactions.user_id,
            target_id: reactions.target_id,
            target_type: reactions.target_type,
            created_at: reactions.created_at,
            updated_at: reactions.updated_at,
            deleted_at: reactions.deleted_at,
          })
          .from(reactions)
          .where(and(eq(reactions.target_id, parent.id), eq(reactions.target_type, 'GAME_LOG')));

        return result || [];
      },
      {
        component: 'GraphQL Resolver',
        action: 'Fetch game log reactions',
        timestamp: new Date().toISOString(),
      }
    );

    return reactionsData ?? [];
  },

  // Resolve totalReactionCount field for a game log
  totalReactionCount: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // If MOCK_MODE is enabled, return 0 for reaction count
    if (process.env.MOCK_MODE === 'true') {
      return 0;
    }

    const totalCountResult = await ErrorHandler.getInstance().handleAsync(
      async () => {
        const database = db();
        if (!database) {
          return 0;
        }

        const result = await database
          .select({ count: sql<number>`count(*)` })
          .from(reactions)
          .where(and(eq(reactions.target_id, parent.id), eq(reactions.target_type, 'GAME_LOG')));

        return result?.[0]?.count ?? 0;
      },
      {
        component: 'GraphQL Resolver',
        action: 'Fetch game log reaction count',
        timestamp: new Date().toISOString(),
      }
    );

    return totalCountResult ?? 0;
  },
};

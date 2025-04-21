import {
  fetchNbaSeasons,
  fetchNbaLeagues,
  fetchNbaGames,
  fetchNbaTeams,
  fetchNbaPlayerById,
  fetchNbaStandings,
  fetchNbaGameStats,
  fetchNbaTeamStats,
  fetchNbaPlayerStats,
  fetchNbaPlayers,
  fetchNbaTeamById,
  fetchNbaGameById,
} from "../external-apis";
import {
  TeamSearchApiResponse,
  TeamFilters,
  Player as NbaPlayer,
  PlayersApiResponse,
  PlayerFilters,
  GameFilters,
  Team,
  User,
  Friendship,
  Comment,
  Reaction,
  Game,
  GameStatistics,
  GameLog,
  GameRating,
  PaginationArgs,
} from "../types/types";
import { db } from "../../db";
import * as schema from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { cache, CACHE_KEYS, CACHE_TTL } from "../redis";
import { Redis } from "@upstash/redis";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { StringValueNode } from "graphql";

// Update the type definition to use PostgreSQL
type DB = NeonHttpDatabase<typeof schema>;

// Utility function for database operations with retry logic
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let retries = maxRetries;
  let lastError: Error | unknown;

  while (retries > 0) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      retries--;
      if (retries > 0) {
        console.log(`Retrying operation, ${retries} attempts remaining...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error("Operation failed after all retries:", lastError);
  throw new Error(
    `Operation failed after ${maxRetries} attempts: ${lastError instanceof Error ? lastError.message : "Unknown error"}`
  );
}

function paginateGames<T extends { id: string }>(
  games: T[],
  pagination?: PaginationArgs
) {
  let startIndex = 0;
  let endIndex = games.length;

  if (pagination?.after) {
    const afterIndex = games.findIndex((game) => game.id === pagination.after);
    if (afterIndex !== -1) {
      startIndex = afterIndex + 1;
    }
  }

  if (pagination?.before) {
    const beforeIndex = games.findIndex((game) => game.id === pagination.before);
    if (beforeIndex !== -1) {
      endIndex = beforeIndex;
    }
  }

  if (pagination?.first) {
    endIndex = Math.min(startIndex + pagination.first, endIndex);
  }

  if (pagination?.last) {
    startIndex = Math.max(endIndex - pagination.last, startIndex);
  }

  const paginatedGames = games.slice(startIndex, endIndex);

  return {
    edges: paginatedGames.map((game) => ({
      node: game,
      cursor: game.id,
    })),
    pageInfo: {
      hasNextPage: endIndex < games.length,
      hasPreviousPage: startIndex > 0,
      startCursor: paginatedGames[0]?.id || null,
      endCursor: paginatedGames[paginatedGames.length - 1]?.id || null,
    },
    totalCount: games.length,
  };
}

export const resolvers = {
  DateTime: {
    serialize: (value: Date | string) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'string') {
        return new Date(value).toISOString();
      }
      return value;
    },
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: StringValueNode) => {
      if (ast.kind === "StringValue") {
        return new Date(ast.value);
      }
      return null;
    },
  },

  Query: {
    seasons: async (_parent: unknown, _args: unknown, { redis }: { redis: Redis }) => {
      try {
        // Try to get from cache first if Redis is available
        if (redis) {
          try {
            const cachedSeasons = await redis.get(CACHE_KEYS.SEASONS);
            if (cachedSeasons) {
              return cachedSeasons;
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for seasons:", cacheError);
            // Continue to fetch from API if cache fails
          }
        }

        const { response } = await fetchNbaSeasons();
        console.log("Seasons response:", response);
        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid seasons response format");
        }
        const seasons = response.flat().map((year: number) => ({
          id: year,
          name: `${year}-${year + 1}`,
          startDate: `${year}-10-01`,
          endDate: `${year + 1}-06-30`,
          isCurrent: new Date().getFullYear() === year,
        }));

        // Cache the seasons data if Redis is available
        if (redis) {
          try {
            await redis.set(CACHE_KEYS.SEASONS, JSON.stringify(seasons), { ex: CACHE_TTL.SEASONS });
          } catch (cacheError) {
            console.error("Error setting Redis cache for seasons:", cacheError);
            // Continue even if caching fails
          }
        }

        return seasons;
      } catch (error) {
        console.error("Error fetching seasons:", error);
        throw new Error("Failed to fetch seasons");
      }
    },

    leagues: async (_parent: unknown, _args: unknown, { redis }: { redis: Redis }) => {
      try {
        // Try to get from cache first if Redis is available
        if (redis) {
          try {
            const cachedLeagues = await redis.get(CACHE_KEYS.LEAGUES);
            if (cachedLeagues) {
              return JSON.parse(cachedLeagues as string);
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for leagues:", cacheError);
            // Continue to fetch from API if cache fails
          }
        }

        const response = await fetchNbaLeagues();
        const leagues = response.response.map((leagues: string[]) => {
          const league = leagues[0];
          return {
            id: league,
            name:
              league === "standard"
                ? "NBA"
                : league.charAt(0).toUpperCase() + league.slice(1),
            type: league,
            logo: `/logos/${league}.png`,
          };
        });

        // Cache the leagues data if Redis is available
        if (redis) {
          try {
            await redis.set(CACHE_KEYS.LEAGUES, JSON.stringify(leagues), { ex: CACHE_TTL.LEAGUES });
          } catch (cacheError) {
            console.error("Error setting Redis cache for leagues:", cacheError);
            // Continue even if caching fails
          }
        }

        return leagues;
      } catch (error) {
        console.error("Error fetching leagues:", error);
        throw new Error("Failed to fetch leagues");
      }
    },

    games: async (
      _parent: unknown,
      { filters, pagination }: { filters?: GameFilters; pagination?: PaginationArgs }
    ) => {
      try {
        // Build query parameters from filters
        const queryParams = filters
          ? Object.entries(filters)
              .filter(([_, value]) => value !== undefined)
              .map(([key, value]) => `${key}=${value}`)
              .join("&")
          : "";

        console.log("Fetching games with params:", queryParams);
        const data = await fetchNbaGames(queryParams ? `?${queryParams}` : "");
        
        if (!data.response) {
          console.error("Invalid response format from games API:", data);
          throw new Error("Invalid response format from games API");
        }

        // Flatten the response array and map the games
        const games = data.response.flat().map((game: Game) => ({
          ...game,
          id: game.id.toString(),
        }));

        return paginateGames(games, pagination);
      } catch (error) {
        console.error("Error fetching games:", error);
        throw new Error("Failed to fetch games");
      }
    },

    game: async (_parent: unknown, { id }: { id: string }, { redis }: { redis: Redis }) => {
      try {
        // Try to get from cache first
        if (redis) {
          try {
            const cachedGame = await redis.get(`${CACHE_KEYS.GAME}:${id}`);
            if (cachedGame) {
              return JSON.parse(cachedGame as string);
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for game:", cacheError);
          }
        }

        // Fetch game data from API
        const response = await fetchNbaGameById(id);
        if (!response || !response.response || response.response.length === 0) {
          throw new Error("Game not found");
        }

        const apiGame = response.response[0] as unknown as Game;
        if (!apiGame) {
          throw new Error("Game not found");
        }

        // Transform the game data to match the schema
        const transformedGame = {
          ...apiGame,
          id: apiGame.id.toString(),
          teams: {
            visitors: {
              ...apiGame.teams.visitors,
              id: apiGame.teams.visitors.id.toString(),
            },
            home: {
              ...apiGame.teams.home,
              id: apiGame.teams.home.id.toString(),
            },
          },
          statistics: apiGame.statistics?.map((stat: GameStatistics) => ({
            ...stat,
            game_id: stat.game_id.toString(),
            team: stat.team.toString(),
            playerId: stat.playerId.toString(),
          })),
        };

        // Cache the transformed game data
        if (redis) {
          try {
            await redis.set(`${CACHE_KEYS.GAME}:${id}`, JSON.stringify(transformedGame), { ex: CACHE_TTL.GAME });
          } catch (cacheError) {
            console.error("Error setting Redis cache for game:", cacheError);
          }
        }

        return transformedGame;
      } catch (error) {
        console.error("Error fetching game:", error);
        throw new Error("Failed to fetch game");
      }
    },

    teams: async (_parent: unknown, { filters }: { filters?: TeamFilters }) => {
      try {
        if (filters) {
          const filterCount = Object.keys(filters).filter(
            (key) => filters[key as keyof TeamFilters] !== undefined
          ).length;
          if (filterCount > 1) {
            throw new Error("Only one filter parameter is allowed at a time");
          }
        }

        // Try to get from cache first
        const cacheKey = filters
          ? `${CACHE_KEYS.TEAMS}:${Object.entries(filters).find(([, value]) => value !== undefined)?.[0]}:${Object.entries(filters).find(([, value]) => value !== undefined)?.[1]}`
          : CACHE_KEYS.TEAMS;

        const cachedTeams = await cache.get(cacheKey);
        if (cachedTeams) {
          return cachedTeams;
        }

        const response: TeamSearchApiResponse = await fetchNbaTeams();
        let filteredTeams: Team[] = response.response.flat();

        // Filter out teams that have conference values as their division values
        filteredTeams = filteredTeams.filter((team: Team) => {
          const division = team.leagues?.standard?.division;
          return division && !["East", "West"].includes(division);
        });

        if (filters) {
          const [key, value] =
            Object.entries(filters).find(([, value]) => value !== undefined) ||
            [];
          if (key && value && typeof value === "string") {
            filteredTeams = filteredTeams.filter((team: Team) => {
              switch (key) {
                case "conference":
                  return (
                    team.leagues?.standard?.conference?.toLowerCase() ===
                    value.toLowerCase()
                  );
                case "division":
                  return (
                    team.leagues?.standard?.division?.toLowerCase() ===
                    value.toLowerCase()
                  );
                case "code":
                  return team.code.toLowerCase() === value.toLowerCase();
                default:
                  return true;
              }
            });
          }
        }

        // Cache the filtered teams
        await cache.set(cacheKey, filteredTeams, CACHE_TTL.TEAMS);
        return filteredTeams;
      } catch (error) {
        console.error("Error in teams resolver:", error);
        throw error;
      }
    },

    players: async (
      _parent: unknown,
      { pagination, filters }: { pagination?: PaginationArgs; filters?: PlayerFilters },
      { redis }: { db: DB; redis: Redis }
    ) => {
      let queryParams = "";
      try {
        // Build query parameters from filters
        queryParams = filters
          ? Object.entries(filters)
              .filter(([_, value]) => value !== undefined)
              .map(([key, value]) => `${key}=${value}`)
              .join("&")
          : "";

        const cacheKey = filters ? `${CACHE_KEYS.PLAYERS}:${queryParams}` : CACHE_KEYS.PLAYERS;
        
        // Try to get from cache first if Redis is available
        if (redis) {
          try {
            const cachedPlayers = await redis.get(cacheKey);
            if (cachedPlayers) {
              console.log("Returning cached players");
              const players = JSON.parse(cachedPlayers as string);
              return paginatePlayers(players, pagination);
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for players:", cacheError);
            // Continue to fetch from API if cache fails
          }
        }

        console.log("Fetching players from API with params:", queryParams);
        console.log("API URL:", `${process.env.RAPID_API_BASE_URL}/players${queryParams ? `?${queryParams}` : ''}`);
        console.log("Headers:", {
          "x-rapidapi-host": process.env.RAPID_API_HOST,
          "x-rapidapi-key": "***",
        });

        try {
          const response: PlayersApiResponse = await fetchNbaPlayers(queryParams);
          
          if (!response) {
            console.error("No response received from players API");
            throw new Error("No response received from players API");
          }

          if (!response.response) {
            console.error("Invalid response format from players API:", response);
            throw new Error("Invalid response format from players API");
          }

          console.log(`Received ${response.response.length} players from API`);
          
          // Transform the players data
          const playersArray = response.response as unknown as NbaPlayer[];
          const players = playersArray.map((player) => ({
            ...player,
            id: player.id.toString(),
            leagues: player.leagues ? {
              standard: {
                ...player.leagues.standard,
                pos: player.leagues.standard?.pos ? player.leagues.standard.pos.replace("-", "") : null,
              },
            } : undefined,
          }));

          // Cache the results if Redis is available
          if (redis) {
            try {
              await redis.set(cacheKey, JSON.stringify(players), { ex: CACHE_TTL.PLAYERS });
              console.log("Cached players data");
            } catch (cacheError) {
              console.error("Error setting Redis cache for players:", cacheError);
              // Continue even if caching fails
            }
          }

          return paginatePlayers(players, pagination);
        } catch (apiError: unknown) {
          console.error("API Error details:", {
            message: apiError instanceof Error ? apiError.message : 'Unknown error',
            stack: apiError instanceof Error ? apiError.stack : undefined,
            response: apiError instanceof Error ? (apiError as any).response : undefined,
          });
          throw new Error(`API Error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
        }
      } catch (error: unknown) {
        console.error("Error in players resolver:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          filters,
          queryParams,
        });
        throw new Error(`Failed to fetch players: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    player: async (_parent: unknown, { id }: { id: string }, { redis }: { db: DB; redis: Redis }) => {
      try {
        if (!id) {
          throw new Error("Player ID is required");
        }

        // Try to get from cache first if Redis is available
        if (redis) {
          try {
            const cacheKey = CACHE_KEYS.PLAYER_STATS(id);
            const cachedPlayer = await redis.get(cacheKey);
            if (cachedPlayer) {
              return JSON.parse(cachedPlayer as string);
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for player:", cacheError);
            // Continue to fetch from API if cache fails
          }
        }

        const response = await fetchNbaPlayerById(id);
        const player = response.response[0] || null;

        // Cache the result if Redis is available
        if (redis && player) {
          try {
            const cacheKey = CACHE_KEYS.PLAYER_STATS(id);
            await redis.set(cacheKey, JSON.stringify(player), { ex: CACHE_TTL.PLAYER_STATS });
          } catch (cacheError) {
            console.error("Error setting Redis cache for player:", cacheError);
            // Continue even if caching fails
          }
        }

        return player;
      } catch (error) {
        console.error("Error fetching player:", error);
        throw new Error("Failed to fetch player");
      }
    },

    standings: async (_parent: unknown, { season }: { season: string }, { redis }: { db: DB; redis: Redis }) => {
      try {
        if (!season) {
          throw new Error("Season is required");
        }

        // Try to get from cache first if Redis is available
        if (redis) {
          try {
            const cacheKey = `nba:standings:${season}`;
            const cachedStandings = await redis.get(cacheKey);
            if (cachedStandings) {
              return JSON.parse(cachedStandings as string);
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for standings:", cacheError);
            // Continue to fetch from API if cache fails
          }
        }

        const response = await fetchNbaStandings(season);
        const standings = response.response || [];

        // Cache the result if Redis is available
        if (redis && standings.length > 0) {
          try {
            const cacheKey = `nba:standings:${season}`;
            await redis.set(cacheKey, JSON.stringify(standings), { ex: CACHE_TTL.TEAM_STATS });
          } catch (cacheError) {
            console.error("Error setting Redis cache for standings:", cacheError);
            // Continue even if caching fails
          }
        }

        return standings;
      } catch (error) {
        console.error("Error fetching standings:", error);
        throw new Error("Failed to fetch standings");
      }
    },

    // Game Statistics Resolvers
    game_stats: async (_parent: unknown, { game_id }: { game_id: string }) => {
      try {
        if (!game_id) {
          throw new Error("Game ID is required");
        }

        // Try to get from cache first
        const cacheKey = CACHE_KEYS.GAME_STATS(game_id);
        const cachedStats = await cache.get(cacheKey);
        if (cachedStats) {
          return cachedStats;
        }

        const stats = await fetchNbaGameStats(`id=${game_id}`);

        // Cache the game stats
        await cache.set(cacheKey, stats, CACHE_TTL.GAME_STATS);
        return stats;
      } catch (error) {
        console.error("Error fetching game stats:", error);
        throw new Error("Failed to fetch game stats");
      }
    },

    player_game_stats: async (
      _parent: unknown,
      { game_id, playerId }: { game_id: string; playerId: string }
    ) => {
      try {
        if (!game_id || !playerId) {
          throw new Error("Game ID and Player ID are required");
        }

        // Try to get from cache first
        const cacheKey = `${CACHE_KEYS.GAME_STATS(game_id)}:player:${playerId}`;
        const cachedStats = await cache.get(cacheKey);
        if (cachedStats) {
          return cachedStats;
        }

        const stats = await fetchNbaPlayerStats(
          `game=${game_id}&player=${playerId}`
        );

        // Cache the player game stats
        await cache.set(cacheKey, stats, CACHE_TTL.PLAYER_STATS);
        return stats;
      } catch (error) {
        console.error("Error fetching player game stats:", error);
        throw new Error("Failed to fetch player game stats");
      }
    },

    team_game_stats: async (
      _parent: unknown,
      { game_id, team }: { game_id: string; team: string }
    ) => {
      try {
        if (!game_id || !team) {
          throw new Error("Game ID and Team ID are required");
        }

        // Try to get from cache first
        const cacheKey = `${CACHE_KEYS.GAME_STATS(game_id)}:team:${team}`;
        const cachedStats = await cache.get(cacheKey);
        if (cachedStats) {
          return cachedStats;
        }

        const stats = await fetchNbaTeamStats(`game=${game_id}&team=${team}`);

        // Cache the team game stats
        await cache.set(cacheKey, stats, CACHE_TTL.TEAM_STATS);
        return stats;
      } catch (error) {
        console.error("Error fetching team game stats:", error);
        throw new Error("Failed to fetch team game stats");
      }
    },

    // Team Statistics Resolvers
    team_stats: async (
      _parent: unknown,
      { team, season }: { team: string; season: number }
    ) => {
      try {
        if (!team || !season) {
          throw new Error("Team ID and Season are required");
        }
        return await fetchNbaTeamStats(`team=${team}&season=${season}`);
      } catch (error) {
        console.error("Error fetching team stats:", error);
        throw new Error("Failed to fetch team stats");
      }
    },

    all_team_stats: async (
      _parent: unknown,
      { season }: { season: number }
    ) => {
      try {
        if (!season) {
          throw new Error("Season is required");
        }
        return await fetchNbaTeamStats(`season=${season}`);
      } catch (error) {
        console.error("Error fetching all team stats:", error);
        throw new Error("Failed to fetch all team stats");
      }
    },

    // Player Statistics Resolvers
    player_stats: async (
      _parent: unknown,
      { playerId, season }: { playerId: string; season: number }
    ) => {
      try {
        if (!playerId || !season) {
          throw new Error("Player ID and Season are required");
        }
        return await fetchNbaPlayerStats(`player=${playerId}&season=${season}`);
      } catch (error) {
        console.error("Error fetching player stats:", error);
        throw new Error("Failed to fetch player stats");
      }
    },

    all_player_stats: async (
      _parent: unknown,
      { season }: { season: number }
    ) => {
      try {
        if (!season) {
          throw new Error("Season is required");
        }
        return await fetchNbaPlayerStats(`season=${season}`);
      } catch (error) {
        console.error("Error fetching all player stats:", error);
        throw new Error("Failed to fetch all player stats");
      }
    },

    player_stats_by_team: async (
      _parent: unknown,
      { team, season }: { team: string; season: number }
    ) => {
      try {
        if (!team || !season) {
          throw new Error("Team ID and Season are required");
        }
        return await fetchNbaPlayerStats(`team=${team}&season=${season}`);
      } catch (error) {
        console.error("Error fetching player stats by team:", error);
        throw new Error("Failed to fetch player stats by team");
      }
    },

    top_players: async (
      _parent: unknown,
      { stat, season, limit }: { stat: string; season: number; limit?: number }
    ) => {
      try {
        if (!stat || !season) {
          throw new Error("Stat and Season are required");
        }
        const queryParams = `stat=${stat}&season=${season}${limit ? `&limit=${limit}` : ""}`;
        return await fetchNbaPlayerStats(queryParams);
      } catch (error) {
        console.error("Error fetching top players:", error);
        throw new Error("Failed to fetch top players");
      }
    },

    // Get all users
    users: async (
      _parent: unknown,
      { pagination }: { pagination?: PaginationArgs },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        if (!db) {
          throw new Error("Database connection is not available");
        }

        // Try to get from cache first if Redis is available
        if (redis) {
          try {
            const cachedUsers = await redis.get(CACHE_KEYS.USERS);
            if (cachedUsers) {
              const users = JSON.parse(cachedUsers as string);
              return paginateResults(users, pagination);
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for users:", cacheError);
            // Continue to fetch from database if cache fails
          }
        }

        const users = await db
          .select()
          .from(schema.users)
          .orderBy(schema.users.created_at);

        const transformedUsers = users.map((user) => ({
          ...user,
          timestamp: new Date(user.timestamp).toISOString(),
          inbound_friendship_ids: user.inbound_friendship_ids || [],
          outbound_friendship_ids: user.outbound_friendship_ids || [],
        }));

        // Cache the results if Redis is available
        if (redis) {
          try {
            await redis.set(CACHE_KEYS.USERS, JSON.stringify(transformedUsers), {
              ex: CACHE_TTL.USERS,
            });
          } catch (cacheError) {
            console.error("Error setting Redis cache for users:", cacheError);
            // Continue even if caching fails
          }
        }

        return paginateResults(transformedUsers, pagination);
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
      }
    },

    // Get user by ID
    user: async (
      _: unknown,
      { id }: { id: string },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        // Check cache for specific user if Redis is available
        if (redis) {
          try {
            const cacheKey = CACHE_KEYS.USER(id);
            const cachedUser = await redis.get(cacheKey);
            if (cachedUser) {
              return JSON.parse(cachedUser as string);
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for user:", cacheError);
            // Continue to fetch from database if cache fails
          }
        }

        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, id))
          .execute();

        if (user) {
          const transformedUser = {
            ...user,
            timestamp: new Date(user.timestamp).toISOString(),
            inbound_friendship_ids: user.inbound_friendship_ids || [],
            outbound_friendship_ids: user.outbound_friendship_ids || [],
          };

          // Cache the result if Redis is available
          if (redis) {
            try {
              const cacheKey = CACHE_KEYS.USER(id);
              await redis.set(cacheKey, JSON.stringify(transformedUser), {
                ex: CACHE_TTL.USER,
              });
            } catch (cacheError) {
              console.error("Error setting Redis cache for user:", cacheError);
              // Continue even if caching fails
            }
          }
          return transformedUser;
        }

        return null;
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user");
      }
    },

    // Get all friendships
    friendships: async (
      _: unknown,
      { pagination }: { pagination?: PaginationArgs },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        if (!db) {
          throw new Error("Database connection is not available");
        }

        // Try to get from cache first if Redis is available
        if (redis) {
          try {
            const cachedFriendships = await redis.get(CACHE_KEYS.FRIENDSHIPS);
            if (cachedFriendships) {
              const friendships = JSON.parse(cachedFriendships as string);
              return paginateResults(friendships, pagination);
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for friendships:", cacheError);
            // Continue to fetch from database if cache fails
          }
        }

        const friendships = await db
          .select({
            id: schema.friendships.id,
            subscriber_id: schema.friendships.subscriber_id,
            user_id: schema.friendships.user_id,
            status: schema.friendships.status,
            timestamp: schema.friendships.timestamp,
          })
          .from(schema.friendships)
          .orderBy(schema.friendships.timestamp);

        // Transform friendships to include initiator and responder
        const transformedFriendships = await Promise.all(
          friendships.map(async (friendship) => {
            const [initiator, responder] = await Promise.all([
              db
                .select({
                  id: schema.users.id,
                  username: schema.users.username,
                  first_name: schema.users.first_name,
                  last_name: schema.users.last_name,
                  image_url: schema.users.image_url,
                })
                .from(schema.users)
                .where(eq(schema.users.id, friendship.subscriber_id as string))
                .then((users) => users[0]),
              db
                .select({
                  id: schema.users.id,
                  username: schema.users.username,
                  first_name: schema.users.first_name,
                  last_name: schema.users.last_name,
                  image_url: schema.users.image_url,
                })
                .from(schema.users)
                .where(eq(schema.users.id, friendship.user_id as string))
                .then((users) => users[0]),
            ]);

            return {
              ...friendship,
              initiator,
              responder,
            };
          })
        );

        // Cache the results if Redis is available
        if (redis) {
          try {
            await redis.set(CACHE_KEYS.FRIENDSHIPS, JSON.stringify(transformedFriendships), {
              ex: CACHE_TTL.FRIENDSHIPS,
            });
          } catch (cacheError) {
            console.error("Error setting Redis cache for friendships:", cacheError);
            // Continue even if caching fails
          }
        }

        return paginateResults(transformedFriendships, pagination);
      } catch (error) {
        console.error("Error fetching friendships:", error);
        throw new Error("Failed to fetch friendships");
      }
    },

    // Get all game logs
    game_logs: async (_parent: unknown, _args: unknown, { db }: { db: DB }) => {
      try {
        const logs = await db.select().from(schema.game_logs);
        const transformedLogs = await Promise.all(
          logs.map(async (log) => {
            const gameRating = await db
              .select()
              .from(schema.game_ratings)
              .where(eq(schema.game_ratings.game_id, log.game_id))
              .limit(1);

            return {
              ...log,
              user_id: log.user_id || "",
              watched_location: log.watched_location || "",
              rating_for_game: log.rating_for_game || 0,
              rating_stars: log.rating_stars || "",
              watched_date: log.watched_date.toISOString(),
              created_at: log.created_at.toISOString(),
              updated_at: log.updated_at.toISOString(),
              game: gameRating[0]
                ? {
                    ...gameRating[0],
                    average_rating: gameRating[0].average_rating.toString(),
                    created_at: gameRating[0].created_at.toISOString(),
                    updated_at: gameRating[0].updated_at.toISOString(),
                  }
                : undefined,
            };
          })
        );

        return paginateLogs(transformedLogs);
      } catch (error) {
        console.error("Error fetching game logs:", error);
        throw new Error("Failed to fetch game logs");
      }
    },

    // Get game log by ID
    game_log: async (_: unknown, { id }: { id: string }) => {
      try {
        const [result] = await db
          .select({
            id: schema.game_logs.id,
            user_id: schema.game_logs.user_id,
            game_id: schema.game_logs.game_id,
            watched_setting: schema.game_logs.watched_setting,
            watched_date: schema.game_logs.watched_date,
            watched_location: schema.game_logs.watched_location,
            rating_for_game: schema.game_logs.rating_for_game,
            rating_stars: schema.game_logs.rating_stars,
            watched_count: schema.game_logs.watched_count,
            created_at: schema.game_logs.created_at,
            updated_at: schema.game_logs.updated_at,
            user: {
              id: schema.users.id,
              username: schema.users.username,
              first_name: schema.users.first_name,
              last_name: schema.users.last_name,
              image_url: schema.users.image_url,
            },
            game: {
              id: schema.game_ratings.id,
              game_id: schema.game_ratings.game_id,
              average_rating: schema.game_ratings.average_rating,
              total_ratings: schema.game_ratings.total_ratings,
            },
          })
          .from(schema.game_logs)
          .leftJoin(schema.users, eq(schema.game_logs.user_id, schema.users.id))
          .leftJoin(schema.game_ratings, eq(schema.game_logs.game_id, schema.game_ratings.game_id))
          .where(eq(schema.game_logs.id, id));

        if (!result) {
          return null;
        }

        return {
          id: result.id,
          user_id: result.user_id || "",
          game_id: result.game_id,
          watched_setting: result.watched_setting,
          watched_date: result.watched_date.toISOString(),
          watched_location: result.watched_location || "",
          rating_for_game: result.rating_for_game || 0,
          rating_stars: result.rating_stars || "",
          watched_count: result.watched_count,
          created_at: result.created_at.toISOString(),
          updated_at: result.updated_at.toISOString(),
          user: result.user as User,
          game: result.game as GameRating,
        };
      } catch (error) {
        console.error("Error fetching game log:", error);
        throw new Error("Failed to fetch game log");
      }
    },

    comments: async (
      _: unknown,
      { target_id, pagination }: { target_id: string; pagination?: PaginationArgs },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        // Check cache for comments if Redis is available
        if (redis) {
          try {
            const cacheKey = CACHE_KEYS.COMMENTS(target_id);
            const cachedComments = await redis.get(cacheKey);
            if (cachedComments) {
              const comments = JSON.parse(cachedComments as string);
              return paginateResults(comments, pagination);
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache for comments:", cacheError);
            // Continue to fetch from database if cache fails
          }
        }

        const comments = await db
          .select()
          .from(schema.comments)
          .where(eq(schema.comments.parent_id, target_id))
          .orderBy(schema.comments.created_at);

        // Cache the results if Redis is available
        if (redis) {
          try {
            const cacheKey = CACHE_KEYS.COMMENTS(target_id);
            await redis.set(cacheKey, JSON.stringify(comments), {
              ex: CACHE_TTL.COMMENTS,
            });
          } catch (cacheError) {
            console.error("Error setting Redis cache for comments:", cacheError);
            // Continue even if caching fails
          }
        }

        return paginateResults(comments, pagination);
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw new Error("Failed to fetch comments");
      }
    },

    game_ratings: async (_: unknown, { pagination }: { pagination?: PaginationArgs }, { db }: { db: DB }) => {
      try {
        const ratings = await db.select().from(schema.game_ratings);
        const transformedRatings = ratings.map((rating) => ({
          ...rating,
          average_rating: rating.average_rating.toString(),
          created_at: new Date(rating.created_at).toISOString(),
          updated_at: new Date(rating.updated_at).toISOString(),
        }));
        return paginateResults(transformedRatings, pagination);
      } catch (error) {
        console.error("Error fetching game ratings:", error);
        throw new Error("Failed to fetch game ratings");
      }
    },

    game_rating: async (_: unknown, { game_id }: { game_id: string }, { db }: { db: DB }) => {
      try {
        const result = await db
          .select()
          .from(schema.game_ratings)
          .where(eq(schema.game_ratings.game_id, game_id))
          .limit(1);

        if (!result || result.length === 0) {
          return null;
        }

        const rating = result[0];
        return {
          ...rating,
          average_rating: rating.average_rating.toString(),
          created_at: new Date(rating.created_at).toISOString(),
          updated_at: new Date(rating.updated_at).toISOString(),
        };
      } catch (error) {
        console.error("Error fetching game rating:", error);
        throw new Error("Failed to fetch game rating");
      }
    },

    reactions: async (
      _: unknown,
      {
        target_id,
        pagination,
      }: {
        target_id: string;
        pagination?: {
          first?: number;
          after?: string;
          last?: number;
          before?: string;
        };
      },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const cacheKey = CACHE_KEYS.REACTIONS(target_id);
        
        // Only try to get from cache if Redis is available
        if (redis) {
          try {
            const cachedReactions = await redis.get(cacheKey);
            if (cachedReactions) {
              const reactions = JSON.parse(cachedReactions as string);
              return reactions;
            }
          } catch (cacheError) {
            console.error("Error accessing Redis cache:", cacheError);
            // Continue to fetch from database if cache fails
          }
        }

        const reactions = await db
          .select({
            id: schema.reactions.id,
            user_id: schema.reactions.user_id,
            target_type: schema.reactions.target_type,
            target_id: schema.reactions.target_id,
            emoji: schema.reactions.emoji,
            created_at: schema.reactions.created_at,
            updated_at: schema.reactions.updated_at,
          })
          .from(schema.reactions)
          .where(eq(schema.reactions.target_id, target_id))
          .orderBy(schema.reactions.created_at);

        // Only try to set cache if Redis is available
        if (redis) {
          try {
            await redis.set(cacheKey, JSON.stringify(reactions), {
              ex: CACHE_TTL.REACTIONS,
            });
          } catch (cacheError) {
            console.error("Error setting Redis cache:", cacheError);
            // Continue even if caching fails
          }
        }

        return reactions;
      } catch (error) {
        console.error("Error fetching reactions:", error);
        throw new Error("Failed to fetch reactions");
      }
    },

    team: async (_parent: unknown, { id }: { id: string }, { redis }: { redis: Redis }) => {
        if (!id) {
            throw new Error("Team ID is required");
        }

        try {
            // Try to get from cache first
            const cacheKey = `team:${id}`;
            const cachedTeam = await redis.get(cacheKey);
            if (cachedTeam) {
                return JSON.parse(cachedTeam as string);
            }

            // If not in cache, fetch from API
            const response = await fetchNbaTeamById(id);
            if (!response) {
                throw new Error(`Team with ID ${id} not found`);
            }

            // Cache the result
            await redis.set(cacheKey, JSON.stringify(response), { ex: 3600 }); // Cache for 1 hour

            return response;
        } catch (error) {
            console.error("Error in team resolver:", error);
            throw new Error("Failed to fetch team data");
        }
    },
  },
  Mutation: {
    // User mutations
    create_user: async (
      _: unknown,
      {
        input,
      }: {
        input: Omit<
          User,
          | "id"
          | "created_at"
          | "updated_at"
          | "inbound_friendship_ids"
          | "outbound_friendship_ids"
          | "banned"
          | "timestamp"
        >;
      },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [user] = await db
          .insert(schema.users)
          .values({
            id: crypto.randomUUID(),
            username: input.username,
            first_name: input.first_name,
            last_name: input.last_name,
            email_address: input.email_address,
            image_url: input.image_url || "",
            created_at: new Date(),
            updated_at: new Date(),
            inbound_friendship_ids: [],
            outbound_friendship_ids: [],
            banned: false,
            timestamp: new Date(),
          })
          .returning();

        // Invalidate relevant caches
        await redis.del(CACHE_KEYS.USERS);
        return user;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
      }
    },

    update_user: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: Partial<
          Omit<
            User,
            | "id"
            | "created_at"
            | "updated_at"
            | "inbound_friendship_ids"
            | "outbound_friendship_ids"
            | "banned"
            | "timestamp"
          >
        >;
      },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [user] = await db
          .update(schema.users)
          .set({
            username: input.username,
            first_name: input.first_name,
            last_name: input.last_name,
            email_address: input.email_address,
            image_url: input.image_url || "",
            updated_at: new Date(),
          })
          .where(eq(schema.users.id, id))
          .returning();

        if (user) {
          // Invalidate relevant caches
          await Promise.all([
            redis.del(CACHE_KEYS.USERS),
            redis.del(CACHE_KEYS.USER(id)),
          ]);
        }

        return user;
      } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
      }
    },

    delete_user: async (
      _: unknown,
      { id }: { id: string },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [user] = await db
          .delete(schema.users)
          .where(eq(schema.users.id, id))
          .returning();

        if (user) {
          // Invalidate relevant caches
          await Promise.all([
            redis.del(CACHE_KEYS.USERS),
            redis.del(CACHE_KEYS.USER(id)),
            redis.del(CACHE_KEYS.USER_FRIENDSHIPS(id)),
          ]);
        }

        return user;
      } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
      }
    },

    // Friendship mutations
    create_friendship: async (
      _: unknown,
      { input }: { input: Omit<Friendship, "id" | "timestamp"> },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [friendship] = await db
          .insert(schema.friendships)
          .values({
            subscriber_id: input.subscriber_id,
            user_id: input.user_id,
            id: crypto.randomUUID(),
            timestamp: new Date(),
            status: input.status as
              | "pending"
              | "connected"
              | "rejected"
              | "severed",
          })
          .returning();

        // Invalidate relevant caches
        await Promise.all([
          redis.del(CACHE_KEYS.FRIENDSHIPS),
          friendship.subscriber_id &&
            redis.del(CACHE_KEYS.USER_FRIENDSHIPS(friendship.subscriber_id)),
          friendship.user_id &&
            redis.del(CACHE_KEYS.USER_FRIENDSHIPS(friendship.user_id)),
        ]);

        return friendship;
      } catch (error) {
        console.error("Error creating friendship:", error);
        throw new Error("Failed to create friendship");
      }
    },

    update_friendship_status: async (
      _: unknown,
      {
        id,
        status,
      }: {
        id: string;
        status: "pending" | "connected" | "rejected" | "severed";
      },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [friendship] = await db
          .update(schema.friendships)
          .set({ status })
          .where(eq(schema.friendships.id, id))
          .returning();

        if (friendship) {
          // Invalidate relevant caches
          await Promise.all([
            redis.del(CACHE_KEYS.FRIENDSHIPS),
            friendship.subscriber_id &&
              redis.del(CACHE_KEYS.USER_FRIENDSHIPS(friendship.subscriber_id)),
            friendship.user_id &&
              redis.del(CACHE_KEYS.USER_FRIENDSHIPS(friendship.user_id)),
          ]);
        }

        return friendship;
      } catch (error) {
        console.error("Error updating friendship status:", error);
        throw new Error("Failed to update friendship status");
      }
    },

    delete_friendship: async (
      _: unknown,
      { id }: { id: string },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [friendship] = await db
          .delete(schema.friendships)
          .where(eq(schema.friendships.id, id))
          .returning();

        if (friendship) {
          // Invalidate relevant caches
          await Promise.all([
            redis.del(CACHE_KEYS.FRIENDSHIPS),
            friendship.subscriber_id &&
              redis.del(CACHE_KEYS.USER_FRIENDSHIPS(friendship.subscriber_id)),
            friendship.user_id &&
              redis.del(CACHE_KEYS.USER_FRIENDSHIPS(friendship.user_id)),
          ]);
        }

        return friendship;
      } catch (error) {
        console.error("Error deleting friendship:", error);
        throw new Error("Failed to delete friendship");
      }
    },

    // Game log mutations
    create_game_log: async (
      _: any,
      {
        user_id,
        game_id,
        watched_setting,
        watched_date,
        watched_location,
        rating_for_game,
        watched_count = 1,
      }: {
        user_id: string;
        game_id: string;
        watched_setting: "tv" | "arena" | "phone" | "laptop" | "bar" | "home" | "other";
        watched_date: Date;
        watched_location: string;
        rating_for_game: number;
        watched_count?: number;
      }
    ) => {
      const result = await db
        .insert(schema.game_logs)
        .values({
          id: crypto.randomUUID(),
          user_id,
          game_id,
          watched_setting,
          watched_date,
          watched_location,
          rating_for_game,
          watched_count,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return result[0];
    },

    update_game_log: async (
      _: any,
      {
        id,
        watched_setting,
        watched_date,
        watched_location,
        rating_for_game,
        watched_count,
      }: {
        id: string;
        watched_setting?: "tv" | "arena" | "phone" | "laptop" | "bar" | "home" | "other";
        watched_date?: Date;
        watched_location?: string;
        rating_for_game?: number;
        watched_count?: number;
      }
    ) => {
      const result = await db
        .update(schema.game_logs)
        .set({
          watched_setting,
          watched_date,
          watched_location,
          rating_for_game,
          watched_count,
          updated_at: new Date(),
        })
        .where(eq(schema.game_logs.id, id))
        .returning();

      return result[0];
    },

    delete_game_log: async (_: any, { id }: { id: string }) => {
      await db.delete(schema.game_logs).where(eq(schema.game_logs.id, id));
      return true;
    },

    create_comment: async (
      _: unknown,
      {
        input,
      }: {
        input: Omit<
          Comment,
          "id" | "created_at" | "updated_at" | "user" | "game_log"
        >;
      },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [comment] = await db
          .insert(schema.comments)
          .values({
            ...input,
            id: crypto.randomUUID(),
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        // Invalidate relevant caches
        await redis.del(CACHE_KEYS.COMMENTS(input.parent_id));

        return comment;
      } catch (error) {
        console.error("Error creating comment:", error);
        throw new Error("Failed to create comment");
      }
    },

    update_comment: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: Partial<
          Omit<
            Comment,
            "id" | "created_at" | "updated_at" | "user" | "game_log"
          >
        >;
      },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [comment] = await db
          .update(schema.comments)
          .set({ ...input, updated_at: new Date() })
          .where(eq(schema.comments.id, id))
          .returning();

        if (comment) {
          // Invalidate relevant caches
          await redis.del(CACHE_KEYS.COMMENTS(comment.parent_id));
        }

        return comment;
      } catch (error) {
        console.error("Error updating comment:", error);
        throw new Error("Failed to update comment");
      }
    },

    delete_comment: async (
      _: unknown,
      { id }: { id: string },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [comment] = await db
          .delete(schema.comments)
          .where(eq(schema.comments.id, id))
          .returning();

        if (comment) {
          // Invalidate relevant caches
          await redis.del(CACHE_KEYS.COMMENTS(comment.parent_id));
        }

        return comment;
      } catch (error) {
        console.error("Error deleting comment:", error);
        throw new Error("Failed to delete comment");
      }
    },

    create_game_rating: async (
      _parent: unknown,
      { game_id, rating }: { game_id: string; rating: number }
    ) => {
      const result = await db
        .insert(schema.game_ratings)
        .values({
          id: crypto.randomUUID(),
          game_id,
          average_rating: rating.toFixed(2),
          total_ratings: 1,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return {
        ...result[0],
        created_at: result[0].created_at,
        updated_at: result[0].updated_at,
      };
    },

    update_game_rating: async (
      _parent: unknown,
      { id, game_id, rating }: { id: string; game_id: string; rating: number }
    ) => {
      const result = await db
        .update(schema.game_ratings)
        .set({
          game_id,
          average_rating: rating.toFixed(2),
          updated_at: new Date(),
        })
        .where(eq(schema.game_ratings.id, id))
        .returning();

      return {
        ...result[0],
        created_at: result[0].created_at,
        updated_at: result[0].updated_at,
      };
    },

    delete_game_rating: async (_parent: unknown, { id }: { id: string }) => {
      await db.delete(schema.game_ratings).where(eq(schema.game_ratings.id, id));
      return true;
    },

    create_reaction: async (
      _parent: unknown,
      { input }: { input: Omit<Reaction, "id" | "created_at" | "updated_at"> },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        // Validate input
        if (
          !input.user_id ||
          !input.target_type ||
          !input.target_id ||
          !input.emoji
        ) {
          throw new Error("Missing required fields");
        }

        // Check if reaction already exists
        const existingReaction = await db
          .select()
          .from(schema.reactions)
          .where(
            sql`${schema.reactions.user_id} = ${input.user_id}
                AND ${schema.reactions.target_type} = ${input.target_type}
                AND ${schema.reactions.target_id} = ${input.target_id}`
          )
          .limit(1);

        if (existingReaction.length > 0) {
          throw new Error("Reaction already exists");
        }

        // Create new reaction
        const [newReaction] = await db
          .insert(schema.reactions)
          .values({
            id: crypto.randomUUID(),
            user_id: input.user_id,
            target_type: input.target_type as "game_log" | "comment",
            target_id: input.target_id,
            emoji: input.emoji,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        // Invalidate cache
        await redis.del(`reactions:${input.target_id}`);

        return newReaction;
      } catch (error: unknown) {
        console.error("Error creating reaction:", error);
        throw error;
      }
    },

    delete_reaction: async (
      _: unknown,
      { id }: { id: string },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const [reaction] = await db
          .delete(schema.reactions)
          .where(eq(schema.reactions.id, id))
          .returning();

        if (reaction) {
          // Invalidate relevant caches
          await redis.del(CACHE_KEYS.REACTIONS(reaction.target_id));
        }

        return reaction;
      } catch (error) {
        console.error("Error deleting reaction:", error);
        throw new Error("Failed to delete reaction");
      }
    },
  },
  User: {
    initiated_friendships: async (parent: User) => {
      if (!parent.id) return [];
      return await db
        .select({
          id: schema.friendships.id,
          status: schema.friendships.status,
          timestamp: schema.friendships.timestamp,
          responder: {
            username: schema.users.username,
            image_url: schema.users.image_url,
          },
        })
        .from(schema.friendships)
        .leftJoin(schema.users, eq(schema.friendships.user_id, schema.users.id))
        .where(eq(schema.friendships.subscriber_id, parent.id))
        .orderBy(schema.friendships.timestamp);
    },
    received_friendships: async (parent: User) => {
      if (!parent.id) return [];
      return await db
        .select({
          id: schema.friendships.id,
          status: schema.friendships.status,
          timestamp: schema.friendships.timestamp,
          initiator: {
            username: schema.users.username,
            image_url: schema.users.image_url,
          },
        })
        .from(schema.friendships)
        .leftJoin(
          schema.users,
          eq(schema.friendships.subscriber_id, schema.users.id)
        )
        .where(eq(schema.friendships.user_id, parent.id))
        .orderBy(schema.friendships.timestamp);
    },
    friendships: async (parent: User) => {
      if (!parent.id) return [];
      try {
        const [initiated, received] = await Promise.all([
          db
            .select({
              id: schema.friendships.id,
              subscriber_id: schema.friendships.subscriber_id,
              user_id: schema.friendships.user_id,
              status: schema.friendships.status,
              timestamp: schema.friendships.timestamp,
            })
            .from(schema.friendships)
            .where(eq(schema.friendships.subscriber_id, parent.id))
            .orderBy(schema.friendships.timestamp),
          db
            .select({
              id: schema.friendships.id,
              subscriber_id: schema.friendships.subscriber_id,
              user_id: schema.friendships.user_id,
              status: schema.friendships.status,
              timestamp: schema.friendships.timestamp,
            })
            .from(schema.friendships)
            .where(eq(schema.friendships.user_id, parent.id))
            .orderBy(schema.friendships.timestamp),
        ]);

        return [...initiated, ...received];
      } catch (error) {
        console.error("Error fetching user friendships:", error);
        return [];
      }
    },
    gameLogs: async (parent: User) => {
      if (!parent.id) return [];
      try {
        const logs = await db
          .select({
            id: schema.game_logs.id,
            game_id: schema.game_logs.game_id,
            watched_setting: schema.game_logs.watched_setting,
            watched_date: schema.game_logs.watched_date,
            watched_location: schema.game_logs.watched_location,
            rating_for_game: schema.game_logs.rating_for_game,
            rating_stars: schema.game_logs.rating_stars,
            watched_count: schema.game_logs.watched_count,
            created_at: schema.game_logs.created_at,
            updated_at: schema.game_logs.updated_at,
          })
          .from(schema.game_logs)
          .where(eq(schema.game_logs.user_id, parent.id))
          .orderBy(schema.game_logs.watched_date)
          .limit(50);
        return logs;
      } catch (error) {
        console.error("Error fetching user game logs:", error);
        return [];
      }
    },
  },
  Friendship: {
    initiator: async (parent: Friendship) => {
      if (!parent.subscriber_id) return null;
      try {
        const [user] = await executeWithRetry(
          async () => {
            const result = await db
              .select({
                id: schema.users.id,
                username: schema.users.username,
                first_name: schema.users.first_name,
                last_name: schema.users.last_name,
                image_url: schema.users.image_url,
              })
              .from(schema.users)
              .where(eq(schema.users.id, parent.subscriber_id as string));
            return result;
          },
          3, // max retries
          1000 // delay between retries in ms
        );
        return user;
      } catch (error) {
        console.error("Error fetching initiator:", error);
        return null;
      }
    },
    responder: async (parent: Friendship) => {
      if (!parent.user_id) return null;
      try {
        const [user] = await executeWithRetry(
          async () => {
            const result = await db
              .select({
                id: schema.users.id,
                username: schema.users.username,
                first_name: schema.users.first_name,
                last_name: schema.users.last_name,
                image_url: schema.users.image_url,
              })
              .from(schema.users)
              .where(eq(schema.users.id, parent.user_id as string));
            return result;
          },
          3, // max retries
          1000 // delay between retries in ms
        );
        return user;
      } catch (error) {
        console.error("Error fetching responder:", error);
        return null;
      }
    },
  },
  GameLog: {
    user: async (parent: GameLog) => {
      if (!parent.user_id) return null;
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, parent.user_id));
      return user;
    },
    game: async (parent: GameLog) => {
      if (!parent.game_id) return null;
      // Fetch game data from NBA API
      const response = await fetchNbaGames(`id=${parent.game_id}`);
      return response.response[0] || null;
    },
    comments: async (parent: GameLog) => {
      const results = await db
        .select()
        .from(schema.comments)
        .where(eq(schema.comments.parent_id, parent.id));
      return results;
    },
  },
  Comment: {
    game_log: async (parent: Comment): Promise<GameLog | null> => {
      const [result] = await db
        .select({
          id: schema.game_logs.id,
          user_id: schema.game_logs.user_id,
          game_id: schema.game_logs.game_id,
          watched_setting: schema.game_logs.watched_setting,
          watched_date: schema.game_logs.watched_date,
          watched_location: schema.game_logs.watched_location,
          rating_for_game: schema.game_logs.rating_for_game,
          rating_stars: schema.game_logs.rating_stars,
          watched_count: schema.game_logs.watched_count,
          created_at: schema.game_logs.created_at,
          updated_at: schema.game_logs.updated_at,
          user: {
            id: schema.users.id,
            username: schema.users.username,
            first_name: schema.users.first_name,
            last_name: schema.users.last_name,
            image_url: schema.users.image_url,
          },
          game: {
            id: schema.game_ratings.id,
            game_id: schema.game_ratings.game_id,
            average_rating: schema.game_ratings.average_rating,
            total_ratings: schema.game_ratings.total_ratings,
          },
        })
        .from(schema.game_logs)
        .leftJoin(schema.users, eq(schema.game_logs.user_id, schema.users.id))
        .leftJoin(schema.game_ratings, eq(schema.game_logs.game_id, schema.game_ratings.game_id))
        .where(eq(schema.game_logs.id, parent.parent_id));

      if (!result) {
        return null;
      }

      return {
        id: result.id,
        user_id: result.user_id || "",
        game_id: result.game_id,
        watched_setting: result.watched_setting,
        watched_date: result.watched_date.toISOString(),
        watched_location: result.watched_location || "",
        rating_for_game: result.rating_for_game || 0,
        rating_stars: result.rating_stars || "",
        watched_count: result.watched_count,
        created_at: result.created_at.toISOString(),
        updated_at: result.updated_at.toISOString(),
        user: result.user as User,
        game: result.game as GameRating,
      };
    },
  },
};

// Helper function for pagination
function paginateLogs(
  logs: GameLog[],
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  }
) {
  let startIndex = 0;
  let endIndex = logs.length;

  if (pagination?.after) {
    const afterIndex = logs.findIndex((log) => log.id === pagination.after);
    if (afterIndex !== -1) {
      startIndex = afterIndex + 1;
    }
  }

  if (pagination?.before) {
    const beforeIndex = logs.findIndex((log) => log.id === pagination.before);
    if (beforeIndex !== -1) {
      endIndex = beforeIndex;
    }
  }

  if (pagination?.first) {
    endIndex = Math.min(startIndex + pagination.first, endIndex);
  }

  if (pagination?.last) {
    startIndex = Math.max(endIndex - pagination.last, startIndex);
  }

  const paginatedLogs = logs.slice(startIndex, endIndex);

  return {
    edges: paginatedLogs.map((log) => ({
      node: log,
      cursor: log.id,
    })),
    pageInfo: {
      hasNextPage: endIndex < logs.length,
      hasPreviousPage: startIndex > 0,
      startCursor: paginatedLogs[0]?.id || null,
      endCursor: paginatedLogs[paginatedLogs.length - 1]?.id || null,
    },
    totalCount: logs.length,
  };
}

function paginateResults<T extends { id: string }>(
  items: T[],
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  }
) {
  let startIndex = 0;
  let endIndex = items.length;

  if (pagination?.after) {
    const afterIndex = items.findIndex((item) => item.id === pagination.after);
    if (afterIndex !== -1) {
      startIndex = afterIndex + 1;
    }
  }

  if (pagination?.before) {
    const beforeIndex = items.findIndex(
      (item) => item.id === pagination.before
    );
    if (beforeIndex !== -1) {
      endIndex = beforeIndex;
    }
  }

  if (pagination?.first) {
    endIndex = Math.min(startIndex + pagination.first, endIndex);
  }

  if (pagination?.last) {
    startIndex = Math.max(endIndex - pagination.last, startIndex);
  }

  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    edges: paginatedItems.map((item) => ({
      node: item,
      cursor: item.id,
    })),
    pageInfo: {
      hasNextPage: endIndex < items.length,
      hasPreviousPage: startIndex > 0,
      startCursor: paginatedItems[0]?.id || null,
      endCursor: paginatedItems[paginatedItems.length - 1]?.id || null,
    },
    totalCount: items.length,
  };
}

function paginatePlayers<T extends { id: string }>(
  players: T[],
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  }
) {
  let startIndex = 0;
  let endIndex = players.length;

  if (pagination?.after) {
    const afterIndex = players.findIndex((player) => player.id === pagination.after);
    if (afterIndex !== -1) {
      startIndex = afterIndex + 1;
    }
  }

  if (pagination?.before) {
    const beforeIndex = players.findIndex((player) => player.id === pagination.before);
    if (beforeIndex !== -1) {
      endIndex = beforeIndex;
    }
  }

  if (pagination?.first) {
    endIndex = Math.min(startIndex + pagination.first, endIndex);
  }

  if (pagination?.last) {
    startIndex = Math.max(endIndex - pagination.last, startIndex);
  }

  const paginatedPlayers = players.slice(startIndex, endIndex);

  return {
    edges: paginatedPlayers.map((player) => ({
      node: player,
      cursor: player.id,
    })),
    pageInfo: {
      hasNextPage: endIndex < players.length,
      hasPreviousPage: startIndex > 0,
      startCursor: paginatedPlayers[0]?.id || null,
      endCursor: paginatedPlayers[paginatedPlayers.length - 1]?.id || null,
    },
    totalCount: players.length,
  };
}

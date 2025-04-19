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
  headers,
} from "../external-apis";
import {
  TeamSearchApiResponse,
  TeamFilters,
} from "../types/types";
import { db } from "../../db";
import * as schema from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import {
  Team,
  User,
  Friendship,
  Comment,
  Reaction,
} from "../types/types";
import { cache, CACHE_KEYS, CACHE_TTL } from "../redis";
import { Redis } from "@upstash/redis";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { StringValueNode } from "graphql";

// Update the type definition to use PostgreSQL
type DB = NeonHttpDatabase<typeof schema>;

// Add PaginationArgs type
interface PaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

// Add GameRating type
interface GameRating {
  id: string;
  game_id: string;
  average_rating: string;
  total_ratings: number;
}

// Update GameLog type to use GameRating instead of Game
interface GameLog {
  id: string;
  user_id: string;
  game_id: string;
  watched_setting: "tv" | "arena" | "phone" | "laptop" | "bar" | "home" | "other";
  watched_date: string;
  watched_location: string;
  rating_for_game: number;
  rating_stars: string;
  watched_count: number;
  created_at: string;
  updated_at: string;
  user: User;
  game: GameRating;
}

// Utility function for database operations with retry logic
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
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

interface Game {
  id: number;
  date: string;
  teams: {
    home: {
      id: number;
      name: string;
    };
    visitors: {
      id: number;
      name: string;
    };
  };
  scores: {
    home: number;
    visitors: number;
  };
  status: {
    long: string;
    short: string;
  };
  time: string;
  period: number;
  postseason: boolean;
  season: number;
}

interface Player {
  id: number;
  firstname: string;
  lastname: string;
  birth: {
    date: string;
    country: string;
  };
  nba: {
    start: number;
    pro: number;
  };
  height: {
    feets: string;
    inches: string;
    meters: string;
  };
  weight: {
    pounds: string;
    kilograms: string;
  };
  college: string;
  affiliation: string;
  leagues: {
    standard: {
      pos: string;
    };
  };
}

export const resolvers = {
  DateTime: {
    serialize: (value: Date) => value.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: StringValueNode) => {
      if (ast.kind === "StringValue") {
        return new Date(ast.value);
      }
      return null;
    },
  },

  Query: {
    seasons: async () => {
      try {
        // Try to get from cache first
        const cachedSeasons = await cache.get(CACHE_KEYS.SEASONS);
        if (cachedSeasons) {
          return cachedSeasons;
        }

        const { response } = await fetchNbaSeasons();
        console.log("Seasons response:", response);
        // Check if response exists and has the expected structure
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

        // Cache the seasons data
        await cache.set(CACHE_KEYS.SEASONS, seasons, CACHE_TTL.SEASONS);
        return seasons;
      } catch (error) {
        console.error("Error fetching seasons:", error);
        throw new Error("Failed to fetch seasons");
      }
    },

    leagues: async () => {
      try {
        // Try to get from cache first
        const cachedLeagues = await cache.get(CACHE_KEYS.LEAGUES);
        if (cachedLeagues) {
          return cachedLeagues;
        }

        const response = await fetchNbaLeagues();
        const leagues = response.response.map((leagues: string[]) => {
          const league = leagues[0]; // Take the first league from the array
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

        // Cache the leagues data
        await cache.set(CACHE_KEYS.LEAGUES, leagues, CACHE_TTL.LEAGUES);
        return leagues;
      } catch (error) {
        console.error("Error fetching leagues:", error);
        throw new Error("Failed to fetch leagues");
      }
    },

    games: async (_: unknown, { page = 1, per_page = 10 }) => {
      try {
        const response = await fetch(
          `${process.env.RAPID_API_BASE_URL}/games?page=${page}&per_page=${per_page}`,
          {
            headers,
          }
        );
        const data = (await response.json()) as { response: Game[] };
        return {
          games: data.response.map((game) => ({
            ...game,
            id: game.id.toString(),
          })),
          total: data.response.length,
          page,
          per_page,
        };
      } catch (error) {
        console.error("Error fetching games:", error);
        throw new Error("Failed to fetch games");
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

    players: async (_: unknown, { page = 1, per_page = 10 }) => {
      try {
        const response = await fetch(
          `${process.env.RAPID_API_BASE_URL}/players?page=${page}&per_page=${per_page}`,
          {
            headers,
          }
        );
        const data = (await response.json()) as { response: Player[] };
        return {
          players: data.response.map((player) => ({
            ...player,
            id: player.id.toString(),
            leagues: {
              standard: {
                ...player.leagues.standard,
                pos: player.leagues.standard.pos.replace("-", ""),
              },
            },
          })),
          total: data.response.length,
          page,
          per_page,
        };
      } catch (error) {
        console.error("Error fetching players:", error);
        throw new Error("Failed to fetch players");
      }
    },

    player: async (_parent: unknown, { id }: { id: string }) => {
      try {
        if (!id) {
          throw new Error("Player ID is required");
        }
        const response = await fetchNbaPlayerById(id);
        return response.response[0] || null;
      } catch (error) {
        console.error("Error fetching player:", error);
        throw new Error("Failed to fetch player");
      }
    },

    standings: async () => {
      try {
        return await fetchNbaStandings("");
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
      _: unknown,
      {
        pagination,
      }: {
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
        if (!db || !redis) {
          throw new Error("Database or Redis connection is not available");
        }

        // Try to get from cache first
        const cachedUsers = await redis.get(CACHE_KEYS.USERS);
        if (cachedUsers) {
          const users = JSON.parse(cachedUsers as string);
          return paginateResults(users, pagination);
        }

        // Fetch from database
        const users = await db
          .select()
          .from(schema.users)
          .orderBy(schema.users.created_at);

        // Transform the data
        const transformedUsers = users.map((user) => ({
          ...user,
          timestamp: new Date(user.timestamp).toISOString(),
          inbound_friendship_ids: user.inbound_friendship_ids || [],
          outbound_friendship_ids: user.outbound_friendship_ids || [],
        }));

        // Cache the results
        await redis.set(CACHE_KEYS.USERS, JSON.stringify(transformedUsers), {
          ex: CACHE_TTL.USERS,
        });

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
        // Check cache for specific user
        const cacheKey = CACHE_KEYS.USER(id);
        const cachedUser = await redis.get(cacheKey);
        if (cachedUser) {
          return JSON.parse(cachedUser as string);
        }

        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, id))
          .execute();

        if (user) {
          // Transform the user data
          const transformedUser = {
            ...user,
            timestamp: new Date(user.timestamp).toISOString(),
            inbound_friendship_ids: user.inbound_friendship_ids || [],
            outbound_friendship_ids: user.outbound_friendship_ids || [],
          };

          // Cache the result
          await redis.set(cacheKey, JSON.stringify(transformedUser), {
            ex: CACHE_TTL.USER,
          });
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
      {
        pagination,
      }: {
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
        if (!db) {
          throw new Error("Database connection is not available");
        }

        if (redis) {
          const cachedFriendships = await redis.get(CACHE_KEYS.FRIENDSHIPS);
          if (cachedFriendships) {
            const friendships = JSON.parse(cachedFriendships as string);
            return paginateResults(friendships, pagination);
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

        if (redis) {
          await redis.set(CACHE_KEYS.FRIENDSHIPS, JSON.stringify(friendships), {
            ex: CACHE_TTL.FRIENDSHIPS,
          });
        }

        return paginateResults(friendships, pagination);
      } catch (error) {
        console.error("Error fetching friendships:", error);
        throw new Error("Failed to fetch friendships");
      }
    },

    // Get all game logs
    game_logs: async (
      _: unknown,
      { pagination }: { pagination?: PaginationArgs },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const cacheKey = CACHE_KEYS.GAME_LOGS;
        const cachedLogs = await redis.get(cacheKey);
        if (cachedLogs) {
          const logs = JSON.parse(cachedLogs as string);
          return paginateLogs(logs, pagination);
        }

        const results = await db
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
          .orderBy(schema.game_logs.created_at);

        const transformedLogs: GameLog[] = results.map((log) => ({
          id: log.id,
          user_id: log.user_id || "",
          game_id: log.game_id,
          watched_setting: log.watched_setting,
          watched_date: log.watched_date.toISOString(),
          watched_location: log.watched_location || "",
          rating_for_game: log.rating_for_game || 0,
          rating_stars: log.rating_stars || "",
          watched_count: log.watched_count,
          created_at: log.created_at.toISOString(),
          updated_at: log.updated_at.toISOString(),
          user: log.user as User,
          game: log.game as GameRating,
        }));

        await cache.set(cacheKey, transformedLogs, CACHE_TTL.GAME_LOGS);
        return paginateLogs(transformedLogs, pagination);
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
        // Check cache for comments
        const cacheKey = CACHE_KEYS.COMMENTS(target_id);
        const cachedComments = await redis.get(cacheKey);
        if (cachedComments) {
          const comments = JSON.parse(cachedComments as string);
          return paginateResults(comments, pagination);
        }

        const comments = await db
          .select()
          .from(schema.comments)
          .where(eq(schema.comments.parent_id, target_id))
          .orderBy(schema.comments.created_at);

        // Cache the results
        await redis.set(cacheKey, JSON.stringify(comments), {
          ex: CACHE_TTL.COMMENTS,
        });

        return paginateResults(comments, pagination);
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw new Error("Failed to fetch comments");
      }
    },

    game_ratings: async (
      _: unknown,
      {
        pagination,
      }: {
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
        const cachedRatings = await redis.get(CACHE_KEYS.GAME_RATINGS);
        if (cachedRatings) {
          const ratings = JSON.parse(cachedRatings as string);
          return paginateResults(ratings, pagination);
        }

        const ratings = await db
          .select()
          .from(schema.game_ratings)
          .orderBy(schema.game_ratings.created_at);

        await redis.set(CACHE_KEYS.GAME_RATINGS, JSON.stringify(ratings), {
          ex: CACHE_TTL.GAME_RATINGS,
        });

        return paginateResults(ratings, pagination);
      } catch (error) {
        console.error("Error fetching game ratings:", error);
        throw new Error("Failed to fetch game ratings");
      }
    },

    game_rating: async (
      _: unknown,
      { game_id }: { game_id: string },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        if (!game_id) {
          throw new Error("Game ID is required");
        }

        // Check cache first
        const cacheKey = CACHE_KEYS.GAME_RATING(game_id);
        if (redis) {
          const cachedRating = await redis.get(cacheKey);
          if (cachedRating) {
            return JSON.parse(cachedRating as string);
          }
        }

        // Execute with retry logic
        const [rating] = await executeWithRetry(
          async () => {
            const result = await db
              .select({
                id: schema.game_ratings.id,
                game_id: schema.game_ratings.game_id,
                average_rating: schema.game_ratings.average_rating,
                total_ratings: schema.game_ratings.total_ratings,
                created_at: schema.game_ratings.created_at,
                updated_at: schema.game_ratings.updated_at,
              })
              .from(schema.game_ratings)
              .where(eq(schema.game_ratings.game_id, game_id))
              .limit(1);
            return result;
          },
          3, // max retries
          1000 // delay between retries in ms
        );

        if (rating) {
          // Cache the result
          if (redis) {
            try {
              await redis.set(cacheKey, JSON.stringify(rating), {
                ex: CACHE_TTL.GAME_RATING,
              });
            } catch (cacheError) {
              console.error("Error caching game rating:", cacheError);
              // Don't throw, just log the error
            }
          }
          return rating;
        }

        return null;
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
        const cachedReactions = await redis.get(cacheKey);
        if (cachedReactions) {
          const reactions = JSON.parse(cachedReactions as string);
          return paginateResults(reactions, pagination);
        }

        const reactions = await db
          .select()
          .from(schema.reactions)
          .where(eq(schema.reactions.target_id, target_id))
          .orderBy(schema.reactions.created_at);

        await redis.set(cacheKey, JSON.stringify(reactions), {
          ex: CACHE_TTL.REACTIONS,
        });

        return paginateResults(reactions, pagination);
      } catch (error) {
        console.error("Error fetching reactions:", error);
        throw new Error("Failed to fetch reactions");
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
      _: unknown,
      {
        input,
      }: {
        input: {
          user_id: string;
          game_id: string;
          watched_date: string;
          watched_setting: string;
          watched_location?: string;
          rating_for_game?: number;
          rating_stars?: string;
          watched_count?: number;
        };
      },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        if (
          !input.user_id ||
          !input.game_id ||
          !input.watched_date ||
          !input.watched_setting
        ) {
          throw new Error(
            "Missing required fields: user_id, game_id, watched_date, watched_setting"
          );
        }

        const result = await executeWithRetry(async () => {
          const [created] = await db
            .insert(schema.game_logs)
            .values({
              id: crypto.randomUUID(),
              user_id: input.user_id,
              game_id: input.game_id,
              watched_date: new Date(input.watched_date),
              watched_setting:
                input.watched_setting as (typeof schema.watched_setting_enum.enumValues)[number],
              watched_location: input.watched_location || "",
              rating_for_game: input.rating_for_game || 0,
              rating_stars: input.rating_stars || "",
              watched_count: input.watched_count || 0,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .returning();
          return created;
        });

        if (result) {
          // Invalidate relevant caches
          await Promise.all([
            redis.del(CACHE_KEYS.GAME_LOGS),
            redis.del(CACHE_KEYS.USER_GAME_LOGS(input.user_id)),
          ]);
        }

        return result;
      } catch (error) {
        console.error("Error creating game log:", error);
        throw new Error("Failed to create game log");
      }
    },

    update_game_log: async (
      _: unknown,
      { id, input }: { id: string; input: { watched_date: string } },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        const result = await executeWithRetry(async () => {
          const [updated] = await db
            .update(schema.game_logs)
            .set({
              watched_date: new Date(input.watched_date),
              updated_at: new Date(),
            })
            .where(eq(schema.game_logs.id, id))
            .returning();
          return updated;
        });

        if (result && result.user_id) {
          // Invalidate relevant caches
          await Promise.all([
            redis.del(CACHE_KEYS.GAME_LOGS),
            redis.del(CACHE_KEYS.USER_GAME_LOGS(result.user_id)),
          ]);
        }

        return result;
      } catch (error) {
        console.error("Error updating game log:", error);
        throw new Error("Failed to update game log");
      }
    },

    delete_game_log: async (
      _: unknown,
      { id }: { id: string },
      { db, redis }: { db: DB; redis: Redis }
    ) => {
      try {
        // Get the user_id before deleting to invalidate cache
        const gameLog = await executeWithRetry(async () => {
          const [log] = await db
            .select()
            .from(schema.game_logs)
            .where(eq(schema.game_logs.id, id));
          return log;
        });

        const result = await executeWithRetry(async () => {
          const [deleted] = await db
            .delete(schema.game_logs)
            .where(eq(schema.game_logs.id, id))
            .returning();
          return deleted;
        });

        if (result && gameLog && gameLog.user_id) {
          // Invalidate relevant caches
          await Promise.all([
            redis.del(CACHE_KEYS.GAME_LOGS),
            redis.del(CACHE_KEYS.USER_GAME_LOGS(gameLog.user_id)),
          ]);
        }

        return result;
      } catch (error) {
        console.error("Error deleting game log:", error);
        throw new Error("Failed to delete game log");
      }
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
      _: unknown,
      { gameId, rating }: { gameId: string; rating: number }
    ) => {
      try {
        const [gameRating] = await db
          .insert(schema.game_ratings)
          .values({
            id: crypto.randomUUID(),
            game_id: gameId,
            average_rating: rating.toFixed(2),
            total_ratings: 1,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();
        return gameRating;
      } catch (error) {
        console.error("Error creating game rating:", error);
        throw new Error("Failed to create game rating");
      }
    },

    update_game_rating: async (
      _: unknown,
      { id, rating }: { id: string; rating: number }
    ) => {
      try {
        const existingRating = await db.query.game_ratings.findFirst({
          where: eq(schema.game_ratings.id, id),
        });

        if (!existingRating) {
          throw new Error("Game rating not found");
        }

        const newTotalRatings = existingRating.total_ratings + 1;
        const newAverageRating =
          (parseFloat(existingRating.average_rating) *
            existingRating.total_ratings +
            rating) /
          newTotalRatings;

        const [updatedRating] = await db
          .update(schema.game_ratings)
          .set({
            average_rating: newAverageRating.toFixed(2),
            total_ratings: newTotalRatings,
            updated_at: new Date(),
          })
          .where(eq(schema.game_ratings.id, id))
          .returning();
        return updatedRating;
      } catch (error) {
        console.error("Error updating game rating:", error);
        throw new Error("Failed to update game rating");
      }
    },

    delete_game_rating: async (_: unknown, { id }: { id: string }) => {
      try {
        await db
          .delete(schema.game_ratings)
          .where(eq(schema.game_ratings.id, id));
        return true;
      } catch (error) {
        console.error("Error deleting game rating:", error);
        throw new Error("Failed to delete game rating");
      }
    },

    create_reaction: async (
      _: unknown,
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
      } catch (error) {
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
              .where(eq(schema.users.id, parent.subscriber_id));
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
              .where(eq(schema.users.id, parent.user_id));
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

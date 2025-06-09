import DataLoader from 'dataloader';
import { inArray, type InferSelectModel } from 'drizzle-orm';

import { getCache } from '@src/lib/cache';
import * as schema from '@src/lib/db/schema';
import { db } from '@src/lib/db/seed';
import { REACTION_EMOJIS, GAME_STATUS_VALUES } from '@src/lib/types/config.types';
import type {
  Game,
  GameLog,
  Comment,
  Reaction,
  Team,
  ParentType as GraphQLParentType,
  GameTeams,
  GameScores,
  ReactionEmojiType as GraphQLReactionEmojiType,
  TeamScore,
  GameDate,
  GameStatus,
  GamePeriods,
  Arena,
  TeamSummary,
} from '@src/lib/types/generated/graphql';

// Type definitions
type UserSummary = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  imageUrl?: string;
  __typename: 'UserSummary';
};

type DBTeam = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  conference: string | null;
  division: string | null;
  logoUrl: string | null;
  isActive: boolean;
};

type DBPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  jerseyNumber: string;
  isActive: boolean;
  teamId: string;
  birth: {
    date: string;
    country: string;
    state: string | null;
    city: string | null;
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
  college: string | null;
  affiliation: string | null;
  seasons_active?: { season: number; teams: string[] }[];
  createdAt: Date;
  updatedAt: Date;
};

type ReactionEmojiType = GraphQLReactionEmojiType;
type ParentType = GraphQLParentType;

// Cache configuration
const CACHE_TTL = 60 * 5; // 5 minutes
const CACHE_PREFIX = 'graphql:loader:';

// Helper functions
const getEmojiKey = (emojiCharacter: string): ReactionEmojiType => {
  const entry = Object.entries(REACTION_EMOJIS).find(([, char]) => char === emojiCharacter);
  if (!entry) {
    throw new Error(`Invalid emoji character: ${emojiCharacter}`);
  }
  return entry[0] as ReactionEmojiType;
};

const safeDateConversion = (date: unknown): Date => {
  if (date instanceof Date) return date;
  if (typeof date === 'string' || typeof date === 'number') return new Date(date);
  return new Date();
};

// Generic cache-aware loader factory
const createCacheAwareLoader = <T>(
  batchLoadFn: (keys: readonly string[]) => Promise<(T | null)[]>,
  cacheKeyFn: (key: string) => string,
  ttl: number = CACHE_TTL
) => {
  return new DataLoader<string, T | null>(async keys => {
    const cache = getCache();
    const cacheKeys = keys.map(cacheKeyFn);
    const cachedResults = await Promise.all(cacheKeys.map(key => cache.get<T>(key)));

    const missingKeys: string[] = [];
    const missingIndices: number[] = [];
    const results: (T | null)[] = new Array(keys.length);

    cachedResults.forEach((cached, index) => {
      if (cached !== null) {
        results[index] = cached;
      } else {
        missingKeys.push(keys[index]);
        missingIndices.push(index);
      }
    });

    if (missingKeys.length > 0) {
      const freshResults = await batchLoadFn(missingKeys);

      // Cache the fresh results
      await Promise.all(
        missingIndices.map((index, i) => {
          const result = freshResults[i];
          if (result !== null) {
            return cache.set(cacheKeyFn(missingKeys[i]), result, ttl);
          }
          return Promise.resolve();
        })
      );

      // Update results array
      missingIndices.forEach((index, i) => {
        results[index] = freshResults[i];
      });
    }

    return results;
  });
};

export function createLoaders() {
  // Using the directly imported db instance for consistent database access

  // User loader with caching
  const userLoader = createCacheAwareLoader<UserSummary | null>(
    async (userIds: readonly string[]) => {
      try {
        // Use the imported db instead of the parameter to avoid undefined issues
        const users = await db.query.users.findMany({
          where: inArray(schema.users.id, Array.from(userIds)),
        });
        return userIds.map(id => {
          const user = users.find(u => u.id === id);
          if (!user) return null;
          return {
            id: user.id,
            username: user.username || 'missing-username',
            firstName: user.firstName || 'missing-first-name',
            lastName: user.lastName || 'missing-last-name',
            emailAddress: user.emailAddress || '',
            imageUrl: user.imageUrl || undefined,
            __typename: 'UserSummary',
          } as UserSummary;
        });
      } catch (error) {
        console.error('Error in userLoader:', error);
        // Fallback to empty array if there's an error
        return userIds.map(() => null);
      }
    },
    (key: string) => `${CACHE_PREFIX}user:${key}`
  );

  // Game loader with caching
  const gameLoader = createCacheAwareLoader<Game>(
    async (ids: readonly string[]) => {
      const games = await db
        .select()
        .from(schema.nba_games)
        .where(inArray(schema.nba_games.id, Array.from(ids)));

      return ids.map(id => {
        const game = games.find(g => g.id === id);
        if (!game) return null;

        // Only pick the required fields for team mapping
        const homeTeamRaw = game.teams?.home;
        const visitorsTeamRaw = game.teams?.visitors;
        const homeTeam = homeTeamRaw
          ? {
              id: String(homeTeamRaw.id),
              name: homeTeamRaw.name,
              code: homeTeamRaw.code,
              logoUrl: homeTeamRaw.logo ?? null,
            }
          : undefined;
        const visitorsTeam = visitorsTeamRaw
          ? {
              id: String(visitorsTeamRaw.id),
              name: visitorsTeamRaw.name,
              code: visitorsTeamRaw.code,
              logoUrl: visitorsTeamRaw.logo ?? null,
            }
          : undefined;

        // Type guards for scores
        const homeScores =
          game.scores && typeof game.scores.home === 'object' && game.scores.home !== null
            ? game.scores.home
            : undefined;
        const visitorsScores =
          game.scores && typeof game.scores.visitors === 'object' && game.scores.visitors !== null
            ? game.scores.visitors
            : undefined;

        // Transform game data to match GraphQL Game type
        return {
          id: game.id,
          date: {
            start: game.date?.start || new Date().toISOString(),
            end: game.date?.end || null,
            duration: game.date?.duration || null,
          } as GameDate,
          status: {
            long: game.status?.long || '',
            short: game.status?.short?.toString() || '',
            clock: game.status?.clock || null,
            halftime: game.status?.halftime || false,
          } as GameStatus,
          teams: {
            home: mapDbTeamToGameTeam(homeTeam as DBTeam),
            visitors: mapDbTeamToGameTeam(visitorsTeam as DBTeam),
          } as GameTeams,
          scores: {
            home: {
              points: homeScores?.points || 0,
              win: getScoreValue(homeScores, 'win'),
              loss: getScoreValue(homeScores, 'loss'),
              series: {
                win: homeScores?.series ? getScoreValue(homeScores.series, 'win') : 0,
                loss: homeScores?.series ? getScoreValue(homeScores.series, 'loss') : 0,
              },
              linescore: homeScores?.linescore || [],
            } as TeamScore,
            visitors: {
              points: visitorsScores?.points || 0,
              win: getScoreValue(visitorsScores, 'win'),
              loss: getScoreValue(visitorsScores, 'loss'),
              series: {
                win: visitorsScores?.series ? getScoreValue(visitorsScores.series, 'win') : 0,
                loss: visitorsScores?.series ? getScoreValue(visitorsScores.series, 'loss') : 0,
              },
              linescore: visitorsScores?.linescore || [],
            } as TeamScore,
          } as GameScores,
          arena: game.arena
            ? ({
                name: game.arena.name || '',
                city: game.arena.city || '',
                state: game.arena.state || null,
                country: game.arena.country || null,
              } as Arena)
            : null,
          league: game.league,
          season: game.season,
          stage: game.stage,
          periods: game.periods
            ? ({
                current: game.periods.current || 0,
                total: game.periods.total || 0,
                endOfPeriod: game.periods.endOfPeriod || false,
              } as GamePeriods)
            : null,
          officials: game.officials || [],
          timesTied: game.timesTied || 0,
          leadChanges: game.leadChanges || 0,
          nugget: game.nugget || null,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
          homeTeamId: homeTeam?.id.toString() || '',
          awayTeamId: visitorsTeam?.id.toString() || '',
          isCompleted: game.status?.short === 'Final',
          homeTeamScore: homeScores?.points || 0,
          awayTeamScore: visitorsScores?.points || 0,
          gameType: 'REGULAR',
        } as Game;
      });
    },
    (key: string) => `${CACHE_PREFIX}game:${key}`
  );

  // Team loader with caching
  const teamLoader = createCacheAwareLoader<Team>(
    async (ids: readonly string[]) => {
      const results = await db
        .select()
        .from(schema.teams)
        .where(inArray(schema.teams.id, Array.from(ids)));

      return ids.map(id => {
        const team = results.find(t => t.id === id);
        if (!team) return null;
        return {
          id: team.id,
          name: team.name,
          city: team.city,
          conference: team.conference ?? null,
          division: team.division ?? null,
          code: team.code,
          logoUrl: team.logoUrl ?? null,
          logo: team.logoUrl ?? null,
          nickname: team.name ?? null,
          createdAt: new Date(0),
          updatedAt: new Date(0),
        };
      });
    },
    (key: string) => `${CACHE_PREFIX}team:${key}`
  );

  const playerLoader = new DataLoader<string, DBPlayer | null>(async (ids: readonly string[]) => {
    const results = await db
      .select()
      .from(schema.nba_players)
      .where(inArray(schema.nba_players.id, Array.from(ids)));

    const playerMap = new Map<string, DBPlayer>();
    results.forEach(player => {
      playerMap.set(player.id, {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        position: player.pos || '',
        jerseyNumber: player.jersey || '',
        isActive: player.active || false,
        teamId: '', // This seems to be missing in the schema
        birth: player.birth as DBPlayer['birth'],
        nba: player.nba as DBPlayer['nba'],
        height: player.height as DBPlayer['height'],
        weight: player.weight as DBPlayer['weight'],
        college: player.college || null,
        affiliation: player.affiliation || null,
        seasons_active: player.seasonsActive
          ? player.seasonsActive.map((s: { season: number; teamIds: string[] }) => ({
              season: s.season,
              teams: s.teamIds,
            }))
          : undefined,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      });
    });

    return ids.map(id => playerMap.get(id) || null);
  });

  const gameLogsLoader = createGameLogsLoader(userLoader, gameLoader);

  const commentLoader = new DataLoader<string, Comment | null>(async (ids: readonly string[]) => {
    const results = await db
      .select()
      .from(schema.comments)
      .where(inArray(schema.comments.id, Array.from(ids)));

    const commentMap = new Map<string, Comment>();
    results.forEach(comment => {
      commentMap.set(comment.id, {
        id: comment.id,
        userId: comment.userId || '',
        parentId: comment.parentId || '',
        parentType: (comment.parentType?.toLowerCase() || 'comment') as GraphQLParentType,
        content: comment.content || '',
        createdAt: new Date(comment.createdAt),
        updatedAt: new Date(comment.updatedAt),
        deletedAt: comment.deletedAt,
        user: null as unknown as UserSummary,
        reactions: [],
        childComments: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
        depth: 0,
      });
    });

    return ids.map(id => commentMap.get(id) || null);
  });

  const reactionLoader = new DataLoader<string, Reaction | null>(async (ids: readonly string[]) => {
    const results = await db
      .select()
      .from(schema.reactions)
      .where(inArray(schema.reactions.id, Array.from(ids)));

    const reactionMap = new Map<string, Reaction>();
    results.forEach(reaction => {
      reactionMap.set(reaction.id, {
        id: reaction.id,
        emoji: getEmojiKey(reaction.emoji),
        user: null as unknown as UserSummary,
        userId: reaction.userId || '',
        targetId: reaction.targetId || '',
        targetType: convertToParentType(reaction.targetType),
        createdAt: new Date(reaction.createdAt),
        updatedAt: new Date(reaction.updatedAt),
        __typename: 'Reaction',
      });
    });

    return ids.map(id => reactionMap.get(id) || null);
  });

  return {
    userLoader,
    gameLoader,
    teamLoader,
    playerLoader,
    gameLogsLoader,
    commentLoader,
    reactionLoader,
  };
}

// Helper function to map database team to GraphQL team
function mapDbTeamToGameTeam(dbTeam: DBTeam | undefined): TeamSummary {
  if (!dbTeam) {
    return {
      id: '',
      name: '',
      nickname: '',
      code: '',
      logo: null,
      __typename: 'TeamSummary',
    };
  }
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    nickname: dbTeam.name,
    code: dbTeam.code,
    logo: dbTeam.logoUrl || null,
    __typename: 'TeamSummary',
  };
}

// Game Logs Loader
export const createGameLogsLoader = (
  userLoader: DataLoader<string, UserSummary | null>,
  gameLoader: DataLoader<string, Game | null>
) => {
  return new DataLoader<string, GameLog | null>(async keys => {
    const logs = await db.query.game_logs.findMany({
      where: inArray(schema.game_logs.id, Array.from(keys)),
    });
    const userIds = logs
      .map((log: InferSelectModel<typeof schema.game_logs>) => log.userId)
      .filter((id): id is string => id !== null);
    const gameIds = logs.map((log: InferSelectModel<typeof schema.game_logs>) => log.gameId);
    const users = await userLoader.loadMany(userIds);
    const games = await gameLoader.loadMany(gameIds);

    const results = keys.map(key => {
      const log = logs.find(l => l.id === key);
      if (!log) return null;
      const user = users[userIds.indexOf(log.userId || '')] as UserSummary;
      const dbGame = games[gameIds.indexOf(log.gameId)] as Game;
      if (!dbGame) {
        // If game is not found, return null for the entire game log
        return null;
      }

      const homeTeamId = dbGame.teams?.home?.id?.toString() || '';
      const awayTeamId = dbGame.teams?.visitors?.id?.toString() || '';
      const homeTeamScore = dbGame.scores?.home?.points || null;
      const awayTeamScore = dbGame.scores?.visitors?.points || null;

      // Ensure we have a valid date object
      let gameDate;
      if (typeof dbGame.date === 'object' && dbGame.date !== null) {
        try {
          const dateObj = dbGame.date as {
            start?: string | Date;
            end?: string | Date | null;
            duration?: string | number | null;
          };
          gameDate = {
            start: dateObj.start
              ? new Date(dateObj.start).toISOString()
              : new Date(0).toISOString(),
            end: dateObj.end ? new Date(dateObj.end).toISOString() : null,
            duration: dateObj.duration ? Number(dateObj.duration) : null,
          };
        } catch (error) {
          console.error('Error parsing game date:', error);
          gameDate = {
            start: new Date(0).toISOString(),
            end: null,
            duration: null,
          };
        }
      } else if (typeof dbGame.date === 'string') {
        try {
          gameDate = {
            start: new Date(dbGame.date).toISOString(),
            end: null,
            duration: null,
          };
        } catch (error) {
          console.error('Error parsing game date string:', error);
          gameDate = {
            start: new Date(0).toISOString(),
            end: null,
            duration: null,
          };
        }
      } else {
        gameDate = {
          start: new Date(0).toISOString(),
          end: null,
          duration: null,
        };
      }

      // Ensure gameDate.start is never null
      if (!gameDate.start) {
        gameDate.start = new Date(0).toISOString();
      }

      const game: Game = {
        id: dbGame.id,
        date: gameDate,
        status: {
          clock: dbGame.status?.clock || null,
          halftime: dbGame.status?.halftime || false,
          long: dbGame.status?.long || '',
          short: String(dbGame.status?.short || ''),
          __typename: 'GameStatus',
        },
        arena: {
          name:
            typeof dbGame.arena === 'object' && dbGame.arena !== null
              ? dbGame.arena.name || ''
              : typeof dbGame.arena === 'string'
                ? dbGame.arena
                : '',
          city:
            typeof dbGame.arena === 'object' && dbGame.arena !== null
              ? dbGame.arena.city || ''
              : '',
          state:
            typeof dbGame.arena === 'object' && dbGame.arena !== null ? dbGame.arena.state : null,
          country:
            typeof dbGame.arena === 'object' && dbGame.arena !== null ? dbGame.arena.country : null,
        },
        league: dbGame.league,
        season: dbGame.season,
        stage: dbGame.stage,
        periods: {
          current:
            typeof dbGame.periods === 'object' && dbGame.periods !== null
              ? (dbGame.periods as { current: number }).current
              : 0,
          total: 4,
          endOfPeriod: false,
        },
        teams: dbGame.teams,
        scores: dbGame.scores,
        officials: dbGame.officials || [],
        timesTied: dbGame.timesTied || 0,
        leadChanges: dbGame.leadChanges || 0,
        nugget: dbGame.nugget || null,
        isCompleted:
          typeof dbGame.status === 'object' && dbGame.status !== null && 'long' in dbGame.status
            ? dbGame.status['long'] === GAME_STATUS_VALUES.FINISHED
            : false,
        gameType: 'REGULAR',
        nbaGameId: dbGame.id,
        __typename: 'Game',
        homeTeamId,
        awayTeamId,
        homeTeamScore,
        awayTeamScore,
        createdAt: safeDateConversion(dbGame.createdAt),
        updatedAt: safeDateConversion(dbGame.updatedAt),
      };

      return {
        id: log.id,
        gameId: log.gameId,
        userId: log.userId || '',
        game,
        user,
        classification: log.classification,
        notes: log.notes || undefined,
        ratingForGame: log.ratingForGame,
        tags: log.tags || [],
        watchedDate: log.watchedDate,
        watchedScope: log.watchedScope,
        watchedSetting: log.watchedSetting,
        watchedLocation: log.watchedLocation || undefined,
        createdAt: safeDateConversion(log.createdAt),
        updatedAt: safeDateConversion(log.updatedAt),
        deletedAt: log.deletedAt,
        comments: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
        reactions: [],
        __typename: 'GameLog',
      } as GameLog;
    });

    return results;
  });
};

// Comments Loader
export const createCommentsLoader = (userLoader: DataLoader<string, UserSummary>) => {
  return new DataLoader<string, Comment[]>(async parentIds => {
    const commentRecords = await db.query.comments.findMany({
      where: inArray(schema.comments.parentId, Array.from(parentIds)),
    });
    const userIds = commentRecords
      .map(comment => comment.userId)
      .filter((id): id is string => id !== null);
    const users = await userLoader.loadMany(userIds);

    const results = parentIds.map(id => {
      const comments = commentRecords.filter(comment => comment.parentId === id);
      return comments.map(comment => {
        const user = users[userIds.indexOf(comment.userId || '')] as UserSummary;
        return {
          id: comment.id,
          content: comment.content,
          user,
          userId: comment.userId || '',
          parentId: comment.parentId,
          parentType: convertToParentType(comment.parentType),
          reactions: [],
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
          deletedAt: comment.deletedAt || undefined,
          childComments: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
          depth: 0,
          __typename: 'Comment',
        } as Comment;
      });
    });

    return results as ArrayLike<Error | Comment[]>;
  });
};

// Reactions Loader
export const createReactionsLoader = (userLoader: DataLoader<string, UserSummary>) => {
  return new DataLoader<string, Reaction[]>(async targetIds => {
    const reactionRecords = await db.query.reactions.findMany({
      where: inArray(schema.reactions.targetId, Array.from(targetIds)),
    });
    const userIds = reactionRecords
      .map(reaction => reaction.userId)
      .filter((id): id is string => id !== null);
    const users = await userLoader.loadMany(userIds);

    const results = targetIds.map(id => {
      const reactions = reactionRecords.filter(reaction => reaction.targetId === id);
      return reactions.map(reaction => {
        const user = users[userIds.indexOf(reaction.userId || '')] as UserSummary;
        return {
          id: reaction.id,
          emoji: getEmojiKey(reaction.emoji) as ReactionEmojiType,
          user,
          userId: reaction.userId || '',
          targetId: reaction.targetId,
          targetType: convertToParentType(reaction.targetType),
          createdAt: new Date(reaction.createdAt),
          updatedAt: new Date(reaction.updatedAt),
          __typename: 'Reaction',
        } as Reaction;
      });
    });

    return results as ArrayLike<Error | Reaction[]>;
  });
};

export const createDbGameBySeasonLoader = () => {
  return new DataLoader<number, Game[]>(async (seasons: readonly number[]) => {
    const games = await db
      .select()
      .from(schema.nba_games)
      .where(inArray(schema.nba_games.season, Array.from(seasons)));

    return seasons.map(season => {
      return (games as InferSelectModel<typeof schema.nba_games>[])
        .filter((game: InferSelectModel<typeof schema.nba_games>) => game.season === season)
        .map(game => {
          const homeTeamId = game.teams?.home?.id?.toString() || '';
          const awayTeamId = game.teams?.visitors?.id?.toString() || '';
          const homeTeamScore = game.scores?.home?.points || null;
          const awayTeamScore = game.scores?.visitors?.points || null;

          const gameData: Game = {
            id: game.id,
            date: createSafeGameDate(game.date),
            status: {
              clock: game.status?.clock || null,
              halftime: game.status?.halftime || false,
              long: game.status?.long || '',
              short: String(game.status?.short || ''),
              __typename: 'GameStatus',
            },
            arena: {
              name: typeof game.arena === 'string' ? game.arena : game.arena?.name || '',
              city: typeof game.arena === 'string' ? '' : game.arena?.city || '',
              state: typeof game.arena === 'string' ? '' : game.arena?.state || '',
              country: typeof game.arena === 'string' ? '' : game.arena?.country || '',
            },
            league: game.league || 'NBA',
            season: game.season || new Date().getFullYear(),
            stage: game.stage || 1,
            periods: {
              current:
                typeof game.periods === 'object' && game.periods !== null
                  ? (game.periods as { current: number }).current
                  : 0,
              total: 4,
              endOfPeriod: false,
            },
            teams: {
              home: {
                id: game.teams?.home?.id?.toString() || '',
                name: game.teams?.home?.name || '',
                nickname: game.teams?.home?.name || '',
                code: game.teams?.home?.code || '',
                logo: game.teams?.home?.logo || null,
                __typename: 'TeamSummary',
              },
              visitors: {
                id: game.teams?.visitors?.id?.toString() || '',
                name: game.teams?.visitors?.name || '',
                nickname: game.teams?.visitors?.name || '',
                code: game.teams?.visitors?.code || '',
                logo: game.teams?.visitors?.logo || null,
                __typename: 'TeamSummary',
              },
            },
            scores: createSafeGameScores(game.scores),
            officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
            timesTied: game.timesTied || 0,
            leadChanges: game.leadChanges || 0,
            nugget: game.nugget || '',
            isCompleted:
              typeof game.status === 'object' && game.status !== null && 'long' in game.status
                ? game.status.long === GAME_STATUS_VALUES.FINISHED
                : false,
            gameType: 'REGULAR',
            nbaGameId: game.id,
            createdAt: safeDateConversion(game.createdAt),
            updatedAt: safeDateConversion(game.updatedAt),
            homeTeamId,
            awayTeamId,
            homeTeamScore,
            awayTeamScore,
            __typename: 'Game',
          };

          return gameData;
        });
    });
  });
};

// Type-safe transformation utilities
const createSafeGameDate = (
  date: unknown
): { start: Date; end: Date | null; duration: number | null } => {
  if (!date) {
    return { start: new Date(), end: null, duration: null };
  }

  if (typeof date === 'object' && date !== null) {
    const dateObj = date as { start?: unknown; end?: unknown; duration?: unknown };
    return {
      start: safeDateConversion(dateObj.start),
      end: dateObj.end ? safeDateConversion(dateObj.end) : null,
      duration: typeof dateObj.duration === 'number' ? dateObj.duration : null,
    };
  }

  return { start: safeDateConversion(date), end: null, duration: null };
};

const createSafeGameScores = (scores: unknown): GameScores => {
  if (!scores || typeof scores !== 'object') {
    return {
      home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
      visitors: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
    };
  }

  const scoresObj = scores as { home?: unknown; visitors?: unknown };

  const processTeamScores = (teamScores: unknown): TeamScore => {
    if (!teamScores || typeof teamScores !== 'object') {
      return {
        points: 0,
        win: 0,
        loss: 0,
        series: { win: 0, loss: 0 },
        linescore: [],
      };
    }

    const scores = teamScores as {
      points?: number;
      win?: number;
      loss?: number;
      series?: { win?: number; loss?: number };
      linescore?: number[];
    };
    return {
      points: scores.points || 0,
      win: scores.win || 0,
      loss: scores.loss || 0,
      series: {
        win: scores.series?.win || 0,
        loss: scores.series?.loss || 0,
      },
      linescore: Array.isArray(scores.linescore) ? scores.linescore : [],
    };
  };

  return {
    home: processTeamScores(scoresObj.home),
    visitors: processTeamScores(scoresObj.visitors),
  };
};

const convertToParentType = (parentType: string): ParentType => {
  switch (parentType) {
    case 'game_log':
      return 'GameLog' as ParentType;
    case 'comment':
      return 'Comment' as ParentType;
    default:
      return 'GameLog' as ParentType;
  }
};

function getScoreValue(score: unknown, key: 'win' | 'loss'): number {
  if (!score || typeof score !== 'object') {
    return 0;
  }
  const scoreObj = score as { win?: number; loss?: number };
  return scoreObj[key] || 0;
}

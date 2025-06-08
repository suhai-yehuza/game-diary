import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

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
  TeamSummary,
  TeamScore,
  GameTeams,
  GameScores,
  ReactionEmojiType as GraphQLReactionEmojiType,
} from '@src/lib/types/generated/graphql';
import type { DBPlayer, DBGameData, DBArenaData } from '@src/lib/types/shared.types';

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

type ReactionEmojiType = GraphQLReactionEmojiType;
type ParentType = GraphQLParentType;

// Cache configuration
const CACHE_TTL = 60 * 5; // 5 minutes
const CACHE_PREFIX = 'graphql:loader:';

// Helper functions
const isDateObj = (d: unknown): d is Date =>
  typeof d === 'object' && d !== null && Object.prototype.toString.call(d) === '[object Date]';

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

export function createLoaders(database: NeonHttpDatabase<typeof schema>) {
  // User loader with caching
  const userLoader = createCacheAwareLoader<UserSummary | null>(
    async (userIds: readonly string[]) => {
      const users = await database.query.users.findMany({
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
    },
    (key: string) => `${CACHE_PREFIX}user:${key}`
  );

  // Game loader with caching
  const gameLoader = createCacheAwareLoader<Game>(
    async (ids: readonly string[]) => {
      const games = await database
        .select()
        .from(schema.nba_games)
        .where(inArray(schema.nba_games.id, Array.from(ids)));

      return ids.map(id => {
        const game = games.find(g => g.id === id);
        if (!game) return null;

        // Transform game data (existing transformation logic)
        return transformGameData(game);
      });
    },
    (key: string) => `${CACHE_PREFIX}game:${key}`
  );

  // Team loader with caching
  const teamLoader = createCacheAwareLoader<Team>(
    async (ids: readonly string[]) => {
      const results = await database
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
    const results = await database
      .select()
      .from(schema.nba_players)
      .where(inArray(schema.nba_players.id, Array.from(ids)));

    const playerMap = new Map<string, DBPlayer>();
    results.forEach(player => {
      playerMap.set(player.id, {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        birth: player.birth as DBPlayer['birth'],
        nba: player.nba as DBPlayer['nba'],
        height: player.height as DBPlayer['height'],
        weight: player.weight as DBPlayer['weight'],
        college: player.college || undefined,
        affiliation: player.affiliation || undefined,
        leagues: {
          standard: {
            jersey: player.jersey || undefined,
            active: player.active || undefined,
            pos: player.pos || undefined,
          },
          sacramento: undefined,
          utah: undefined,
          vegas: undefined,
        },
        seasons_active: player.seasonsActive
          ? player.seasonsActive.map((s: { season: number; teamIds: string[] }) => ({
              season: s.season,
              teams: s.teamIds,
            }))
          : undefined,
      });
    });

    return ids.map(id => playerMap.get(id) || null);
  });

  const gameLogsLoader = createGameLogsLoader(userLoader, gameLoader);

  const commentLoader = new DataLoader<string, Comment | null>(async (ids: readonly string[]) => {
    const results = await database
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
    const results = await database
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

// Helper function to transform game data
function transformGameData(game: DBGameData): Game {
  const teams = game.teams || {};
  const homeTeam = teams.home || {};
  const awayTeam = teams.visitors || {};

  // Ensure all fields are present and correct type for TeamSummary
  const toTeamSummary = (team: any): TeamSummary => ({
    id: String(team.id ?? ''),
    name: String(team.name ?? ''),
    nickname: String(team.nickname ?? ''),
    code: String(team.code ?? ''),
    logo: team.logo !== undefined && team.logo !== null ? String(team.logo) : null,
    __typename: 'TeamSummary',
  });

  const transformedTeams = createSafeGameTeams(teams);

  // Ensure all fields are present and correct type for TeamScore
  const toTeamScore = (score: any): TeamScore => ({
    win: typeof score.win === 'number' ? score.win : 0,
    loss: typeof score.loss === 'number' ? score.loss : 0,
    linescore: Array.isArray(score.linescore) ? score.linescore.map(Number) : [],
    points: typeof score.points === 'number' ? score.points : 0,
    series: {
      win: score.series && typeof score.series.win === 'number' ? score.series.win : 0,
      loss: score.series && typeof score.series.loss === 'number' ? score.series.loss : 0,
      __typename: 'SeriesScore',
    },
    __typename: 'TeamScore',
  });

  const scores = (game.scores as Record<string, Record<string, unknown>>) || {};
  const homeScores = scores.home || {};
  const awayScores = scores.visitors || {};

  const transformedScores = createSafeGameScores(scores);

  const status = (game.status as Record<string, unknown>) || {};
  const periods = (game.periods as Record<string, unknown>) || {};

  return {
    id: game.id,
    date: {
      start: (() => {
        try {
          const parsedDate = new Date(game.date as string);
          return isNaN(parsedDate.getTime()) ? new Date(0).toISOString() : parsedDate.toISOString();
        } catch (error) {
          console.warn(`Error parsing start date for game ${game.id}:`, error);
          return new Date(0).toISOString();
        }
      })(),
      end: null,
      duration: null,
      __typename: 'GameDate',
    },
    status: {
      clock: (status.clock as string) || null,
      halftime: (status.halftime as boolean) || false,
      short: (status.short as string) || 'SCHEDULED',
      long: (status.long as string) || 'SCHEDULED',
      __typename: 'GameStatus',
    },
    arena: game.arena ? transformArenaData(game.arena as DBArenaData) : null,
    periods: {
      current: (periods.current as number) || 1,
      total: (periods.total as number) || 4,
      endOfPeriod: (periods.endOfPeriod as boolean) || false,
      __typename: 'GamePeriods',
    },
    teams: transformedTeams,
    scores: transformedScores,
    league: game.league || null,
    season: game.season || null,
    officials: Array.isArray(game.officials) ? (game.officials as string[]) : [],
    timesTied: game.timesTied || null,
    leadChanges: game.leadChanges || null,
    nugget: game.nugget || null,
    createdAt: new Date(game.createdAt),
    updatedAt: new Date(game.updatedAt),
    isCompleted: status.long === 'FINISHED',
    homeTeamId: String(homeTeam.id || ''),
    awayTeamId: String(awayTeam.id || ''),
    gameType: 'REGULAR',
    __typename: 'Game',
  };
}

// Helper transformation functions
function transformArenaData(arena: DBArenaData | string | null): {
  name: string;
  city: string;
  state: string | null;
  country: string | null;
} | null {
  if (typeof arena === 'string') {
    return { name: arena, city: '', state: null, country: null };
  }
  if (!arena) return null;
  return {
    name: arena.name || '',
    city: arena.city || '',
    state: arena.state || null,
    country: arena.country || null,
  };
}

// Team Loader
export const createTeamLoader = () => {
  return new DataLoader<string, Team | null>(async teamIds => {
    const teamRecords = await db.query.teams.findMany({
      where: inArray(schema.teams.id, Array.from(teamIds)),
    });
    return teamIds.map(id => {
      const team = teamRecords.find((t: any) => t.id === id);
      if (!team) return null;
      return {
        id: team.id,
        name: team.name,
        nickname: team.name ?? null,
        code: team.code ?? null,
        city: team.city,
        logo: team.logoUrl ?? null,
        conference: team.conference ?? null,
        division: team.division ?? null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        logoUrl: team.logoUrl ?? null,
        __typename: 'Team',
      } as Team;
    });
  });
};

// Game Loader with Stats
export const createGameLoader = () => {
  return new DataLoader<string, Game | null>(async gameIds => {
    const games = await db.query.nba_games.findMany({
      where: inArray(schema.nba_games.id, Array.from(gameIds)),
    });
    return gameIds.map(id => {
      const game = games.find((g: any) => g.id === id);
      if (!game) return null;

      // Safe type handling for complex fields
      const teams = game.teams || {};
      const homeTeamId =
        typeof teams === 'object' &&
        teams !== null &&
        'home' in teams &&
        teams.home &&
        typeof teams.home === 'object' &&
        'id' in teams.home
          ? String(teams.home.id)
          : '';

      const awayTeamId =
        typeof teams === 'object' &&
        teams !== null &&
        'visitors' in teams &&
        teams.visitors &&
        typeof teams.visitors === 'object' &&
        'id' in teams.visitors
          ? String(teams.visitors.id)
          : '';

      return {
        id: game.id,
        date: createSafeGameDate(game.date),
        status: {
          clock: game.status?.clock || null,
          halftime: game.status?.halftime || false,
          short: String(game.status?.short || ''),
          long: game.status?.long || GAME_STATUS_VALUES.SCHEDULED,
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
        teams: createSafeGameTeams(game.teams),
        scores: createSafeGameScores(game.scores),
        officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
        timesTied: game.timesTied || 0,
        leadChanges: game.leadChanges || 0,
        nugget: game.nugget || null,
        createdAt: new Date(game.createdAt),
        updatedAt: new Date(game.updatedAt),
        homeTeamId,
        awayTeamId,
        isCompleted:
          game.status && typeof game.status === 'object' && 'long' in game.status
            ? game.status.long === GAME_STATUS_VALUES.FINISHED
            : false,
        awayTeamScore: game.scores?.visitors?.points ?? null,
        homeTeamScore: game.scores?.home?.points ?? null,
        gameType: 'REGULAR',
        nbaGameId: game.id,
        __typename: 'Game',
      } as Game;
    });
  });
};

// Database Game Loader
export const createDbGameLoader = () => {
  return new DataLoader<string, Game | null>(async (ids: readonly string[]) => {
    const games = await db
      .select()
      .from(schema.nba_games)
      .where(inArray(schema.nba_games.id, Array.from(ids)));

    return ids.map(id => {
      const game = games.find((g: any) => g.id === id);
      if (!game) {
        return null;
      }

      const gameData: Game = {
        id: game.id,
        date: createSafeGameDate(game.date),
        status: {
          clock:
            typeof game.status === 'object' && game.status !== null
              ? game.status.clock || null
              : null,
          halftime:
            typeof game.status === 'object' && game.status !== null
              ? game.status.halftime || false
              : false,
          long:
            typeof game.status === 'object' && game.status !== null ? game.status.long || '' : '',
          short: String(game.status?.short || ''),
        },
        arena: {
          name: typeof game.arena === 'string' ? game.arena : game.arena?.name || '',
          city: typeof game.arena === 'string' ? '' : game.arena?.city || '',
          state: typeof game.arena === 'string' ? '' : game.arena?.state || '',
          country: typeof game.arena === 'string' ? '' : game.arena?.country || '',
        },
        league: game.league || 'NBA',
        season: game.season ?? new Date().getFullYear(),
        stage: game.stage ?? 1,
        periods: {
          current:
            typeof game.periods === 'object' && game.periods !== null
              ? (game.periods as { current: number }).current
              : 0,
          total: 4,
          endOfPeriod: false,
        },
        teams: createSafeGameTeams(game.teams),
        scores: createSafeGameScores(game.scores),
        officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
        timesTied: game.timesTied || 0,
        leadChanges: game.leadChanges || 0,
        nugget: game.nugget || null,
        createdAt: safeDateConversion(game.createdAt),
        updatedAt: safeDateConversion(game.updatedAt),
        homeTeamId: game.teams?.home?.id?.toString() || '',
        awayTeamId: game.teams?.visitors?.id?.toString() || '',
        isCompleted:
          game.status && typeof game.status === 'object' && 'long' in game.status
            ? game.status.long === GAME_STATUS_VALUES.FINISHED
            : false,
        awayTeamScore: game.scores?.visitors?.points ?? null,
        homeTeamScore: game.scores?.home?.points ?? null,
        gameType: 'REGULAR',
        nbaGameId: game.id,
        __typename: 'Game',
      };

      return gameData;
    });
  });
};

// Game Logs Loader
export const createGameLogsLoader = (
  userLoader: DataLoader<string, UserSummary | null>,
  gameLoader: DataLoader<string, Game | null>
) => {
  return new DataLoader<string, GameLog | null>(async keys => {
    const logs = await db.query.game_logs.findMany({
      where: inArray(schema.game_logs.id, Array.from(keys)),
    });
    const userIds = logs.map((log: any) => log.userId).filter((id): id is string => id !== null);
    const gameIds = logs.map((log: any) => log.gameId);
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
      return games
        .filter((game: any) => game.season === season)
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
            teams: createSafeGameTeams(game.teams),
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
  try {
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return { start: new Date(0), end: null, duration: null };
      }
      return { start: parsedDate, end: null, duration: null };
    }
    if (isDateObj(date)) {
      return { start: date, end: null, duration: null };
    }
    if (typeof date === 'object' && date !== null) {
      const { start, end, duration } = date as { start: unknown; end: unknown; duration: unknown };
      const startDate =
        typeof start === 'string' ? new Date(start) : isDateObj(start) ? start : new Date(0);
      const endDate = typeof end === 'string' ? new Date(end) : isDateObj(end) ? end : null;
      const durationValue = typeof duration === 'number' ? duration : null;

      if (isNaN(startDate.getTime())) {
        return { start: new Date(0), end: endDate, duration: durationValue };
      }

      return { start: startDate, end: endDate, duration: durationValue };
    }
    return { start: new Date(0), end: null, duration: null };
  } catch (error) {
    return { start: new Date(0), end: null, duration: null };
  }
};

const createSafeGameTeams = (teams: unknown): GameTeams => {
  if (!teams || typeof teams !== 'object') {
    return {
      home: { id: '', name: '', nickname: '', code: '', logo: null },
      visitors: { id: '', name: '', nickname: '', code: '', logo: null },
    };
  }

  const teamsObj = teams as Record<string, Record<string, unknown>>;
  return {
    home: {
      id: String(teamsObj.home?.id || ''),
      name: String(teamsObj.home?.name || ''),
      nickname: String(teamsObj.home?.nickname || ''),
      code: String(teamsObj.home?.code || ''),
      logo: (teamsObj.home?.logo as string) || null,
    },
    visitors: {
      id: String(teamsObj.visitors?.id || ''),
      name: String(teamsObj.visitors?.name || ''),
      nickname: String(teamsObj.visitors?.nickname || ''),
      code: String(teamsObj.visitors?.code || ''),
      logo: (teamsObj.visitors?.logo as string) || null,
    },
  };
};

const createSafeGameScores = (scores: unknown): GameScores => {
  if (!scores || typeof scores !== 'object') {
    console.warn('[GameScores] Invalid scores object:', scores);
    return {
      home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
      visitors: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
    };
  }

  const scoresObj = scores as Record<string, Record<string, unknown>>;

  const processLinescore = (linescore: unknown, team: 'home' | 'visitors'): number[] => {
    if (!Array.isArray(linescore)) {
      console.warn(`[GameScores] Invalid linescore format for ${team}:`, linescore);
      return [];
    }

    // Log the raw linescore data for debugging
    console.debug(`[GameScores] Raw linescore for ${team}:`, JSON.stringify(linescore));

    // Ensure we have a valid array of numbers
    return linescore
      .map((score, index) => {
        // Handle empty string case explicitly
        if (score === '') {
          console.warn(
            `[GameScores] Empty string score at index ${index} for ${team}, defaulting to 0`
          );
          return 0;
        }

        // Handle null/undefined
        if (score === null || score === undefined) {
          console.warn(
            `[GameScores] Null/undefined score at index ${index} for ${team}, defaulting to 0`
          );
          return 0;
        }

        // Convert to number and validate
        const numScore = Number(score);
        if (isNaN(numScore)) {
          console.warn(`[GameScores] Non-numeric score at index ${index} for ${team}:`, {
            score,
            type: typeof score,
            rawValue: JSON.stringify(score),
          });
          return 0;
        }

        // Ensure it's a valid integer
        return Math.floor(numScore);
      })
      .filter(score => !isNaN(score)); // Remove any NaN values that might have slipped through
  };

  const processTeamScores = (team: 'home' | 'visitors') => {
    const teamScores = (scoresObj[team] || {}) as {
      win?: unknown;
      loss?: unknown;
      series?: { win?: unknown; loss?: unknown };
      linescore?: unknown;
      points?: unknown;
    };

    return {
      win: Number(teamScores.win) || 0,
      loss: Number(teamScores.loss) || 0,
      series: {
        win: Number(teamScores.series?.win) || 0,
        loss: Number(teamScores.series?.loss) || 0,
      },
      linescore: processLinescore(teamScores.linescore, team),
      points: Number(teamScores.points) || 0,
    };
  };

  return {
    home: processTeamScores('home'),
    visitors: processTeamScores('visitors'),
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

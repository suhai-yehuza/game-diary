import DataLoader from 'dataloader';
import { inArray, type InferSelectModel } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { getCache } from '@/lib/cache';
import * as schema from '@/lib/db/schema';
import { db } from '@/lib/db/seed';
import { FRIENDSHIP_STATUS, REACTION_EMOJIS } from '@/lib/types/config.types';
import type {
  Game,
  GameLog,
  Comment,
  Reaction,
  Friendship,
  ReactionEmojiType,
  ParentType,
  Player,
  UserSummary,
  Team,
  Maybe,
  BirthInfo,
  NbaInfo,
  HeightInfo,
  WeightInfo,
  GameDate,
} from '@/lib/types/generated/graphql';
import type { DbGame, DBComment, DBReaction } from '@/lib/types/generated/types';

const isDateObj = (d: unknown): d is Date =>
  typeof d === 'object' && d !== null && Object.prototype.toString.call(d) === '[object Date]';

// Helper function to convert emoji character back to key
const getEmojiKey = (emojiCharacter: string): ReactionEmojiType => {
  const entry = Object.entries(REACTION_EMOJIS).find(([, char]) => char === emojiCharacter);
  return (entry?.[0] || emojiCharacter) as ReactionEmojiType;
};

export function createLoaders(db: NeonHttpDatabase<typeof schema>) {
  const userLoader = new DataLoader<string, UserSummary>(async userIds => {
    const users = await db.query.users.findMany({
      where: inArray(schema.users.id, Array.from(userIds)),
    });
    const results = userIds.map(id => {
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
    return results as ArrayLike<UserSummary | Error>;
  });

  const gameLoader = new DataLoader<string, Game | null>(async (ids: readonly string[]) => {
    const games = await db
      .select()
      .from(schema.nba_games)
      .where(inArray(schema.nba_games.id, Array.from(ids)));

    return ids.map(id => {
      const game = games.find(g => g.id === id);
      if (!game) {
        return null;
      }

      console.log('DB game value:', game);

      const homeTeamId = game.teams?.home?.id || '';
      const awayTeamId = game.teams?.visitors?.id || '';
      const arena =
        typeof game.arena === 'string'
          ? { name: game.arena, city: '', state: null, country: null }
          : game.arena
            ? {
                name: game.arena.name || '',
                city: game.arena.city || '',
                state: game.arena.state || null,
                country: game.arena.country || null,
              }
            : null;

      return {
        id: game.id,
        date: {
          start: isDateObj(game.date)
            ? game.date
            : game.date && typeof game.date === 'object' && 'start' in game.date
              ? new Date(game.date.start)
              : new Date(0),
          end: null,
          duration: null,
        } as GameDate,
        status: {
          clock: game.status?.clock || null,
          halftime: game.status?.halftime || false,
          short: game.status?.short || '',
          long: game.status?.long || '',
        },
        arena,
        league: game.league,
        season: game.season,
        stage: game.stage,
        periods: {
          current:
            typeof game.periods === 'object' && game.periods !== null
              ? (game.periods as { current: number }).current
              : 0,
          total: 4,
          endOfPeriod: false,
        },
        teams: game.teams || {
          home: { id: '', name: '', nickname: '', code: '', logo: null },
          visitors: { id: '', name: '', nickname: '', code: '', logo: null },
        },
        scores: game.scores
          ? {
              home: {
                win: game.scores.home.win,
                loss: game.scores.home.loss,
                series: {
                  win: game.scores.home.series.win,
                  loss: game.scores.home.series.loss,
                },
                linescore: game.scores.home.linescore.map(Number),
                points: game.scores.home.points,
              },
              visitors: {
                win: game.scores.visitors.win,
                loss: game.scores.visitors.loss,
                series: {
                  win: game.scores.visitors.series.win,
                  loss: game.scores.visitors.series.loss,
                },
                linescore: game.scores.visitors.linescore.map(Number),
                points: game.scores.visitors.points,
              },
            }
          : {
              home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
              visitors: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
            },
        officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
        timesTied: game.timesTied ?? null,
        leadChanges: game.leadChanges ?? null,
        nugget: game.nugget || null,
        createdAt: new Date(game.createdAt),
        updatedAt: new Date(game.updatedAt),
        homeTeamId,
        awayTeamId,
        isCompleted:
          typeof game.status === 'object' && game.status !== null && 'long' in game.status
            ? game.status.long === 'Finished'
            : false,
        awayScore: game.scores?.visitors?.points ?? null,
        homeScore: game.scores?.home?.points ?? null,
        gameType: 'REGULAR',
        nbaGameId: game.id,
        __typename: 'Game',
      } as Game;
    });
  });

  const teamLoader = new DataLoader<string, Team | null>(async ids => {
    const results = await db
      .select()
      .from(schema.teams)
      .where(inArray(schema.teams.id, Array.from(ids)));

    const teamMap = new Map<string, Team>();
    results.forEach(team => {
      teamMap.set(team.id, {
        id: team.id,
        name: team.name,
        city: team.city,
        conference: team.conference ?? null,
        division: team.division ?? null,
        abbreviation: team.abbreviation,
        logoUrl: team.logoUrl ?? null,
        primaryColor: team.primaryColor ?? null,
        secondaryColor: team.secondaryColor ?? null,
        code: team.abbreviation ?? null,
        logo: team.logoUrl ?? null,
        nickname: team.name ?? null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      });
    });

    return ids.map(id => teamMap.get(id) || null);
  });

  const playerLoader = new DataLoader<string, Player | null>(async ids => {
    const results = await db
      .select()
      .from(schema.nba_players)
      .where(inArray(schema.nba_players.id, Array.from(ids)));

    const playerMap = new Map<string, Player>();
    results.forEach(player => {
      playerMap.set(player.id, {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        birth: player.birth as Maybe<BirthInfo>,
        nba: player.nba as Maybe<NbaInfo>,
        height: player.height as Maybe<HeightInfo>,
        weight: player.weight as Maybe<WeightInfo>,
        college: player.college,
        affiliation: player.affiliation,
        leagues: {
          standard: {
            pos: player.pos,
            jersey: player.jersey,
            active: player.active,
            conference: null,
            division: null,
          },
          sacramento: null,
          utah: null,
          vegas: null,
        },
        seasons_active: player.seasonsActive
          ? player.seasonsActive.map((s: { season: number; teamIds: string[] }) => ({
              season: s.season,
              teams: s.teamIds,
            }))
          : null,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      });
    });

    return ids.map(id => playerMap.get(id) || null);
  });

  const dbGameLoader = createDbGameLoader();
  const gameLogsLoader = createGameLogsLoader(userLoader, dbGameLoader);

  const commentLoader = new DataLoader<string, Comment | null>(async ids => {
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
        parentType: (comment.parentType?.toLowerCase() || 'comment') as ParentType,
        content: comment.content || '',
        createdAt: new Date(comment.createdAt),
        updatedAt: new Date(comment.updatedAt),
        deletedAt: comment.deletedAt,
        user: null as unknown as UserSummary,
        reactions: [],
      });
    });

    return ids.map(id => commentMap.get(id) || null);
  });

  const reactionLoader = new DataLoader<string, Reaction | null>(async ids => {
    const results = await db
      .select()
      .from(schema.reactions)
      .where(inArray(schema.reactions.id, Array.from(ids)));

    const reactionMap = new Map<string, Reaction>();
    results.forEach(reaction => {
      reactionMap.set(reaction.id, {
        id: reaction.id,
        userId: reaction.userId || '',
        targetId: reaction.targetId || '',
        targetType: (reaction.targetType || 'comment') as ParentType,
        emoji: getEmojiKey(reaction.emoji) as ReactionEmojiType,
        createdAt: new Date(reaction.createdAt),
        updatedAt: reaction.updatedAt,
        user: null as unknown as UserSummary,
      });
    });

    return ids.map(id => reactionMap.get(id) || null);
  });

  const friendshipLoader = new DataLoader<string, Friendship | null>(async ids => {
    const results = await db
      .select()
      .from(schema.friendships)
      .where(inArray(schema.friendships.id, Array.from(ids)));

    const friendshipMap = new Map<string, Friendship>();
    results.forEach(friendship => {
      friendshipMap.set(friendship.id, {
        id: friendship.id,
        userId: friendship.userId || '',
        subscriberId: friendship.friendId || '',
        status: (friendship.status ||
          'PENDING') as (typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS],
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
        initiator: null as unknown as UserSummary,
        recipient: null as unknown as UserSummary,
      });
    });

    return ids.map(id => friendshipMap.get(id) || null);
  });

  return {
    user: userLoader,
    game: gameLoader,
    team: teamLoader,
    player: playerLoader,
    dbGame: dbGameLoader,
    gameLog: gameLogsLoader,
    comment: commentLoader,
    reaction: reactionLoader,
    friendship: friendshipLoader,
  };
}

// Team Loader
export const createTeamLoader = () => {
  return new DataLoader<string, Team | null>(async teamIds => {
    const teamRecords = await db.query.teams.findMany({
      where: inArray(schema.teams.id, Array.from(teamIds)),
    });
    return teamIds.map(id => {
      const team = teamRecords.find((t: InferSelectModel<typeof schema.teams>) => t.id === id);
      if (!team) return null;
      return {
        id: team.id,
        name: team.name,
        nickname: team.name ?? null,
        code: team.abbreviation ?? null,
        city: team.city,
        logo: team.logoUrl ?? null,
        conference: team.conference ?? null,
        division: team.division ?? null,
        abbreviation: team.abbreviation ?? null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        logoUrl: team.logoUrl ?? null,
        primaryColor: team.primaryColor ?? null,
        secondaryColor: team.secondaryColor ?? null,
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
      const game = games.find((g: InferSelectModel<typeof schema.nba_games>) => g.id === id);
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
        date:
          game.date && typeof game.date === 'object' && 'start' in game.date
            ? {
                start: new Date(game.date.start),
                end: game.date.end ? new Date(game.date.end) : null,
                duration: game.date.duration,
              }
            : {
                start: isDateObj(game.date) ? game.date : new Date(game.date || 0),
                end: null,
                duration: null,
              },
        status:
          typeof game.status === 'object' && game.status !== null
            ? {
                ...game.status,
                short: String(game.status.short || ''),
              }
            : { clock: '', halftime: false, short: '', long: '' },
        arena: {
          name: typeof game.arena === 'string' ? game.arena : game.arena?.name || '',
          city: typeof game.arena === 'string' ? '' : game.arena?.city || '',
          state: typeof game.arena === 'string' ? null : game.arena?.state || null,
          country: typeof game.arena === 'string' ? null : game.arena?.country || null,
        },
        league: game.league,
        season: game.season,
        stage: game.stage,
        periods: {
          current:
            typeof game.periods === 'object' && game.periods !== null
              ? (game.periods as { current: number }).current
              : 0,
          total: 4,
          endOfPeriod: false,
        },
        teams: game.teams
          ? {
              home: {
                id: String(game.teams.home.id),
                name: game.teams.home.name,
                nickname: game.teams.home.nickname,
                code: game.teams.home.code || '',
                logo: game.teams.home.logo || null,
              },
              visitors: {
                id: String(game.teams.visitors.id),
                name: game.teams.visitors.name,
                nickname: game.teams.visitors.nickname,
                code: game.teams.visitors.code || '',
                logo: game.teams.visitors.logo || null,
              },
            }
          : null,
        scores: game.scores || { home: { points: 0 }, visitors: { points: 0 } },
        officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
        timesTied: game.timesTied || 0,
        leadChanges: game.leadChanges || 0,
        nugget: game.nugget || null,
        createdAt: new Date(game.createdAt),
        updatedAt: new Date(game.updatedAt),
        homeTeamId,
        awayTeamId,
        isCompleted:
          typeof game.status === 'object' && game.status !== null && 'long' in game.status
            ? game.status.long === 'Finished'
            : false,
        awayScore: game.scores?.visitors?.points ?? null,
        homeScore: game.scores?.home?.points ?? null,
        gameType: 'REGULAR',
        nbaGameId: game.id,
      } satisfies Game;
    });
  });
};

// Database Game Loader
export const createDbGameLoader = () => {
  return new DataLoader<string, DbGame | null>(async (ids: readonly string[]) => {
    const games = await db
      .select()
      .from(schema.nba_games)
      .where(inArray(schema.nba_games.id, Array.from(ids)));

    return ids.map(id => {
      const game = games.find((g: InferSelectModel<typeof schema.nba_games>) => g.id === id);
      if (!game) {
        return null;
      }

      const gameData = {
        id: game.id,
        date: {
          start: isDateObj(game.date)
            ? game.date.toISOString()
            : game.date && typeof game.date === 'object' && 'start' in game.date
              ? new Date(game.date.start).toISOString()
              : new Date(0).toISOString(),
          end: null,
          duration: null,
        },
        status: {
          clock:
            typeof game.status === 'object' && game.status !== null
              ? game.status.clock || null
              : null,
          halftime:
            typeof game.status === 'object' && game.status !== null
              ? game.status.halftime || false
              : false,
          short:
            typeof game.status === 'object' && game.status !== null
              ? String(game.status.short || '')
              : '',
          long:
            typeof game.status === 'object' && game.status !== null ? game.status.long || '' : '',
        },
        arena: {
          name: typeof game.arena === 'string' ? game.arena : game.arena?.name || '',
          city: typeof game.arena === 'string' ? '' : game.arena?.city || '',
          state: typeof game.arena === 'string' ? null : game.arena?.state || null,
          country: typeof game.arena === 'string' ? null : game.arena?.country || null,
        },
        league: game.league,
        season: game.season ?? 0,
        stage: game.stage ?? 0,
        periods: {
          current:
            typeof game.periods === 'object' && game.periods !== null
              ? (game.periods as { current: number }).current
              : 0,
          total: 4,
          endOfPeriod: false,
        },
        teams: game.teams
          ? {
              home: {
                id: String(game.teams.home.id),
                name: game.teams.home.name,
                nickname: game.teams.home.nickname,
                code: game.teams.home.code || '',
                logo: game.teams.home.logo || null,
              },
              visitors: {
                id: String(game.teams.visitors.id),
                name: game.teams.visitors.name,
                nickname: game.teams.visitors.nickname,
                code: game.teams.visitors.code || '',
                logo: game.teams.visitors.logo || null,
              },
            }
          : null,
        scores: game.scores
          ? {
              home: {
                win: game.scores.home.win || 0,
                loss: game.scores.home.loss || 0,
                series: {
                  win: game.scores.home.series?.win || 0,
                  loss: game.scores.home.series?.loss || 0,
                },
                linescore: Array.isArray(game.scores.home.linescore)
                  ? game.scores.home.linescore.map(Number)
                  : [],
                points: game.scores.home.points || 0,
              },
              visitors: {
                win: game.scores.visitors.win || 0,
                loss: game.scores.visitors.loss || 0,
                series: {
                  win: game.scores.visitors.series?.win || 0,
                  loss: game.scores.visitors.series?.loss || 0,
                },
                linescore: Array.isArray(game.scores.visitors.linescore)
                  ? game.scores.visitors.linescore.map(Number)
                  : [],
                points: game.scores.visitors.points || 0,
              },
            }
          : null,
        officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
        timesTied: game.timesTied || 0,
        leadChanges: game.leadChanges || 0,
        nugget: game.nugget || null,
        createdAt: new Date(game.createdAt).toISOString(),
        updatedAt: new Date(game.updatedAt).toISOString(),
        homeTeamId: game.teams?.home?.id?.toString() || '',
        awayTeamId: game.teams?.visitors?.id?.toString() || '',
        isCompleted:
          typeof game.status === 'object' && game.status !== null && 'long' in game.status
            ? game.status.long === 'Finished'
            : false,
        awayScore: game.scores?.visitors?.points ?? null,
        homeScore: game.scores?.home?.points ?? null,
        gameType: 'REGULAR',
        nbaGameId: game.id,
      } as unknown as DbGame;

      return gameData;
    });
  });
};

// Game Logs Loader
export const createGameLogsLoader = (
  userLoader: DataLoader<string, UserSummary>,
  dbGameLoader: DataLoader<string, DbGame | null>
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
    const games = await dbGameLoader.loadMany(gameIds);

    const results = keys.map(key => {
      const log = logs.find(l => l.id === key);
      if (!log) return null;
      const user = users[userIds.indexOf(log.userId || '')] as UserSummary;
      const dbGame = games[gameIds.indexOf(log.gameId)] as DbGame;
      if (!dbGame) return null;

      const game: Game = {
        id: dbGame.id,
        date:
          dbGame.date && typeof dbGame.date === 'object' && 'start' in dbGame.date
            ? {
                start: new Date(dbGame.date.start),
                end: dbGame.date.end ? new Date(dbGame.date.end) : null,
                duration: dbGame.date.duration,
              }
            : {
                start: isDateObj(dbGame.date) ? dbGame.date : new Date(dbGame.date || 0),
                end: null,
                duration: null,
              },
        status: {
          clock: dbGame.status?.clock || null,
          halftime: false,
          long: '',
          short: '',
          __typename: 'GameStatus',
        },
        homeTeamId: dbGame.homeTeamId,
        awayTeamId: dbGame.awayTeamId,
        createdAt: new Date(dbGame.createdAt),
        updatedAt: new Date(dbGame.updatedAt),
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
            ? dbGame.status.long === 'Finished'
            : false,
        awayScore: dbGame.scores?.visitors?.points || null,
        homeScore: dbGame.scores?.home?.points || null,
        gameType: 'REGULAR',
        nbaGameId: dbGame.id,
        __typename: 'Game',
      };

      return {
        id: log.id,
        gameId: log.gameId,
        userId: log.userId || '',
        game,
        user,
        classification: log.classification,
        notes: log.notes || undefined,
        rating: log.ratingForGame,
        ratingForGame: log.ratingForGame,
        ratingStars: log.ratingStars ? parseInt(log.ratingStars) : undefined,
        tags: log.tags || [],
        watchedDate: log.watchedDate,
        watchedSetting: log.watchedSetting,
        watchedLocation: log.watchedLocation || undefined,
        watchedCount: log.watchedCount,
        createdAt: new Date(log.createdAt),
        updatedAt: new Date(log.updatedAt),
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
        reactions: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
        __typename: 'GameLog',
      } as GameLog;
    });

    return results;
  });
};

// Comments Loader
export const createCommentsLoader = (userLoader: DataLoader<string, UserSummary>) => {
  return new DataLoader<string, DBComment[]>(async parentIds => {
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
          parentType: comment.parentType,
          reactions: [],
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
          deletedAt: comment.deletedAt || undefined,
        } as DBComment;
      });
    });

    return results as ArrayLike<Error | DBComment[]>;
  });
};

// Reactions Loader
export const createReactionsLoader = (userLoader: DataLoader<string, UserSummary>) => {
  return new DataLoader<string, DBReaction[]>(async targetIds => {
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
          emoji: reaction.emoji,
          user,
          userId: reaction.userId || '',
          targetId: reaction.targetId,
          targetType: reaction.targetType,
          createdAt: new Date(reaction.createdAt),
        } as DBReaction;
      });
    });

    return results as ArrayLike<Error | DBReaction[]>;
  });
};

// Cache-aware DataLoader
export const createCacheAwareLoader = <T>(
  batchLoadFn: (keys: readonly string[]) => Promise<(T | null)[]>,
  cacheKeyFn: (key: string) => string,
  ttl: number
) => {
  return new DataLoader<string, T | null>(async keys => {
    // Try to get from cache first
    const cacheKeys = keys.map(cacheKeyFn);
    const cachedValues = await Promise.all(cacheKeys.map(key => getCache().get(key)));

    // Find keys that weren't in cache
    const uncachedKeys = keys.filter((_, i) => !cachedValues[i]);
    const uncachedValues = uncachedKeys.length > 0 ? await batchLoadFn(uncachedKeys) : [];

    // Cache the new values
    await Promise.all(
      uncachedValues.map((value: T | null, i: number) =>
        value ? getCache().set(cacheKeys[i], value, ttl) : Promise.resolve()
      )
    );

    // Combine cached and newly fetched values
    const results = keys.map(
      (_, i) => cachedValues[i] || uncachedValues[keys.indexOf(uncachedKeys[i])] || null
    ) as ArrayLike<T | null>;

    return results;
  });
};

export const createDbGameBySeasonLoader = () => {
  return new DataLoader<number, DbGame[]>(async (seasons: readonly number[]) => {
    const games = await db
      .select()
      .from(schema.nba_games)
      .where(inArray(schema.nba_games.season, Array.from(seasons)));

    return seasons.map(season => {
      return games
        .filter((game: InferSelectModel<typeof schema.nba_games>) => game.season === season)
        .map(game => {
          const gameData: DbGame = {
            id: game.id,
            date:
              game.date && typeof game.date === 'object' && 'start' in game.date
                ? game.date
                : {
                    start: isDateObj(game.date)
                      ? (game.date as Date).toISOString()
                      : new Date(game.date || 0).toISOString(),
                    end: null,
                    duration: null,
                  },
            status: game.status,
            homeTeamId: game.teams?.home?.id?.toString() || '',
            awayTeamId: game.teams?.visitors?.id?.toString() || '',
            createdAt:
              game.createdAt instanceof Date
                ? game.createdAt.toISOString()
                : new Date(game.createdAt).toISOString(),
            updatedAt:
              game.updatedAt instanceof Date
                ? game.updatedAt.toISOString()
                : new Date(game.updatedAt).toISOString(),
            arena: game.arena,
            league: game.league,
            season: game.season,
            stage: game.stage,
            periods: {
              current:
                typeof game.periods === 'object' && game.periods !== null
                  ? (game.periods as { current: number }).current
                  : 0,
              total: 4,
              endOfPeriod: false,
            },
            teams: game.teams
              ? {
                  home: {
                    ...game.teams.home,
                    id: game.teams.home.id.toString(),
                    logo: game.teams.home.logo || null,
                  },
                  visitors: {
                    ...game.teams.visitors,
                    id: game.teams.visitors.id.toString(),
                    logo: game.teams.visitors.logo || null,
                  },
                }
              : null,
            scores: game.scores
              ? {
                  home: {
                    ...game.scores.home,
                    linescore: game.scores.home.linescore.map(score => Number(score)),
                  },
                  visitors: {
                    ...game.scores.visitors,
                    linescore: game.scores.visitors.linescore.map(score => Number(score)),
                  },
                }
              : null,
            officials: game.officials,
            timesTied: game.timesTied || 0,
            leadChanges: game.leadChanges || 0,
            nugget: game.nugget || null,
            isCompleted:
              typeof game.status === 'object' && game.status !== null && 'long' in game.status
                ? game.status.long === 'Finished'
                : false,
            awayScore: game.scores?.visitors?.points || null,
            homeScore: game.scores?.home?.points || null,
            gameType: 'REGULAR',
            nbaGameId: game.id,
          };

          return gameData;
        });
    });
  });
};

import DataLoader from 'dataloader';
import { inArray, type InferSelectModel } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { getCache } from '@/lib/cache';
import * as schema from '@/lib/db/schema';
import { db } from '@/lib/db/seed';
import { FRIENDSHIP_STATUS } from '@/lib/types/config.types';
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
} from '@/lib/types/generated/graphql';
import type { DbGame, DBComment, DBReaction } from '@/lib/types/generated/types';

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
        first_name: user.first_name || 'missing-first-name',
        last_name: user.last_name || 'missing-last-name',
        email_address: user.email_address || '',
        imageUrl: user.image_url || undefined,
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

      const homeTeamId = game.teams?.home?.id || '';
      const awayTeamId = game.teams?.visitors?.id || '';
      const arena =
        typeof game.arena === 'string'
          ? game.arena
          : JSON.stringify(game.arena || { name: '', city: '' });

      return {
        id: game.id,
        date: {
          start: game.date,
          end: null,
          duration: null,
          __typename: 'GameDate',
        },
        status: {
          clock: game.periods?.current?.toString() || '',
        },
        homeTeamId,
        awayTeamId,
        created_at: game.created_at,
        updated_at: game.updated_at,
        arena,
        league: game.league,
        season: game.season,
        stage: game.stage,
        periods: game.periods || { current: 0 },
        teams: game.teams || {
          home: { id: '', name: '', nickname: '', logo: undefined },
          visitors: { id: '', name: '', nickname: '', logo: undefined },
        },
        scores: game.scores || {
          home: { points: 0 },
          visitors: { points: 0 },
        },
        officials: game.officials || [],
        timesTied: game.times_tied || undefined,
        leadChanges: game.lead_changes || undefined,
        nugget: game.nugget || undefined,
        isCompleted: game.status === 'FINISHED',
        away_score: game.scores?.visitors?.points || null,
        home_score: game.scores?.home?.points || null,
        game_type: 'REGULAR',
        nba_game_id: game.id,
        __typename: 'Game',
      } as unknown as Game;
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
        logo_url: team.logo_url ?? null,
        primary_color: team.primary_color ?? null,
        secondary_color: team.secondary_color ?? null,
        code: team.abbreviation ?? null,
        logo: team.logo_url ?? null,
        nickname: team.name ?? null,
        created_at: new Date(0),
        updated_at: new Date(0),
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
        first_name: player.firstname,
        last_name: player.lastname,
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
        seasons_active: player.seasons_active
          ? player.seasons_active.map(s => ({
              season: s.season,
              teams: s.team_ids,
            }))
          : null,
        created_at: player.created_at,
        updated_at: player.updated_at,
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
        userId: comment.user_id || '',
        parent_id: comment.parent_id || '',
        parent_type: (comment.parent_type?.toLowerCase() || 'comment') as ParentType,
        content: comment.content || '',
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        deleted_at: comment.deleted_at,
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
        userId: reaction.user_id || '',
        targetId: reaction.target_id || '',
        targetType: (reaction.target_type || 'comment') as ParentType,
        emoji: (reaction.emoji || 'LIKE') as ReactionEmojiType,
        created_at: reaction.created_at,
        updated_at: reaction.updated_at,
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
        userId: friendship.user_id || '',
        subscriberId: friendship.friend_id || '',
        status: (friendship.status ||
          'PENDING') as (typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS],
        created_at: friendship.created_at,
        updated_at: friendship.updated_at,
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
        logo: team.logo_url ?? null,
        conference: team.conference ?? null,
        division: team.division ?? null,
        abbreviation: team.abbreviation ?? null,
        created_at: new Date(0),
        updated_at: new Date(0),
        logo_url: team.logo_url ?? null,
        primary_color: team.primary_color ?? null,
        secondary_color: team.secondary_color ?? null,
        __typename: 'Team',
      } as Team;
    });
  });
};

// Game Loader with Stats
export const createGameLoader = () => {
  return new DataLoader<string, DbGame | null>(async gameIds => {
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
          game.date instanceof Date
            ? game.date
            : typeof game.date === 'string' || typeof game.date === 'number'
              ? new Date(game.date)
              : new Date(),
        status:
          typeof game.status === 'string'
            ? { clock: game.status }
            : game.status && typeof game.status === 'object'
              ? (game.status as { clock: string })
              : { clock: 'Unknown' },
        arena:
          typeof game.arena === 'string'
            ? { name: game.arena, city: '' }
            : game.arena && typeof game.arena === 'object'
              ? (game.arena as { name: string; city: string })
              : { name: '', city: '' },
        league: game.league,
        season: game.season_id ?? 0,
        stage: game.stage,
        periods:
          typeof game.periods === 'object' && game.periods !== null
            ? (game.periods as { current: number })
            : { current: 0 },
        teams: game.teams || {
          home: { id: '', name: '', nickname: '', logo: undefined },
          visitors: { id: '', name: '', nickname: '', logo: undefined },
        },
        scores: game.scores || { home: { points: 0 }, visitors: { points: 0 } },
        officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
        timesTied: game.times_tied || undefined,
        leadChanges: game.lead_changes || undefined,
        nugget: game.nugget || undefined,
        created_at: game.created_at,
        updated_at: game.updated_at,
        homeTeamId,
        awayTeamId,
        isCompleted: game.status === 'Finished',
      } as DbGame;
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

      const homeTeamId = game.teams?.home?.id || '';
      const awayTeamId = game.teams?.visitors?.id || '';
      const arena =
        typeof game.arena === 'string'
          ? { name: '', city: '' }
          : game.arena || { name: '', city: '' };

      return {
        id: game.id,
        date: game.date,
        status: {
          clock: game.periods?.current?.toString() || '',
        },
        homeTeamId,
        awayTeamId,
        created_at: game.created_at,
        updated_at: game.updated_at,
        arena,
        league: game.league,
        season: game.season,
        stage: game.stage,
        periods: game.periods || { current: 0 },
        teams: game.teams || {
          home: { id: '', name: '', nickname: '', logo: undefined },
          visitors: { id: '', name: '', nickname: '', logo: undefined },
        },
        scores: game.scores || {
          home: { points: 0 },
          visitors: { points: 0 },
        },
        officials: game.officials || [],
        timesTied: game.times_tied || undefined,
        leadChanges: game.lead_changes || undefined,
        nugget: game.nugget || undefined,
        isCompleted: game.status === 'FINISHED',
      } as unknown as DbGame;
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
      .map((log: InferSelectModel<typeof schema.game_logs>) => log.user_id)
      .filter((id): id is string => id !== null);
    const gameIds = logs.map((log: InferSelectModel<typeof schema.game_logs>) => log.game_id);
    const users = await userLoader.loadMany(userIds);
    const games = await dbGameLoader.loadMany(gameIds);

    const results = keys.map(key => {
      const log = logs.find(l => l.id === key);
      if (!log) return null;
      const user = users[userIds.indexOf(log.user_id || '')] as UserSummary;
      const dbGame = games[gameIds.indexOf(log.game_id)] as DbGame;
      if (!dbGame) return null;

      const game: Game = {
        id: dbGame.id,
        date: {
          start: dbGame.date,
          end: null,
          duration: null,
          __typename: 'GameDate',
        },
        status: {
          clock: dbGame.status.clock,
          halftime: false,
          long: '',
          short: '',
          __typename: 'GameStatus',
        },
        homeTeamId: dbGame.homeTeamId,
        awayTeamId: dbGame.awayTeamId,
        created_at: dbGame.created_at,
        updated_at: dbGame.updated_at,
        arena: typeof dbGame.arena === 'string' ? dbGame.arena : JSON.stringify(dbGame.arena),
        league: dbGame.league,
        season: dbGame.season,
        stage: dbGame.stage,
        periods: dbGame.periods,
        teams: dbGame.teams,
        scores: dbGame.scores,
        officials: dbGame.officials,
        timesTied: dbGame.timesTied || null,
        leadChanges: dbGame.leadChanges || null,
        nugget: dbGame.nugget || null,
        isCompleted: dbGame.isCompleted,
        away_score: dbGame.scores?.visitors?.points || null,
        home_score: dbGame.scores?.home?.points || null,
        game_type: 'REGULAR',
        nba_game_id: dbGame.id,
        __typename: 'Game',
      };

      return {
        id: log.id,
        gameId: log.game_id,
        userId: log.user_id || '',
        game,
        user,
        classification: log.classification,
        notes: log.notes || undefined,
        rating: log.rating_for_game,
        ratingForGame: log.rating_for_game,
        ratingStars: log.rating_stars ? parseInt(log.rating_stars) : undefined,
        tags: log.tags || [],
        watchedDate: log.watched_date,
        watchedSetting: log.watched_setting,
        watchedLocation: log.watched_location || undefined,
        watchedCount: log.watched_count,
        created_at: log.created_at,
        updated_at: log.updated_at,
        deleted_at: log.deleted_at,
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
      where: inArray(schema.comments.parent_id, Array.from(parentIds)),
    });
    const userIds = commentRecords
      .map(comment => comment.user_id)
      .filter((id): id is string => id !== null);
    const users = await userLoader.loadMany(userIds);

    const results = parentIds.map(id => {
      const comments = commentRecords.filter(comment => comment.parent_id === id);
      return comments.map(comment => {
        const user = users[userIds.indexOf(comment.user_id || '')] as UserSummary;
        return {
          id: comment.id,
          content: comment.content,
          user,
          userId: comment.user_id || '',
          parent_id: comment.parent_id,
          parent_type: comment.parent_type,
          reactions: [],
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          deleted_at: comment.deleted_at || undefined,
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
      where: inArray(schema.reactions.target_id, Array.from(targetIds)),
    });
    const userIds = reactionRecords
      .map(reaction => reaction.user_id)
      .filter((id): id is string => id !== null);
    const users = await userLoader.loadMany(userIds);

    const results = targetIds.map(id => {
      const reactions = reactionRecords.filter(reaction => reaction.target_id === id);
      return reactions.map(reaction => {
        const user = users[userIds.indexOf(reaction.user_id || '')] as UserSummary;
        return {
          id: reaction.id,
          emoji: reaction.emoji,
          user,
          userId: reaction.user_id || '',
          targetId: reaction.target_id,
          targetType: reaction.target_type,
          created_at: reaction.created_at,
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

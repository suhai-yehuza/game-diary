import { and, eq, gt, lt, or, sql } from 'drizzle-orm';

import * as schema from '@/lib/db/schema';
import { fetchNbaLiveGames } from '@/lib/external-apis';
import { BusinessLogicError } from '@/lib/graphql/errors';
import { createConnection } from '@/lib/graphql/utils/pagination';
import type { Context } from '@/lib/types/context.types';
import { GameResponseData } from '@/lib/types/game.types';
import type { GameFilters } from '@/lib/types/generated/graphql';
import { getCurrentSeason } from '@/lib/utils/index';

import type { PaginationArgs } from '../common/types';
import { handleResolverError, mapGameData } from '../common/utils';

// Helper function to map live game data
const mapLiveGameData = (game: GameResponseData) => ({
  id: game.id,
  date: game.date || {
    start: '',
    end: '',
    duration: '',
  },
  status: game.status || {
    clock: '',
    halftime: false,
    long: '',
    short: '',
  },
  arena: game.arena || {
    name: '',
    city: '',
    state: '',
    country: '',
  },
  league: game.league || '',
  season: game.season || getCurrentSeason(),
  stage: game.stage || 0,
  periods: game.periods || {
    current: 0,
    total: 0,
    endOfPeriod: false,
  },
  scores: game.scores || {
    home: {
      points: 0,
    },
    visitors: {
      points: 0,
    },
  },
  officials: game.officials || [],
  timesTied: game.timesTied,
  leadChanges: game.leadChanges,
  nugget: game.nugget,
  homeTeamId: game.teams?.home?.id ?? '',
  awayTeamId: game.teams?.visitors?.id ?? '',
  teams: {
    home: game.teams?.home || null,
    visitors: game.teams?.visitors || null,
  },
  is_completed: game.status?.long === 'Finished',
  awayTeamScore: game.scores?.visitors?.points || null,
  homeTeamScore: game.scores?.home?.points || null,
  nbaGameId: String(game.id),
});

export const games = async (
  _parent: unknown,
  args: PaginationArgs & { filters?: GameFilters },
  { db }: Context
) => {
  try {
    const { first = 10, after, last, before, filters } = args;

    // Build the query
    const conditions = [];
    if (filters?.season) {
      conditions.push(eq(schema.nba_games.season, filters.season));
    }
    if (filters?.status) {
      conditions.push(sql`${schema.nba_games.status}->>'long' = ${filters.status}`);
    }
    if (filters?.teamId) {
      conditions.push(
        or(
          sql`${schema.nba_games.teams}->>'home'->>'id' = ${filters.teamId}`,
          sql`${schema.nba_games.teams}->>'visitors'->>'id' = ${filters.teamId}`
        )
      );
    }
    if (after) {
      conditions.push(gt(schema.nba_games.id, after));
    }
    if (before) {
      conditions.push(lt(schema.nba_games.id, before));
    }

    const limit = last || first || 10;
    const query = db
      .select()
      .from(schema.nba_games)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${schema.nba_games.date}->>'start' DESC`)
      .limit(limit + 1);

    // Execute query
    const items = await query;

    // Check if there are more items
    const hasNextPage = items.length > limit;
    const actualItems = hasNextPage ? items.slice(0, -1) : items;

    const mappedGames = actualItems.map(mapGameData);

    return createConnection(mappedGames, actualItems.length, args);
  } catch (error) {
    handleResolverError(error, 'fetch games');
  }
};

export const game = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  try {
    const game = await db
      .select()
      .from(schema.nba_games)
      .where(eq(schema.nba_games.id, id))
      .limit(1)
      .then(rows => rows[0]);

    if (!game) throw new BusinessLogicError(`Game with id ${id} not found`, 'GAME_NOT_FOUND');

    return mapGameData(game);
  } catch (error) {
    handleResolverError(error, 'fetch game');
  }
};

export const liveGames = async (
  _parent: unknown,
  args: PaginationArgs,
  { redis: _redis }: Context
) => {
  try {
    const liveGames = await fetchNbaLiveGames();

    // Handle empty response gracefully
    if (!liveGames || !liveGames.response || liveGames.response.length === 0) {
      return createConnection([], 0, args);
    }

    const mappedGames = liveGames.response.map(mapLiveGameData);

    return createConnection(mappedGames, mappedGames.length, args);
  } catch (error) {
    handleResolverError(error, 'fetch live games');
  }
};

export const gameLog = async (
  _parent: unknown,
  { userId, gameId }: { userId: string; gameId: string },
  { db }: Context
) => {
  try {
    const conditions = [eq(schema.game_logs.userId, userId), eq(schema.game_logs.gameId, gameId)];

    const gameLog = await db
      .select()
      .from(schema.game_logs)
      .where(and(...conditions))
      .limit(1)
      .then(rows => rows[0]);

    if (!gameLog) {
      return null;
    }

    return {
      id: gameLog.id,
      userId: gameLog.userId,
      gameId: gameLog.gameId,
      watchedSetting: gameLog.watchedSetting,
      watchedDate: gameLog.watchedDate,
      watchedLocation: gameLog.watchedLocation,
      ratingForGame: gameLog.ratingForGame,
      watchedCount: gameLog.watchedCount,
      notes: gameLog.notes,
      tags: gameLog.tags,
      classification: gameLog.classification,
      createdAt: gameLog.createdAt,
      updatedAt: gameLog.updatedAt,
      deletedAt: gameLog.deletedAt,
    };
  } catch (error) {
    handleResolverError(error, 'fetch game log');
  }
};

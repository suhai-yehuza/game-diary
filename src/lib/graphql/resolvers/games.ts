import { and, eq, or, sql } from 'drizzle-orm';

import * as schema from '@src/lib/db/schema';
import { fetchNbaLiveGames } from '@src/lib/external-apis';
import { BusinessLogicError } from '@src/lib/graphql/errors';
import { createConnection } from '@src/lib/graphql/utils';
import type { Context } from '@src/lib/types/component.types';
import type { GameResponseData } from '@src/lib/types/consolidated.types';
import type { GameFilters } from '@src/lib/types/generated/graphql';
import type { PaginationArgs } from '@src/lib/types/resolver.types';
import { getCurrentSeason } from '@src/lib/utils/index';

import { handleResolverError, mapGameData } from '../utils';

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
  scores: {
    home: {
      win: game.scores?.home?.win || 0,
      loss: game.scores?.home?.loss || 0,
      series: {
        win: game.scores?.home?.series?.win || 0,
        loss: game.scores?.home?.series?.loss || 0,
      },
      linescore: (game.scores?.home?.linescore || []).map((score: string | number) => {
        const numScore = typeof score === 'string' ? parseInt(score, 10) : score;
        return isNaN(numScore) ? 0 : numScore;
      }),
      points: game.scores?.home?.points || 0,
    },
    visitors: {
      win: game.scores?.visitors?.win || 0,
      loss: game.scores?.visitors?.loss || 0,
      series: {
        win: game.scores?.visitors?.series?.win || 0,
        loss: game.scores?.visitors?.series?.loss || 0,
      },
      linescore: (game.scores?.visitors?.linescore || []).map((score: string | number) => {
        const numScore = typeof score === 'string' ? parseInt(score, 10) : score;
        return isNaN(numScore) ? 0 : numScore;
      }),
      points: game.scores?.visitors?.points || 0,
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
  isCompleted: game.status?.long === 'Finished',
  awayTeamScore: game.scores?.visitors?.points || null,
  homeTeamScore: game.scores?.home?.points || null,
  nbaGameId: String(game.id),
  createdAt: game.date?.start || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  gameType: 'NBA',
});

export const games = async (
  _parent: unknown,
  args: PaginationArgs & { filters?: GameFilters },
  { db }: Context
) => {
  try {
    const { first = 1000, after, filters } = args;

    // Build the query conditions
    const conditions = [];
    if (filters?.season) {
      conditions.push(eq(schema.nba_games.season, filters.season));
    }
    if (filters?.status) {
      conditions.push(sql`${schema.nba_games.status}::jsonb->>'long' = ${filters.status}`);
    }
    if (filters?.teamId) {
      conditions.push(
        or(
          sql`${schema.nba_games.teams}::jsonb->'home'->>'id' = ${filters.teamId}`,
          sql`${schema.nba_games.teams}::jsonb->'visitors'->>'id' = ${filters.teamId}`
        )
      );
    }
    if (filters?.arena) {
      conditions.push(sql`${schema.nba_games.arena}::jsonb->>'name' ILIKE ${`%${filters.arena}%`}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get the total count
    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.nba_games)
      .where(whereClause);

    const totalCount = countResult?.count || 0;

    // Execute query with pagination
    const limit = first || 1000;
    const offset = after ? parseInt(Buffer.from(after, 'base64').toString(), 10) : 0;

    const query = db
      .select()
      .from(schema.nba_games)
      .where(whereClause)
      .orderBy(sql`${schema.nba_games.date}->>'start' DESC`)
      .limit(limit)
      .offset(offset);

    const items = await query;
    const mappedGames = items.map(mapGameData);

    return createConnection(mappedGames, totalCount, args);
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
      watchedScope: gameLog.watchedScope,
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

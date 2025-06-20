import type { InferSelectModel } from 'drizzle-orm';
import { and, eq, or, sql } from 'drizzle-orm';

import * as schema from '@src/lib/db/schema';
import { fetchNbaLiveGames } from '@src/lib/external-apis';
import { BusinessLogicError } from '@src/lib/graphql/errors';
import { createConnection, handleResolverError, mapGameData } from '@src/lib/graphql/utils';
import type {
  IContext,
  IGameResponseData,
  GameFilters,
  IPaginationArgs,
  IDatabaseRow,
  IGamePeriods,
  IGameScores,
  IGameTeams,
  IGameDate,
  IGameStatus,
  GameArena,
  IDBGameRecord,
} from '@src/lib/types';
import { getCurrentSeason } from '@src/lib/utils/index';

// Helper function to map live game data
function mapLiveGameData(game: IGameResponseData): IDBGameRecord {
  const date: IGameDate = {
    start:
      typeof game.date === 'string'
        ? game.date
        : (game.date as IGameDate)?.start || new Date().toISOString(),
    end: typeof game.date === 'string' ? null : (game.date as IGameDate)?.end || null,
    duration: typeof game.date === 'string' ? null : (game.date as IGameDate)?.duration || null,
  };

  const status: IGameStatus = {
    clock: typeof game.status === 'string' ? null : (game.status as IGameStatus)?.clock || null,
    halftime:
      typeof game.status === 'string' ? false : (game.status as IGameStatus)?.halftime || false,
    long:
      typeof game.status === 'string'
        ? game.status
        : (game.status as IGameStatus)?.long || 'Unknown',
    short:
      typeof game.status === 'string'
        ? game.status
        : (game.status as IGameStatus)?.short || 'Unknown',
  };

  const arena: GameArena =
    typeof game.arena === 'string'
      ? game.arena
      : {
          name: (game.arena as { name?: string })?.name || 'Unknown Arena',
          city: (game.arena as { city?: string })?.city || 'Unknown City',
          state: (game.arena as { state?: string })?.state || null,
          country: (game.arena as { country?: string })?.country || null,
        };

  const periods: IGamePeriods = {
    current: (game.periods as IGamePeriods)?.current || 1,
    total: (game.periods as IGamePeriods)?.total || 4,
    endOfPeriod: (game.periods as IGamePeriods)?.endOfPeriod || false,
  };

  const scores: IGameScores = {
    home: {
      win: (game.scores as IGameScores)?.home?.win || 0,
      loss: (game.scores as IGameScores)?.home?.loss || 0,
      series: {
        win: (game.scores as IGameScores)?.home?.series?.win || 0,
        loss: (game.scores as IGameScores)?.home?.series?.loss || 0,
      },
      linescore: (game.scores as IGameScores)?.home?.linescore || [],
      points: (game.scores as IGameScores)?.home?.points || 0,
    },
    visitors: {
      win: (game.scores as IGameScores)?.visitors?.win || 0,
      loss: (game.scores as IGameScores)?.visitors?.loss || 0,
      series: {
        win: (game.scores as IGameScores)?.visitors?.series?.win || 0,
        loss: (game.scores as IGameScores)?.visitors?.series?.loss || 0,
      },
      linescore: (game.scores as IGameScores)?.visitors?.linescore || [],
      points: (game.scores as IGameScores)?.visitors?.points || 0,
    },
  };

  const teams: IGameTeams = {
    home: {
      id: (game.teams as IGameTeams)?.home?.id || 0,
      name: (game.teams as IGameTeams)?.home?.name || 'Unknown Team',
      nickname: (game.teams as IGameTeams)?.home?.nickname || 'Unknown',
      code: (game.teams as IGameTeams)?.home?.code || 'UNK',
      logo: (game.teams as IGameTeams)?.home?.logo || '',
    },
    visitors: {
      id: (game.teams as IGameTeams)?.visitors?.id || 0,
      name: (game.teams as IGameTeams)?.visitors?.name || 'Unknown Team',
      nickname: (game.teams as IGameTeams)?.visitors?.nickname || 'Unknown',
      code: (game.teams as IGameTeams)?.visitors?.code || 'UNK',
      logo: (game.teams as IGameTeams)?.visitors?.logo || '',
    },
  };

  const officials = Array.isArray(game.officials)
    ? game.officials.map((official, index) => ({
        id: String(index),
        name: typeof official === 'string' ? official : (official as { name?: string }).name || '',
        position:
          typeof official === 'string'
            ? 'Referee'
            : (official as { position?: string }).position || 'Referee',
      }))
    : [];

  return {
    id: game.id || '',
    date,
    status,
    arena,
    league: typeof game.league === 'string' ? game.league : 'NBA',
    season: typeof game.season === 'number' ? game.season : getCurrentSeason(),
    stage: typeof game.stage === 'number' ? game.stage : 2,
    periods,
    scores,
    teams,
    officials,
    timesTied: typeof game.timesTied === 'number' ? game.timesTied : null,
    leadChanges: typeof game.leadChanges === 'number' ? game.leadChanges : null,
    nugget: typeof game.nugget === 'string' ? game.nugget : '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCompleted: game.isCompleted || false,
    awayTeamScore: game.awayTeamScore || 0,
    homeTeamScore: game.homeTeamScore || 0,
    gameType: game.gameType || 'regular',
    nbaGameId: game.nbaGameId || '',
  };
}

export const games = async (
  _parent: unknown,
  args: IPaginationArgs & { filters?: GameFilters },
  { db }: IContext
) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

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
    const mappedGames = items.map(game => {
      const dbRow: IDatabaseRow = {
        id: game.id,
        date: game.date || ({ start: '', end: null, duration: null } as IGameDate),
        status:
          game.status || ({ long: '', short: '', clock: null, halftime: false } as IGameStatus),
        arena: game.arena || ({ name: '', city: '', state: null, country: null } as GameArena),
        league: game.league,
        season: game.season,
        stage: game.stage,
        periods:
          game.periods ||
          ({
            current: 0,
            total: 0,
            endOfPeriod: false,
          } as IGamePeriods),
        scores: game.scores || {
          home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
          visitors: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
        },
        teams: game.teams || {
          home: { id: 0, name: '', nickname: '', code: '', logo: '' },
          visitors: { id: 0, name: '', nickname: '', code: '', logo: '' },
        },
        officials: Array.isArray(game.officials)
          ? game.officials.map((official, index) => ({
              id: String(index),
              name:
                typeof official === 'string'
                  ? official
                  : (official as { name?: string }).name || '',
              position:
                typeof official === 'string'
                  ? 'Referee'
                  : (official as { position?: string }).position || 'Referee',
            }))
          : [],
        timesTied: game.timesTied || 0,
        leadChanges: game.leadChanges || 0,
        nugget: game.nugget || '',
        createdAt: game.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: game.updatedAt?.toISOString() || new Date().toISOString(),
        isCompleted: game.status?.long === 'Finished' || false,
        awayTeamScore: game.scores?.visitors?.points || 0,
        homeTeamScore: game.scores?.home?.points || 0,
        gameType: 'REGULAR',
        nbaGameId: game.id,
      };
      return mapGameData(dbRow);
    });

    return createConnection(mappedGames, totalCount, args);
  } catch (error) {
    handleResolverError(error, 'fetch games');
  }
};

export const game = async (_parent: unknown, { id }: { id: string }, { db }: IContext) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const game = await db
      .select()
      .from(schema.nba_games)
      .where(eq(schema.nba_games.id, id))
      .limit(1)
      .then((rows: InferSelectModel<typeof schema.nba_games>[]) => rows[0]);

    if (!game) throw new BusinessLogicError(`Game with id ${id} not found`, 'GAME_NOT_FOUND');

    const gameDate = new Date(game.date?.start || new Date()).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'short',
    });
    const gameTime = new Date(game.date?.start || new Date()).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      timeStyle: 'short',
    });

    const dbRow: IDatabaseRow = {
      id: String(game.id),
      date: {
        start: gameDate,
        end: gameTime ?? null,
        duration: null,
      },
      status: game.status
        ? {
            long: game.status.long ?? '',
            short: game.status.short ?? '',
            clock: game.status.clock ?? null,
            halftime: game.status.halftime ?? false,
          }
        : {
            long: '',
            short: '',
            clock: null,
            halftime: false,
          },
      arena: game.arena
        ? {
            name: typeof game.arena === 'string' ? game.arena : (game.arena.name ?? ''),
            city: typeof game.arena === 'string' ? '' : (game.arena.city ?? ''),
            state: typeof game.arena === 'string' ? null : (game.arena.state ?? null),
            country: typeof game.arena === 'string' ? null : (game.arena.country ?? null),
          }
        : {
            name: '',
            city: '',
            state: null,
            country: null,
          },
      league: game.league || 'NBA',
      season: game.season || new Date().getFullYear(),
      stage: game.stage || 1,
      periods: game.periods
        ? {
            current: game.periods.current ?? 0,
            total: game.periods.total ?? 0,
            endOfPeriod: game.periods.endOfPeriod ?? false,
          }
        : {
            current: 0,
            total: 0,
            endOfPeriod: false,
          },
      officials: Array.isArray(game.officials)
        ? game.officials.map((official, index) => ({
            id: String(index),
            name:
              typeof official === 'string' ? official : (official as { name?: string }).name || '',
            position:
              typeof official === 'string'
                ? 'Referee'
                : (official as { position?: string }).position || 'Referee',
          }))
        : [],
      teams: game.teams
        ? {
            home: {
              id: Number(game.teams.home.id ?? 0),
              name: game.teams.home.name ?? '',
              nickname: game.teams.home.nickname ?? '',
              code: game.teams.home.code ?? '',
              logo: game.teams.home.logo ?? '',
            },
            visitors: {
              id: Number(game.teams.visitors.id ?? 0),
              name: game.teams.visitors.name ?? '',
              nickname: game.teams.visitors.nickname ?? '',
              code: game.teams.visitors.code ?? '',
              logo: game.teams.visitors.logo ?? '',
            },
          }
        : {
            home: {
              id: 0,
              name: '',
              nickname: '',
              code: '',
              logo: '',
            },
            visitors: {
              id: 0,
              name: '',
              nickname: '',
              code: '',
              logo: '',
            },
          },
      scores: game.scores
        ? {
            home: {
              win: game.scores.home.win ?? 0,
              loss: game.scores.home.loss ?? 0,
              series: {
                win: game.scores.home.series?.win ?? 0,
                loss: game.scores.home.series?.loss ?? 0,
              },
              linescore: Array.isArray(game.scores.home.linescore)
                ? game.scores.home.linescore
                : [],
              points: game.scores.home.points ?? 0,
            },
            visitors: {
              win: game.scores.visitors.win ?? 0,
              loss: game.scores.visitors.loss ?? 0,
              series: {
                win: game.scores.visitors.series?.win ?? 0,
                loss: game.scores.visitors.series?.loss ?? 0,
              },
              linescore: Array.isArray(game.scores.visitors.linescore)
                ? game.scores.visitors.linescore
                : [],
              points: game.scores.visitors.points ?? 0,
            },
          }
        : {
            home: {
              win: 0,
              loss: 0,
              series: {
                win: 0,
                loss: 0,
              },
              linescore: [],
              points: 0,
            },
            visitors: {
              win: 0,
              loss: 0,
              series: {
                win: 0,
                loss: 0,
              },
              linescore: [],
              points: 0,
            },
          },
      timesTied: game.timesTied || 0,
      leadChanges: game.leadChanges || 0,
      nugget: game.nugget || '',
      createdAt: game.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: game.updatedAt?.toISOString() || new Date().toISOString(),
      isCompleted: game.status?.long === 'Finished' || false,
      awayTeamScore: game.scores?.visitors?.points || 0,
      homeTeamScore: game.scores?.home?.points || 0,
      gameType: 'REGULAR',
      nbaGameId: game.id,
    };

    return mapGameData(dbRow);
  } catch (error) {
    handleResolverError(error, 'fetch game');
  }
};

export const liveGames = async (
  _parent: unknown,
  args: IPaginationArgs,
  { redis: _redis }: IContext
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
  { db }: IContext
) => {
  try {
    const conditions = [eq(schema.game_logs.userId, userId), eq(schema.game_logs.gameId, gameId)];

    if (!db) {
      throw new Error('Database connection not available');
    }

    const gameLog = await db
      .select()
      .from(schema.game_logs)
      .where(and(...conditions))
      .limit(1)
      .then((rows: InferSelectModel<typeof schema.game_logs>[]) => rows[0]);

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

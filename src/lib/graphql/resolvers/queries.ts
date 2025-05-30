import type { InferSelectModel } from 'drizzle-orm';
import { desc, eq, sql, SQL, and, or, gt, lt } from 'drizzle-orm';
import { GraphQLError } from 'graphql';

import { CACHE_KEYS, getCache } from '@/lib/cache';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { fetchNbaLiveGames } from '@/lib/external-apis';
import { NotFoundError, BusinessLogicError } from '@/lib/graphql/errors';
import {
  createConnection,
  createEmptyConnection,
  parsePaginationArgs,
} from '@/lib/graphql/utils/pagination';
import { CACHE_TTL } from '@/lib/types/cache.types';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import { Context } from '@/lib/types/context.types';
import { DatabaseRow } from '@/lib/types/database.types';
import { ReactionEmojiType } from '@/lib/types/generated/graphql';
import type { User, GameFilters } from '@/lib/types/generated/graphql';

// Type for game scores JSON structure
interface GameScores {
  visitors?: {
    points?: number;
  };
  home?: {
    points?: number;
  };
}

// Type for game teams structure
interface GameTeam {
  id: string;
  name: string;
  nickname: string;
  logo: string;
}

interface GameTeams {
  home?: GameTeam;
  visitors?: GameTeam;
}

// Type for game arena structure
interface GameArena {
  name?: string;
  city?: string;
  state?: string | null;
  country?: string | null;
}

// Type for game status structure
interface GameStatus {
  clock?: string;
  halftime?: boolean;
  long?: string;
  short?: string;
}

// Type for game data from database
interface GameData {
  id: string;
  date: Date | string;
  status: string | GameStatus;
  arena: string | GameArena;
  league: string;
  season: number;
  stage: number;
  periods: unknown[];
  scores: GameScores;
  officials: string[];
  times_tied: number | null;
  lead_changes: number | null;
  nugget: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  teams: GameTeams;
  [key: string]: unknown;
}

// Type for mapped game data
interface MappedGame {
  id: string;
  date: {
    start: string;
    end: string | null;
    duration: string | null;
  };
  status: {
    clock: string;
    halftime: boolean;
    long: string;
    short: string;
  };
  arena: string;
  league: string;
  season: number;
  stage: number;
  periods: unknown[];
  scores: GameScores;
  officials: string[];
  times_tied: number | null;
  lead_changes: number | null;
  nugget: string | null;
  createdAt: string;
  updatedAt: string;
  homeTeamId: string;
  awayTeamId: string;
  teams: {
    home: GameTeam | null;
    visitors: GameTeam | null;
  };
  is_completed: boolean;
  awayScore: number | null;
  homeScore: number | null;
  gameType: string;
  nbaGameId: string;
}

// Helper function to convert emoji character back to key
const getEmojiKey = (emojiCharacter: string): ReactionEmojiType => {
  const entry = Object.entries(REACTION_EMOJIS).find(([, char]) => char === emojiCharacter);
  return (entry?.[0] || emojiCharacter) as ReactionEmojiType;
};

export const seasons = async (
  _parent: unknown,
  args: {
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  } = {}
) => {
  const { limit, offset } = parsePaginationArgs(args);

  const [dbSeasons, totalResult] = await Promise.all([
    db.query.seasons.findMany({
      limit,
      offset,
    }),
    db.select({ count: sql<number>`count(*)` }).from(schema.seasons),
  ]);

  const total = totalResult[0]?.count || 0;

  const mappedSeasons = dbSeasons.map(season => ({
    id: String(season.id),
    year: season.year,
    displayYear: season.displayYear,
    startDate: season.startDate,
    endDate: season.endDate,
    isCurrent: season.isCurrent,
    isPlayoffs: season.isPlayoffs,
  }));

  return createConnection(mappedSeasons, total, args);
};

export const games = async (
  _parent: unknown,
  args: {
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
    filters?: GameFilters;
  } = {},
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
      .orderBy(desc(sql`${schema.nba_games.date}->>'start'`))
      .limit(limit + 1);

    // Execute query
    const items = await query;

    // Check if there are more items
    const hasNextPage = items.length > limit;
    const actualItems = hasNextPage ? items.slice(0, -1) : items;

    const mappedGames = actualItems.map((game: DatabaseRow) => {
      const arenaData = game.arena as
        | { name?: string; city?: string; state?: string | null; country?: string | null }
        | string
        | null;
      // const periods = game.periods as {
      //   current: number;
      //   total: number;
      //   end_of_period: boolean;
      // } | null;
      const teams = game.teams as { home: { id: string }; visitors: { id: string } } | null;

      return {
        id: game.id,
        date: {
          start:
            (game.date as { start?: string | null })?.start ||
            (game.date instanceof Date
              ? game.date.toISOString()
              : typeof game.date === 'string'
                ? new Date(game.date).toISOString()
                : ''),
          end: (game.date as { end?: string | null })?.end || null,
          duration: (game.date as { duration?: string | null })?.duration || null,
        },
        status: {
          clock:
            typeof game.status === 'object' && game.status !== null
              ? String((game.status as GameStatus).clock || '')
              : typeof game.status === 'string'
                ? game.status
                : '',
          halftime:
            typeof game.status === 'object' && game.status !== null
              ? Boolean((game.status as GameStatus).halftime)
              : false,
          long:
            typeof game.status === 'object' && game.status !== null
              ? String((game.status as GameStatus).long || '')
              : typeof game.status === 'string'
                ? game.status
                : '',
          short:
            typeof game.status === 'object' && game.status !== null
              ? String((game.status as GameStatus).short || '')
              : typeof game.status === 'string'
                ? game.status
                : '',
        },
        arena: {
          name:
            typeof arenaData === 'object' && arenaData !== null
              ? arenaData.name || ''
              : typeof arenaData === 'string'
                ? arenaData
                : '',
          city: typeof arenaData === 'object' && arenaData !== null ? arenaData.city || '' : '',
          state: typeof arenaData === 'object' && arenaData !== null ? arenaData.state : null,
          country: typeof arenaData === 'object' && arenaData !== null ? arenaData.country : null,
        },
        league: typeof game.league === 'string' ? game.league : String(game.league ?? ''),
        season: typeof game.season === 'number' ? game.season : Number(game.season ?? 0),
        stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
        periods: game.periods ?? [],
        scores: game.scores ?? [],
        officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
        times_tied: typeof game.times_tied === 'number' ? game.times_tied : null,
        lead_changes: typeof game.lead_changes === 'number' ? game.lead_changes : null,
        nugget: typeof game.nugget === 'string' ? game.nugget : null,
        createdAt:
          game.createdAt instanceof Date ? game.createdAt : new Date(game.createdAt as string),
        updatedAt:
          game.updatedAt instanceof Date ? game.updatedAt : new Date(game.updatedAt as string),
        homeTeamId: teams?.home?.id || '',
        awayTeamId: teams?.visitors?.id || '',
        teams: game.teams ?? {},
        is_completed: game.status === 'Finished',
      };
    });

    return createConnection(mappedGames, actualItems.length, args);
  } catch (error) {
    console.error('Error in games resolver:', error);
    if (error instanceof BusinessLogicError) {
      throw error;
    }
    throw new BusinessLogicError(
      error instanceof Error ? error.message : 'Failed to fetch games',
      'GAMES_FETCH_ERROR'
    );
  }
};

export const game = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  try {
    const game = await db
      .select()
      .from(schema.nba_games)
      .where(eq(schema.nba_games.id, id))
      .limit(1)
      .then((rows: DatabaseRow[]) => rows[0]);

    if (!game) throw new NotFoundError('Game', id);

    const teams = (game.teams as GameTeams) || {};
    const homeTeamId = teams.home?.id || null;
    const awayTeamId = teams.visitors?.id || null;

    const arenaData = game.arena as
      | { name?: string; city?: string; state?: string | null; country?: string | null }
      | string
      | null;

    return {
      id: game.id,
      date: {
        start:
          (game.date as { start?: string | null })?.start ||
          (game.date instanceof Date
            ? game.date.toISOString()
            : typeof game.date === 'string'
              ? new Date(game.date).toISOString()
              : ''),
        end: (game.date as { end?: string | null })?.end || null,
        duration: (game.date as { duration?: string | null })?.duration || null,
      },
      status: {
        clock:
          typeof game.status === 'object' && game.status !== null
            ? String((game.status as GameStatus).clock || '')
            : typeof game.status === 'string'
              ? game.status
              : '',
        halftime:
          typeof game.status === 'object' && game.status !== null
            ? Boolean((game.status as GameStatus).halftime)
            : false,
        long:
          typeof game.status === 'object' && game.status !== null
            ? String((game.status as GameStatus).long || '')
            : typeof game.status === 'string'
              ? game.status
              : '',
        short:
          typeof game.status === 'object' && game.status !== null
            ? String((game.status as GameStatus).short || '')
            : typeof game.status === 'string'
              ? game.status
              : '',
      },
      arena: {
        name:
          typeof arenaData === 'object' && arenaData !== null
            ? arenaData.name || ''
            : typeof arenaData === 'string'
              ? arenaData
              : '',
        city: typeof arenaData === 'object' && arenaData !== null ? arenaData.city || '' : '',
        state: typeof arenaData === 'object' && arenaData !== null ? arenaData.state : null,
        country: typeof arenaData === 'object' && arenaData !== null ? arenaData.country : null,
      },
      league: typeof game.league === 'string' ? game.league : String(game.league ?? ''),
      season: typeof game.season === 'number' ? game.season : Number(game.season ?? 0),
      stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
      periods: game.periods ?? [],
      scores: game.scores ?? [],
      officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
      times_tied: typeof game.times_tied === 'number' ? game.times_tied : null,
      lead_changes: typeof game.lead_changes === 'number' ? game.lead_changes : null,
      nugget: typeof game.nugget === 'string' ? game.nugget : null,
      createdAt:
        game.createdAt instanceof Date ? game.createdAt : new Date(game.createdAt as string),
      updatedAt:
        game.updatedAt instanceof Date ? game.updatedAt : new Date(game.updatedAt as string),
      homeTeamId:
        typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
      awayTeamId:
        typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
      teams,
      is_completed: game.status === 'Finished',
      awayScore: (game.scores as GameScores)?.visitors?.points || null,
      homeScore: (game.scores as GameScores)?.home?.points || null,
      gameType: 'REGULAR',
      nbaGameId: game.id,
    };
  } catch (error) {
    console.error('Error fetching game:', error);
    throw error;
  }
};

export const teams = async (
  _parent: unknown,
  args: {
    filters?: {
      conference?: string;
      division?: string;
      city?: string;
      code?: string;
    };
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  },
  { db }: Context
) => {
  try {
    const { filters, ...paginationArgs } = args;
    const { limit, offset } = parsePaginationArgs(paginationArgs);

    const teamConditions: SQL<unknown>[] = [];
    if (filters?.conference) {
      teamConditions.push(eq(schema.teams.conference, filters.conference));
    }
    if (filters?.division) {
      teamConditions.push(eq(schema.teams.division, filters.division));
    }
    if (filters?.city) {
      teamConditions.push(eq(schema.teams.city, filters.city));
    }
    if (filters?.code) {
      teamConditions.push(eq(schema.teams.abbreviation, filters.code));
    }

    const [teamItems, totalResult] = await Promise.all([
      db
        .select()
        .from(schema.teams)
        .where(teamConditions.length > 0 ? and(...teamConditions) : undefined)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.teams)
        .where(teamConditions.length > 0 ? and(...teamConditions) : undefined),
    ]);

    const total = totalResult[0]?.count || 0;

    const mappedTeams = teamItems.map(team => ({
      id: team.id,
      name: team.name,
      abbreviation: team.abbreviation,
      city: team.city,
      state: team.state,
      country: team.country,
      conference: team.conference,
      division: team.division,
      logoUrl: team.logoUrl,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }));

    return createConnection(mappedTeams, total, paginationArgs);
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw new BusinessLogicError('Failed to fetch teams', 'TEAMS_FETCH_ERROR');
  }
};

export const players = async (
  _parent: unknown,
  args: {
    filters?: {
      teamId?: string;
      active?: boolean;
      position?: string;
      country?: string;
    };
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  },
  { db }: Context
) => {
  try {
    const { filters, ...paginationArgs } = args;
    const { limit, offset } = parsePaginationArgs(paginationArgs);

    const playerConditions: SQL<unknown>[] = [];
    if (filters?.teamId) {
      playerConditions.push(eq(schema.nba_players.id, filters.teamId));
    }
    if (filters?.active !== undefined) {
      playerConditions.push(eq(schema.nba_players.active, filters.active as boolean));
    }
    if (filters?.position) {
      playerConditions.push(eq(schema.nba_players.pos, filters.position));
    }
    if (filters?.country) {
      playerConditions.push(sql`(${schema.nba_players.birth}->>'country') = ${filters.country}`);
    }

    const [playerItems, totalResult] = await Promise.all([
      db
        .select()
        .from(schema.nba_players)
        .where(playerConditions.length > 0 ? and(...playerConditions) : undefined)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.nba_players)
        .where(playerConditions.length > 0 ? and(...playerConditions) : undefined),
    ]);

    const total = totalResult[0]?.count || 0;

    const mappedPlayers = playerItems.map(player => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      birth: player.birth,
      nba: player.nba,
      height: player.height,
      weight: player.weight,
      college: player.college,
      affiliation: player.affiliation,
      jersey: player.jersey,
      active: player.active,
      position: player.pos,
      seasonsActive: player.seasonsActive,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    }));

    return createConnection(mappedPlayers, total, paginationArgs);
  } catch (error) {
    console.error('Error fetching players:', error);
    throw new BusinessLogicError('Failed to fetch players', 'PLAYERS_FETCH_ERROR');
  }
};

export const player = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  const player = await db
    .select()
    .from(schema.nba_players)
    .where(eq(schema.nba_players.id, id))
    .limit(1)
    .then(rows => rows[0]);

  if (!player) throw new NotFoundError('Player', id);

  return {
    id: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    teamId: '',
    birthDate: (player.birth as { date?: string | null })?.date || null,
    birthCountry: (player.birth as { country?: string | null })?.country || null,
    heightFeet: (player.height as { feet?: number | null })?.feet || null,
    heightInches: (player.height as { inches?: number | null })?.inches || null,
    heightMeters: (player.height as { meters?: number | null })?.meters || null,
    weightPounds: (player.weight as { pounds?: number | null })?.pounds || null,
    weightKilograms: (player.weight as { kilograms?: number | null })?.kilograms || null,
    nbaStart: (player.nba as { start?: number | null })?.start || null,
    nbaProYears: (player.nba as { pro?: number | null })?.pro || null,
    college: player.college,
    affiliation: player.affiliation,
    jerseyNumber: player.jersey,
    active: player.active,
    position: player.pos,
    seasonsActive: player.seasonsActive,
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
  };
};

export const gameStats = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  try {
    const gameStats = await db
      .select({
        id: schema.game_stats.id,
        gameId: schema.game_stats.gameId,
        seasonId: schema.game_stats.seasonId,
        homeTeamId: schema.game_stats.homeTeamId,
        awayTeamId: schema.game_stats.awayTeamId,
        gameDate: schema.game_stats.gameDate,
        homeScore: schema.game_stats.homeScore,
        awayScore: schema.game_stats.awayScore,
        status: schema.game_stats.status,
        homeFastBreakPoints: schema.game_stats.homeFastBreakPoints,
        homePointsInPaint: schema.game_stats.homePointsInPaint,
        homeBiggestLead: schema.game_stats.homeBiggestLead,
        homeSecondChancePoints: schema.game_stats.homeSecondChancePoints,
        homePointsOffTurnovers: schema.game_stats.homePointsOffTurnovers,
        homeLongestRun: schema.game_stats.homeLongestRun,
        homeFgm: schema.game_stats.homeFgm,
        homeFga: schema.game_stats.homeFga,
        homeFgp: schema.game_stats.homeFgp,
        homeFtm: schema.game_stats.homeFtm,
        homeFta: schema.game_stats.homeFta,
        homeFtp: schema.game_stats.homeFtp,
        homeTpm: schema.game_stats.homeTpm,
        homeTpa: schema.game_stats.homeTpa,
        homeTpp: schema.game_stats.homeTpp,
        homeOffReb: schema.game_stats.homeOffReb,
        homeDefReb: schema.game_stats.homeDefReb,
        homeTotReb: schema.game_stats.homeTotReb,
        homeAssists: schema.game_stats.homeAssists,
        homePFouls: schema.game_stats.homePFouls,
        homeSteals: schema.game_stats.homeSteals,
        homeTurnovers: schema.game_stats.homeTurnovers,
        homeBlocks: schema.game_stats.homeBlocks,
        homePlusMinus: schema.game_stats.homePlusMinus,
        homeMinutes: schema.game_stats.homeMinutes,
        awayFastBreakPoints: schema.game_stats.awayFastBreakPoints,
        awayPointsInPaint: schema.game_stats.awayPointsInPaint,
        awayBiggestLead: schema.game_stats.awayBiggestLead,
        awaySecondChancePoints: schema.game_stats.awaySecondChancePoints,
        awayPointsOffTurnovers: schema.game_stats.awayPointsOffTurnovers,
        awayLongestRun: schema.game_stats.awayLongestRun,
        awayFgm: schema.game_stats.awayFgm,
        awayFga: schema.game_stats.awayFga,
        awayFgp: schema.game_stats.awayFgp,
        awayFtm: schema.game_stats.awayFtm,
        awayFta: schema.game_stats.awayFta,
        awayFtp: schema.game_stats.awayFtp,
        awayTpm: schema.game_stats.awayTpm,
        awayTpa: schema.game_stats.awayTpa,
        awayTpp: schema.game_stats.awayTpp,
        awayOffReb: schema.game_stats.awayOffReb,
        awayDefReb: schema.game_stats.awayDefReb,
        awayTotReb: schema.game_stats.awayTotReb,
        awayAssists: schema.game_stats.awayAssists,
        awayPFouls: schema.game_stats.awayPFouls,
        awaySteals: schema.game_stats.awaySteals,
        awayTurnovers: schema.game_stats.awayTurnovers,
        awayBlocks: schema.game_stats.awayBlocks,
        awayPlusMinus: schema.game_stats.awayPlusMinus,
        awayMinutes: schema.game_stats.awayMinutes,
        stats: schema.game_stats.stats,
        createdAt: schema.game_stats.createdAt,
        updatedAt: schema.game_stats.updatedAt,
      })
      .from(schema.game_stats)
      .where(eq(schema.game_stats.id, id))
      .limit(1)
      .then(rows => rows[0]);

    if (!gameStats) {
      throw new NotFoundError('GameStats', id);
    }

    // Fetch the full game object using the same mapping as the 'game' query
    const game = (await db
      .select()
      .from(schema.nba_games)
      .where(eq(schema.nba_games.id, gameStats.gameId as string))
      .limit(1)
      .then((rows: DatabaseRow[]) => rows[0])) as unknown as GameData;

    if (!game) {
      throw new NotFoundError('Game', gameStats.gameId as string);
    }

    const teams = game.teams || {};
    const homeTeamId = teams.home?.id || null;
    const awayTeamId = teams.visitors?.id || null;

    const mappedGame: MappedGame = {
      id: game.id,
      date: {
        start:
          (game.date as { start?: string | null })?.start ||
          (game.date instanceof Date
            ? game.date.toISOString()
            : typeof game.date === 'string'
              ? new Date(game.date).toISOString()
              : ''),
        end: (game.date as { end?: string | null })?.end || null,
        duration: (game.date as { duration?: string | null })?.duration || null,
      },
      status: {
        clock:
          typeof game.status === 'object' && game.status !== null
            ? String((game.status as GameStatus).clock || '')
            : typeof game.status === 'string'
              ? game.status
              : '',
        halftime:
          typeof game.status === 'object' && game.status !== null
            ? Boolean((game.status as GameStatus).halftime)
            : false,
        long:
          typeof game.status === 'object' && game.status !== null
            ? String((game.status as GameStatus).long || '')
            : typeof game.status === 'string'
              ? game.status
              : '',
        short:
          typeof game.status === 'object' && game.status !== null
            ? String((game.status as GameStatus).short || '')
            : typeof game.status === 'string'
              ? game.status
              : '',
      },
      arena: typeof game.arena === 'string' ? game.arena : String(game.arena ?? ''),
      league: typeof game.league === 'string' ? game.league : String(game.league ?? ''),
      season: typeof game.season === 'number' ? game.season : Number(game.season ?? 0),
      stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
      periods: game.periods ?? [],
      scores: game.scores ?? [],
      officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
      times_tied: typeof game.times_tied === 'number' ? game.times_tied : null,
      lead_changes: typeof game.lead_changes === 'number' ? game.lead_changes : null,
      nugget: typeof game.nugget === 'string' ? game.nugget : null,
      createdAt:
        game.createdAt instanceof Date
          ? game.createdAt.toISOString()
          : String(game.createdAt ?? ''),
      updatedAt:
        game.updatedAt instanceof Date
          ? game.updatedAt.toISOString()
          : String(game.updatedAt ?? ''),
      homeTeamId:
        typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
      awayTeamId:
        typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
      teams: {
        home: game.teams?.home || null,
        visitors: game.teams?.visitors || null,
      },
      is_completed: game.status === 'Final' || game.status === 'Completed',
      awayScore: (game.scores as GameScores)?.visitors?.points || null,
      homeScore: (game.scores as GameScores)?.home?.points || null,
      gameType: 'REGULAR',
      nbaGameId: game.id,
    };

    // Fetch home and away teams
    const [homeTeam, awayTeam] = await Promise.all([
      db
        .select()
        .from(schema.teams)
        .where(eq(schema.teams.id, gameStats.homeTeamId as string))
        .limit(1)
        .then((rows: DatabaseRow[]) => rows[0]),
      db
        .select()
        .from(schema.teams)
        .where(eq(schema.teams.id, gameStats.awayTeamId as string))
        .limit(1)
        .then((rows: DatabaseRow[]) => rows[0]),
    ]);

    return {
      id: gameStats.id ?? '',
      game: mappedGame,
      seasonId: gameStats.seasonId,
      homeTeam: homeTeam
        ? {
            ...homeTeam,
            allStar: homeTeam.allStar,
            nbaFranchise: homeTeam.nbaFranchise,
          }
        : null,
      awayTeam: awayTeam
        ? {
            ...awayTeam,
            allStar: awayTeam.allStar,
            nbaFranchise: awayTeam.nbaFranchise,
          }
        : null,
      gameDate: gameStats.gameDate,
      homeScore: gameStats.homeScore,
      awayScore: gameStats.awayScore,
      status: gameStats.status,
      homeFastBreakPoints: gameStats.homeFastBreakPoints,
      homePointsInPaint: gameStats.homePointsInPaint,
      homeBiggestLead: gameStats.homeBiggestLead,
      homeSecondChancePoints: gameStats.homeSecondChancePoints,
      homePointsOffTurnovers: gameStats.homePointsOffTurnovers,
      homeLongestRun: gameStats.homeLongestRun,
      homeFgm: gameStats.homeFgm,
      homeFga: gameStats.homeFga,
      homeFgp: gameStats.homeFgp ? parseFloat(gameStats.homeFgp.toString()) : undefined,
      homeFtm: gameStats.homeFtm,
      homeFta: gameStats.homeFta,
      homeFtp: gameStats.homeFtp ? parseFloat(gameStats.homeFtp.toString()) : undefined,
      homeTpm: gameStats.homeTpm,
      homeTpa: gameStats.homeTpa,
      homeTpp: gameStats.homeTpp ? parseFloat(gameStats.homeTpp.toString()) : undefined,
      homeOffReb: gameStats.homeOffReb,
      homeDefReb: gameStats.homeDefReb,
      homeTotReb: gameStats.homeTotReb,
      homeAssists: gameStats.homeAssists,
      homePFouls: gameStats.homePFouls,
      homeSteals: gameStats.homeSteals,
      homeTurnovers: gameStats.homeTurnovers,
      homeBlocks: gameStats.homeBlocks,
      homePlusMinus: gameStats.homePlusMinus,
      homeMinutes: gameStats.homeMinutes,
      awayFastBreakPoints: gameStats.awayFastBreakPoints,
      awayPointsInPaint: gameStats.awayPointsInPaint,
      awayBiggestLead: gameStats.awayBiggestLead,
      awaySecondChancePoints: gameStats.awaySecondChancePoints,
      awayPointsOffTurnovers: gameStats.awayPointsOffTurnovers,
      awayLongestRun: gameStats.awayLongestRun,
      awayFgm: gameStats.awayFgm,
      awayFga: gameStats.awayFga,
      awayFgp: gameStats.awayFgp ? parseFloat(gameStats.awayFgp.toString()) : undefined,
      awayFtm: gameStats.awayFtm,
      awayFta: gameStats.awayFta,
      awayFtp: gameStats.awayFtp ? parseFloat(gameStats.awayFtp.toString()) : undefined,
      awayTpm: gameStats.awayTpm,
      awayTpa: gameStats.awayTpa,
      awayTpp: gameStats.awayTpp ? parseFloat(gameStats.awayTpp.toString()) : undefined,
      awayOffReb: gameStats.awayOffReb,
      awayDefReb: gameStats.awayDefReb,
      awayTotReb: gameStats.awayTotReb,
      awayAssists: gameStats.awayAssists,
      awayPFouls: gameStats.awayPFouls,
      awaySteals: gameStats.awaySteals,
      awayTurnovers: gameStats.awayTurnovers,
      awayBlocks: gameStats.awayBlocks,
      awayPlusMinus: gameStats.awayPlusMinus,
      awayMinutes: gameStats.awayMinutes,
      stats: gameStats.stats,
      createdAt: gameStats.createdAt,
      updatedAt: gameStats.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching game stats:', error);
    throw error;
  }
};

export const playerGameStats = async (
  _parent: unknown,
  { playerId, gameId }: { playerId: string; gameId: string },
  { db, redis }: Context
) => {
  try {
    const cacheKey = CACHE_KEYS.PLAYER_GAME_STATS(playerId, gameId);
    if (redis) {
      const cache = getCache();
      await cache.initializeRedis();
      const cached = await cache.get(cacheKey);
      if (cached) return cached;
    }

    const stats = await db.query.nba_player_stats.findFirst({
      where: and(
        eq(schema.nba_player_stats.playerId, playerId),
        eq(schema.nba_player_stats.gameId, gameId)
      ),
      with: {
        player: true,
        team: true,
      },
    });

    if (!stats) {
      throw new NotFoundError('PlayerStats', playerId);
    }

    if (redis) {
      const cache = getCache();
      await cache.set(cacheKey, stats, CACHE_TTL.PLAYER);
    }
    return stats;
  } catch (error) {
    console.error('Error fetching player game stats:', error);
    throw new GraphQLError('Failed to fetch player game stats');
  }
};

export const teamGameStats = async (
  _parent: unknown,
  { gameId, team }: { gameId: string; team: string },
  { db }: Context
) => {
  try {
    const stats = await db.query.game_stats.findFirst({
      where: and(
        eq(schema.game_stats.gameId, gameId),
        or(eq(schema.game_stats.homeTeamId, team), eq(schema.game_stats.awayTeamId, team))
      ),
      with: {
        game: true,
        season: true,
        home_team: true,
        away_team: true,
      },
    });

    if (!stats) {
      throw new NotFoundError('TeamGameStats', `${gameId}:${team}`);
    }

    // Fetch the full game object from nba_games
    const dbGame = await db.query.nba_games.findFirst({
      where: eq(schema.nba_games.id, stats.gameId),
    });
    if (!dbGame) throw new NotFoundError('Game', stats.gameId);
    const teams = dbGame.teams || { home: undefined, visitors: undefined };
    const homeTeamId =
      typeof teams.home?.id === 'string'
        ? teams.home.id
        : teams.home?.id
          ? String(teams.home.id)
          : '';
    const awayTeamId =
      typeof teams.visitors?.id === 'string'
        ? teams.visitors.id
        : teams.visitors?.id
          ? String(teams.visitors.id)
          : '';

    const mappedGame = {
      id: dbGame.id,
      date: {
        start:
          (dbGame.date as { start?: string | null })?.start ||
          (dbGame.date instanceof Date
            ? dbGame.date.toISOString()
            : typeof dbGame.date === 'string'
              ? new Date(dbGame.date).toISOString()
              : ''),
        end: (dbGame.date as { end?: string | null })?.end || null,
        duration: (dbGame.date as { duration?: string | null })?.duration || null,
      },
      status: {
        clock:
          typeof dbGame.status === 'object' && dbGame.status !== null
            ? String(dbGame.status.clock || '')
            : typeof dbGame.status === 'string'
              ? dbGame.status
              : '',
        halftime:
          typeof dbGame.status === 'object' && dbGame.status !== null
            ? Boolean(dbGame.status.halftime)
            : false,
        long:
          typeof dbGame.status === 'object' && dbGame.status !== null
            ? String(dbGame.status.long || '')
            : typeof dbGame.status === 'string'
              ? dbGame.status
              : '',
        short:
          typeof dbGame.status === 'object' && dbGame.status !== null
            ? String(dbGame.status.short || '')
            : typeof dbGame.status === 'string'
              ? dbGame.status
              : '',
      },
      periods: dbGame.periods,
      arena: dbGame.arena,
      teams: dbGame.teams,
      scores: dbGame.scores ?? [],
      officials: Array.isArray(dbGame.officials) ? dbGame.officials.map(String) : [],
      times_tied: typeof dbGame.timesTied === 'number' ? dbGame.timesTied : null,
      lead_changes: typeof dbGame.leadChanges === 'number' ? dbGame.leadChanges : null,
      nugget: typeof dbGame.nugget === 'string' ? dbGame.nugget : null,
      createdAt:
        dbGame.createdAt instanceof Date
          ? dbGame.createdAt.toISOString()
          : new Date(dbGame.createdAt as string).toISOString(),
      updatedAt:
        dbGame.updatedAt instanceof Date
          ? dbGame.updatedAt.toISOString()
          : new Date(dbGame.updatedAt as string).toISOString(),
      homeTeamId:
        typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
      awayTeamId:
        typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
      is_completed: dbGame.status?.long === 'Finished',
      awayScore: dbGame.scores?.visitors?.points || null,
      homeScore: dbGame.scores?.home?.points || null,
      gameType: 'LIVE',
      nbaGameId: String(dbGame.id),
    };

    // Helper to map team to GraphQL type
    const mapTeam = (team: typeof schema.teams.$inferSelect) => ({
      id: team.id,
      name: team.name,
      abbreviation: team.abbreviation,
      city: team.city,
      state: team.state,
      country: team.country,
      conference: team.conference,
      division: team.division,
      logoUrl: team.logoUrl,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
    });

    // Map the stats to the correct GraphQL type
    return {
      id: stats.id ?? '',
      game: mappedGame,
      team: team === stats.homeTeamId ? mapTeam(stats.home_team) : mapTeam(stats.away_team),
      assists: team === stats.homeTeamId ? (stats.homeAssists ?? 0) : (stats.awayAssists ?? 0),
      blocks: team === stats.homeTeamId ? (stats.homeBlocks ?? 0) : (stats.awayBlocks ?? 0),
      fieldGoals: {
        made: team === stats.homeTeamId ? (stats.homeFgm ?? 0) : (stats.awayFgm ?? 0),
        attempted: team === stats.homeTeamId ? (stats.homeFga ?? 0) : (stats.awayFga ?? 0),
        percentage: (team === stats.homeTeamId
          ? (stats.homeFgp ?? 0)
          : (stats.awayFgp ?? 0)
        ).toString(),
      },
      fouls: team === stats.homeTeamId ? (stats.homePFouls ?? 0) : (stats.awayPFouls ?? 0),
      freeThrows: {
        made: team === stats.homeTeamId ? (stats.homeFtm ?? 0) : (stats.awayFtm ?? 0),
        attempted: team === stats.homeTeamId ? (stats.homeFta ?? 0) : (stats.awayFta ?? 0),
        percentage: (team === stats.homeTeamId
          ? (stats.homeFtp ?? 0)
          : (stats.awayFtp ?? 0)
        ).toString(),
      },
      points: team === stats.homeTeamId ? (stats.homeScore ?? 0) : (stats.awayScore ?? 0),
      rebounds: team === stats.homeTeamId ? (stats.homeTotReb ?? 0) : (stats.awayTotReb ?? 0),
      steals: team === stats.homeTeamId ? (stats.homeSteals ?? 0) : (stats.awaySteals ?? 0),
      threePointers: {
        made: team === stats.homeTeamId ? (stats.homeTpm ?? 0) : (stats.awayTpm ?? 0),
        attempted: team === stats.homeTeamId ? (stats.homeTpa ?? 0) : (stats.awayTpa ?? 0),
        percentage: (team === stats.homeTeamId
          ? (stats.homeTpp ?? 0)
          : (stats.awayTpp ?? 0)
        ).toString(),
      },
      turnovers:
        team === stats.homeTeamId ? (stats.homeTurnovers ?? 0) : (stats.awayTurnovers ?? 0),
      createdAt: stats.createdAt,
      updatedAt: stats.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching team game stats:', error);
    throw error;
  }
};

export const users = async (
  _parent: unknown,
  args: {
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  },
  { db }: Context
) => {
  const { limit, offset } = parsePaginationArgs(args);

  const [items, totalResult] = await Promise.all([
    db.query.users.findMany({
      limit,
      offset,
    }),
    db.select({ count: sql<number>`count(*)` }).from(schema.users),
  ]);

  const total = totalResult[0]?.count || 0;

  const mappedUsers = items.map((user: InferSelectModel<typeof schema.users>) => ({
    id: user.id,
    username: user.username,
    emailAddress: user.emailAddress || '',
    imageUrl: user.imageUrl,
    avatarUrl: user.imageUrl,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
    comments: [],
    gameLogs: [],
    initiatedFriendships: [],
    reactions: [],
    friendships: [],
  }));

  return createConnection(mappedUsers, total, args);
};

export const user = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1)
    .then(rows => rows[0]);

  if (!user) throw new NotFoundError('User', id);

  return {
    id: user.id,
    username: user.username,
    emailAddress: user.emailAddress,
    imageUrl: user.imageUrl,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    inboundFriendshipIds: user.inboundFriendshipIds,
    outboundFriendshipIds: user.outboundFriendshipIds,
    banned: user.banned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastSignInAt: user.last_sign_in_at,
    passwordEnabled: user.password_enabled,
    twoFactorEnabled: user.two_factor_enabled,
    emailVerified: user.email_verified,
    emailVerificationStrategy: user.email_verification_strategy,
    externalId: user.external_id,
    externalAccounts: user.external_accounts,
    deletedAt: user.deletedAt,
  };
};

export const friendships = async (
  _parent: unknown,
  args: {
    userId: string;
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  },
  { db }: Context
) => {
  const { userId, ...paginationArgs } = args;

  const [friendships, totalResult] = await Promise.all([
    db.query.friendships.findMany({
      where: or(eq(schema.friendships.userId, userId), eq(schema.friendships.friendId, userId)),
      with: {
        user: true,
        friend: true,
      },
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.friendships)
      .where(or(eq(schema.friendships.userId, userId), eq(schema.friendships.friendId, userId))),
  ]);

  const total = totalResult[0]?.count || 0;

  const mappedFriendships = friendships
    .map((friendship: typeof schema.friendships.$inferSelect & { user?: User; friend?: User }) => {
      const friend = friendship.userId === userId ? friendship.friend : friendship.user;
      if (!friend) return null;

      return {
        id: (friend as User).id,
        username: (friend as User).username,
        emailAddress: (friend as User).emailAddress,
        imageUrl: (friend as User).imageUrl,
        avatarUrl: (friend as User).imageUrl,
        createdAt: new Date(),
      };
    })
    .filter((user): user is NonNullable<typeof user> => user !== null);

  return createConnection(mappedFriendships, total, paginationArgs);
};

export const allPlayerStats = async (
  _parent: unknown,
  _args: {
    season: number;
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  }
) => {
  // TODO: Implement actual player stats fetching
  return createEmptyConnection();
};

export const allTeamStats = async (
  _parent: unknown,
  _args: {
    season: number;
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  }
) => {
  // TODO: Implement actual team stats fetching
  return createEmptyConnection();
};

export const playerSeasonStatsList = async (
  _parent: unknown,
  _args: {
    playerId: string;
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  }
) => {
  // TODO: Implement actual player season stats fetching
  return createEmptyConnection();
};

export const playerStatsByTeam = async (
  _parent: unknown,
  _args: {
    season: number;
    team: string;
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  }
) => {
  // TODO: Implement actual player stats by team fetching
  return createEmptyConnection();
};

export const teamStats = async (
  _parent: unknown,
  _args: {
    teamId: string;
    sort?: { field: string; direction: string };
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  }
) => {
  // TODO: Implement actual team stats fetching
  return createEmptyConnection();
};

export const topPlayers = async (
  _parent: unknown,
  _args: {
    season: number;
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  }
) => {
  // TODO: Implement actual top players fetching
  return createEmptyConnection();
};

export const gameLogs = async (
  _parent: unknown,
  args: {
    filters?: {
      userId?: string;
      gameId?: string;
      classification?: string;
      watchedDateRange?: { start?: string; end?: string };
    };
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  },
  { db, user: _user }: Context
) => {
  try {
    const { filters, ...paginationArgs } = args;
    const { limit, offset } = parsePaginationArgs(paginationArgs);
    const conditions: SQL<unknown>[] = [];

    if (filters?.userId) {
      conditions.push(eq(schema.game_logs.userId, filters.userId));
    }
    if (filters?.gameId) {
      conditions.push(eq(schema.game_logs.gameId, filters.gameId));
    }
    if (filters?.classification) {
      conditions.push(eq(schema.game_logs.classification, filters.classification));
    }
    if (filters?.watchedDateRange) {
      const { start, end } = filters.watchedDateRange;
      if (start) {
        conditions.push(sql`${schema.game_logs.watchedDate} >= ${start}`);
      }
      if (end) {
        conditions.push(sql`${schema.game_logs.watchedDate} <= ${end}`);
      }
    }

    const [gameLogs, totalResult] = await Promise.all([
      db
        .select()
        .from(schema.game_logs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(schema.game_logs.createdAt))
        .limit(limit + 1) // Get one extra to check if there's a next page
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.game_logs)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ]);

    const total = totalResult[0]?.count || 0;
    const hasNextPage = gameLogs.length > limit;
    const actualGameLogs = hasNextPage ? gameLogs.slice(0, -1) : gameLogs;

    const edges = await Promise.all(
      actualGameLogs.map(async (gameLog: DatabaseRow, index: number) => {
        const gameLogId = gameLog.id as string;

        // Fetch user data for this game log
        const user = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, gameLog.userId as string))
          .limit(1)
          .then(rows => rows[0]);

        // Fetch game data
        const game = await db
          .select()
          .from(schema.nba_games)
          .where(eq(schema.nba_games.id, gameLog.gameId as string))
          .limit(1)
          .then(rows => rows[0]);

        // Fetch comments for this game log with pagination
        const [comments, commentsTotal] = await Promise.all([
          db
            .select()
            .from(schema.comments)
            .where(
              and(
                eq(schema.comments.parentId, gameLogId),
                eq(schema.comments.parentType, 'game_log')
              )
            )
            .orderBy(desc(schema.comments.createdAt))
            .limit(10),
          db
            .select({ count: sql<number>`count(*)` })
            .from(schema.comments)
            .where(
              and(
                eq(schema.comments.parentId, gameLogId),
                eq(schema.comments.parentType, 'game_log')
              )
            ),
        ]);

        // Fetch reactions for this game log with pagination
        const [reactions, reactionsTotal] = await Promise.all([
          db
            .select()
            .from(schema.reactions)
            .where(
              and(
                eq(schema.reactions.targetId, gameLogId),
                eq(schema.reactions.targetType, 'game_log')
              )
            )
            .orderBy(desc(schema.reactions.createdAt))
            .limit(10),
          db
            .select({ count: sql<number>`count(*)` })
            .from(schema.reactions)
            .where(
              and(
                eq(schema.reactions.targetId, gameLogId),
                eq(schema.reactions.targetType, 'game_log')
              )
            ),
        ]);

        // Fetch users for comments and reactions
        const [commentUsers, reactionUsers] = await Promise.all([
          Promise.all(
            comments.map(comment =>
              comment.userId
                ? db
                    .select()
                    .from(schema.users)
                    .where(eq(schema.users.id, comment.userId))
                    .limit(1)
                    .then(rows => rows[0])
                : null
            )
          ),
          Promise.all(
            reactions.map(reaction =>
              reaction.userId
                ? db
                    .select()
                    .from(schema.users)
                    .where(eq(schema.users.id, reaction.userId))
                    .limit(1)
                    .then(rows => rows[0])
                : null
            )
          ),
        ]);

        return {
          cursor: String(offset + index),
          node: {
            id: gameLogId,
            userId: String(gameLog.userId ?? ''),
            gameId: String(gameLog.gameId),
            watchedSetting: gameLog.watchedSetting as string,
            watchedDate: gameLog.watchedDate as Date,
            watchedLocation: gameLog.watchedLocation as string,
            rating: gameLog.ratingForGame as number,
            ratingForGame: gameLog.ratingForGame as number,
            ratingStars: gameLog.ratingStars
              ? Number.isNaN(Number(gameLog.ratingStars))
                ? null
                : Math.round(Number(gameLog.ratingStars))
              : null,
            watchedCount: gameLog.watchedCount as number,
            notes: gameLog.notes as string,
            tags: gameLog.tags as string[],
            classification: gameLog.classification as string,
            createdAt: gameLog.createdAt as Date,
            updatedAt: gameLog.updatedAt as Date,
            deletedAt: gameLog.deletedAt as Date | null,
            user: user
              ? {
                  id: user.id,
                  username: user.username,
                  emailAddress: user.emailAddress,
                  imageUrl: user.imageUrl,
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                }
              : {
                  id: '',
                  username: 'Unknown User',
                  emailAddress: '',
                  imageUrl: '',
                  firstName: '',
                  lastName: '',
                },
            game: game
              ? {
                  id: game.id,
                  teams: game.teams || {
                    home: null,
                    visitors: null,
                  },
                }
              : null,
            comments: {
              edges: comments.map((comment, i) => ({
                cursor: String(i),
                node: {
                  id: comment.id,
                  userId: String(comment.userId ?? ''),
                  parentId: comment.parentId,
                  parentType: 'game_log' as const,
                  content: comment.content,
                  createdAt: comment.createdAt,
                  updatedAt: comment.updatedAt,
                  deletedAt: comment.deletedAt,
                  user: commentUsers[i]
                    ? {
                        id: commentUsers[i].id,
                        username: commentUsers[i].username,
                        emailAddress: commentUsers[i].emailAddress,
                        imageUrl: commentUsers[i].imageUrl,
                        firstName: commentUsers[i].firstName || '',
                        lastName: commentUsers[i].lastName || '',
                      }
                    : {
                        id: '',
                        username: 'Unknown User',
                        emailAddress: '',
                        imageUrl: '',
                        firstName: '',
                        lastName: '',
                      },
                  reactions: [],
                },
              })),
              totalCount: commentsTotal[0]?.count || 0,
            },
            reactions: {
              edges: reactions.map((reaction, i) => ({
                cursor: String(i),
                node: {
                  id: reaction.id,
                  emoji: getEmojiKey(reaction.emoji) as ReactionEmojiType,
                  createdAt: reaction.createdAt,
                  updatedAt: reaction.updatedAt,
                  targetId: reaction.targetId || '',
                  targetType: 'game_log' as const,
                  userId: String(reaction.userId ?? ''),
                  user: reactionUsers[i]
                    ? {
                        id: reactionUsers[i].id,
                        username: reactionUsers[i].username,
                        emailAddress: reactionUsers[i].emailAddress,
                        imageUrl: reactionUsers[i].imageUrl,
                        firstName: reactionUsers[i].firstName || '',
                        lastName: reactionUsers[i].lastName || '',
                      }
                    : {
                        id: '',
                        username: 'Unknown User',
                        emailAddress: '',
                        imageUrl: '',
                        firstName: '',
                        lastName: '',
                      },
                },
              })),
              totalCount: reactionsTotal[0]?.count || 0,
            },
          },
        };
      })
    );

    return {
      edges,
      pageInfo: {
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        hasNextPage,
        hasPreviousPage: offset > 0,
      },
      totalCount: total,
    };
  } catch (error) {
    console.error('Error fetching game logs:', error);
    throw error;
  }
};

// Add resolvers for comments and reactions on GameLog type
export const GameLog = {
  comments: async (
    gameLog: { id: string },
    args: {
      first?: number | null;
      after?: string | null;
      last?: number | null;
      before?: string | null;
    },
    { db }: Context
  ) => {
    try {
      const { first, after } = args;
      const limit = Math.min(first ?? 20, 100);
      const offset = after ? parseInt(after, 10) : 0;

      const comments = await db
        .select()
        .from(schema.comments)
        .where(
          and(eq(schema.comments.parentId, gameLog.id), eq(schema.comments.parentType, 'game_log'))
        )
        .orderBy(desc(schema.comments.createdAt))
        .limit(limit + 1)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.comments)
        .where(
          and(eq(schema.comments.parentId, gameLog.id), eq(schema.comments.parentType, 'game_log'))
        );

      const hasNextPage = comments.length > limit;
      const actualComments = hasNextPage ? comments.slice(0, -1) : comments;

      const commentUsers = await Promise.all(
        actualComments.map(comment =>
          comment.userId
            ? db
                .select()
                .from(schema.users)
                .where(eq(schema.users.id, comment.userId))
                .limit(1)
                .then(rows => rows[0])
            : null
        )
      );

      const edges = actualComments.map((comment, index) => ({
        cursor: String(offset + index),
        node: {
          id: comment.id,
          userId: String(comment.userId ?? ''),
          parentId: comment.parentId,
          parentType: 'game_log' as const,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          deletedAt: comment.deletedAt,
          user: commentUsers[index]
            ? {
                id: commentUsers[index].id,
                username: commentUsers[index].username,
                emailAddress: commentUsers[index].emailAddress,
                imageUrl: commentUsers[index].imageUrl,
                firstName: commentUsers[index].firstName || '',
                lastName: commentUsers[index].lastName || '',
              }
            : {
                id: '',
                username: 'Unknown User',
                emailAddress: '',
                imageUrl: '',
                firstName: '',
                lastName: '',
              },
          reactions: [],
        },
      }));

      return {
        edges,
        pageInfo: {
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          hasNextPage,
          hasPreviousPage: offset > 0,
        },
        totalCount: count,
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  reactions: async (
    gameLog: { id: string },
    args: {
      first?: number | null;
      after?: string | null;
      last?: number | null;
      before?: string | null;
    },
    { db }: Context
  ) => {
    try {
      const { first, after } = args;
      const limit = Math.min(first ?? 20, 100); // Limit to max 100 reactions
      const offset = after ? parseInt(after, 10) : 0;

      const reactions = await db
        .select()
        .from(schema.reactions)
        .where(
          and(
            eq(schema.reactions.targetId, gameLog.id),
            eq(schema.reactions.targetType, 'game_log')
          )
        )
        .orderBy(desc(schema.reactions.createdAt))
        .limit(limit + 1) // fetch one extra to check for next page
        .offset(offset);

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.reactions)
        .where(
          and(
            eq(schema.reactions.targetId, gameLog.id),
            eq(schema.reactions.targetType, 'game_log')
          )
        );

      const hasNextPage = reactions.length > limit;
      const actualReactions = hasNextPage ? reactions.slice(0, -1) : reactions;

      // Fetch users for reactions
      const reactionUsers = await Promise.all(
        actualReactions.map(reaction =>
          reaction.userId
            ? db
                .select()
                .from(schema.users)
                .where(eq(schema.users.id, reaction.userId))
                .limit(1)
                .then(rows => rows[0])
            : null
        )
      );

      const edges = actualReactions.map((reaction, index) => ({
        cursor: String(offset + index),
        node: {
          id: reaction.id,
          emoji: getEmojiKey(reaction.emoji) as ReactionEmojiType,
          createdAt: reaction.createdAt,
          updatedAt: reaction.updatedAt,
          targetId: reaction.targetId || '',
          targetType: 'game_log' as const,
          userId: String(reaction.userId ?? ''),
          user: reactionUsers[index]
            ? {
                id: reactionUsers[index].id,
                username: reactionUsers[index].username,
                emailAddress: reactionUsers[index].emailAddress,
                imageUrl: reactionUsers[index].imageUrl,
                firstName: reactionUsers[index].firstName || '',
                lastName: reactionUsers[index].lastName || '',
              }
            : {
                id: '',
                username: 'Unknown User',
                emailAddress: '',
                imageUrl: '',
                firstName: '',
                lastName: '',
              },
        },
      }));

      return {
        edges,
        pageInfo: {
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          hasNextPage,
          hasPreviousPage: offset > 0,
        },
        totalCount: count,
      };
    } catch (error) {
      console.error('Error fetching reactions:', error);
      throw error;
    }
  },
};

export const comments = async (
  _parent: unknown,
  args: {
    parentId: string;
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  },
  { db }: Context
) => {
  try {
    const { parentId, ...paginationArgs } = args;
    const { limit, offset } = parsePaginationArgs(paginationArgs);

    const [comments, totalResult] = await Promise.all([
      db
        .select()
        .from(schema.comments)
        .where(eq(schema.comments.parentId, parentId))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.comments)
        .where(eq(schema.comments.parentId, parentId)),
    ]);

    const total = totalResult[0]?.count || 0;

    const commentsWithReactions = await Promise.all(
      comments.map(async comment => {
        if (!comment.userId) return null;

        const user = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, comment.userId))
          .limit(1)
          .then(rows => rows[0]);

        if (!user) return null;

        const commentReactions = await db
          .select()
          .from(schema.reactions)
          .where(eq(schema.reactions.targetId, comment.id));

        const reactionUsers = await Promise.all(
          commentReactions.map(reaction =>
            reaction.userId
              ? db
                  .select()
                  .from(schema.users)
                  .where(eq(schema.users.id, reaction.userId))
                  .limit(1)
                  .then(rows => rows[0])
              : null
          )
        );

        return {
          id: comment.id,
          userId: String(comment.userId ?? ''),
          parentId: comment.parentId,
          parentType: 'game_log' as const,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          deletedAt: comment.deletedAt,
          user: {
            id: user.id,
            username: user.username,
            emailAddress: user.emailAddress,
            imageUrl: user.imageUrl,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          },
          reactions: commentReactions
            .map((reactionRaw, index) => {
              const reactionUser = reactionUsers[index];
              if (!reactionUser) return null;
              return {
                id: reactionRaw.id,
                emoji: getEmojiKey(reactionRaw.emoji) as ReactionEmojiType,
                createdAt: reactionRaw.createdAt,
                updatedAt: reactionRaw.updatedAt,
                targetId: reactionRaw.targetId,
                targetType: 'game_log' as const,
                userId: String(reactionRaw.userId ?? ''),
                user: reactionUsers[index]
                  ? {
                      id: reactionUsers[index].id,
                      username: reactionUsers[index].username,
                      emailAddress: reactionUsers[index].emailAddress,
                      imageUrl: reactionUsers[index].imageUrl,
                      firstName: reactionUsers[index].firstName || '',
                      lastName: reactionUsers[index].lastName || '',
                    }
                  : {
                      id: '',
                      username: 'Unknown User',
                      emailAddress: '',
                      imageUrl: '',
                      firstName: '',
                      lastName: '',
                    },
              };
            })
            .filter((reaction): reaction is NonNullable<typeof reaction> => reaction !== null),
        };
      })
    );

    const validComments = commentsWithReactions.filter(
      (comment): comment is NonNullable<typeof comment> => comment !== null
    );

    return createConnection(validComments, total, paginationArgs);
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new GraphQLError('Failed to fetch comments', {
      extensions: {
        code: 'COMMENTS_FETCH_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    });
  }
};

export const reactions = async (
  _parent: unknown,
  args: {
    targetId: string;
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  },
  { db }: Context
) => {
  const { targetId, ...paginationArgs } = args;
  const { limit, offset } = parsePaginationArgs(paginationArgs);

  const [reactions, totalResult] = await Promise.all([
    db
      .select()
      .from(schema.reactions)
      .where(eq(schema.reactions.targetId, targetId))
      .orderBy(desc(schema.reactions.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.reactions)
      .where(eq(schema.reactions.targetId, targetId)),
  ]);

  const total = totalResult[0]?.count || 0;

  // Fetch users for reactions
  const reactionUsers = await Promise.all(
    reactions.map(reaction =>
      reaction.userId
        ? db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, reaction.userId))
            .limit(1)
            .then(rows => rows[0])
        : null
    )
  );

  const mappedReactions = reactions.map((reaction, index) => ({
    id: reaction.id,
    emoji: getEmojiKey(reaction.emoji) as ReactionEmojiType,
    createdAt: reaction.createdAt,
    updatedAt: reaction.updatedAt,
    targetId: reaction.targetId || '',
    targetType: 'game_log' as const,
    userId: String(reaction.userId ?? ''),
    user: reactionUsers[index]
      ? {
          id: reactionUsers[index].id,
          username: reactionUsers[index].username,
          emailAddress: reactionUsers[index].emailAddress,
          imageUrl: reactionUsers[index].imageUrl,
          firstName: reactionUsers[index].firstName || '',
          lastName: reactionUsers[index].lastName || '',
        }
      : {
          id: '',
          username: 'Unknown User',
          emailAddress: '',
          imageUrl: '',
          firstName: '',
          lastName: '',
        },
  }));

  return createConnection(mappedReactions, total, paginationArgs);
};

export const leagues = async (
  _parent: unknown,
  args: {
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  } = {}
) => {
  // Mock leagues data since we don't have a leagues table
  const mockLeagues = [
    { id: '1', name: 'NBA', type: 'Professional', logo: '', active: true },
    { id: '2', name: 'WNBA', type: 'Professional', logo: '', active: true },
    { id: '3', name: 'G League', type: 'Development', logo: '', active: true },
  ];

  return createConnection(mockLeagues, mockLeagues.length, args);
};

export const liveGames = async (
  _parent: unknown,
  args: {
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  } = {},
  { redis: _redis }: Context
) => {
  try {
    const liveGames = await fetchNbaLiveGames();

    // Handle empty response gracefully
    if (!liveGames || !liveGames.response || liveGames.response.length === 0) {
      return createConnection([], 0, args);
    }

    const mappedGames = liveGames.response.map(game => {
      const arenaData = game.arena as
        | { name?: string; city?: string; state?: string | null; country?: string | null }
        | string
        | null;

      return {
        id: String(game.id),
        date: {
          start: game.date?.start ? new Date(game.date.start) : new Date(),
          end: null,
          duration: null,
        },
        status: {
          clock: game.status?.clock || '',
          halftime: false,
          long: game.status?.long || '',
          short: game.status?.short || '',
        },
        arena: {
          name:
            typeof arenaData === 'object' && arenaData !== null
              ? arenaData.name || ''
              : typeof arenaData === 'string'
                ? arenaData
                : '',
          city: typeof arenaData === 'object' && arenaData !== null ? arenaData.city || '' : '',
          state: typeof arenaData === 'object' && arenaData !== null ? arenaData.state : null,
          country: typeof arenaData === 'object' && arenaData !== null ? arenaData.country : null,
        },
        league: game.league || '',
        season: game.season || 0,
        stage: game.stage || 0,
        periods: game.periods || [],
        scores: game.scores || [],
        officials: game.officials || [],
        times_tied: game.timesTied,
        lead_changes: game.leadChanges,
        nugget: game.nugget,
        createdAt: new Date(),
        updatedAt: new Date(),
        homeTeamId: game.teams?.home?.id ? String(game.teams.home.id) : '',
        awayTeamId: game.teams?.visitors?.id ? String(game.teams.visitors.id) : '',
        teams: {
          home: game.teams?.home || null,
          visitors: game.teams?.visitors || null,
        },
        is_completed: game.status?.long === 'Finished',
        awayScore: game.scores?.visitors?.points || null,
        homeScore: game.scores?.home?.points || null,
        gameType: 'LIVE',
        nbaGameId: String(game.id),
      };
    });

    return createConnection(mappedGames, mappedGames.length, args);
  } catch (error) {
    console.error('Error in liveGames resolver:', error);
    if (error instanceof BusinessLogicError) {
      throw error;
    }
    throw new BusinessLogicError(
      error instanceof Error ? error.message : 'Failed to fetch live games',
      'LIVE_GAMES_FETCH_ERROR'
    );
  }
};

export const gameLog = async (
  _parent: unknown,
  { userId, gameId }: { userId: string; gameId: string },
  { db }: Context
) => {
  try {
    const conditions: SQL<unknown>[] = [];
    conditions.push(eq(schema.game_logs.userId, userId));
    conditions.push(eq(schema.game_logs.gameId, gameId));

    const query = db
      .select()
      .from(schema.game_logs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(1);

    const gameLog = await query.then(rows => rows[0]);

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
    console.error('Error fetching game log:', error);
    throw error;
  }
};

import type { InferSelectModel } from 'drizzle-orm';
import { desc, eq, sql, SQL, and, or } from 'drizzle-orm';
import { GraphQLError } from 'graphql';

import { CACHE_KEYS, getCache } from '@/lib/cache';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { fetchNbaLiveGames } from '@/lib/external-apis';
import { NotFoundError, BusinessLogicError } from '@/lib/graphql/errors';
import { transformUserToSummary } from '@/lib/graphql/resolvers/transformers';
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
import type { User } from '@/lib/types/generated/graphql';

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
  state?: string;
  country?: string;
}

// Type for game data from database
interface GameData {
  id: string;
  date: Date | string;
  status: string;
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
  created_at: Date | string;
  updated_at: Date | string;
  teams: GameTeams;
  [key: string]: unknown;
}

// Type for mapped game data
interface MappedGame {
  id: string;
  date: {
    start: string;
    end: null;
    duration: null;
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
  timesTied: number | null;
  leadChanges: number | null;
  nugget: string | null;
  created_at: string;
  updated_at: string;
  homeTeamId: string;
  awayTeamId: string;
  teams: {
    home: GameTeam | null;
    visitors: GameTeam | null;
  };
  isCompleted: boolean;
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
    display_year: season.display_year,
    start_date: season.start_date,
    end_date: season.end_date,
    is_current: season.is_current,
    is_playoffs: season.is_playoffs,
  }));

  return createConnection(mappedSeasons, total, args);
};

export const games = async (
  _parent: unknown,
  args: {
    filters?: {
      game_id?: string;
      status?: string;
      dateRange?: { start?: string; end?: string };
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
    const conditions: SQL[] = [];

    if (filters) {
      if (filters.game_id) {
        conditions.push(eq(schema.nba_games.id, filters.game_id));
      }
      if (filters.status) {
        conditions.push(eq(schema.nba_games.status, filters.status));
      }
      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        if (start) {
          conditions.push(sql`${schema.nba_games.date} >= ${start}`);
        }
        if (end) {
          conditions.push(sql`${schema.nba_games.date} <= ${end}`);
        }
      }
    }

    const query = db
      .select()
      .from(schema.nba_games)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    const [items, totalResult] = await Promise.all([
      query,
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.nba_games)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ]);

    const total = totalResult[0]?.count || 0;

    const mappedGames = items.map(game => ({
      id: game.id,
      date: {
        start:
          typeof game.date === 'string'
            ? new Date(game.date)
            : game.date instanceof Date
              ? game.date
              : new Date(),
        end: null,
        duration: null,
      },
      status: {
        clock: game.periods?.current?.toString() || '',
        halftime: false,
        long: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
        short: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
      },
      arena: typeof game.arena === 'string' ? game.arena : String(game.arena ?? ''),
      league: typeof game.league === 'string' ? game.league : String(game.league ?? ''),
      season: typeof game.season === 'number' ? game.season : Number(game.season ?? 0),
      stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
      periods: game.periods ?? [],
      scores: game.scores ?? [],
      officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
      timesTied: typeof game.times_tied === 'number' ? game.times_tied : null,
      leadChanges: typeof game.lead_changes === 'number' ? game.lead_changes : null,
      nugget: typeof game.nugget === 'string' ? game.nugget : null,
      created_at:
        game.created_at instanceof Date ? game.created_at : new Date(game.created_at as string),
      updated_at:
        game.updated_at instanceof Date ? game.updated_at : new Date(game.updated_at as string),
      homeTeamId: game.teams?.home?.id || '',
      awayTeamId: game.teams?.visitors?.id || '',
      teams: game.teams ?? {},
      isCompleted: game.status === 'FINISHED',
      away_score: (game.scores as GameScores)?.visitors?.points || null,
      home_score: (game.scores as GameScores)?.home?.points || null,
      game_type: 'REGULAR',
      nba_game_id: game.id,
    }));

    return createConnection(mappedGames, total, paginationArgs);
  } catch (error) {
    console.error('Error fetching games:', error);
    throw new BusinessLogicError('Failed to fetch games', 'GAMES_FETCH_ERROR');
  }
};

export const game = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
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

  return {
    id: game.id,
    date: {
      start:
        typeof game.date === 'string'
          ? game.date
          : game.date instanceof Date
            ? game.date.toISOString()
            : '',
      end: null,
      duration: null,
    },
    status: {
      clock: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
      halftime: false,
      long: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
      short: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
    },
    arena: typeof game.arena === 'string' ? game.arena : String(game.arena ?? ''),
    league: typeof game.league === 'string' ? game.league : String(game.league ?? ''),
    season: typeof game.season === 'number' ? game.season : Number(game.season ?? 0),
    stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
    periods: game.periods ?? [],
    scores: game.scores ?? [],
    officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
    timesTied: typeof game.times_tied === 'number' ? game.times_tied : null,
    leadChanges: typeof game.lead_changes === 'number' ? game.lead_changes : null,
    nugget: typeof game.nugget === 'string' ? game.nugget : null,
    created_at:
      game.created_at instanceof Date ? game.created_at : new Date(game.created_at as string),
    updated_at:
      game.updated_at instanceof Date ? game.updated_at : new Date(game.updated_at as string),
    homeTeamId: typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
    awayTeamId: typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
    teams,
    isCompleted: game.status === 'Finished',
    away_score: (game.scores as GameScores)?.visitors?.points || null,
    home_score: (game.scores as GameScores)?.home?.points || null,
    game_type: 'REGULAR',
    nba_game_id: game.id,
  };
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
      code: team.abbreviation,
      nickname: team.name,
      logo: team.logo_url,
      conference: team.conference,
      division: team.division,
      logo_url: team.logo_url,
      primary_color: team.primary_color,
      secondary_color: team.secondary_color,
      created_at: team.created_at,
      updated_at: team.updated_at,
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
      first_name: player.firstname,
      last_name: player.lastname,
      birth: player.birth,
      nba: player.nba,
      height: player.height,
      weight: player.weight,
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
      seasons_active: player.seasons_active,
      created_at: player.created_at,
      updated_at: player.updated_at,
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
    firstName: player.firstname,
    lastName: player.lastname,
    teamId: '',
    birthDate: (player.birth as { date?: string | null })?.date || null,
    birthCountry: (player.birth as { country?: string | null })?.country || null,
    heightFeet: (player.height as { feets?: number | null })?.feets || null,
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
    seasonsActive: player.seasons_active,
    created_at: player.created_at,
    updated_at: player.updated_at,
  };
};

export const gameStats = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  try {
    const gameStats = await db
      .select({
        id: schema.game_stats.id,
        game_id: schema.game_stats.game_id,
        season_id: schema.game_stats.season_id,
        home_team_id: schema.game_stats.home_team_id,
        away_team_id: schema.game_stats.away_team_id,
        game_date: schema.game_stats.game_date,
        home_score: schema.game_stats.home_score,
        away_score: schema.game_stats.away_score,
        status: schema.game_stats.status,
        home_fast_break_points: schema.game_stats.home_fast_break_points,
        home_points_in_paint: schema.game_stats.home_points_in_paint,
        home_biggest_lead: schema.game_stats.home_biggest_lead,
        home_second_chance_points: schema.game_stats.home_second_chance_points,
        home_points_off_turnovers: schema.game_stats.home_points_off_turnovers,
        home_longest_run: schema.game_stats.home_longest_run,
        home_fgm: schema.game_stats.home_fgm,
        home_fga: schema.game_stats.home_fga,
        home_fgp: schema.game_stats.home_fgp,
        home_ftm: schema.game_stats.home_ftm,
        home_fta: schema.game_stats.home_fta,
        home_ftp: schema.game_stats.home_ftp,
        home_tpm: schema.game_stats.home_tpm,
        home_tpa: schema.game_stats.home_tpa,
        home_tpp: schema.game_stats.home_tpp,
        home_off_reb: schema.game_stats.home_off_reb,
        home_def_reb: schema.game_stats.home_def_reb,
        home_tot_reb: schema.game_stats.home_tot_reb,
        home_assists: schema.game_stats.home_assists,
        home_p_fouls: schema.game_stats.home_p_fouls,
        home_steals: schema.game_stats.home_steals,
        home_turnovers: schema.game_stats.home_turnovers,
        home_blocks: schema.game_stats.home_blocks,
        home_plus_minus: schema.game_stats.home_plus_minus,
        home_minutes: schema.game_stats.home_minutes,
        away_fast_break_points: schema.game_stats.away_fast_break_points,
        away_points_in_paint: schema.game_stats.away_points_in_paint,
        away_biggest_lead: schema.game_stats.away_biggest_lead,
        away_second_chance_points: schema.game_stats.away_second_chance_points,
        away_points_off_turnovers: schema.game_stats.away_points_off_turnovers,
        away_longest_run: schema.game_stats.away_longest_run,
        away_fgm: schema.game_stats.away_fgm,
        away_fga: schema.game_stats.away_fga,
        away_fgp: schema.game_stats.away_fgp,
        away_ftm: schema.game_stats.away_ftm,
        away_fta: schema.game_stats.away_fta,
        away_ftp: schema.game_stats.away_ftp,
        away_tpm: schema.game_stats.away_tpm,
        away_tpa: schema.game_stats.away_tpa,
        away_tpp: schema.game_stats.away_tpp,
        away_off_reb: schema.game_stats.away_off_reb,
        away_def_reb: schema.game_stats.away_def_reb,
        away_tot_reb: schema.game_stats.away_tot_reb,
        away_assists: schema.game_stats.away_assists,
        away_p_fouls: schema.game_stats.away_p_fouls,
        away_steals: schema.game_stats.away_steals,
        away_turnovers: schema.game_stats.away_turnovers,
        away_blocks: schema.game_stats.away_blocks,
        away_plus_minus: schema.game_stats.away_plus_minus,
        away_minutes: schema.game_stats.away_minutes,
        stats: schema.game_stats.stats,
        created_at: schema.game_stats.created_at,
        updated_at: schema.game_stats.updated_at,
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
      .where(eq(schema.nba_games.id, gameStats.game_id as string))
      .limit(1)
      .then((rows: DatabaseRow[]) => rows[0])) as unknown as GameData;

    if (!game) {
      throw new NotFoundError('Game', gameStats.game_id as string);
    }

    const teams = game.teams || {};
    const homeTeamId = teams.home?.id || null;
    const awayTeamId = teams.visitors?.id || null;

    const mappedGame: MappedGame = {
      id: game.id,
      date: {
        start:
          game.date instanceof Date
            ? game.date.toISOString()
            : typeof game.date === 'string'
              ? game.date
              : new Date().toISOString(),
        end: null,
        duration: null,
      },
      status: {
        clock: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
        halftime: false,
        long: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
        short: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
      },
      arena: typeof game.arena === 'string' ? game.arena : String(game.arena ?? ''),
      league: typeof game.league === 'string' ? game.league : String(game.league ?? ''),
      season: typeof game.season === 'number' ? game.season : Number(game.season ?? 0),
      stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
      periods: game.periods ?? [],
      scores: game.scores ?? [],
      officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
      timesTied: typeof game.times_tied === 'number' ? game.times_tied : null,
      leadChanges: typeof game.lead_changes === 'number' ? game.lead_changes : null,
      nugget: typeof game.nugget === 'string' ? game.nugget : null,
      created_at:
        game.created_at instanceof Date
          ? game.created_at.toISOString()
          : String(game.created_at ?? ''),
      updated_at:
        game.updated_at instanceof Date
          ? game.updated_at.toISOString()
          : String(game.updated_at ?? ''),
      homeTeamId:
        typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
      awayTeamId:
        typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
      teams: {
        home: game.teams?.home || null,
        visitors: game.teams?.visitors || null,
      },
      isCompleted: game.status === 'Final' || game.status === 'Completed',
    };

    // Fetch home and away teams
    const [homeTeam, awayTeam] = await Promise.all([
      db
        .select()
        .from(schema.teams)
        .where(eq(schema.teams.id, gameStats.home_team_id as string))
        .limit(1)
        .then((rows: DatabaseRow[]) => rows[0]),
      db
        .select()
        .from(schema.teams)
        .where(eq(schema.teams.id, gameStats.away_team_id as string))
        .limit(1)
        .then((rows: DatabaseRow[]) => rows[0]),
    ]);

    return {
      id: gameStats.id,
      game: mappedGame,
      season_id: gameStats.season_id,
      homeTeam: homeTeam
        ? {
            ...homeTeam,
            allStar: homeTeam.all_star,
            nbaFranchise: homeTeam.nba_franchise,
          }
        : null,
      awayTeam: awayTeam
        ? {
            ...awayTeam,
            allStar: awayTeam.all_star,
            nbaFranchise: awayTeam.nba_franchise,
          }
        : null,
      gameDate: gameStats.game_date,
      homeScore: gameStats.home_score,
      awayScore: gameStats.away_score,
      status: gameStats.status,
      homeFastBreakPoints: gameStats.home_fast_break_points,
      homePointsInPaint: gameStats.home_points_in_paint,
      homeBiggestLead: gameStats.home_biggest_lead,
      homeSecondChancePoints: gameStats.home_second_chance_points,
      homePointsOffTurnovers: gameStats.home_points_off_turnovers,
      homeLongestRun: gameStats.home_longest_run,
      homeFgm: gameStats.home_fgm,
      homeFga: gameStats.home_fga,
      homeFgp: gameStats.home_fgp ? parseFloat(gameStats.home_fgp.toString()) : undefined,
      homeFtm: gameStats.home_ftm,
      homeFta: gameStats.home_fta,
      homeFtp: gameStats.home_ftp ? parseFloat(gameStats.home_ftp.toString()) : undefined,
      homeTpm: gameStats.home_tpm,
      homeTpa: gameStats.home_tpa,
      homeTpp: gameStats.home_tpp ? parseFloat(gameStats.home_tpp.toString()) : undefined,
      homeOffReb: gameStats.home_off_reb,
      homeDefReb: gameStats.home_def_reb,
      homeTotReb: gameStats.home_tot_reb,
      homeAssists: gameStats.home_assists,
      homePFouls: gameStats.home_p_fouls,
      homeSteals: gameStats.home_steals,
      homeTurnovers: gameStats.home_turnovers,
      homeBlocks: gameStats.home_blocks,
      homePlusMinus: gameStats.home_plus_minus,
      homeMinutes: gameStats.home_minutes,
      awayFastBreakPoints: gameStats.away_fast_break_points,
      awayPointsInPaint: gameStats.away_points_in_paint,
      awayBiggestLead: gameStats.away_biggest_lead,
      awaySecondChancePoints: gameStats.away_second_chance_points,
      awayPointsOffTurnovers: gameStats.away_points_off_turnovers,
      awayLongestRun: gameStats.away_longest_run,
      awayFgm: gameStats.away_fgm,
      awayFga: gameStats.away_fga,
      awayFgp: gameStats.away_fgp ? parseFloat(gameStats.away_fgp.toString()) : undefined,
      awayFtm: gameStats.away_ftm,
      awayFta: gameStats.away_fta,
      awayFtp: gameStats.away_ftp ? parseFloat(gameStats.away_ftp.toString()) : undefined,
      awayTpm: gameStats.away_tpm,
      awayTpa: gameStats.away_tpa,
      awayTpp: gameStats.away_tpp ? parseFloat(gameStats.away_tpp.toString()) : undefined,
      awayOffReb: gameStats.away_off_reb,
      awayDefReb: gameStats.away_def_reb,
      awayTotReb: gameStats.away_tot_reb,
      awayAssists: gameStats.away_assists,
      awayPFouls: gameStats.away_p_fouls,
      awaySteals: gameStats.away_steals,
      awayTurnovers: gameStats.away_turnovers,
      awayBlocks: gameStats.away_blocks,
      awayPlusMinus: gameStats.away_plus_minus,
      awayMinutes: gameStats.away_minutes,
      stats: gameStats.stats,
      created_at: gameStats.created_at,
      updated_at: gameStats.updated_at,
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
        eq(schema.nba_player_stats.player_id, playerId),
        eq(schema.nba_player_stats.game_id, gameId)
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
  { game_id, team }: { game_id: string; team: string },
  { db }: Context
) => {
  try {
    const stats = await db.query.game_stats.findFirst({
      where: and(
        eq(schema.game_stats.game_id, game_id),
        or(eq(schema.game_stats.home_team_id, team), eq(schema.game_stats.away_team_id, team))
      ),
      with: {
        game: true,
        season: true,
        home_team: true,
        away_team: true,
      },
    });

    if (!stats) {
      throw new NotFoundError('TeamGameStats', `${game_id}:${team}`);
    }

    // Fetch the full game object from nba_games
    const dbGame = await db.query.nba_games.findFirst({
      where: eq(schema.nba_games.id, stats.game_id),
    });
    if (!dbGame) throw new NotFoundError('Game', stats.game_id);
    const teams = dbGame.teams || {};
    const homeTeamId =
      typeof teams === 'object' &&
      teams !== null &&
      'home' in teams &&
      teams.home &&
      typeof teams.home === 'object' &&
      'id' in teams.home
        ? teams.home.id
        : null;
    const awayTeamId =
      typeof teams === 'object' &&
      teams !== null &&
      'visitors' in teams &&
      teams.visitors &&
      typeof teams.visitors === 'object' &&
      'id' in teams.visitors
        ? teams.visitors.id
        : null;
    const mappedGame = {
      id: dbGame.id,
      date: {
        start:
          typeof dbGame.date === 'string'
            ? dbGame.date
            : dbGame.date instanceof Date
              ? dbGame.date.toISOString()
              : '',
        end: null,
        duration: null,
      },
      status: typeof dbGame.status === 'string' ? dbGame.status : String(dbGame.status ?? ''),
      arena:
        dbGame.arena && typeof dbGame.arena === 'object'
          ? JSON.stringify({
              name: (dbGame.arena as Record<string, unknown>).name || '',
              city: (dbGame.arena as Record<string, unknown>).city || '',
              state: (dbGame.arena as Record<string, unknown>).state || '',
              country: (dbGame.arena as Record<string, unknown>).country || '',
            })
          : typeof dbGame.arena === 'string'
            ? dbGame.arena
            : '',
      league: typeof dbGame.league === 'string' ? dbGame.league : String(dbGame.league ?? ''),
      season: typeof dbGame.season === 'number' ? dbGame.season : Number(dbGame.season ?? 0),
      stage: typeof dbGame.stage === 'number' ? dbGame.stage : Number(dbGame.stage ?? 0),
      periods: dbGame.periods ?? [],
      scores: dbGame.scores ?? [],
      officials: Array.isArray(dbGame.officials) ? dbGame.officials.map(String) : [],
      timesTied: typeof dbGame.times_tied === 'number' ? dbGame.times_tied : null,
      leadChanges: typeof dbGame.lead_changes === 'number' ? dbGame.lead_changes : null,
      nugget: typeof dbGame.nugget === 'string' ? dbGame.nugget : null,
      created_at:
        typeof dbGame.created_at === 'string'
          ? dbGame.created_at
          : dbGame.created_at instanceof Date
            ? dbGame.created_at.toISOString()
            : '',
      updated_at:
        typeof dbGame.updated_at === 'string'
          ? dbGame.updated_at
          : dbGame.updated_at instanceof Date
            ? dbGame.updated_at.toISOString()
            : '',
      homeTeamId:
        typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
      awayTeamId:
        typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
      teams: dbGame.teams ?? {},
      isCompleted: dbGame.status === 'Final' || dbGame.status === 'Completed',
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
      logo_url: team.logo_url,
      primary_color: team.primary_color,
      secondary_color: team.secondary_color,
    });

    // Map the stats to the correct GraphQL type
    return {
      id: stats.id ?? '',
      game: mappedGame,
      team: team === stats.home_team_id ? mapTeam(stats.home_team) : mapTeam(stats.away_team),
      assists: team === stats.home_team_id ? (stats.home_assists ?? 0) : (stats.away_assists ?? 0),
      blocks: team === stats.home_team_id ? (stats.home_blocks ?? 0) : (stats.away_blocks ?? 0),
      fieldGoals: {
        made: team === stats.home_team_id ? (stats.home_fgm ?? 0) : (stats.away_fgm ?? 0),
        attempted: team === stats.home_team_id ? (stats.home_fga ?? 0) : (stats.away_fga ?? 0),
        percentage: (team === stats.home_team_id
          ? (stats.home_fgp ?? 0)
          : (stats.away_fgp ?? 0)
        ).toString(),
      },
      fouls: team === stats.home_team_id ? (stats.home_p_fouls ?? 0) : (stats.away_p_fouls ?? 0),
      freeThrows: {
        made: team === stats.home_team_id ? (stats.home_ftm ?? 0) : (stats.away_ftm ?? 0),
        attempted: team === stats.home_team_id ? (stats.home_fta ?? 0) : (stats.away_fta ?? 0),
        percentage: (team === stats.home_team_id
          ? (stats.home_ftp ?? 0)
          : (stats.away_ftp ?? 0)
        ).toString(),
      },
      points: team === stats.home_team_id ? (stats.home_score ?? 0) : (stats.away_score ?? 0),
      rebounds: team === stats.home_team_id ? (stats.home_tot_reb ?? 0) : (stats.away_tot_reb ?? 0),
      steals: team === stats.home_team_id ? (stats.home_steals ?? 0) : (stats.away_steals ?? 0),
      threePointers: {
        made: team === stats.home_team_id ? (stats.home_tpm ?? 0) : (stats.away_tpm ?? 0),
        attempted: team === stats.home_team_id ? (stats.home_tpa ?? 0) : (stats.away_tpa ?? 0),
        percentage: (team === stats.home_team_id
          ? (stats.home_tpp ?? 0)
          : (stats.away_tpp ?? 0)
        ).toString(),
      },
      turnovers:
        team === stats.home_team_id ? (stats.home_turnovers ?? 0) : (stats.away_turnovers ?? 0),
      created_at: stats.created_at,
      updated_at: stats.updated_at,
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
    email: user.email_address || '',
    email_address: user.email_address,
    imageUrl: user.image_url,
    avatar_url: user.image_url,
    first_name: user.first_name,
    last_name: user.last_name,
    created_at: user.created_at,
    updated_at: user.updated_at,
    deleted_at: user.deleted_at,
    comments: [],
    gameLogs: [],
    initiated_friendships: [],
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
    first_name: user.first_name,
    last_name: user.last_name,
    email_address: user.email_address,
    image_url: user.image_url,
    inbound_friendship_ids: user.inbound_friendship_ids,
    outbound_friendship_ids: user.outbound_friendship_ids,
    banned: user.banned,
    created_at: user.created_at,
    updated_at: user.updated_at,
    last_sign_in_at: user.last_sign_in_at,
    password_enabled: user.password_enabled,
    two_factor_enabled: user.two_factor_enabled,
    email_verified: user.email_verified,
    email_verification_strategy: user.email_verification_strategy,
    external_id: user.external_id,
    external_accounts: user.external_accounts,
    deleted_at: user.deleted_at,
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
  const { limit, offset } = parsePaginationArgs(paginationArgs);

  const [friendships, totalResult] = await Promise.all([
    db.query.friendships.findMany({
      where: or(eq(schema.friendships.user_id, userId), eq(schema.friendships.friend_id, userId)),
      with: {
        user: true,
        friend: true,
      },
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.friendships)
      .where(or(eq(schema.friendships.user_id, userId), eq(schema.friendships.friend_id, userId))),
  ]);

  const total = totalResult[0]?.count || 0;

  const mappedFriendships = friendships
    .map((friendship: typeof schema.friendships.$inferSelect & { user?: User; friend?: User }) => {
      const friend = friendship.user_id === userId ? friendship.friend : friendship.user;
      if (!friend) return null;

      return {
        id: (friend as User).id,
        username: (friend as User).username,
        email_address: (friend as User).email_address,
        imageUrl: (friend as User).imageUrl,
        avatar_url: (friend as User).avatar_url,
        created_at: new Date(),
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
      user_id?: string;
      game_id?: string;
      classification?: string;
      watched_date_range?: { start?: string; end?: string };
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

    if (filters?.user_id) {
      conditions.push(eq(schema.game_logs.user_id, filters.user_id));
    }
    if (filters?.game_id) {
      conditions.push(eq(schema.game_logs.game_id, filters.game_id));
    }
    if (filters?.classification) {
      conditions.push(eq(schema.game_logs.classification, filters.classification));
    }
    if (filters?.watched_date_range) {
      const { start, end } = filters.watched_date_range;
      if (start) {
        conditions.push(sql`${schema.game_logs.watched_date} >= ${start}`);
      }
      if (end) {
        conditions.push(sql`${schema.game_logs.watched_date} <= ${end}`);
      }
    }

    const [gameLogs, totalResult] = await Promise.all([
      db
        .select()
        .from(schema.game_logs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(schema.game_logs.created_at))
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
          .where(eq(schema.users.id, gameLog.user_id as string))
          .limit(1)
          .then(rows => rows[0]);

        // Fetch game data
        const game = await db
          .select()
          .from(schema.nba_games)
          .where(eq(schema.nba_games.id, gameLog.game_id as string))
          .limit(1)
          .then(rows => rows[0]);

        // Fetch comments for this game log with pagination
        const [comments, commentsTotal] = await Promise.all([
          db
            .select()
            .from(schema.comments)
            .where(
              and(
                eq(schema.comments.parent_id, gameLogId),
                eq(schema.comments.parent_type, 'game_log')
              )
            )
            .orderBy(desc(schema.comments.created_at))
            .limit(10),
          db
            .select({ count: sql<number>`count(*)` })
            .from(schema.comments)
            .where(
              and(
                eq(schema.comments.parent_id, gameLogId),
                eq(schema.comments.parent_type, 'game_log')
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
                eq(schema.reactions.target_id, gameLogId),
                eq(schema.reactions.target_type, 'game_log')
              )
            )
            .orderBy(desc(schema.reactions.created_at))
            .limit(10),
          db
            .select({ count: sql<number>`count(*)` })
            .from(schema.reactions)
            .where(
              and(
                eq(schema.reactions.target_id, gameLogId),
                eq(schema.reactions.target_type, 'game_log')
              )
            ),
        ]);

        // Fetch users for comments and reactions
        const [commentUsers, reactionUsers] = await Promise.all([
          Promise.all(
            comments.map(comment =>
              comment.user_id
                ? db
                    .select()
                    .from(schema.users)
                    .where(eq(schema.users.id, comment.user_id))
                    .limit(1)
                    .then(rows => rows[0])
                : null
            )
          ),
          Promise.all(
            reactions.map(reaction =>
              reaction.user_id
                ? db
                    .select()
                    .from(schema.users)
                    .where(eq(schema.users.id, reaction.user_id))
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
            userId: gameLog.user_id as string,
            gameId: gameLog.game_id as string,
            watchedSetting: gameLog.watched_setting as string,
            watchedDate: gameLog.watched_date as Date,
            watchedLocation: gameLog.watched_location as string,
            rating: gameLog.rating_for_game as number,
            ratingForGame: gameLog.rating_for_game as number,
            ratingStars: gameLog.rating_stars
              ? Number.isNaN(Number(gameLog.rating_stars))
                ? null
                : Math.round(Number(gameLog.rating_stars))
              : null,
            watchedCount: gameLog.watched_count as number,
            notes: gameLog.notes as string,
            tags: gameLog.tags as string[],
            classification: gameLog.classification as string,
            created_at: gameLog.created_at as Date,
            updated_at: gameLog.updated_at as Date,
            deleted_at: gameLog.deleted_at as Date | null,
            user: user
              ? {
                  id: user.id,
                  username: user.username,
                  email_address: user.email_address,
                  imageUrl: user.image_url,
                  first_name: user.first_name || '',
                  last_name: user.last_name || '',
                }
              : {
                  id: '',
                  username: 'Unknown User',
                  email_address: '',
                  imageUrl: '',
                  first_name: '',
                  last_name: '',
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
                  userId: String(comment.user_id),
                  parent_id: comment.parent_id,
                  parent_type: 'game_log' as const,
                  content: comment.content,
                  created_at: comment.created_at,
                  updated_at: comment.updated_at,
                  deleted_at: comment.deleted_at,
                  user: commentUsers[i]
                    ? {
                        id: commentUsers[i].id,
                        username: commentUsers[i].username,
                        email_address: commentUsers[i].email_address,
                        imageUrl: commentUsers[i].image_url,
                        first_name: commentUsers[i].first_name || '',
                        last_name: commentUsers[i].last_name || '',
                      }
                    : {
                        id: '',
                        username: 'Unknown User',
                        email_address: '',
                        imageUrl: '',
                        first_name: '',
                        last_name: '',
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
                  created_at: reaction.created_at,
                  updated_at: reaction.updated_at,
                  targetId: reaction.target_id || '',
                  targetType: reaction.target_type,
                  userId: reaction.user_id || '',
                  user: reactionUsers[i]
                    ? {
                        id: reactionUsers[i].id,
                        username: reactionUsers[i].username,
                        email_address: reactionUsers[i].email_address,
                        imageUrl: reactionUsers[i].image_url,
                        first_name: reactionUsers[i].first_name || '',
                        last_name: reactionUsers[i].last_name || '',
                      }
                    : {
                        id: '',
                        username: 'Unknown User',
                        email_address: '',
                        imageUrl: '',
                        first_name: '',
                        last_name: '',
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
          and(
            eq(schema.comments.parent_id, gameLog.id),
            eq(schema.comments.parent_type, 'game_log')
          )
        )
        .orderBy(desc(schema.comments.created_at))
        .limit(limit + 1)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.comments)
        .where(
          and(
            eq(schema.comments.parent_id, gameLog.id),
            eq(schema.comments.parent_type, 'game_log')
          )
        );

      const hasNextPage = comments.length > limit;
      const actualComments = hasNextPage ? comments.slice(0, -1) : comments;

      const commentUsers = await Promise.all(
        actualComments.map(comment =>
          comment.user_id
            ? db
                .select()
                .from(schema.users)
                .where(eq(schema.users.id, comment.user_id))
                .limit(1)
                .then(rows => rows[0])
            : null
        )
      );

      const edges = actualComments.map((comment, index) => ({
        cursor: String(offset + index),
        node: {
          id: comment.id,
          userId: String(comment.user_id),
          parent_id: comment.parent_id,
          parent_type: 'game_log' as const,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          deleted_at: comment.deleted_at,
          user: commentUsers[index]
            ? {
                id: commentUsers[index].id,
                username: commentUsers[index].username,
                email_address: commentUsers[index].email_address,
                imageUrl: commentUsers[index].image_url,
                first_name: commentUsers[index].first_name || '',
                last_name: commentUsers[index].last_name || '',
              }
            : {
                id: '',
                username: 'Unknown User',
                email_address: '',
                imageUrl: '',
                first_name: '',
                last_name: '',
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
            eq(schema.reactions.target_id, gameLog.id),
            eq(schema.reactions.target_type, 'game_log')
          )
        )
        .orderBy(desc(schema.reactions.created_at))
        .limit(limit + 1) // fetch one extra to check for next page
        .offset(offset);

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.reactions)
        .where(
          and(
            eq(schema.reactions.target_id, gameLog.id),
            eq(schema.reactions.target_type, 'game_log')
          )
        );

      const hasNextPage = reactions.length > limit;
      const actualReactions = hasNextPage ? reactions.slice(0, -1) : reactions;

      // Fetch users for reactions
      const reactionUsers = await Promise.all(
        actualReactions.map(reaction =>
          reaction.user_id
            ? db
                .select()
                .from(schema.users)
                .where(eq(schema.users.id, reaction.user_id))
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
          created_at: reaction.created_at,
          updated_at: reaction.updated_at,
          targetId: reaction.target_id || '',
          targetType: reaction.target_type,
          userId: reaction.user_id || '',
          user: reactionUsers[index]
            ? {
                id: reactionUsers[index].id,
                username: reactionUsers[index].username,
                email_address: reactionUsers[index].email_address,
                imageUrl: reactionUsers[index].image_url,
                first_name: reactionUsers[index].first_name || '',
                last_name: reactionUsers[index].last_name || '',
              }
            : {
                id: '',
                username: 'Unknown User',
                email_address: '',
                imageUrl: '',
                first_name: '',
                last_name: '',
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
    parent_id: string;
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  },
  { db }: Context
) => {
  const { parent_id, ...paginationArgs } = args;
  const { limit, offset } = parsePaginationArgs(paginationArgs);

  const [comments, totalResult] = await Promise.all([
    db
      .select()
      .from(schema.comments)
      .where(
        and(eq(schema.comments.parent_id, parent_id), eq(schema.comments.parent_type, 'game_log'))
      )
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.comments)
      .where(
        and(eq(schema.comments.parent_id, parent_id), eq(schema.comments.parent_type, 'game_log'))
      ),
  ]);

  const total = totalResult[0]?.count || 0;

  const commentsWithReactions = await Promise.all(
    comments.map(async comment => {
      if (!comment.user_id) return null;

      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, comment.user_id))
        .limit(1)
        .then(rows => rows[0]);

      if (!user) return null;

      const commentReactions = await db
        .select()
        .from(schema.reactions)
        .where(eq(schema.reactions.target_id, comment.id));

      const reactionUsers = await Promise.all(
        commentReactions.map(reaction =>
          reaction.user_id
            ? db
                .select()
                .from(schema.users)
                .where(eq(schema.users.id, reaction.user_id))
                .limit(1)
                .then(rows => rows[0])
            : null
        )
      );

      return {
        id: comment.id,
        userId: String(comment.user_id),
        parent_id: comment.parent_id,
        parent_type: 'game_log' as const,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        deleted_at: comment.deleted_at,
        user: transformUserToSummary(user as unknown as User),
        reactions: commentReactions
          .map((reactionRaw, index) => {
            const reactionUser = reactionUsers[index];
            if (!reactionUser) return null;
            return {
              id: reactionRaw.id,
              emoji: getEmojiKey(reactionRaw.emoji) as ReactionEmojiType,
              created_at: reactionRaw.created_at,
              updated_at: reactionRaw.updated_at,
              targetId: reactionRaw.target_id,
              targetType: reactionRaw.target_type,
              userId: reactionRaw.user_id || '',
              user: transformUserToSummary(reactionUser as unknown as User),
              __typename: 'Reaction' as const,
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
      .where(eq(schema.reactions.target_id, targetId))
      .orderBy(desc(schema.reactions.created_at))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.reactions)
      .where(eq(schema.reactions.target_id, targetId)),
  ]);

  const total = totalResult[0]?.count || 0;

  // Fetch users for reactions
  const reactionUsers = await Promise.all(
    reactions.map(reaction =>
      reaction.user_id
        ? db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, reaction.user_id))
            .limit(1)
            .then(rows => rows[0])
        : null
    )
  );

  const mappedReactions = reactions.map((reaction, index) => ({
    id: reaction.id,
    emoji: getEmojiKey(reaction.emoji) as ReactionEmojiType,
    created_at: reaction.created_at,
    updated_at: reaction.updated_at,
    targetId: reaction.target_id || '',
    targetType: reaction.target_type,
    userId: reaction.user_id || '',
    user: reactionUsers[index]
      ? transformUserToSummary(reactionUsers[index] as unknown as User)
      : {
          id: '',
          username: 'Unknown User',
          email_address: '',
          imageUrl: '',
          first_name: '',
          last_name: '',
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
      console.log('No live games available');
      return createConnection([], 0, args);
    }

    const mappedGames = liveGames.response.map(game => {
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
        arena: game.arena?.name || '',
        league: game.league || '',
        season: game.season || 0,
        stage: game.stage || 0,
        periods: game.periods || [],
        scores: game.scores || [],
        officials: game.officials || [],
        timesTied: game.timesTied,
        leadChanges: game.leadChanges,
        nugget: game.nugget,
        created_at: new Date(),
        updated_at: new Date(),
        homeTeamId: game.teams?.home?.id ? String(game.teams.home.id) : '',
        awayTeamId: game.teams?.visitors?.id ? String(game.teams.visitors.id) : '',
        teams: {
          home: game.teams?.home || null,
          visitors: game.teams?.visitors || null,
        },
        isCompleted: game.status?.long === 'Finished',
        away_score: game.scores?.visitors?.points || null,
        home_score: game.scores?.home?.points || null,
        game_type: 'LIVE',
        nba_game_id: String(game.id),
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
    conditions.push(eq(schema.game_logs.user_id, userId));
    conditions.push(eq(schema.game_logs.game_id, gameId));

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
      userId: gameLog.user_id,
      gameId: gameLog.game_id,
      watchedSetting: gameLog.watched_setting,
      watchedDate: gameLog.watched_date,
      watchedLocation: gameLog.watched_location,
      ratingForGame: gameLog.rating_for_game,
      watchedCount: gameLog.watched_count,
      notes: gameLog.notes,
      tags: gameLog.tags,
      classification: gameLog.classification,
      created_at: gameLog.created_at,
      updated_at: gameLog.updated_at,
      deleted_at: gameLog.deleted_at,
    };
  } catch (error) {
    console.error('Error fetching game log:', error);
    throw error;
  }
};

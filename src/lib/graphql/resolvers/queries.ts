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
  CACHE_TTL,
  Context,
  GameLogFilters as GqlGameLogFilters,
  QuerygamesArgs,
  QueryteamsArgs,
  QueryplayersArgs,
  QueryusersArgs,
  DatabaseRow,
  GameTeamSortInput,
} from '@/lib/types';
import type { User, UserSummary } from '@/lib/types';

export const seasons = async () => {
  const dbSeasons = await db.query.seasons.findMany();
  return dbSeasons.map(season => ({
    id: String(season.id),
    year: season.year,
    display_year: season.display_year,
    start_date: season.start_date.toISOString(),
    end_date: season.end_date.toISOString(),
    current: season.is_current,
    is_current: season.is_current,
    type: season.is_playoffs ? 'playoffs' : 'regular',
    is_playoffs: season.is_playoffs,
    created_at: season.created_at,
    updated_at: season.updated_at,
  }));
};

export const games = async (_parent: unknown, args: QuerygamesArgs, { db }: Context) => {
  try {
    const { filters, pagination } = args;
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
      .where(and(...conditions))
      .limit(pagination?.first || 10)
      .offset(pagination?.after ? parseInt(pagination.after) : 0);

    const [items, total] = await Promise.all([query, db.select().from(schema.nba_games).execute()]);

    return {
      items: items.map(game => ({
        id: game.id,
        date: game.date,
        status: {
          clock: game.periods?.current?.toString() || '',
        },
        homeTeamId: game.teams?.home?.id || '',
        awayTeamId: game.teams?.visitors?.id || '',
        created_at: game.created_at,
        updated_at: game.updated_at,
        arena: game.arena || { name: '', city: '' },
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
      })),
      total: total.length,
      hasMore: total.length > (pagination?.first || 10),
    };
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

  const teams = game.teams || {};
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
  return {
    id: game.id,
    date:
      typeof game.date === 'string'
        ? game.date
        : game.date instanceof Date
          ? game.date.toISOString()
          : '',
    status: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
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
      typeof game.created_at === 'string'
        ? game.created_at
        : game.created_at instanceof Date
          ? game.created_at.toISOString()
          : '',
    updated_at:
      typeof game.updated_at === 'string'
        ? game.updated_at
        : game.updated_at instanceof Date
          ? game.updated_at.toISOString()
          : '',
    homeTeamId: typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
    awayTeamId: typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
    teams,
    isCompleted: game.status === 'Finished',
  };
};

export const teams = async (
  _parent: unknown,
  { filters, pagination }: QueryteamsArgs,
  { db }: Context
) => {
  try {
    const limit = pagination?.first || 10;
    const offset = pagination?.after ? parseInt(pagination.after, 10) : 0;

    const teamConditions: SQL<unknown>[] = [];
    if (filters?.conference) {
      teamConditions.push(eq(schema.teams.conference, filters.conference));
    }
    if (filters?.division) {
      teamConditions.push(eq(schema.teams.division, filters.division));
    }
    const teamQuery =
      teamConditions.length > 0
        ? db
            .select()
            .from(schema.teams)
            .where(and(...teamConditions))
            .limit(limit)
            .offset(offset)
        : db.select().from(schema.teams).limit(limit).offset(offset);
    const [teamItems, teamTotal] = await Promise.all([
      teamQuery,
      db.select().from(schema.teams).execute(),
    ]);
    const mappedTeams = teamItems.map(team => ({
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
    }));

    return {
      items: mappedTeams,
      total: teamTotal.length,
      hasMore: teamTotal.length > limit,
      nextCursor:
        mappedTeams.length > 0
          ? String((pagination?.after ? parseInt(pagination.after, 10) : 0) + mappedTeams.length)
          : null,
    };
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw new BusinessLogicError('Failed to fetch teams', 'TEAMS_FETCH_ERROR');
  }
};

export const players = async (
  _parent: unknown,
  { filters, pagination }: QueryplayersArgs,
  { db }: Context
) => {
  try {
    const limit = pagination?.first || 10;
    const offset = pagination?.after ? parseInt(pagination.after, 10) : 0;

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
    if (filters && 'country' in filters && filters.country) {
      playerConditions.push(sql`(${schema.nba_players.birth}->>'country') = ${filters.country}`);
    }
    const playerQuery =
      playerConditions.length > 0
        ? db
            .select()
            .from(schema.nba_players)
            .where(and(...playerConditions))
            .limit(limit)
            .offset(offset)
        : db.select().from(schema.nba_players).limit(limit).offset(offset);
    const [playerItems, playerTotal] = await Promise.all([
      playerQuery,
      db.select().from(schema.nba_players).execute(),
    ]);
    const mappedPlayers = playerItems.map(player => ({
      id: player.id,
      firstname: player.firstname,
      lastname: player.lastname,
      birth: player.birth,
      nba: player.nba,
      height: player.height,
      weight: player.weight,
      college: player.college,
      affiliation: player.affiliation,
      jersey: player.jersey,
      active: player.active,
      pos: player.pos,
      created_at: player.created_at,
      updated_at: player.updated_at,
    }));

    return {
      items: mappedPlayers,
      total: playerTotal.length,
      hasMore: playerTotal.length > limit,
      nextCursor:
        mappedPlayers.length > 0
          ? String((pagination?.after ? parseInt(pagination.after, 10) : 0) + mappedPlayers.length)
          : null,
    };
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
    .then((rows: DatabaseRow[]) => rows[0]);

  if (!player) throw new NotFoundError('Player', id);

  return {
    id: player.id,
    firstName: player.first_name,
    lastName: player.last_name,
    teamId: (player.team_ids as string[])?.[0] || '',
    birthDate: player.birth_date,
    birthCountry: player.birth_country,
    nbaStart: player.nba_start,
    nbaProYears: player.nba_pro_years,
    heightFeet: player.height_feet,
    heightInches: player.height_inches,
    heightMeters: player.height_meters,
    weightPounds: player.weight_pounds,
    weightKilograms: player.weight_kilograms,
    college: player.college,
    affiliation: player.affiliation,
    jerseyNumber: player.jersey_number,
    active: player.active,
    position: player.position,
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
      .then((rows: DatabaseRow[]) => rows[0]);

    if (!gameStats) {
      throw new NotFoundError('GameStats', id);
    }

    // Fetch the full game object using the same mapping as the 'game' query
    const game = await db
      .select()
      .from(schema.nba_games)
      .where(eq(schema.nba_games.id, gameStats.game_id as string))
      .limit(1)
      .then((rows: DatabaseRow[]) => rows[0]);

    if (!game) {
      throw new NotFoundError('Game', gameStats.game_id as string);
    }

    const teams = game.teams || {};
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
      id: game.id,
      date:
        typeof game.date === 'string'
          ? game.date
          : game.date instanceof Date
            ? game.date.toISOString()
            : '',
      status: typeof game.status === 'string' ? game.status : String(game.status ?? ''),
      arena: typeof game.arena === 'string' ? game.arena : String(game.arena ?? ''),
      league: typeof game.league === 'string' ? game.league : String(game.league ?? ''),
      season_id: typeof game.season_id === 'number' ? game.season_id : Number(game.season_id ?? 0),
      stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
      periods: game.periods ?? [],
      scores: game.scores ?? [],
      officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
      timesTied: typeof game.times_tied === 'number' ? game.times_tied : null,
      leadChanges: typeof game.lead_changes === 'number' ? game.lead_changes : null,
      nugget: typeof game.nugget === 'string' ? game.nugget : null,
      created_at:
        typeof game.created_at === 'string'
          ? game.created_at
          : game.created_at instanceof Date
            ? game.created_at.toISOString()
            : '',
      updated_at:
        typeof game.updated_at === 'string'
          ? game.updated_at
          : game.updated_at instanceof Date
            ? game.updated_at.toISOString()
            : '',
      homeTeamId:
        typeof homeTeamId === 'string' ? homeTeamId : homeTeamId ? String(homeTeamId) : '',
      awayTeamId:
        typeof awayTeamId === 'string' ? awayTeamId : awayTeamId ? String(awayTeamId) : '',
      teams,
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
      date:
        typeof dbGame.date === 'string'
          ? dbGame.date
          : dbGame.date instanceof Date
            ? dbGame.date.toISOString()
            : '',
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
      season_id:
        typeof dbGame.season_id === 'number' ? dbGame.season_id : Number(dbGame.season_id ?? 0),
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

export const teamStats = async (
  _parent: unknown,
  { teamId: _teamId, sort: _sort }: { teamId: string; sort?: GameTeamSortInput },
  { db: _db }: Context
) => {
  try {
    return [];
  } catch (error) {
    console.error('Error fetching team stats:', error);
    throw error;
  }
};

export const allTeamStats = async (
  _parent: unknown,
  { season: _season }: { season: number },
  { db: _db }: Context
) => {
  try {
    return [];
  } catch (error) {
    console.error('Error fetching all team stats:', error);
    throw error;
  }
};

export const topPlayers = async (
  _parent: unknown,
  { season: _season }: { season: number },
  { db: _db }: Context
) => {
  try {
    return [];
  } catch (error) {
    console.error('Error fetching top players:', error);
    throw error;
  }
};

export const users = async (_parent: unknown, { pagination }: QueryusersArgs, { db }: Context) => {
  const limit = pagination?.first ?? 10;
  const offset = pagination?.after ? parseInt(pagination.after, 10) : 0;
  const items = await db.query.users.findMany({
    limit,
    offset,
  });
  return {
    items: items.map((user: InferSelectModel<typeof schema.users>) => ({
      id: user.id,
      username: user.username,
      email_address: user.email_address,
      imageUrl: user.image_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
      comments: [],
      gameLogs: [],
      initiated_friendships: [],
      reactions: [],
      friendships: [],
      __typename: 'User' as const,
    })),
    total: items.length,
    hasMore: items.length > limit,
    nextCursor: items.length > 0 ? String(offset + items.length) : null,
  };
};

export const user = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1)
    .then((rows: DatabaseRow[]) => rows[0]);

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
  { userId }: { userId: string },
  { db }: Context
) => {
  const friendships = await db.query.friendships.findMany({
    where: or(eq(schema.friendships.user_id, userId), eq(schema.friendships.friend_id, userId)),
    with: {
      user: true,
      friend: true,
    },
  });

  return friendships
    .map((friendship: typeof schema.friendships.$inferSelect & { user?: User; friend?: User }) => {
      const friend = friendship.user_id === userId ? friendship.friend : friendship.user;
      if (!friend) return null;
      const user: User = {
        id: (friend as User).id,
        username: (friend as User).username,
        email_address: (friend as User).email_address,
        imageUrl: (friend as User).imageUrl,
        avatar_url: (friend as User).avatar_url,
        email: (friend as User).email || '',
        first_name: (friend as User).first_name,
        last_name: (friend as User).last_name,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        comments: [],
        gameLogs: [],
        initiated_friendships: [],
        reactions: [],
        friendships: [],
        __typename: 'User' as const,
      };
      return transformUserToSummary(user);
    })
    .filter((user: UserSummary | null): user is UserSummary => user !== null);
};

export const gameLogs = async (
  _parent: unknown,
  { filters }: { filters?: GqlGameLogFilters | null },
  { db, user: _user }: Context
) => {
  try {
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

    const query = db
      .select()
      .from(schema.game_logs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.game_logs.created_at));

    const gameLogs = await query;

    return gameLogs.map((gameLog: DatabaseRow) => ({
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
    }));
  } catch (error) {
    console.error('Error fetching game logs:', error);
    throw error;
  }
};

export const comments = async (
  _parent: unknown,
  { parent_id }: { parent_id: string },
  _context: Context
) => {
  const comments = await db.query.comments.findMany({
    where: eq(schema.comments.parent_id, parent_id),
    with: {
      user: true,
    },
  });

  const commentsWithReactions = await Promise.all(
    comments.map(async comment => {
      if (!comment.user) return null;

      const commentReactions = await db.query.reactions.findMany({
        where: eq(schema.reactions.target_id, comment.id),
        with: {
          user: true,
        },
      });

      return {
        id: comment.id,
        userId: String(comment.user_id),
        parent_id: comment.parent_id,
        parent_type: comment.parent_type,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        deleted_at: comment.deleted_at,
        user: transformUserToSummary(comment.user as unknown as User),
        reactions: commentReactions
          .map(reactionRaw => {
            const reaction = {
              id: reactionRaw.id,
              emoji: reactionRaw.emoji,
              created_at: reactionRaw.created_at,
              updated_at: reactionRaw.updated_at,
              targetId: reactionRaw.target_id,
              targetType: reactionRaw.target_type,
              userId: reactionRaw.user_id,
              user: reactionRaw.user
                ? transformUserToSummary(reactionRaw.user as unknown as User)
                : null,
              __typename: 'Reaction' as const,
            };
            return reaction;
          })
          .filter((reaction): reaction is NonNullable<typeof reaction> => reaction !== null),
      };
    })
  );

  return commentsWithReactions.filter(
    (comment): comment is NonNullable<typeof comment> => comment !== null
  );
};

export const reactions = async (
  _parent: unknown,
  { targetId }: { targetId: string },
  context: Context
) => {
  if (!context.loaders?.reaction) {
    throw new Error('Reaction loader not initialized');
  }
  const result = await context.loaders.reaction.load(targetId);
  if (!result) return [];
  if (Array.isArray(result)) {
    return result.filter(Boolean);
  }
  return Array.isArray(result) ? result : [result];
};

export const liveGames = async (_parent: unknown, _args: unknown, { redis: _redis }: Context) => {
  try {
    const liveGames = await fetchNbaLiveGames();
    return (liveGames.data || []).map(game => ({
      id: String(game.id),
      date: game.date?.start || '',
      arena: game.arena?.name || '',
      league: game.league || '',
      status: game.status?.long || '',
      homeTeamId: game.teams?.home?.id ? String(game.teams.home.id) : '',
      awayTeamId: game.teams?.visitors?.id ? String(game.teams.visitors.id) : '',
      created_at: '',
      updated_at: '',
      season: game.season || 0,
      stage: game.stage || 0,
      periods: game.periods || [],
      scores: game.scores || [],
      officials: game.officials || [],
      timesTied: game.timesTied,
      leadChanges: game.leadChanges,
      nugget: game.nugget,
      teams: {
        home: game.teams?.home || null,
        visitors: game.teams?.visitors || null,
      },
      isCompleted: game.status?.long === 'Finished',
    }));
  } catch (error) {
    console.error('Error fetching live games:', error);
    throw new BusinessLogicError('Failed to fetch live games', 'LIVE_GAMES_FETCH_ERROR');
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

    const gameLog = await query.then((rows: DatabaseRow[]) => rows[0]);

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

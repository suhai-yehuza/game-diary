import { eq, and, or, InferSelectModel } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as schema from '@/lib/db/schema';
import { GAME_STATUS_VALUES } from '@/lib/types/config.types';
import type { GameTeams, GameScores, DBGameRecord } from '@/lib/types/game.types';
import { Player, Game, Arena } from '@/lib/types/generated/graphql';
import type { GameStatus, GamePeriods, Team } from '@/lib/types/generated/graphql';
import type { GameRecord } from '@/lib/types/graphql.types';

function isDBGameRecord(game: unknown): game is DBGameRecord {
  if (!game || typeof game !== 'object') return false;

  const record = game as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.league === 'string' &&
    typeof record.season === 'number' &&
    record.date instanceof Object &&
    typeof record.stage === 'number' &&
    record.status instanceof Object &&
    record.periods instanceof Object &&
    record.arena instanceof Object &&
    record.teams instanceof Object &&
    record.scores instanceof Object &&
    record.officials instanceof Object
  );
}

function convertDBGameToNBAGame(game: GameRecord): Game {
  const teams = game.teams as GameTeams;
  const scores = game.scores as GameScores;
  const status = game.status as GameStatus;
  const periods = game.periods as GamePeriods;
  const gameDate = new Date(game.date);
  const createdAt = new Date(game.createdAt);
  const updatedAt = new Date(game.updatedAt);

  return {
    id: game.id,
    date: {
      start: gameDate,
      end: gameDate,
      duration: '2:00',
    },
    status: {
      clock: status.clock,
      halftime: status.halftime,
      long: status.long,
      short: status.short,
    },
    arena: (typeof game.arena === 'string'
      ? (JSON.parse(game.arena) as Arena)
      : {
          name: game.arena?.name ?? null,
          city: game.arena?.city ?? null,
          state: game.arena?.state ?? null,
          country: game.arena?.country ?? null,
        }) as Arena,
    league: game.league,
    season: game.season,
    stage: game.stage,
    periods: {
      current: periods.current,
      total: periods.total,
      endOfPeriod: periods.endOfPeriod,
    },
    teams: game.teams,
    scores: game.scores,
    officials: game.officials as string[],
    timesTied: game.times_tied ?? null,
    leadChanges: game.lead_changes ?? null,
    nugget: game.nugget ?? null,
    createdAt: createdAt,
    updatedAt: updatedAt,
    isCompleted: status.long === GAME_STATUS_VALUES.FINISHED,
    awayTeamId: teams.visitors.id.toString(),
    homeTeamId: teams.home.id.toString(),
    awayScore: scores.visitors.points || 0,
    homeScore: scores.home.points || 0,
    gameType: 'Regular Season',
    nbaGameId: game.id,
  };
}

export function getTeamFullName(team: Team): string {
  return `${team.name} ${team.nickname}`;
}

export function getPlayerDisplayName(player: Player): string {
  return `${player.firstName} ${player.lastName}`;
}

export function calculateGameScore(game: Game): string {
  const { home, visitors } = game.scores;
  return `${home.points} - ${visitors.points}`;
}

export const isGameFinished = (game: Game): boolean => {
  return game.status.long === GAME_STATUS_VALUES.FINISHED;
};

export function isGameInProgress(game: Game): boolean {
  return game.status.long === GAME_STATUS_VALUES.LIVE;
}

export const isGameScheduled = (game: Game): boolean => {
  return game.status.long === GAME_STATUS_VALUES.SCHEDULED;
};

export function getWinningTeam(game: Game): Team | null {
  if (!isGameFinished(game)) return null;
  const { home, visitors } = game.scores;
  return home.points > visitors.points ? game.teams.home : game.teams.visitors;
}

export function sortGamesByDate(games: Game[]): Game[] {
  return [...games].sort(
    (a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime()
  );
}

export function transformGameStats(stats: {
  team: string;
  points: number;
  fgp: number;
  tpp: number;
  ftp: number;
  totReb: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  pFouls: number;
}) {
  return {
    team: stats.team,
    points: stats.points,
    fieldGoalPercentage: stats.fgp,
    threePointPercentage: stats.tpp,
    freeThrowPercentage: stats.ftp,
    rebounds: stats.totReb,
    assists: stats.assists,
    steals: stats.steals,
    blocks: stats.blocks,
    turnovers: stats.turnovers,
    fouls: stats.pFouls,
  };
}

export function paginateGames(
  games: Game[],
  pagination?: { first?: number; after?: string; last?: number; before?: string }
) {
  let startIndex = 0;
  let endIndex = games.length;

  if (pagination?.after) {
    const afterIndex = games.findIndex(game => game.id.toString() === pagination.after);
    if (afterIndex !== -1) startIndex = afterIndex + 1;
  }

  if (pagination?.before) {
    const beforeIndex = games.findIndex(game => game.id.toString() === pagination.before);
    if (beforeIndex !== -1) endIndex = beforeIndex;
  }

  if (pagination?.first) endIndex = Math.min(startIndex + pagination.first, endIndex);
  if (pagination?.last) startIndex = Math.max(endIndex - pagination.last, startIndex);

  const paginatedGames = games.slice(startIndex, endIndex);

  return {
    edges: paginatedGames.map(game => ({ node: game, cursor: game.id.toString() })),
    pageInfo: {
      hasNextPage: endIndex < games.length,
      hasPreviousPage: startIndex > 0,
      startCursor: paginatedGames[0]?.id.toString() || null,
      endCursor: paginatedGames[paginatedGames.length - 1]?.id.toString() || null,
    },
    totalCount: games.length,
  };
}

export async function getH2HData(
  team1Id: string,
  team2Id: string,
  season: number,
  db: NodePgDatabase<typeof schema>
) {
  try {
    const [smallerId, largerId] = [team1Id, team2Id].sort();

    const h2h = await db
      .select()
      .from(schema.team_h2h)
      .where(
        and(
          eq(schema.team_h2h.season, season),
          or(
            and(eq(schema.team_h2h.team1Id, smallerId), eq(schema.team_h2h.team2Id, largerId)),
            and(eq(schema.team_h2h.team1Id, largerId), eq(schema.team_h2h.team2Id, smallerId))
          )
        )
      )
      .then((records: InferSelectModel<typeof schema.team_h2h>[]) => records[0]);

    if (!h2h) {
      return null;
    }

    const last5Games = await Promise.all(
      (h2h.last5Games as string[]).map(async (gameId: string) => {
        const game = await db
          .select()
          .from(schema.nba_games)
          .where(eq(schema.nba_games.id, gameId))
          .then(
            (records: InferSelectModel<typeof schema.nba_games>[]) =>
              records[0] as unknown as GameRecord
          );

        if (!game || !isDBGameRecord(game)) {
          console.error('Invalid game record:', game);
          return null;
        }

        const nbaGame = convertDBGameToNBAGame(game);
        return nbaGame;
      })
    );

    return {
      ...h2h,
      last5Games: last5Games.filter(Boolean),
    };
  } catch (error) {
    console.error('Error fetching H2H data:', error);
    return null;
  }
}

export async function updateH2HData(game: Game, db: NodePgDatabase<typeof schema>) {
  try {
    const { teams } = game;
    const [team1Id, team2Id] = [teams.home.id, teams.visitors.id].sort();

    // Get existing H2H record
    const existingH2H = await db
      .select()
      .from(schema.team_h2h)
      .where(
        and(
          eq(schema.team_h2h.season, game.season),
          or(
            and(eq(schema.team_h2h.team1Id, team1Id), eq(schema.team_h2h.team2Id, team2Id)),
            and(eq(schema.team_h2h.team1Id, team2Id), eq(schema.team_h2h.team2Id, team1Id))
          )
        )
      )
      .then((records: InferSelectModel<typeof schema.team_h2h>[]) => records[0]);

    if (!existingH2H) {
      // Create new H2H record
      await db.insert(schema.team_h2h).values({
        team1Id,
        team2Id,
        season: game.season,
        last5Games: [game.id],
        team1Wins: game.teams.home.id === team1Id ? 1 : 0,
        team2Wins: game.teams.visitors.id === team2Id ? 1 : 0,
      });
    } else {
      // Update existing H2H record
      const last5Games = [...(existingH2H.last5Games as string[]), game.id].slice(-5);
      const team1Wins = existingH2H.team1Wins + (game.teams.home.id === team1Id ? 1 : 0);
      const team2Wins = existingH2H.team2Wins + (game.teams.visitors.id === team2Id ? 1 : 0);

      await db
        .update(schema.team_h2h)
        .set({
          last5Games,
          team1Wins,
          team2Wins,
        })
        .where(eq(schema.team_h2h.id, existingH2H.id));
    }
  } catch (error) {
    console.error('Error updating H2H data:', error);
  }
}

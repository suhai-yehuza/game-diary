import { eq } from 'drizzle-orm';

import { API_CONFIG, getRapidApiConfig } from '@/lib/config/api.config';
import { game_stats, teams } from '@/lib/db/schema';
import { createRapidAPIClient, validateAPIKey, handleAPIError } from '@/lib/external-apis';
import { GAME_STATUS_VALUES } from '@/lib/types/config.types';
import type { TeamStatistics } from '@/lib/types/team.types';
import { generateUUID } from '@/lib/utils/index.processing';

import { createDatabaseClient } from './config';

// Database type for game_stats table insertion
type DBGameStats = typeof game_stats.$inferInsert;

function parseNumericValue(value: number | string | null | undefined, defaultValue = 0): string {
  if (value === null || value === undefined) return defaultValue.toString();
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue.toString() : num.toString();
}

function parsePercentageValue(value: number | string | null | undefined, defaultValue = 0): string {
  if (value === null || value === undefined) return defaultValue.toFixed(2);
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue.toFixed(2) : num.toFixed(2);
}

function processTeamStats(
  stats: TeamStatistics['statistics'][0],
  prefix: 'home' | 'away'
): Partial<DBGameStats> {
  return {
    [`${prefix}_fast_break_points`]: parseNumericValue(stats.fastBreakPoints),
    [`${prefix}_points_in_paint`]: parseNumericValue(stats.pointsInPaint),
    [`${prefix}_biggest_lead`]: parseNumericValue(stats.biggestLead),
    [`${prefix}_second_chance_points`]: parseNumericValue(stats.secondChancePoints),
    [`${prefix}_points_off_turnovers`]: parseNumericValue(stats.pointsOffTurnovers),
    [`${prefix}_longest_run`]: parseNumericValue(stats.longestRun),
    [`${prefix}_fgm`]: parseNumericValue(stats.fgm),
    [`${prefix}_fga`]: parseNumericValue(stats.fga),
    [`${prefix}_fgp`]: parsePercentageValue(stats.fgp),
    [`${prefix}_ftm`]: parseNumericValue(stats.ftm),
    [`${prefix}_fta`]: parseNumericValue(stats.fta),
    [`${prefix}_ftp`]: parsePercentageValue(stats.ftp),
    [`${prefix}_tpm`]: parseNumericValue(stats.tpm),
    [`${prefix}_tpa`]: parseNumericValue(stats.tpa),
    [`${prefix}_tpp`]: parsePercentageValue(stats.tpp),
    [`${prefix}_off_reb`]: parseNumericValue(stats.offReb),
    [`${prefix}_def_reb`]: parseNumericValue(stats.defReb),
    [`${prefix}_tot_reb`]: parseNumericValue(stats.totReb),
    [`${prefix}_assists`]: parseNumericValue(stats.assists),
    [`${prefix}_p_fouls`]: parseNumericValue(stats.pFouls),
    [`${prefix}_steals`]: parseNumericValue(stats.steals),
    [`${prefix}_turnovers`]: parseNumericValue(stats.turnovers),
    [`${prefix}_blocks`]: parseNumericValue(stats.blocks),
    [`${prefix}_plus_minus`]: parseNumericValue(stats.plusMinus),
    [`${prefix}_minutes`]: parseNumericValue(stats.min),
    [`${prefix}_score`]: parseNumericValue(stats.points),
  };
}

export async function fetchAndProcessNBAGameStats(gameId: string, season: number): Promise<void> {
  try {
    const db = createDatabaseClient();
    const rapidApiConfig = getRapidApiConfig();
    const apiKey = validateAPIKey(rapidApiConfig.apiKey);
    const api = createRapidAPIClient(apiKey);

    // First check if game stats already exist
    const existingStats = await db.query.game_stats.findFirst({
      where: eq(game_stats.game_id, gameId),
    });

    if (existingStats) {
      console.log(`Game stats already exist for game ${gameId}, skipping...`);
      return;
    }

    console.log(`Fetching NBA game statistics for game ${gameId}...`);
    const response = await api.get<{ response: TeamStatistics[] }>(
      `${API_CONFIG.endpoints.GAMES}/statistics?id=${gameId}`
    );

    if (!response?.response) {
      throw new Error('Invalid response structure from NBA API');
    }

    const gameStats = response.response;
    if (gameStats.length < 2) {
      console.log('Insufficient game stats found in response, skipping...');
      return;
    }

    const [homeTeamStats, awayTeamStats] = gameStats as unknown as [TeamStatistics, TeamStatistics];
    if (!homeTeamStats.statistics[0] || !awayTeamStats.statistics[0]) {
      console.log('Missing team statistics, skipping...');
      return;
    }

    const homeStats = homeTeamStats.statistics[0];
    const awayStats = awayTeamStats.statistics[0];

    // Verify both teams exist in our database
    const homeTeam = await db.query.teams.findFirst({
      where: eq(teams.id, homeTeamStats.team.id.toString()),
    });
    const awayTeam = await db.query.teams.findFirst({
      where: eq(teams.id, awayTeamStats.team.id.toString()),
    });

    if (!homeTeam || !awayTeam) {
      console.log(`Skipping game ${gameId} - one or both teams not found in database:`, {
        homeTeamId: homeTeamStats.team.id,
        awayTeamId: awayTeamStats.team.id,
      });
      return;
    }

    const now = new Date();
    const gameStatsData: DBGameStats = {
      id: generateUUID(),
      game_id: gameId,
      season_id: season,
      home_team_id: homeTeamStats.team.id.toString(),
      away_team_id: awayTeamStats.team.id.toString(),
      game_date: now,
      status: GAME_STATUS_VALUES.FINISHED,
      created_at: now,
      updated_at: now,
      ...processTeamStats(homeStats, 'home'),
      ...processTeamStats(awayStats, 'away'),
    };

    // Use upsert instead of insert to handle potential race conditions
    await db
      .insert(game_stats)
      .values(gameStatsData)
      .onConflictDoNothing({ target: game_stats.game_id });

    console.log(`Successfully processed and stored statistics for game ${gameId}`);
  } catch (error) {
    handleAPIError(error);
  }
}

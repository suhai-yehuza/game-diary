import { eq } from 'drizzle-orm';

import { API_CONFIG, getRapidApiConfig } from '@/lib/config/api.config';
import { game_stats, teams } from '@/lib/db/schema';
import { createRapidAPIClient, validateAPIKey, handleAPIError } from '@/lib/external-apis';
import { GAME_STATUS_VALUES } from '@/lib/types/config.types';
import type { GameTeamStatistic, GameTeamStatistics } from '@/lib/types/team.types';
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

function processTeamStats(stats: GameTeamStatistic, prefix: 'home' | 'away'): Partial<DBGameStats> {
  return {
    [`${prefix}FastBreakPoints`]: parseNumericValue(stats.fastBreakPoints || 0),
    [`${prefix}PointsInPaint`]: parseNumericValue(stats.pointsInPaint || 0),
    [`${prefix}BiggestLead`]: parseNumericValue(stats.biggestLead || 0),
    [`${prefix}SecondChancePoints`]: parseNumericValue(stats.secondChancePoints || 0),
    [`${prefix}PointsOffTurnovers`]: parseNumericValue(stats.pointsOffTurnovers || 0),
    [`${prefix}LongestRun`]: parseNumericValue(stats.longestRun || 0),
    [`${prefix}Fgm`]: parseNumericValue(stats.fgm || 0),
    [`${prefix}Fga`]: parseNumericValue(stats.fga || 0),
    [`${prefix}Fgp`]: parsePercentageValue(stats.fgp || 0),
    [`${prefix}Ftm`]: parseNumericValue(stats.ftm || 0),
    [`${prefix}Fta`]: parseNumericValue(stats.fta || 0),
    [`${prefix}Ftp`]: parsePercentageValue(stats.ftp || 0),
    [`${prefix}Tpm`]: parseNumericValue(stats.tpm || 0),
    [`${prefix}Tpa`]: parseNumericValue(stats.tpa || 0),
    [`${prefix}Tpp`]: parsePercentageValue(stats.tpp || 0),
    [`${prefix}OffReb`]: parseNumericValue(stats.offReb || 0),
    [`${prefix}DefReb`]: parseNumericValue(stats.defReb || 0),
    [`${prefix}TotReb`]: parseNumericValue(stats.totReb || 0),
    [`${prefix}Assists`]: parseNumericValue(stats.assists || 0),
    [`${prefix}PFouls`]: parseNumericValue(stats.pFouls || 0),
    [`${prefix}Steals`]: parseNumericValue(stats.steals || 0),
    [`${prefix}Turnovers`]: parseNumericValue(stats.turnovers || 0),
    [`${prefix}Blocks`]: parseNumericValue(stats.blocks || 0),
    [`${prefix}PlusMinus`]: parseNumericValue(stats.plusMinus || 0),
    [`${prefix}Minutes`]: parseNumericValue(stats.min || 0),
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
      where: eq(game_stats.gameId, gameId),
    });

    if (existingStats) {
      console.log(`Game stats already exist for game ${gameId}, skipping...`);
      return;
    }

    console.log(`Fetching NBA game statistics for game ${gameId}...`);
    const response = await api.get<{ response: GameTeamStatistics[] }>(
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

    const [homeTeamStats, awayTeamStats] = gameStats as unknown as [
      GameTeamStatistics,
      GameTeamStatistics,
    ];
    if (!homeTeamStats.statistics[0] && !awayTeamStats.statistics[0]) {
      console.log('Missing team statistics, skipping...');
      return;
    }

    const homeStats = homeTeamStats.statistics[0] || ({} as GameTeamStatistic);
    const awayStats = awayTeamStats.statistics[0] || ({} as GameTeamStatistic);

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
      gameId: gameId,
      seasonId: season,
      homeTeamId: homeTeamStats.team.id.toString(),
      awayTeamId: awayTeamStats.team.id.toString(),
      homeTeamScore: homeStats.points || 0,
      awayTeamScore: awayStats.points || 0,
      gameDate: now, // TODO: add game date
      status: GAME_STATUS_VALUES.FINISHED,
      ...processTeamStats(homeStats, 'home'),
      ...processTeamStats(awayStats, 'away'),
      createdAt: now,
      updatedAt: now,
    };

    // Use upsert instead of insert to handle potential race conditions
    await db
      .insert(game_stats)
      .values(gameStatsData)
      .onConflictDoNothing({ target: game_stats.gameId });

    console.log(`Successfully processed and stored statistics for game ${gameId}`);
  } catch (error) {
    handleAPIError(error);
  }
}

#!/usr/bin/env tsx

/**
 * Daily Basketball Games Update Script
 *
 * This script fetches new basketball games from the NBA API and adds them to the database.
 * It's designed to run daily to keep the database up-to-date with new games.
 *
 * ## Features
 * - **Smart Updates**: Only updates games that transition from "Scheduled" to "Finished"
 * - **Preserves Finished Games**: Does not overwrite games that are already "Finished"
 * - **New Game Insertion**: Always inserts new games that don't exist in the database
 * - **Date Range Support**: Can fetch games for specific date ranges
 * - **Error Handling**: Comprehensive error handling with retry logic
 * - **Logging**: Detailed logging for monitoring and debugging
 * - **Dry Run Mode**: Preview what would be updated without making changes
 * - **Environment Aware**: Works in development, staging, and production
 *
 * ## Usage Examples
 * ```bash
 * # Update games for 7 days back and 7 days forward (default for hourly runs)
 * # - New games are inserted, scheduled games that finished are updated with results
 * pnpm update:daily-games
 *
 * # Update games for a specific date
 * pnpm update:daily-games --date=2024-01-15
 *
 * # Update games for a date range
 * pnpm update:daily-games --start-date=2024-01-01 --end-date=2024-01-31
 *
 * # Preview what would be updated (dry run)
 * pnpm update:daily-games --dry-run
 *
 * # Update games for current season
 * pnpm update:daily-games --season=2024
 * ```
 *
 * ## Command Line Options
 * - `--date=YYYY-MM-DD`: Update games for a specific date
 * - `--start-date=YYYY-MM-DD`: Start date for range updates
 * - `--end-date=YYYY-MM-DD`: End date for range updates
 * - `--season=YYYY`: Update games for a specific season
 * - `--dry-run`: Preview actions without database changes
 * - `--help`: Show usage information
 *
 * ## Database Operations
 * - Fetches games from NBA API
 * - Inserts new games that don't exist in the database
 * - Only updates games that were previously "Scheduled" but are now "Finished"
 * - Skips updating games that are already "Finished" to preserve existing data
 * - Ensures scheduled games get updated with results when they finish
 * - Logs all operations for monitoring
 *
 * ## Error Handling
 * - API rate limiting with exponential backoff
 * - Database connection failures with retry
 * - Invalid date format validation
 * - Missing environment variables
 * - Graceful degradation on partial failures
 *
 * @author Game Diary Team
 * @version 1.0.0
 * @since 2025-01-15
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
// In CI environments, use existing env vars; otherwise load from .env files
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

if (!isCI) {
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    // Don't override existing env vars
    config({ path: envPath, override: false });
  } else {
    // Don't override existing env vars
    config({ override: false });
  }
}

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { format, subDays, addDays, startOfDay, endOfDay } from 'date-fns';

import { getRapidApiConfig } from '@/lib/config/app.config';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { convertNBADateToLocal, debugDateConversion } from '@/lib/utils/nba-date-converter';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import * as schema from '@/lib/db/schema';
import type { Database, IGamesApiResponse, IGameResponse } from '../types';

interface UpdateOptions {
  date?: string;
  startDate?: string;
  endDate?: string;
  season?: string;
  dryRun?: boolean;
  help?: boolean;
}

interface GameUpdateResult {
  totalFetched: number;
  newGames: number;
  updatedGames: number;
  skippedGames: number;
  errors: number;
  duration: number;
}

class DailyGamesUpdater {
  private db: Database;
  private apiClient: ReturnType<typeof createRapidAPIClient>;
  private isDryRun: boolean;

  constructor(isDryRun = false) {
    this.isDryRun = isDryRun;
    this.db = this.createDatabaseConnection();
    this.apiClient = this.createApiClient();
  }

  private createDatabaseConnection(): Database {
    const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

    if (!databaseUrl) {
      throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
    }

    const sql = neon(databaseUrl);
    return drizzle(sql, { schema }) as Database;
  }

  private createApiClient() {
    const apiConfig = getRapidApiConfig();
    return createRapidAPIClient(apiConfig);
  }

  /**
   * Parse command line arguments
   */
  parseArguments(): UpdateOptions {
    const args = process.argv.slice(2);
    const options: UpdateOptions = {};

    for (const arg of args) {
      if (arg.startsWith('--date=')) {
        options.date = arg.split('=')[1];
      } else if (arg.startsWith('--start-date=')) {
        options.startDate = arg.split('=')[1];
      } else if (arg.startsWith('--end-date=')) {
        options.endDate = arg.split('=')[1];
      } else if (arg.startsWith('--season=')) {
        options.season = arg.split('=')[1];
      } else if (arg === '--dry-run') {
        options.dryRun = true;
      } else if (arg === '--help') {
        options.help = true;
      }
    }

    return options;
  }

  /**
   * Show help information
   */
  showHelp(): void {
    console.log(`
Daily Basketball Games Update Script

Usage: pnpm update:daily-games [options]

Options:
  --date=YYYY-MM-DD        Update games for a specific date
  --start-date=YYYY-MM-DD  Start date for range updates
  --end-date=YYYY-MM-DD    End date for range updates
  --season=YYYY            Update games for a specific season
  --dry-run                Preview actions without database changes
  --help                   Show this help message

Examples:
  pnpm update:daily-games                    # Update games for the last 2 days (yesterday and today)
  pnpm update:daily-games --date=2024-01-15  # Update specific date
  pnpm update:daily-games --dry-run          # Preview changes
  pnpm update:daily-games --season=2024      # Update current season
`);
  }

  /**
   * Validate date format
   */
  private validateDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  }

  /**
   * Get date range for updates
   */
  private getDateRange(options: UpdateOptions): { startDate: Date; endDate: Date } {
    const today = new Date();

    if (options.date) {
      if (!this.validateDate(options.date)) {
        throw new Error(`Invalid date format: ${options.date}. Use YYYY-MM-DD format.`);
      }
      // Fix timezone issue: parse date as local time, not UTC
      const [year, month, day] = options.date.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-based
      return {
        startDate: startOfDay(date),
        endDate: endOfDay(date),
      };
    }

    if (options.startDate && options.endDate) {
      if (!this.validateDate(options.startDate) || !this.validateDate(options.endDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format.');
      }
      // Fix timezone issue: parse dates as local time, not UTC
      const [startYear, startMonth, startDay] = options.startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = options.endDate.split('-').map(Number);
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      return {
        startDate: startOfDay(startDate),
        endDate: endOfDay(endDate),
      };
    }

    if (options.startDate) {
      if (!this.validateDate(options.startDate)) {
        throw new Error(`Invalid start date format: ${options.startDate}. Use YYYY-MM-DD format.`);
      }
      // Fix timezone issue: parse date as local time, not UTC
      const [year, month, day] = options.startDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return {
        startDate: startOfDay(date),
        endDate: endOfDay(today),
      };
    }

    // Default: update games for 7 days back and 7 days forward
    // This ensures we catch:
    // - Past games (up to 7 days back) - update with latest results
    // - Today's games (current games) - update with latest status
    // - Future scheduled games (up to 7 days ahead) - update when they become available
    const sevenDaysBack = subDays(today, 7);
    const sevenDaysAhead = addDays(today, 7);
    return {
      startDate: startOfDay(sevenDaysBack),
      endDate: endOfDay(sevenDaysAhead),
    };
  }

  /**
   * Fetch games from NBA API for a specific date range
   */
  private async fetchGamesFromAPI(
    startDate: Date,
    endDate: Date,
    season?: string,
    options?: UpdateOptions
  ): Promise<IGameResponse[]> {
    const allGames: IGameResponse[] = [];
    const currentDate = new Date(startDate);

    // Iterate through each date in the range
    while (currentDate <= endDate) {
      const params: Record<string, string> = {
        date: format(currentDate, 'yyyy-MM-dd'),
      };

      if (season) {
        params.season = season;
      }

      logger.info(`📡 Fetching games from NBA API for date: ${format(currentDate, 'yyyy-MM-dd')}`);

      try {
        const response = await this.apiClient.fetch<IGamesApiResponse>('/games', params);

        if (response.response && response.response.length > 0) {
          logger.info(
            `📊 Fetched ${response.response.length} games for ${format(currentDate, 'yyyy-MM-dd')}`
          );
          allGames.push(...(response.response as IGameResponse[]));
        } else {
          logger.info(`📭 No games found for ${format(currentDate, 'yyyy-MM-dd')}`);
        }
      } catch (error) {
        logger.error(
          `❌ Error fetching games for ${format(currentDate, 'yyyy-MM-dd')}:`,
          error instanceof Error ? error : new Error(String(error))
        );
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    logger.info(`📊 Total fetched ${allGames.length} games from API across date range`);
    return allGames;
  }

  /**
   * Check if game already exists in database
   */
  private async gameExists(gameId: string, season: string): Promise<boolean> {
    const existingGame = await this.db
      .select({ id: schema.basketball_games.id })
      .from(schema.basketball_games)
      .where(
        and(eq(schema.basketball_games.game_id, gameId), eq(schema.basketball_games.season, season))
      )
      .limit(1);

    return existingGame.length > 0;
  }

  /**
   * Get the current game status from the database
   * Returns the status.long value if available, or null if game doesn't exist
   */
  private async getCurrentGameStatus(gameId: string, season: string): Promise<string | null> {
    const existingGame = await this.db
      .select({ status: schema.basketball_games.status })
      .from(schema.basketball_games)
      .where(
        and(eq(schema.basketball_games.game_id, gameId), eq(schema.basketball_games.season, season))
      )
      .limit(1);

    if (existingGame.length === 0) {
      return null;
    }

    const gameStatus = existingGame[0].status;
    if (typeof gameStatus === 'string') {
      return gameStatus;
    } else if (gameStatus && typeof gameStatus === 'object') {
      const statusObj = gameStatus as { long?: string; short?: string };
      return statusObj.long || null;
    }

    return null;
  }

  /**
   * Check if a game status is "Scheduled"
   */
  private isScheduledStatus(status: string | null): boolean {
    if (!status) return false;
    const statusLower = status.toLowerCase();
    return statusLower === 'scheduled';
  }

  /**
   * Check if a game status is "Finished"
   */
  private isFinishedStatus(status: string | null): boolean {
    if (!status) return false;
    const statusLower = status.toLowerCase();
    return statusLower === 'finished';
  }

  /**
   * Check if a game is finished/completed
   */
  private isGameFinished(game: IGameResponse): boolean {
    // Check if scores exist - if both teams have scores, game is finished
    if (
      game.scores?.home?.points !== null &&
      game.scores?.home?.points !== undefined &&
      game.scores?.visitors?.points !== null &&
      game.scores?.visitors?.points !== undefined
    ) {
      return true;
    }

    // Check status string or object
    let statusString = '';
    if (typeof game.status === 'string') {
      statusString = game.status.toLowerCase();
    } else if (game.status && typeof game.status === 'object') {
      const statusObj = game.status as { short?: string | number; long?: string };
      const shortStatus =
        typeof statusObj.short === 'string' ? statusObj.short : String(statusObj.short || '');
      const longStatus = statusObj.long || '';
      statusString = (shortStatus || longStatus || '').toLowerCase();
    }

    // Game is finished if status contains "finished" or "final" or "ft"
    return (
      statusString.includes('finished') ||
      statusString.includes('final') ||
      statusString === 'ft' ||
      statusString === '3' // Some APIs use numeric status codes
    );
  }

  /**
   * Create game insert data from API response
   */
  private createGameInsertData(game: IGameResponse, season: string) {
    // Use proper NBA API date conversion utility
    const dateString = typeof game.date === 'string' ? game.date : game.date.start;

    if (!dateString || dateString.trim() === '') {
      throw new Error(`Invalid date string for game ${game.id}: ${dateString}`);
    }

    let gameDate: Date;
    try {
      gameDate = convertNBADateToLocal(dateString);

      // Debug the conversion in development
      debugDateConversion(dateString, gameDate, `Game ${game.id} Date Conversion`);
    } catch (error) {
      logger.error(`Failed to convert date for game ${game.id}:`, {
        dateString,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Date conversion failed for game ${game.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return {
      id: `${season}-${game.id}`,
      season: season,
      game_id: game.id.toString(),
      date: gameDate,
      stage: game.stage || null,
      teams: game.teams || null,
      status: game.status || null,
      scores: game.scores || null,
      arena: game.arena || null,
      periods: game.periods || null,
      officials: game.officials || [],
      times_tied: game.timesTied || null,
      lead_changes: game.leadChanges || null,
      nugget: game.nugget || null,
    };
  }

  /**
   * Insert or update games in database (upsert)
   * Only updates games that were previously "Scheduled" but are now "Finished"
   * New games are always inserted, but existing finished games are not overwritten
   */
  private async insertGames(games: IGameResponse[], season: string): Promise<GameUpdateResult> {
    const result: GameUpdateResult = {
      totalFetched: games.length,
      newGames: 0,
      updatedGames: 0,
      skippedGames: 0,
      errors: 0,
      duration: 0,
    };

    const startTime = Date.now();

    for (const game of games) {
      try {
        const gameId = game.id.toString();
        const exists = await this.gameExists(gameId, season);

        // Get the new status from API response
        let newStatus: string | null = null;
        if (typeof game.status === 'string') {
          newStatus = game.status;
        } else if (game.status && typeof game.status === 'object') {
          const statusObj = game.status as { long?: string; short?: string };
          newStatus = statusObj.long || null;
        }

        // If game exists, check if we should update it
        if (exists) {
          const currentStatus = await this.getCurrentGameStatus(gameId, season);
          const wasScheduled = this.isScheduledStatus(currentStatus);
          const isNowFinished = this.isFinishedStatus(newStatus);

          // Only update if game was previously "Scheduled" and is now "Finished"
          if (!wasScheduled || !isNowFinished) {
            if (this.isDryRun) {
              logger.info(
                `🔍 [DRY RUN] Would skip game ${gameId}: current status="${currentStatus}", new status="${newStatus}"`
              );
            } else {
              logger.debug(
                `⏭️  Skipping game ${gameId}: current status="${currentStatus}", new status="${newStatus}" (only updating Scheduled→Finished transitions)`
              );
            }
            result.skippedGames++;
            continue;
          }
        }

        if (this.isDryRun) {
          if (exists) {
            logger.info(`🔍 [DRY RUN] Would update game: ${gameId} (Scheduled→Finished)`);
            result.updatedGames++;
          } else {
            logger.info(`🔍 [DRY RUN] Would insert game: ${gameId}`);
            result.newGames++;
          }
          continue;
        }

        const gameData = this.createGameInsertData(game, season);

        // Use upsert to insert new games or update existing ones
        await this.db
          .insert(schema.basketball_games)
          .values(gameData)
          .onConflictDoUpdate({
            target: schema.basketball_games.id,
            set: {
              season: gameData.season,
              game_id: gameData.game_id,
              date: gameData.date,
              stage: gameData.stage,
              teams: gameData.teams,
              status: gameData.status,
              scores: gameData.scores,
              arena: gameData.arena,
              periods: gameData.periods,
              officials: gameData.officials,
              times_tied: gameData.times_tied,
              lead_changes: gameData.lead_changes,
              nugget: gameData.nugget,
              updated_at: new Date(),
            },
          });

        if (exists) {
          logger.info(`🔄 Updated existing game: ${gameId} (Scheduled→Finished)`);
          result.updatedGames++;
        } else {
          logger.info(`✅ Inserted new game: ${gameId}`);
          result.newGames++;
        }
      } catch (error) {
        logger.error(
          `❌ Error processing game ${game.id}:`,
          error instanceof Error ? error : new Error(String(error))
        );
        result.errors++;
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Update existing games with latest status
   * Only updates games that were previously "Scheduled" but are now "Finished"
   * This method is kept for backward compatibility but insertGames handles the logic
   *
   * Note: This method is now largely redundant since insertGames uses upsert,
   * but kept for backward compatibility and to handle edge cases.
   */
  private async updateExistingGames(games: IGameResponse[], season: string): Promise<number> {
    let updatedCount = 0;

    for (const game of games) {
      try {
        const gameId = game.id.toString();
        const exists = await this.gameExists(gameId, season);

        if (!exists) {
          continue; // Skip if game doesn't exist (will be handled by insert)
        }

        // Get the new status from API response
        let newStatus: string | null = null;
        if (typeof game.status === 'string') {
          newStatus = game.status;
        } else if (game.status && typeof game.status === 'object') {
          const statusObj = game.status as { long?: string; short?: string };
          newStatus = statusObj.long || null;
        }

        // Check if we should update this game
        const currentStatus = await this.getCurrentGameStatus(gameId, season);
        const wasScheduled = this.isScheduledStatus(currentStatus);
        const isNowFinished = this.isFinishedStatus(newStatus);

        // Only update if game was previously "Scheduled" and is now "Finished"
        if (!wasScheduled || !isNowFinished) {
          logger.debug(
            `⏭️  Skipping game ${gameId}: current status="${currentStatus}", new status="${newStatus}" (only updating Scheduled→Finished transitions)`
          );
          continue;
        }

        if (this.isDryRun) {
          logger.info(`🔍 [DRY RUN] Would update game: ${gameId} (Scheduled→Finished)`);
          updatedCount++;
          continue;
        }

        // Update game with latest data - only for Scheduled→Finished transitions
        const gameData = this.createGameInsertData(game, season);

        await this.db
          .update(schema.basketball_games)
          .set({
            season: gameData.season,
            game_id: gameData.game_id,
            date: gameData.date,
            stage: gameData.stage,
            teams: gameData.teams,
            status: gameData.status,
            scores: gameData.scores,
            arena: gameData.arena,
            periods: gameData.periods,
            officials: gameData.officials,
            times_tied: gameData.times_tied,
            lead_changes: gameData.lead_changes,
            nugget: gameData.nugget,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(schema.basketball_games.game_id, gameId),
              eq(schema.basketball_games.season, season)
            )
          );

        logger.info(`🔄 Updated game: ${gameId} (Scheduled→Finished)`);
        updatedCount++;
      } catch (error) {
        logger.error(
          `❌ Error updating game ${game.id}:`,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    return updatedCount;
  }

  /**
   * Get current NBA season
   */
  private getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0-based month

    // NBA season typically starts in October
    if (month >= 10) {
      return year.toString();
    } else {
      return (year - 1).toString();
    }
  }

  /**
   * Main update function
   */
  async updateGames(options: UpdateOptions = {}): Promise<GameUpdateResult> {
    const startTime = Date.now();

    try {
      logger.info('🏀 Starting daily basketball games update...');

      if (this.isDryRun) {
        logger.info('🔍 Running in DRY RUN mode - no database changes will be made');
      }

      // Get date range
      const { startDate, endDate } = this.getDateRange(options);
      const season = options.season || this.getCurrentSeason();

      logger.info(
        `📅 Update range: ${options.date || format(startDate, 'yyyy-MM-dd')} to ${options.date || format(endDate, 'yyyy-MM-dd')}`
      );
      logger.info(`🏆 Season: ${season}`);

      // Fetch games from API
      const games = await this.fetchGamesFromAPI(startDate, endDate, season, options);

      if (games.length === 0) {
        logger.info('📭 No games to process');
        return {
          totalFetched: 0,
          newGames: 0,
          updatedGames: 0,
          skippedGames: 0,
          errors: 0,
          duration: Date.now() - startTime,
        };
      }

      // Process games
      const insertResult = await this.insertGames(games, season);
      const updateResult = await this.updateExistingGames(games, season);

      const finalResult: GameUpdateResult = {
        ...insertResult,
        updatedGames: updateResult,
        duration: Date.now() - startTime,
      };

      // Log summary
      logger.info('📊 Update Summary:');
      logger.info(`   Total fetched: ${finalResult.totalFetched}`);
      logger.info(`   New games: ${finalResult.newGames}`);
      logger.info(`   Updated games: ${finalResult.updatedGames}`);
      logger.info(`   Skipped games: ${finalResult.skippedGames}`);
      logger.info(`   Errors: ${finalResult.errors}`);
      logger.info(`   Duration: ${finalResult.duration}ms`);

      return finalResult;
    } catch (error) {
      logger.error(
        '❌ Daily games update failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const updater = new DailyGamesUpdater();
    const options = updater.parseArguments();

    if (options.help) {
      updater.showHelp();
      return;
    }

    const isDryRun = options.dryRun || false;
    const dryRunUpdater = new DailyGamesUpdater(isDryRun);

    const result = await dryRunUpdater.updateGames(options);

    if (result.errors > 0) {
      logger.warn(`⚠️  Update completed with ${result.errors} errors`);
      process.exit(1);
    } else {
      logger.info('✅ Daily games update completed successfully');
      process.exit(0);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log to both logger and console to ensure visibility
    console.error('❌ Daily games update script failed:', errorMessage);
    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }

    try {
      logger.error(
        '❌ Daily games update script failed:',
        error instanceof Error ? error : new Error(String(error))
      );
    } catch (loggerError) {
      // If logger fails, at least we have console output
      console.error('⚠️  Logger also failed:', loggerError);
    }

    process.exit(1);
  }
}

// Run if this file is executed directly
// Check if this is the main module by comparing file paths
const __filename = fileURLToPath(import.meta.url);
const scriptPath = process.argv[1];

// More permissive check - if the script path contains our filename, run it
const isMainModule =
  scriptPath && // Only check if we have a script path
  (scriptPath.endsWith('update-daily-games.ts') ||
    scriptPath.includes('update-daily-games') ||
    __filename === resolve(scriptPath) ||
    __filename.endsWith(scriptPath) ||
    scriptPath.endsWith(__filename));

// Debug logging in CI environments
if (process.env.CI || process.env.GITHUB_ACTIONS) {
  console.log('🔍 Debug: Script execution check');
  console.log('  __filename:', __filename);
  console.log('  scriptPath:', scriptPath);
  console.log('  isMainModule:', isMainModule);
}

if (isMainModule) {
  main().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('❌ Unhandled error in main():', errorMessage);
    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }
    if (error instanceof Error && error.cause) {
      console.error('Error cause:', error.cause);
    }
    process.exit(1);
  });
}

export { DailyGamesUpdater };

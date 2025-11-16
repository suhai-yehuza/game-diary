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
  // Use .env.production if NODE_ENV=production, otherwise use .env.development
  const isProduction = process.env.NODE_ENV === 'production';
  const envPath = isProduction
    ? resolve(process.cwd(), '.env.production')
    : resolve(process.cwd(), '.env.development');

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
          const isCurrentlyFinished = this.isFinishedStatus(currentStatus);

          // Debug logging to understand why games are being skipped
          logger.debug(
            `🔍 Game ${gameId} status check: current="${currentStatus}", api="${newStatus}", wasScheduled=${wasScheduled}, isNowFinished=${isNowFinished}, isCurrentlyFinished=${isCurrentlyFinished}`
          );

          // Always update if:
          // 1. Game was "Scheduled" and is now "Finished" (overwrite with latest scores/data)
          // 2. Game is not currently "Finished" but API says it's "Finished" (catches Live→Finished, etc.)
          // Skip only if:
          // - Game is already "Finished" AND was NOT previously "Scheduled" (preserve existing finished games that weren't scheduled)
          // - API says game is not finished
          if (wasScheduled && isNowFinished) {
            // Game was scheduled and is now finished - ALWAYS update to get latest scores/data
            if (this.isDryRun) {
              logger.info(
                `🔍 [DRY RUN] Would update game ${gameId}: Scheduled→Finished (overwriting with latest data)`
              );
            } else {
              logger.info(
                `🔄 Updating game ${gameId}: Scheduled→Finished (overwriting with latest scores/data)`
              );
            }
            // Continue to update below
          } else if (isCurrentlyFinished && !wasScheduled && isNowFinished) {
            // Game is already finished and was NOT scheduled - preserve existing data
            if (this.isDryRun) {
              logger.info(
                `🔍 [DRY RUN] Would skip game ${gameId}: already finished (was not scheduled, preserving existing data)`
              );
            } else {
              logger.debug(
                `⏭️  Skipping game ${gameId}: already finished (was not scheduled, preserving existing data)`
              );
            }
            result.skippedGames++;
            continue;
          } else if (!isNowFinished) {
            // API says game is not finished - skip updates for non-finished games
            if (this.isDryRun) {
              logger.info(
                `🔍 [DRY RUN] Would skip game ${gameId}: API status is not finished (current="${currentStatus}", api="${newStatus}")`
              );
            } else {
              logger.debug(`⏭️  Skipping game ${gameId}: API status is not finished`);
            }
            result.skippedGames++;
            continue;
          } else if (!isCurrentlyFinished && isNowFinished) {
            // Game is not currently finished but API says it's finished - update it
            if (this.isDryRun) {
              logger.info(`🔍 [DRY RUN] Would update game ${gameId}: ${currentStatus}→Finished`);
            } else {
              logger.info(`🔄 Updating game ${gameId}: ${currentStatus}→Finished`);
            }
            // Continue to update below
          } else {
            // Edge case - log and skip
            if (this.isDryRun) {
              logger.info(
                `🔍 [DRY RUN] Would skip game ${gameId}: unexpected status combination (current="${currentStatus}", api="${newStatus}")`
              );
            } else {
              logger.debug(
                `⏭️  Skipping game ${gameId}: unexpected status combination (current="${currentStatus}", api="${newStatus}")`
              );
            }
            result.skippedGames++;
            continue;
          }
        }

        if (this.isDryRun) {
          if (exists) {
            // Get current status for dry-run logging
            const currentStatusForDryRun = await this.getCurrentGameStatus(gameId, season);
            logger.info(
              `🔍 [DRY RUN] Would update game: ${gameId} (${currentStatusForDryRun || 'unknown'}→Finished)`
            );
            result.updatedGames++;
          } else {
            logger.info(`🔍 [DRY RUN] Would insert game: ${gameId}`);
            result.newGames++;
          }
          continue;
        }

        const gameData = this.createGameInsertData(game, season);

        // Log what we're about to upsert
        let apiStatus: string | null = null;
        if (typeof game.status === 'string') {
          apiStatus = game.status;
        } else if (game.status && typeof game.status === 'object') {
          const statusObj = game.status as { long?: string; short?: string };
          apiStatus = statusObj.long || null;
        }
        logger.debug(`🔄 Upserting game ${gameId}: status="${apiStatus}", exists=${exists}`);

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
              status: gameData.status, // This should update the status from API
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

        // Check if game was actually updated or inserted
        // Note: We check exists before the upsert, but the upsert handles both cases
        // So we need to check again after to see if it was an update or insert
        const stillExists = await this.gameExists(gameId, season);
        if (stillExists) {
          // Game exists - check if status changed (it was an update)
          const finalStatus = await this.getCurrentGameStatus(gameId, season);
          if (exists) {
            // Game existed before, so this was an update
            logger.info(`🔄 Updated existing game: ${gameId} (now ${finalStatus})`);
            result.updatedGames++;
          } else {
            // Game didn't exist before but exists now - this shouldn't happen with upsert
            // but log it as a new game to be safe
            logger.info(`✅ Inserted new game: ${gameId}`);
            result.newGames++;
          }
        } else {
          // Game doesn't exist - this shouldn't happen after upsert, but log as error
          logger.warn(`⚠️  Game ${gameId} was not inserted/updated successfully`);
          result.errors++;
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
        const isCurrentlyFinished = this.isFinishedStatus(currentStatus);

        // Always update if:
        // 1. Game was "Scheduled" and is now "Finished" (ALWAYS overwrite with latest scores/data)
        // 2. Game is not currently "Finished" but API says it's "Finished" (catches Live→Finished, etc.)
        // Skip only if:
        // - Game is already "Finished" AND was NOT previously "Scheduled" (preserve existing finished games that weren't scheduled)
        // - API says game is not finished
        if (wasScheduled && isNowFinished) {
          // Game was scheduled and is now finished - ALWAYS update to get latest scores/data
          logger.info(
            `🔄 Updating game ${gameId}: Scheduled→Finished (overwriting with latest scores/data)`
          );
          // Continue to update below
        } else if (isCurrentlyFinished && !wasScheduled && isNowFinished) {
          // Game is already finished and was NOT scheduled - preserve existing data
          logger.debug(
            `⏭️  Skipping game ${gameId}: already finished (was not scheduled, preserving existing data)`
          );
          continue;
        } else if (!isNowFinished) {
          // API says game is not finished - skip updates for non-finished games
          logger.debug(`⏭️  Skipping game ${gameId}: API status is not finished`);
          continue;
        } else if (!isCurrentlyFinished && isNowFinished) {
          // Game is not currently finished but API says it's finished - update it
          logger.info(`🔄 Updating game ${gameId}: ${currentStatus}→Finished`);
          // Continue to update below
        } else {
          // Edge case - log and skip
          logger.debug(
            `⏭️  Skipping game ${gameId}: unexpected status combination (current="${currentStatus}", api="${newStatus}")`
          );
          continue;
        }

        if (this.isDryRun) {
          logger.info(`🔍 [DRY RUN] Would update game: ${gameId} (${currentStatus}→Finished)`);
          updatedCount++;
          continue;
        }

        // Update game with latest data
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

        logger.info(`🔄 Updated game: ${gameId} (${currentStatus}→Finished)`);
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
   * Invalidate landing page cache after games are updated
   * This ensures the "Latest Results" section shows the most recent games
   */
  private async invalidateLandingPageCache(): Promise<void> {
    try {
      // Try direct Redis cache invalidation first (if Redis is available)
      const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
      if (redisUrl) {
        try {
          const { Redis } = await import('@upstash/redis');
          const redis = Redis.fromEnv();

          // Delete the specific cache key for latest results
          const cacheKey = 'landingPage:landing-page-data:latestResults';
          await redis.del(cacheKey);
          logger.info(`✅ Directly invalidated Redis cache key: ${cacheKey}`);
          return; // Success, no need to try API
        } catch (redisError) {
          logger.debug('Could not invalidate via direct Redis access, trying API...', {
            error: redisError instanceof Error ? redisError.message : String(redisError),
          });
        }
      }

      // Fallback: Try to invalidate cache via API endpoint
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://www.game-diary.io';
      const cacheInvalidationUrl = `${appUrl}/api/landing-page/cache?section=latest-results`;

      logger.info(`📡 Attempting to invalidate cache via API: ${cacheInvalidationUrl}`);

      const response = await fetch(cacheInvalidationUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        logger.info('✅ Cache invalidated via API endpoint');
      } else {
        logger.warn(`⚠️  Cache invalidation API returned status ${response.status}`);
        // Fallback: log that manual cache invalidation may be needed
        logger.info(
          '💡 Tip: You may need to manually invalidate the cache or wait for TTL expiration'
        );
      }
    } catch (error) {
      // If API call fails, log but don't throw - cache will expire naturally via TTL
      logger.warn('⚠️  Could not invalidate cache (will expire via TTL):', {
        error: error instanceof Error ? error.message : String(error),
      });
      logger.info('💡 Cache will automatically refresh when TTL expires (5 minutes)');
    }
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

      // Invalidate landing page cache if games were updated
      if (!this.isDryRun && (finalResult.newGames > 0 || finalResult.updatedGames > 0)) {
        try {
          logger.info('🔄 Invalidating landing page cache after game updates...');
          await this.invalidateLandingPageCache();
          logger.info('✅ Landing page cache invalidated successfully');
        } catch (cacheError) {
          logger.warn(
            '⚠️  Failed to invalidate landing page cache (non-critical):',
            cacheError instanceof Error ? cacheError : new Error(String(cacheError))
          );
          // Don't fail the entire update if cache invalidation fails
        }
      }

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

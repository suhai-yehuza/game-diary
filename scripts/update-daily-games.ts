#!/usr/bin/env tsx

/**
 * Daily Basketball Games Update Script
 *
 * This script fetches new basketball games from the NBA API and adds them to the database.
 * It's designed to run daily to keep the database up-to-date with new games.
 *
 * ## Features
 * - **Incremental Updates**: Only fetches and adds games that don't exist in the database
 * - **Date Range Support**: Can fetch games for specific date ranges
 * - **Error Handling**: Comprehensive error handling with retry logic
 * - **Logging**: Detailed logging for monitoring and debugging
 * - **Dry Run Mode**: Preview what would be updated without making changes
 * - **Environment Aware**: Works in development, staging, and production
 *
 * ## Usage Examples
 * ```bash
 * # Update games for today
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
 * - Checks existing games in database
 * - Inserts only new games (idempotent)
 * - Updates game status for existing games
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

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
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
  pnpm update:daily-games                    # Update today's games
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

    // Default: update today's games
    return {
      startDate: startOfDay(today),
      endDate: endOfDay(today),
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
   * Insert new games into database
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

        if (exists) {
          logger.debug(`⏭️  Game ${gameId} already exists, skipping`);
          result.skippedGames++;
          continue;
        }

        if (this.isDryRun) {
          logger.info(`🔍 [DRY RUN] Would insert game: ${gameId}`);
          result.newGames++;
          continue;
        }

        const gameData = this.createGameInsertData(game, season);

        await this.db.insert(schema.basketball_games).values(gameData);

        logger.info(`✅ Inserted new game: ${gameId}`);
        result.newGames++;
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

        if (this.isDryRun) {
          logger.info(`🔍 [DRY RUN] Would update game: ${gameId}`);
          updatedCount++;
          continue;
        }

        // Update game status and scores
        await this.db
          .update(schema.basketball_games)
          .set({
            status: game.status || null,
            scores: game.scores || null,
            periods: game.periods || null,
            times_tied: game.timesTied || null,
            lead_changes: game.leadChanges || null,
            nugget: game.nugget || null,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(schema.basketball_games.game_id, gameId),
              eq(schema.basketball_games.season, season)
            )
          );

        logger.debug(`🔄 Updated game: ${gameId}`);
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
    logger.error(
      '❌ Daily games update script failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DailyGamesUpdater };

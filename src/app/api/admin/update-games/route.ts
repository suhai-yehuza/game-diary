import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { DailyGamesUpdater } from '@scripts/update-daily-games';

/**
 * API endpoint for manually updating basketball games
 *
 * This endpoint allows manual triggering of the daily games update process
 * with various options for date ranges and seasons.
 *
 * @route POST /api/admin/update-games
 *
 * @body {
 *   date?: string;           // Specific date (YYYY-MM-DD)
 *   startDate?: string;      // Start date for range (YYYY-MM-DD)
 *   endDate?: string;        // End date for range (YYYY-MM-DD)
 *   season?: string;         // Specific season (YYYY)
 *   dryRun?: boolean;        // Preview changes without updating database
 * }
 *
 * @returns {
 *   success: boolean;
 *   result?: {
 *     totalFetched: number;
 *     newGames: number;
 *     updatedGames: number;
 *     skippedGames: number;
 *     errors: number;
 *     duration: number;
 *   };
 *   error?: string;
 * }
 */

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as {
      date?: string;
      startDate?: string;
      endDate?: string;
      season?: string;
      dryRun?: boolean;
    };
    const { date, startDate, endDate, season, dryRun = false } = body;

    // Validate date formats if provided
    const validateDate = (dateString: string): boolean => {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    };

    if (date && !validateDate(date)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid date format: ${date}. Use YYYY-MM-DD format.`,
        },
        { status: 400 }
      );
    }

    if (startDate && !validateDate(startDate)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid start date format: ${startDate}. Use YYYY-MM-DD format.`,
        },
        { status: 400 }
      );
    }

    if (endDate && !validateDate(endDate)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid end date format: ${endDate}. Use YYYY-MM-DD format.`,
        },
        { status: 400 }
      );
    }

    // Validate season format if provided
    if (season && !/^\d{4}$/.test(season)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid season format: ${season}. Use YYYY format.`,
        },
        { status: 400 }
      );
    }

    logger.info('🏀 Manual games update requested via API', {
      date,
      startDate,
      endDate,
      season,
      dryRun,
    });

    // Create updater instance
    const updater = new DailyGamesUpdater(dryRun);

    // Prepare options
    const options: {
      date?: string;
      startDate?: string;
      endDate?: string;
      season?: string;
      dryRun?: boolean;
    } = {
      date,
      startDate,
      endDate,
      season,
      dryRun,
    };

    // Run the update
    const result = await updater.updateGames(options);

    logger.info('✅ Manual games update completed via API', {
      result: {
        totalFetched: result.totalFetched,
        newGames: result.newGames,
        updatedGames: result.updatedGames,
        skippedGames: result.skippedGames,
        errors: result.errors,
        duration: result.duration,
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        totalFetched: result.totalFetched,
        newGames: result.newGames,
        updatedGames: result.updatedGames,
        skippedGames: result.skippedGames,
        errors: result.errors,
        duration: result.duration,
      },
    });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Games Update API',
      action: 'Manual games update',
    });

    logger.error(
      '❌ Manual games update failed via API:',
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking update status and getting help
 */
export function GET() {
  return NextResponse.json({
    success: true,
    message: 'Basketball Games Update API',
    usage: {
      method: 'POST',
      endpoint: '/api/admin/update-games',
      body: {
        date: 'Optional. Specific date to update (YYYY-MM-DD)',
        startDate: 'Optional. Start date for range updates (YYYY-MM-DD)',
        endDate: 'Optional. End date for range updates (YYYY-MM-DD)',
        season: 'Optional. Specific season to update (YYYY)',
        dryRun: 'Optional. Preview changes without updating database (boolean)',
      },
      examples: [
        {
          description: "Update today's games",
          body: {},
        },
        {
          description: 'Update specific date',
          body: { date: '2024-01-15' },
        },
        {
          description: 'Update date range',
          body: { startDate: '2024-01-01', endDate: '2024-01-31' },
        },
        {
          description: 'Update specific season',
          body: { season: '2024' },
        },
        {
          description: 'Preview changes (dry run)',
          body: { dryRun: true },
        },
      ],
    },
  });
}

/**
 * OPTIONS endpoint for CORS preflight
 */
export function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getGameEngagementQuery } from '@/lib/db/queries/engagement.queries';
import { logger } from '@/lib/utils/logger';

export async function GET(_request: NextRequest) {
  try {
    const database = db();
    if (!database) {
      throw new Error('Database connection not available');
    }

    logger.info('Testing engagement query...');

    // Test with a specific game ID
    const testGameId = '2024-15027'; // Use a game with actual data

    // Test the engagement query
    const engagement = await getGameEngagementQuery(testGameId);

    logger.info('Engagement query result:', engagement);

    return NextResponse.json({
      success: true,
      testGameId,
      engagement,
      message: 'Engagement query test completed',
    });
  } catch (error) {
    logger.error('Failed to test engagement query:', { error: String(error) });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

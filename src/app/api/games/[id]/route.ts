import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiLogger } from '@lib/core/logger';
import { db } from '@src/lib/db';
import { nba_games } from '@src/lib/db/schema';
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const game = await db.select().from(nba_games).where(eq(nba_games.id, params.id)).limit(1);

    if (!game || game.length === 0) {
      return new NextResponse('Game not found', { status: 404 });
    }

    return NextResponse.json({
      get: 'games',
      parameters: { id: params.id },
      errors: [],
      results: 1,
      response: game,
      data: game,
    });
  } catch (error) {
    apiLogger.error('Error fetching game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

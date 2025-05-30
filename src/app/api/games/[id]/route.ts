import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { nba_games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const game = await db.query.nba_games.findFirst({
      where: eq(nba_games.id, params.id),
    });

    if (!game) {
      return new NextResponse('Game not found', { status: 404 });
    }

    return NextResponse.json({
      get: 'games',
      parameters: { id: params.id },
      errors: [],
      results: 1,
      response: [game],
      data: [game],
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
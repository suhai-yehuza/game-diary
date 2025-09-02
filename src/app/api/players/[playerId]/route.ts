import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest, { params }: { params: { playerId: string } }) {
  try {
    const { playerId } = params;

    // Import and use the database service directly instead of making HTTP request
    const { getPlayerById } = await import('@/lib/db/services/players.service');

    // Get player by ID directly from database
    const player = await getPlayerById(playerId);

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // The getPlayerById function already returns the player in the correct format
    // so we can return it directly
    return NextResponse.json(player);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/players/[playerId]',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';

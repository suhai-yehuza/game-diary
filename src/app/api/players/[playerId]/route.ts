import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest, { params }: { params: { playerId: string } }) {
  try {
    const { playerId } = params;

    // Use hybrid database for player query (API + Redis, DB fallback)
    const { hybridDB } = await import('@/lib/db/hybrid-db');

    const player = await hybridDB.getPlayerById(playerId);

    if (!player || typeof player !== 'object' || player === null) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Type guard to ensure player has the expected structure
    const playerData = player as {
      id: string | number;
      first_name?: string;
      last_name?: string;
      birth?: string | null;
      nba?: string | null;
      height?: string | null;
      weight?: string | null;
      college?: string | null;
      affiliation?: string | null;
      teams?: string | null;
      leagues?: string | null;
      image_url?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };

    // Helper function to safely parse JSON fields
    const parseJsonField = (field: string | null | undefined): unknown => {
      if (!field) return null;
      try {
        return JSON.parse(field) as unknown;
      } catch {
        return field; // Return as string if parsing fails
      }
    };

    // Return player data in the expected format
    return NextResponse.json({
      id: parseInt(String(playerData.id)),
      firstname: playerData.first_name || '',
      lastname: playerData.last_name || '',
      birth: parseJsonField(playerData.birth),
      nba: parseJsonField(playerData.nba),
      height: parseJsonField(playerData.height),
      weight: parseJsonField(playerData.weight),
      college: playerData.college || '',
      affiliation: playerData.affiliation || '',
      teams: parseJsonField(playerData.teams),
      leagues: parseJsonField(playerData.leagues),
      image_url: playerData.image_url || '',
      created_at: playerData.created_at || '',
      updated_at: playerData.updated_at || '',
    });
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

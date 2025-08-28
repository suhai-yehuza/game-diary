import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { nba_players } from '@/lib/db/schema';

export async function GET(request: NextRequest, { params }: { params: { playerId: string } }) {
  try {
    const { playerId } = params;

    // Fetch player from database
    const player = await db()?.query.nba_players.findFirst({
      where: eq(nba_players.id, playerId),
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

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
      id: parseInt(player.id),
      firstname: player.first_name,
      lastname: player.last_name,
      birth: parseJsonField(player.birth),
      nba: parseJsonField(player.nba),
      height: parseJsonField(player.height),
      weight: parseJsonField(player.weight),
      college: player.college,
      affiliation: player.affiliation,
      teams: parseJsonField(player.teams),
      leagues: parseJsonField(player.leagues),
      image_url: player.image_url,
      created_at: player.created_at,
      updated_at: player.updated_at,
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';

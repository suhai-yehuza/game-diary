import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { game_logs } from '@/lib/db/schema';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { IGameLogWithRelations } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameLogId: string }> }
) {
  try {
    // Get authentication context
    let user = null;
    try {
      user = await currentUser();
    } catch {
      console.log('No authenticated user found');
    }

    const { gameLogId } = await params;

    // Get the game log from the database
    const gameLog = (await db()?.query.game_logs.findFirst({
      where: eq(game_logs.id, gameLogId),
      with: {
        user: true,
        game: true,
      },
    })) as IGameLogWithRelations | undefined;

    if (!gameLog) {
      return NextResponse.json({ error: 'Game log not found' }, { status: 404 });
    }

    // Check access permissions
    let canAccess = false;

    // Public game logs can be accessed by anyone
    if (gameLog.classification === 'PUBLIC') {
      canAccess = true;
    }
    // For protected and private game logs, user must be authenticated
    else if (user?.id) {
      // Owner can always access
      if (gameLog.user_id === user.id) {
        canAccess = true;
      }
      // For now, allow access to protected game logs if authenticated
      else if (gameLog.classification === 'PROTECTED') {
        canAccess = true;
      }
    }

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Return the game log data
    return NextResponse.json({
      id: gameLog.id,
      game_id: gameLog.game_id,
      rating_for_game: gameLog.rating_for_game,
      notes: gameLog.notes,
      tags: gameLog.tags,
      watched_date: gameLog.watched_date,
      watched_setting: gameLog.watched_setting,
      watched_location: gameLog.watched_location,
      watched_scope: gameLog.watched_scope,
      classification: gameLog.classification,
      created_at: gameLog.created_at,
      updated_at: gameLog.updated_at,
      user: gameLog.user
        ? {
            id: gameLog.user.id,
            username: gameLog.user.username,
            first_name: gameLog.user.first_name,
            last_name: gameLog.user.last_name,
            image_url: gameLog.user.image_url,
          }
        : null,
      game: gameLog.game
        ? {
            id: gameLog.game.id,
            date: gameLog.game.date,
            status: gameLog.game.status,
            teams: gameLog.game.teams,
            scores: gameLog.game.scores,
          }
        : null,
    });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/user/game-logs/[gameLogId]',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

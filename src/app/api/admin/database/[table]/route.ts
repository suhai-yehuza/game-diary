import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@src/lib/db';
import {
  users,
  game_logs,
  comments,
  reactions,
  friendships,
  game_ratings,
  notifications,
  games,
} from '@src/lib/db/schema';

const MAX_RECORDS = 100;

export async function GET(
  request: Readonly<NextRequest>,
  context: Readonly<{ params: Promise<{ table: string }> }>
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const tableName = resolvedParams.table;

    // Check if database is connected
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }

    // Check if user is admin (you may need to implement this check based on your user roles)
    // For now, we'll allow any authenticated user to access this endpoint

    // Define table mappings
    const tableMap = {
      users,
      game_logs,
      comments,
      reactions,
      friendships,
      game_ratings,
      notifications,
      games,
    };

    const selectedTable = tableMap[tableName as keyof typeof tableMap];

    if (!selectedTable) {
      return NextResponse.json(
        { success: false, error: `Table '${tableName}' not found` },
        { status: 404 }
      );
    }

    // Fetch data from the selected table
    const data = await db.select().from(selectedTable).limit(MAX_RECORDS);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

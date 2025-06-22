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
} from '@src/lib/db/schema';

export async function GET(request: NextRequest, { params }: { params: { table: string } }) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you may need to implement this check based on your user roles)
    // For now, we'll allow any authenticated user to access this endpoint

    const { table } = params;

    // Define table mappings
    const tableMap = {
      users,
      game_logs,
      comments,
      reactions,
      friendships,
      game_ratings,
      notifications,
    };

    const selectedTable = tableMap[table as keyof typeof tableMap];

    if (!selectedTable) {
      return NextResponse.json(
        { success: false, error: `Table '${table}' not found` },
        { status: 404 }
      );
    }

    // Fetch data from the selected table
    const data = await db.select().from(selectedTable).limit(100);

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

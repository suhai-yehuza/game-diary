import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { cacheLogger } from '@lib/core/logger';
import { getCache } from '@src/lib/cache';

// GET /api/cache?key=value
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 });
    }

    // Prefix key with user ID for user-specific data
    const userKey = `user:${userId}:${key}`;

    const cache = getCache();
    // Initialize Redis before using cache operations
    await cache.initializeRedis();

    const value = await cache.get(userKey);

    cacheLogger.info(`[API Cache GET] Retrieved key: ${userKey}`);

    return NextResponse.json({ value });
  } catch (error) {
    cacheLogger.error('[API Cache GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cache
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value, ttl } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    // Prefix key with user ID for user-specific data
    const userKey = `user:${userId}:${key}`;

    const cache = getCache();
    // Initialize Redis before using cache operations
    await cache.initializeRedis();

    const success = await cache.set(userKey, value, ttl);

    cacheLogger.info(`[API Cache SET] Set key: ${userKey}, success: ${success}`);

    return NextResponse.json({ success });
  } catch (error) {
    cacheLogger.error('[API Cache POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cache?key=value
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 });
    }

    // Prefix key with user ID for user-specific data
    const userKey = `user:${userId}:${key}`;

    const cache = getCache();
    // Initialize Redis before using cache operations
    await cache.initializeRedis();

    const success = await cache.del(userKey);

    cacheLogger.info(`[API Cache DELETE] Deleted key: ${userKey}, success: ${success}`);

    return NextResponse.json({ success });
  } catch (error) {
    cacheLogger.error('[API Cache DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Force Node.js runtime for Redis operations and Clerk auth
export const runtime = 'nodejs';

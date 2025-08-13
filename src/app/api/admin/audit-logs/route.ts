import { auth } from '@clerk/nextjs/server';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { API_CONFIG } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { audit_logs } from '@/lib/db/schema/audit-schemas';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(
      searchParams.get('limit') ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE.toString()
    );
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const userIdFilter = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query conditions
    const conditions = [];

    if (category) {
      conditions.push(eq(audit_logs.category, category));
    }

    if (severity) {
      conditions.push(eq(audit_logs.severity, severity));
    }

    if (userIdFilter) {
      conditions.push(eq(audit_logs.user_id, userIdFilter));
    }

    if (startDate) {
      conditions.push(gte(audit_logs.timestamp, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(audit_logs.timestamp, new Date(endDate)));
    }

    // Get total count for pagination
    const database = db();
    if (!database) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const totalCountQuery = await database
      .select({ count: audit_logs.id })
      .from(audit_logs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalCountQuery?.length ?? 0;

    // Get paginated results
    const query = database
      .select({
        id: audit_logs.id,
        timestamp: audit_logs.timestamp,
        category: audit_logs.category,
        action: audit_logs.action,
        severity: audit_logs.severity,
        user_id: audit_logs.user_id,
        description: audit_logs.description,
        success: audit_logs.success,
        error_message: audit_logs.error_message,
        endpoint: audit_logs.endpoint,
        method: audit_logs.method,
        details: audit_logs.details,
      })
      .from(audit_logs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(audit_logs.timestamp))
      .limit(limit)
      .offset(offset);

    const results = await query;

    // Transform the results to match the expected format
    const logs =
      results?.map(log => ({
        id: log.id,
        timestamp: log.timestamp?.toISOString() ?? new Date().toISOString(),
        category: log.category ?? 'unknown',
        action: log.action ?? 'unknown',
        severity: log.severity ?? 'low',
        user_id: log.user_id ?? 'unknown',
        description: log.description ?? 'No description',
        success: log.success ?? true,
        error_message: log.error_message ?? null,
        endpoint: log.endpoint ?? null,
        method: log.method ?? null,
        details: log.details ?? {},
      })) ?? [];

    // Return the expected structure
    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in /api/admin/audit-logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const filters = (await request.json()) as {
      category?: string;
      severity?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
    };

    // Build query conditions for export
    const conditions = [];

    if (filters.category) {
      conditions.push(eq(audit_logs.category, filters.category));
    }

    if (filters.severity) {
      conditions.push(eq(audit_logs.severity, filters.severity));
    }

    if (filters.userId) {
      conditions.push(eq(audit_logs.user_id, filters.userId));
    }

    if (filters.startDate) {
      conditions.push(gte(audit_logs.timestamp, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(audit_logs.timestamp, new Date(filters.endDate)));
    }

    // Get all matching results for export (no pagination)
    const query = db()
      ?.select({
        id: audit_logs.id,
        timestamp: audit_logs.timestamp,
        category: audit_logs.category,
        action: audit_logs.action,
        severity: audit_logs.severity,
        user_id: audit_logs.user_id,
        description: audit_logs.description,
        success: audit_logs.success,
        error_message: audit_logs.error_message,
        endpoint: audit_logs.endpoint,
        method: audit_logs.method,
      })
      .from(audit_logs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(audit_logs.timestamp));

    const results = await query;

    // Transform the results
    const logs =
      results?.map(log => ({
        id: log.id,
        timestamp: log.timestamp?.toISOString() ?? new Date().toISOString(),
        category: log.category ?? 'unknown',
        action: log.action ?? 'unknown',
        severity: log.severity ?? 'low',
        user_id: log.user_id ?? 'unknown',
        description: log.description ?? 'No description',
        success: log.success ?? true,
        error_message: log.error_message ?? null,
        endpoint: log.endpoint ?? null,
        method: log.method ?? null,
      })) ?? [];

    // Convert to CSV format
    const csvHeaders = [
      'Timestamp',
      'Category',
      'Action',
      'Severity',
      'User ID',
      'Description',
      'Success',
      'Error Message',
      'Endpoint',
      'Method',
    ];

    const csvRows = logs.map(log => [
      log.timestamp,
      log.category,
      log.action,
      log.severity,
      log.user_id ?? 'N/A',
      log.description ?? 'N/A',
      log.success ? 'Yes' : 'No',
      log.error_message ?? 'N/A',
      log.endpoint ?? 'N/A',
      log.method ?? 'N/A',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error in /api/admin/audit-logs POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';

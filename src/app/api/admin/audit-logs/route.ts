import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { adminAuthMiddleware, type IAdminAuthContext } from '@/lib/middleware/admin-auth';
import { auditLogger } from '@/lib/services/audit-logger';

export async function GET(req: NextRequest) {
  // Authenticate admin user
  const authResult = await adminAuthMiddleware(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const adminContext: IAdminAuthContext = authResult;

  // Parse query params for filtering
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') ?? undefined;
  const action = searchParams.get('action') ?? undefined;
  const severity = searchParams.get('severity') ?? undefined;
  const userId = searchParams.get('userId') ?? undefined;
  const resourceType = searchParams.get('resourceType') ?? undefined;
  const resourceId = searchParams.get('resourceId') ?? undefined;
  const startDateParam = searchParams.get('startDate');
  const startDate = startDateParam ? new Date(startDateParam) : undefined;
  const endDateParam = searchParams.get('endDate');
  const endDate = endDateParam ? new Date(endDateParam) : undefined;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam) : 100;
  const offsetParam = searchParams.get('offset');
  const offset = offsetParam ? parseInt(offsetParam) : 0;

  try {
    const logs = (await auditLogger.queryAuditLogs({
      category,
      action,
      severity,
      userId,
      resourceType,
      resourceId,
      startDate,
      endDate,
      limit,
      offset,
    })) as Record<string, unknown>[];

    // Log admin access to audit logs
    await auditLogger.logAuditEvent({
      category: 'data_access',
      action: 'data_read',
      severity: 'medium',
      userId: adminContext.userId,
      description: 'Admin accessed audit logs',
      endpoint: req.url,
      method: req.method,
      success: true,
      details: { logsCount: logs.length, filters: { category, action, severity, userId } },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Optionally support CSV export
export async function POST(req: NextRequest) {
  // Authenticate admin user
  const authResult = await adminAuthMiddleware(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const adminContext: IAdminAuthContext = authResult;

  // For export, accept filter params in body
  const body = (await req.json()) as {
    category?: string;
    action?: string;
    severity?: string;
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  };

  // Convert string dates to Date objects
  const queryFilters = {
    ...body,
    startDate: body.startDate ? new Date(body.startDate) : undefined,
    endDate: body.endDate ? new Date(body.endDate) : undefined,
  };

  const logs = (await auditLogger.queryAuditLogs(queryFilters)) as Record<string, unknown>[];

  // Log admin export of audit logs
  await auditLogger.logAuditEvent({
    category: 'data_access',
    action: 'data_read',
    severity: 'medium',
    userId: adminContext.userId,
    description: 'Admin exported audit logs to CSV',
    endpoint: req.url,
    method: req.method,
    success: true,
    details: { logsCount: logs.length, exportFormat: 'csv' },
  });

  // Convert to CSV (simple implementation)
  const csv = [
    Object.keys(logs[0] ?? {}).join(','),
    ...logs.map(log =>
      Object.values(log)
        .map(v => JSON.stringify(v))
        .join(',')
    ),
  ].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="audit-logs.csv"',
    },
  });
}

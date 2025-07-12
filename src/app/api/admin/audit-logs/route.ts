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
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : undefined;
  const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

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
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
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
  const body = await req.json();
  const logs = (await auditLogger.queryAuditLogs(body)) as Record<string, unknown>[];

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

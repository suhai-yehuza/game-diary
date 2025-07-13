import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Mock audit logs for testing
    const mockAuditLogs = [
      {
        id: '1',
        user_id: userId,
        action: 'sensitive_data_accessed',
        success: true,
        timestamp: new Date().toISOString(),
        details: 'User accessed their profile data',
      },
      {
        id: '2',
        user_id: 'unknown',
        action: 'sensitive_data_accessed',
        success: false,
        timestamp: new Date().toISOString(),
        details: 'Unauthorized access attempt',
      },
    ];

    return NextResponse.json(mockAuditLogs);
  } catch (error) {
    console.error('Error in /api/admin/audit-logs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const runtime = 'nodejs';

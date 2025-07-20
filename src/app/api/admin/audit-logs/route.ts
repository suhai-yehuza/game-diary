import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const userIdFilter = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Mock audit logs for testing with proper structure
    const mockAuditLogs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        category: 'authentication',
        action: 'login_success',
        severity: 'low',
        user_id: userId,
        description: 'User successfully logged in',
        success: true,
        error_message: null,
        endpoint: '/api/auth/login',
        method: 'POST',
        details: { ip_address: '192.168.1.1', user_agent: 'Mozilla/5.0...' },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        category: 'authorization',
        action: 'permission_denied',
        severity: 'high',
        user_id: 'unknown',
        description: 'Unauthorized access attempt to admin page',
        success: false,
        error_message: 'Insufficient permissions',
        endpoint: '/protected/admin/audit-logs',
        method: 'GET',
        details: { ip_address: '192.168.1.2', user_agent: 'Mozilla/5.0...' },
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        category: 'data_access',
        action: 'sensitive_data_accessed',
        severity: 'medium',
        user_id: userId,
        description: 'User accessed their profile data',
        success: true,
        error_message: null,
        endpoint: '/api/user/profile',
        method: 'GET',
        details: { fields_accessed: ['email', 'phone'] },
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        category: 'encryption',
        action: 'key_rotation',
        severity: 'critical',
        user_id: 'system',
        description: 'Encryption key rotation completed',
        success: true,
        error_message: null,
        endpoint: '/api/admin/keys/rotate',
        method: 'POST',
        details: { key_id: 'key_123', affected_records: 1500 },
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        category: 'security',
        action: 'failed_login',
        severity: 'medium',
        user_id: 'unknown',
        description: 'Failed login attempt',
        success: false,
        error_message: 'Invalid credentials',
        endpoint: '/api/auth/login',
        method: 'POST',
        details: { ip_address: '192.168.1.3', attempts: 3 },
      },
    ];

    // Apply filters
    let filteredLogs = mockAuditLogs;

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }

    if (userIdFilter) {
      filteredLogs = filteredLogs.filter(log => log.user_id === userIdFilter);
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }

    // Apply pagination
    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Return the expected structure
    return NextResponse.json({
      logs: paginatedLogs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in /api/admin/audit-logs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const filters = await request.json();

    // Mock audit logs for export (same as GET but without pagination)
    const mockAuditLogs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        category: 'authentication',
        action: 'login_success',
        severity: 'low',
        user_id: userId,
        description: 'User successfully logged in',
        success: true,
        error_message: null,
        endpoint: '/api/auth/login',
        method: 'POST',
        details: { ip_address: '192.168.1.1', user_agent: 'Mozilla/5.0...' },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        category: 'authorization',
        action: 'permission_denied',
        severity: 'high',
        user_id: 'unknown',
        description: 'Unauthorized access attempt to admin page',
        success: false,
        error_message: 'Insufficient permissions',
        endpoint: '/protected/admin/audit-logs',
        method: 'GET',
        details: { ip_address: '192.168.1.2', user_agent: 'Mozilla/5.0...' },
      },
    ];

    // Apply filters (same logic as GET)
    let filteredLogs = mockAuditLogs;

    if (filters.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }

    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.user_id === filters.userId);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }

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

    const csvRows = filteredLogs.map(log => [
      log.timestamp,
      log.category,
      log.action,
      log.severity,
      log.user_id || 'N/A',
      log.description || 'N/A',
      log.success ? 'Yes' : 'No',
      log.error_message || 'N/A',
      log.endpoint || 'N/A',
      log.method || 'N/A',
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export const runtime = 'nodejs';

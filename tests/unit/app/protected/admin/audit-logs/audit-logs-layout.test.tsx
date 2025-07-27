import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminAuditLogsLayout from '@/app/protected/admin/audit-logs/layout';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock audit logger
vi.mock('@/lib/services/audit-logger', () => ({
  auditLogger: {
    logAuditEvent: vi.fn(),
  },
}));

const mockAuth = auth as any;
const mockRedirect = redirect as any;

describe('AdminAuditLogsLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to sign-in when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

    const TestComponent = () => <div>Test Content</div>;

    await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(mockRedirect).toHaveBeenCalledWith('/sign-in');
  });

  it('allows access when user has admin role', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {
        metadata: {
          role: ['admin'],
        },
      },
    });

    const TestComponent = () => <div data-testid="test-content">Test Content</div>;

    const result = await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('allows access when user has Admin role (case insensitive)', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {
        metadata: {
          role: ['Admin'],
        },
      },
    });

    const TestComponent = () => <div data-testid="test-content">Test Content</div>;

    const result = await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('redirects non-admin users to user page', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {
        metadata: {
          role: ['user'],
        },
      },
    });

    const TestComponent = () => <div>Test Content</div>;

    await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(mockRedirect).toHaveBeenCalledWith('/protected/user');
  });

  it('handles missing session claims gracefully', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: null,
    });

    const TestComponent = () => <div>Test Content</div>;

    await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(mockRedirect).toHaveBeenCalledWith('/protected/user');
  });

  it('handles missing metadata gracefully', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {},
    });

    const TestComponent = () => <div>Test Content</div>;

    await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(mockRedirect).toHaveBeenCalledWith('/protected/user');
  });

  it('handles missing role array gracefully', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {
        metadata: {},
      },
    });

    const TestComponent = () => <div>Test Content</div>;

    await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(mockRedirect).toHaveBeenCalledWith('/protected/user');
  });

  it('handles empty role array gracefully', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {
        metadata: {
          role: [],
        },
      },
    });

    const TestComponent = () => <div>Test Content</div>;

    await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(mockRedirect).toHaveBeenCalledWith('/protected/user');
  });

  it('handles malformed session claims gracefully', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {
        metadata: {
          role: 'not-an-array',
        },
      },
    });

    const TestComponent = () => <div>Test Content</div>;

    await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(mockRedirect).toHaveBeenCalledWith('/protected/user');
  });

  it('logs audit events for unauthorized access attempts', async () => {
    const { auditLogger } = await import('@/lib/services/audit-logger');

    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {
        metadata: {
          role: ['user'],
        },
      },
    });

    const TestComponent = () => <div>Test Content</div>;

    await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(auditLogger.logAuditEvent).toHaveBeenCalledWith({
      category: 'authorization',
      action: 'permission_denied',
      severity: 'high',
      userId: 'user123',
      description: 'Non-admin user attempted to access admin audit logs page',
      success: false,
      errorMessage: 'Insufficient permissions',
      details: { userRoles: ['user'], page: '/admin/audit-logs' },
    });
  });

  it('logs audit events for successful admin access', async () => {
    const { auditLogger } = await import('@/lib/services/audit-logger');

    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {
        metadata: {
          role: ['admin'],
        },
      },
    });

    const TestComponent = () => <div>Test Content</div>;

    await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(auditLogger.logAuditEvent).toHaveBeenCalledWith({
      category: 'authorization',
      action: 'permission_granted',
      severity: 'medium',
      userId: 'user123',
      description: 'Admin user accessed audit logs page',
      success: true,
      details: { userRoles: ['admin'], page: '/admin/audit-logs' },
    });
  });

  it('returns children when access is granted', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: {
        metadata: {
          role: ['admin'],
        },
      },
    });

    const TestComponent = () => <div data-testid="test-content">Test Content</div>;

    const result = await AdminAuditLogsLayout({ children: <TestComponent /> });

    expect(result).toBeDefined();
    expect(result).toBeTruthy();
  });
});

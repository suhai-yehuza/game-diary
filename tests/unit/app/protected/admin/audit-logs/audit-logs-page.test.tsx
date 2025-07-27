import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminAuditLogsPage from '@/app/protected/admin/audit-logs/page';

// Mock the components
vi.mock('@/app/protected/admin/audit-logs/components/audit-logs-content', () => ({
  AdminAuditLogsContent: () => <div data-testid="admin-audit-logs-content">Audit Logs Content</div>,
}));

vi.mock('@src/app/protected/admin/database/components/ui/error-boundary', () => ({
  ErrorBoundary: ({
    children,
    componentName,
  }: {
    children: React.ReactNode;
    componentName: string;
  }) => (
    <div data-testid="error-boundary" data-component-name={componentName}>
      {children}
    </div>
  ),
}));

describe('AdminAuditLogsPage', () => {
  it('renders the admin audit logs page with correct structure', () => {
    render(<AdminAuditLogsPage />);

    // Check that the error boundary is rendered with correct component name
    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();
    expect(errorBoundary).toHaveAttribute('data-component-name', 'AdminAuditLogsPage');

    // Check that the audit logs content is rendered
    expect(screen.getByTestId('admin-audit-logs-content')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs Content')).toBeInTheDocument();
  });

  it('wraps content in error boundary with correct component name', () => {
    render(<AdminAuditLogsPage />);

    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toHaveAttribute('data-component-name', 'AdminAuditLogsPage');
  });

  it('renders with proper background styling', () => {
    const { container } = render(<AdminAuditLogsPage />);

    // Find the div with background styling inside the error boundary
    const backgroundDiv = container.querySelector('.bg-background');
    expect(backgroundDiv).toBeInTheDocument();
    expect(backgroundDiv).toHaveClass('bg-background', 'min-h-screen');
  });

  it('maintains proper component hierarchy', () => {
    const { container } = render(<AdminAuditLogsPage />);

    // Check the DOM structure
    const errorBoundary = container.querySelector('[data-testid="error-boundary"]');
    expect(errorBoundary).toBeInTheDocument();

    const backgroundDiv = errorBoundary?.querySelector('.bg-background');
    expect(backgroundDiv).toBeInTheDocument();

    const content = backgroundDiv?.querySelector('[data-testid="admin-audit-logs-content"]');
    expect(content).toBeInTheDocument();
  });
});

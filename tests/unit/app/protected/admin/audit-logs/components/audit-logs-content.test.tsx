import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTheme } from 'next-themes';

import { AdminAuditLogsContent } from '@src/app/protected/admin/audit-logs/components/audit-logs-content';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

// Mock the API config
vi.mock('@/lib/config/app.config', () => ({
  API_CONFIG: {
    pagination: {
      DEFAULT_PAGE_SIZE: 20,
    },
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Mock the error boundary component
vi.mock('@src/app/protected/admin/database/components/ui/error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

// Mock the pagination controls component
vi.mock('@src/app/protected/admin/database/components/ui/pagination-controls', () => ({
  PaginationControls: ({ onFirst, onPrev, onNext, onLast, currentPage, totalPages }: any) => (
    <div data-testid="pagination-controls">
      <button onClick={onFirst} data-testid="first-page">
        First
      </button>
      <button onClick={onPrev} data-testid="prev-page">
        Prev
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button onClick={onNext} data-testid="next-page">
        Next
      </button>
      <button onClick={onLast} data-testid="last-page">
        Last
      </button>
    </div>
  ),
}));

describe('AdminAuditLogsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useTheme
    (useTheme as any).mockReturnValue({
      resolvedTheme: 'light',
    });

    // Mock successful fetch response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: '1',
                timestamp: '2024-01-01T00:00:00Z',
                level: 'info',
                message: 'Test audit log',
                user_id: 'user123',
                action: 'test_action',
                resource: 'test_resource',
                details: { test: 'data' },
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              pages: 1,
            },
          }),
      } as unknown as Response)
    );
  });

  it('renders audit logs content with title', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('Admin Audit Logs')).toBeInTheDocument();
    });
  });

  it('renders error boundary wrapper', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  it('renders filter section', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('Filter Audit Logs')).toBeInTheDocument();
    });
  });

  it('renders category filter', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });
  });

  it('renders severity filter', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('All Severities')).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    // Mock a slow fetch
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    render(<AdminAuditLogsContent />);

    expect(screen.getByText('Loading audit logs...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock fetch error
    global.fetch = vi.fn(() => Promise.reject(new Error('API Error')));

    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('renders with dark theme', async () => {
    (useTheme as any).mockReturnValue({
      resolvedTheme: 'dark',
    });

    render(<AdminAuditLogsContent />);

    // Component should render without crashing in dark theme
    await waitFor(() => {
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });
});

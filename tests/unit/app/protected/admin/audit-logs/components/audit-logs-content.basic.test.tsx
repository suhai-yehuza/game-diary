import { render, screen, waitFor } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

// Mock useCentralizedErrorHandler
vi.mock('@/hooks/use-centralized-error-handler', () => ({
  useCentralizedErrorHandler: () => ({
    handleAsync: vi.fn(fn => fn()),
    handleSync: vi.fn(fn => fn()),
  }),
}));

describe('AdminAuditLogsContent', () => {
  const mockAuditLogs = [
    {
      id: '1',
      timestamp: '2024-01-01T00:00:00Z',
      level: 'info',
      message: 'Test audit log 1',
      user_id: 'user123',
      action: 'test_action',
      resource: 'test_resource',
      details: { test: 'data' },
      category: 'authentication',
      severity: 'low',
      description: 'Test description 1',
    },
    {
      id: '2',
      timestamp: '2024-01-02T00:00:00Z',
      level: 'error',
      message: 'Test audit log 2',
      user_id: 'user456',
      action: 'test_action_2',
      resource: 'test_resource_2',
      details: { test: 'data_2' },
      category: 'database',
      severity: 'high',
      description: 'Test description 2',
    },
  ];

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
            logs: mockAuditLogs,
            total: 2,
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
    global.fetch = vi.fn(() => new Promise(() => {})) as any;

    render(<AdminAuditLogsContent />);

    expect(screen.getByText('Loading audit logs...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock fetch error
    global.fetch = vi.fn(() => Promise.reject(new Error('API Error')));

    render(<AdminAuditLogsContent />);

    // The component should handle the error gracefully
    await waitFor(() => {
      expect(screen.getByText('Loading audit logs...')).toBeInTheDocument();
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

  // Enhanced tests for better function coverage

  it('handles pagination controls', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
    });

    // Test pagination buttons
    const firstButton = screen.getByTestId('first-page');
    const prevButton = screen.getByTestId('prev-page');
    const nextButton = screen.getByTestId('next-page');
    const lastButton = screen.getByTestId('last-page');

    expect(firstButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(lastButton).toBeInTheDocument();
  });

  it('handles filter changes', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('Filter Audit Logs')).toBeInTheDocument();
    });

    // Test category filter
    const categorySelect = screen.getByDisplayValue('All Categories');
    expect(categorySelect).toBeInTheDocument();

    // Test severity filter
    const severitySelect = screen.getByDisplayValue('All Severities');
    expect(severitySelect).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search audit logs...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search audit logs...');
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search field selection', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('All Fields')).toBeInTheDocument();
    });

    const searchFieldSelect = screen.getByDisplayValue('All Fields');
    expect(searchFieldSelect).toBeInTheDocument();
  });

  it('handles export functionality', async () => {
    // Mock successful response with both json and blob methods
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ logs: mockAuditLogs, total: 2 }),
        blob: () => Promise.resolve(new Blob(['test'])),
      } as unknown as Response)
    );

    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('Admin Audit Logs')).toBeInTheDocument();
    });

    // Check that export button is present
    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('handles sorting functionality', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('Admin Audit Logs')).toBeInTheDocument();
    });

    // Test that sortable headers are present
    const timestampHeader = screen.getByText('Timestamp');
    expect(timestampHeader).toBeInTheDocument();

    // Check that severity and action appear in the table headers
    const severityHeaders = screen.getAllByText('Severity');
    const actionHeaders = screen.getAllByText('Action');
    expect(severityHeaders.length).toBeGreaterThan(0);
    expect(actionHeaders.length).toBeGreaterThan(0);
  });

  it('displays audit log data correctly', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('Admin Audit Logs')).toBeInTheDocument();
    });

    // Test that log details are displayed
    expect(screen.getByText('user123')).toBeInTheDocument();
    expect(screen.getByText('user456')).toBeInTheDocument();
    expect(screen.getByText('test action')).toBeInTheDocument(); // action field with underscores replaced
    expect(screen.getByText('test action 2')).toBeInTheDocument(); // action field with underscores replaced
  });

  it('handles empty audit logs', async () => {
    // Mock empty response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            logs: [],
            total: 0,
          }),
      } as unknown as Response)
    );

    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('No audit logs found')).toBeInTheDocument();
    });
  });

  it('handles API error responses', async () => {
    // Mock API error response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as unknown as Response)
    );

    render(<AdminAuditLogsContent />);

    // The component should handle the error gracefully
    await waitFor(() => {
      expect(screen.getByText('Loading audit logs...')).toBeInTheDocument();
    });
  });

  it('handles pagination state correctly', async () => {
    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('Admin Audit Logs')).toBeInTheDocument();
    });

    // Check if pagination controls are present
    const paginationControls = screen.getByTestId('pagination-controls');
    expect(paginationControls).toBeInTheDocument();
  });

  it('handles multiple pages of data', async () => {
    // Mock response with multiple pages
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            logs: mockAuditLogs,
            total: 50, // More than one page
          }),
      } as unknown as Response)
    );

    render(<AdminAuditLogsContent />);

    await waitFor(() => {
      expect(screen.getByText('Admin Audit Logs')).toBeInTheDocument();
    });

    // Check if pagination controls are present
    const paginationControls = screen.getByTestId('pagination-controls');
    expect(paginationControls).toBeInTheDocument();
  });
});

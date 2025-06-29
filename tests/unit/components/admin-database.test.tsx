import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { AdminDatabasePage } from '@src/app/protected/admin/database/page';

// Mock Next.js useSearchParams
const mockSearchParams = new Map();
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

describe('AdminDatabasePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders database management page with tabs', () => {
    render(<AdminDatabasePage />);

    expect(screen.getByText('Database Management')).toBeInTheDocument();
    expect(
      screen.getByText(
        'View and manage database tables. This page allows you to fetch and display data from various tables in the system.'
      )
    ).toBeInTheDocument();

    // Check for all tab triggers
    expect(screen.getAllByText('Users')).toHaveLength(2); // tab trigger and card title
    expect(screen.getByText('Game Logs')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('Reactions')).toBeInTheDocument();
    expect(screen.getByText('Friendships')).toBeInTheDocument();
    expect(screen.getByText('Game Ratings')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('NBA Games')).toBeInTheDocument();
  });

  it('shows users tab by default', () => {
    render(<AdminDatabasePage />);

    expect(screen.getByText('User accounts and profiles')).toBeInTheDocument();
    expect(
      screen.getByText('No data loaded. Click "Fetch Data" to load users.')
    ).toBeInTheDocument();
  });

  it('switches to different tab when clicked', async () => {
    render(<AdminDatabasePage />);

    const gameLogsTab = screen.getByText('Game Logs');
    fireEvent.click(gameLogsTab);

    // Mock fetch for game_logs
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getAllByText('Game Logs').length).toBeGreaterThan(0);
    });
  });

  it('fetches and displays data when Fetch Data is clicked', async () => {
    const mockData = [
      {
        id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        emailAddress: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        username: 'anotheruser',
        first_name: 'Another',
        last_name: 'User',
        emailAddress: 'another@example.com',
        createdAt: '2024-01-02T00:00:00Z',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    render(<AdminDatabasePage />);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('2 records')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('anotheruser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('another@example.com')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/database/users');
  });

  it('handles API error when fetching data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false, error: 'Database connection failed' }),
    });

    render(<AdminDatabasePage />);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });
  });

  it('handles network error when fetching data', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<AdminDatabasePage />);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Error fetching users data: Network error')).toBeInTheDocument();
    });
  });

  it('formats different data types correctly', async () => {
    const mockData = [
      {
        id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        emailAddress: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    render(<AdminDatabasePage />);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('handles null and undefined values', async () => {
    const mockData = [
      {
        id: 1,
        username: 'testuser',
        first_name: null,
        last_name: undefined,
        emailAddress: '',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    render(<AdminDatabasePage />);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getAllByText('N/A')).toHaveLength(2); // null and undefined
      expect(screen.getByTitle('')).toBeInTheDocument(); // empty string
    });
  });

  it('limits displayed records to 50', async () => {
    const mockData = Array.from({ length: 60 }, (_, i) => ({
      id: i + 1,
      username: `user${i + 1}`,
      emailAddress: `user${i + 1}@example.com`,
      createdAt: '2024-01-01T00:00:00Z',
    }));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    render(<AdminDatabasePage />);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('60 records')).toBeInTheDocument();
      expect(screen.getByText('Showing first 50 of 60 records')).toBeInTheDocument();
    });
  });

  it('switches to tab based on URL parameter', async () => {
    mockSearchParams.set('tab', 'comments');

    render(<AdminDatabasePage />);

    await waitFor(() => {
      expect(screen.getByText('User comments on game logs and other content')).toBeInTheDocument();
    });
  });

  it('auto-fetches data when tab is specified in URL', async () => {
    mockSearchParams.set('tab', 'game_logs');

    const mockData = [
      {
        id: 1,
        userId: 1,
        gameId: 123,
        ratingForGame: 5,
        watchedSetting: 'live',
        watchedDate: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    render(<AdminDatabasePage />);

    await waitFor(() => {
      const matches = screen.queryAllByText(content =>
        content.includes('User game watching history and ratings')
      );
      expect(matches.length).toBeGreaterThan(0);
      expect(screen.getByText('1 records')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('live')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/database/game_logs');
  });

  it('handles invalid tab parameter gracefully', () => {
    mockSearchParams.set('tab', 'invalid_tab');

    render(<AdminDatabasePage />);

    // Should default to users tab
    expect(screen.getByText('User accounts and profiles')).toBeInTheDocument();
  });

  it('disables fetch button while loading', async () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdminDatabasePage />);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(fetchButton).toBeDisabled();
    });
  });

  it('shows last updated timestamp', async () => {
    const mockData = [
      {
        id: 1,
        username: 'testuser',
        emailAddress: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    render(<AdminDatabasePage />);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { UsersTableWithSearch } from '@src/app/protected/admin/database/components/users-table';

// Mock the GraphQL query
vi.mock('@src/lib/graphql/queries', () => ({
  SEARCH_USERS_ADMIN: {
    loc: {
      source: {
        body: 'mock query',
      },
    },
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('UsersTableWithSearch', () => {
  const mockUsers = [
    {
      id: '1',
      username: 'john_doe',
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john@example.com',
      phone_number: '+1234567890',
      created_at: '2023-01-01T00:00:00Z',
      image_url: null,
    },
    {
      id: '2',
      username: 'jane_smith',
      first_name: 'Jane',
      last_name: 'Smith',
      email_address: 'jane@example.com',
      phone_number: null,
      created_at: '2023-01-02T00:00:00Z',
      image_url: 'https://example.com/avatar.jpg',
    },
  ];

  const mockResponse = {
    data: {
      searchUsers: {
        edges: mockUsers.map(user => ({ node: user })),
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: '1',
          endCursor: '2',
        },
        totalCount: 2,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search component', () => {
    render(<UsersTableWithSearch />);

    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UsersTableWithSearch />);

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('user_id')).toBeInTheDocument();
    expect(screen.getByText('email_address')).toBeInTheDocument();
    expect(screen.getByText('phone_number')).toBeInTheDocument();
    expect(screen.getByText('created_at')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<UsersTableWithSearch />);

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('fetches and displays users', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays user information correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('@john_doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
    });
  });

  it('displays user initials when no image is available', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  it('displays user avatar when image is available', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      const avatar = screen.getByAltText('Jane Smith');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  it('displays N/A for missing phone numbers', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
    });
  });

  it('displays pagination info', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('2 total users')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/graphql',
        expect.objectContaining({
          body: JSON.stringify({
            query: 'mock query',
            variables: {
              first: 20,
              after: null,
              searchTerm: 'john',
              searchField: 'all',
            },
          }),
        })
      );
    });
  });

  it('handles search field changes', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    const dropdown = screen.getByDisplayValue('All Fields');
    fireEvent.change(dropdown, { target: { value: 'username' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/graphql',
        expect.objectContaining({
          body: JSON.stringify({
            query: 'mock query',
            variables: {
              first: 20,
              after: null,
              searchTerm: '',
              searchField: 'username',
            },
          }),
        })
      );
    });
  });

  it('handles pagination controls', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('displays error message when fetch fails', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays error message when API returns errors', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => ({
        errors: [{ message: 'API error' }],
      }),
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('API error')).toBeInTheDocument();
    });
  });

  it('handles empty user list', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => ({
        data: {
          searchUsers: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
        },
      }),
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('calculates row numbers correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<UsersTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes to table', () => {
    render(<UsersTableWithSearch />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('w-full');
  });

  it('applies correct CSS classes to table headers', () => {
    render(<UsersTableWithSearch />);

    const headers = screen.getAllByRole('columnheader');
    headers.forEach(header => {
      expect(header).toHaveClass(
        'px-6',
        'py-3',
        'text-left',
        'text-xs',
        'font-medium',
        'text-muted-foreground',
        'tracking-wider',
        'border-b',
        'border-border'
      );
    });
  });
});

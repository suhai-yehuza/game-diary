import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock the friendship hooks to prevent Apollo Client context errors
vi.mock('@/hooks/use-friendships', () => ({
  useFriendships: vi.fn(() => ({
    friendships: [],
    loading: false,
    refetch: vi.fn(),
  })),
  useFriendshipRequests: vi.fn(() => ({
    requests: [],
    loading: false,
    refetch: vi.fn(),
  })),
  useUserSearch: vi.fn(() => ({
    users: [],
    loading: false,
    search: vi.fn(),
  })),
  useFriendshipMutations: vi.fn(() => ({
    sendFriendRequest: vi.fn(),
    acceptFriendRequest: vi.fn(),
    rejectFriendRequest: vi.fn(),
    removeFriend: vi.fn(),
    loading: false,
  })),
  useFriendshipStatus: vi.fn(() => ({
    status: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { FriendsTable } from '@/app/protected/user/components/FriendsTable';
import { useUser } from '@clerk/nextjs';

describe('FriendsTable', () => {
  const mockUseUser = useUser as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign-in message when user is not signed in', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<FriendsTable />);

    expect(screen.getByText('Please sign in to view your friends')).toBeInTheDocument();
    expect(screen.queryByText('Friends')).not.toBeInTheDocument();
  });

  it('renders sign-in message when user has no id', () => {
    mockUseUser.mockReturnValue({
      user: { id: null },
    });

    render(<FriendsTable />);

    expect(screen.getByText('Please sign in to view your friends')).toBeInTheDocument();
    expect(screen.queryByText('Friends')).not.toBeInTheDocument();
  });

  it('renders friends content when user is signed in', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('Add Friends')).toBeInTheDocument();
    expect(screen.getByText('No friends yet')).toBeInTheDocument();
    expect(screen.getByText('Add some friends to get started!')).toBeInTheDocument();
    expect(screen.queryByText('Please sign in to view your friends')).not.toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    const container = screen.getByText('Friends').closest('div');
    expect(container).toHaveClass('flex', 'justify-between', 'items-center');
  });

  it('renders sign-in message with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<FriendsTable />);

    const signInContainer = screen.getByText('Please sign in to view your friends').closest('div');
    expect(signInContainer).toHaveClass('flex', 'items-center', 'justify-center', 'p-8');

    const messageContainer = screen.getByText('Please sign in to view your friends');
    expect(messageContainer).toHaveClass('text-muted-foreground');
  });

  it('renders friends heading with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    const heading = screen.getByText('Friends');
    expect(heading).toHaveClass('text-2xl', 'font-bold');
  });

  it('renders empty state with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    const emptyStateContainer = screen.getByText('No friends yet').closest('div');
    expect(emptyStateContainer).toHaveClass('text-center', 'py-12', 'text-gray-400');
  });

  it('renders empty state description with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    const description = screen.getByText('Add some friends to get started!');
    expect(description).toHaveClass('text-sm');
  });

  it('handles user with different id formats', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'test-user-id-456' },
    });

    render(<FriendsTable />);

    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.queryByText('Please sign in to view your friends')).not.toBeInTheDocument();
  });

  it('handles user object with additional properties', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    render(<FriendsTable />);

    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.queryByText('Please sign in to view your friends')).not.toBeInTheDocument();
  });

  it('renders proper component structure when signed in', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    const { container } = render(<FriendsTable />);

    // Should have the main container
    const mainContainer = container.querySelector('.space-y-6');
    expect(mainContainer).toBeInTheDocument();

    // Should contain the heading
    expect(mainContainer).toHaveTextContent('Friends');

    // Should contain the add friends button
    expect(mainContainer).toHaveTextContent('Add Friends');

    // Should contain the empty state
    expect(mainContainer).toHaveTextContent('No friends yet');
  });

  it('renders proper component structure when not signed in', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    const { container } = render(<FriendsTable />);

    // Should have the sign-in container
    const signInContainer = container.querySelector('.flex.items-center.justify-center.p-8');
    expect(signInContainer).toBeInTheDocument();

    // Should contain the sign-in message
    expect(signInContainer).toHaveTextContent('Please sign in to view your friends');

    // Should not contain friends content
    expect(signInContainer).not.toHaveTextContent('Friends');
  });

  it('distinguishes from ActivityTable content', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    // Should show friends-specific content
    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('Add Friends')).toBeInTheDocument();
    expect(screen.getByText('No friends yet')).toBeInTheDocument();

    // Should not show activity-specific content
    expect(screen.queryByText('Activity & Timeline')).not.toBeInTheDocument();
    expect(
      screen.queryByText('See your recent activities and timeline here.')
    ).not.toBeInTheDocument();
  });
});

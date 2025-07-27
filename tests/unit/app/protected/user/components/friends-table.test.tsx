import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
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

    expect(screen.getByText('Please sign in to view your friends.')).toBeInTheDocument();
    expect(screen.queryByText('Friends')).not.toBeInTheDocument();
  });

  it('renders sign-in message when user has no id', () => {
    mockUseUser.mockReturnValue({
      user: { id: null },
    });

    render(<FriendsTable />);

    expect(screen.getByText('Please sign in to view your friends.')).toBeInTheDocument();
    expect(screen.queryByText('Friends')).not.toBeInTheDocument();
  });

  it('renders friends content when user is signed in', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('View and manage your friends list.')).toBeInTheDocument();
    expect(screen.getByText('Friends functionality coming soon!')).toBeInTheDocument();
    expect(
      screen.getByText('This will include search, filter, and sort capabilities.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Please sign in to view your friends.')).not.toBeInTheDocument();
  });

  it('renders with proper styling classes', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    const container = screen.getByText('Friends').closest('div');
    expect(container).toHaveClass('rounded-lg', 'border', 'p-6', 'bg-background');
  });

  it('renders sign-in message with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<FriendsTable />);

    const signInContainer = screen
      .getByText('Please sign in to view your friends.')
      .closest('.rounded-lg');
    expect(signInContainer).toHaveClass('rounded-lg', 'border', 'p-6', 'bg-background');

    const messageContainer = screen.getByText('Please sign in to view your friends.');
    expect(messageContainer).toHaveClass('text-center', 'text-muted-foreground');
  });

  it('renders friends heading with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    const heading = screen.getByText('Friends');
    expect(heading).toHaveClass('text-2xl', 'font-semibold', 'mb-4');
  });

  it('renders friends description with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    const description = screen.getByText('View and manage your friends list.');
    expect(description).toHaveClass('text-muted-foreground', 'mb-4');
  });

  it('renders coming soon message with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    const comingSoonContainer = screen
      .getByText('Friends functionality coming soon!')
      .closest('div');
    expect(comingSoonContainer).toHaveClass('text-center', 'py-8', 'text-muted-foreground');
  });

  it('renders coming soon description with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    const description = screen.getByText(
      'This will include search, filter, and sort capabilities.'
    );
    expect(description).toHaveClass('text-sm', 'mt-2');
  });

  it('handles user with different id formats', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'test-user-id-456' },
    });

    render(<FriendsTable />);

    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.queryByText('Please sign in to view your friends.')).not.toBeInTheDocument();
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
    expect(screen.queryByText('Please sign in to view your friends.')).not.toBeInTheDocument();
  });

  it('renders proper component structure when signed in', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    const { container } = render(<FriendsTable />);

    // Should have the main container
    const mainContainer = container.querySelector('.rounded-lg.border.p-6.bg-background');
    expect(mainContainer).toBeInTheDocument();

    // Should contain the heading
    expect(mainContainer).toHaveTextContent('Friends');

    // Should contain the description
    expect(mainContainer).toHaveTextContent('View and manage your friends list.');

    // Should contain the coming soon message
    expect(mainContainer).toHaveTextContent('Friends functionality coming soon!');
  });

  it('renders proper component structure when not signed in', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    const { container } = render(<FriendsTable />);

    // Should have the main container
    const mainContainer = container.querySelector('.rounded-lg.border.p-6.bg-background');
    expect(mainContainer).toBeInTheDocument();

    // Should contain the sign-in message
    expect(mainContainer).toHaveTextContent('Please sign in to view your friends.');

    // Should not contain friends content
    expect(mainContainer).not.toHaveTextContent('Friends');
  });

  it('distinguishes from ActivityTable content', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    render(<FriendsTable />);

    // Should show friends-specific content
    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('View and manage your friends list.')).toBeInTheDocument();
    expect(screen.getByText('Friends functionality coming soon!')).toBeInTheDocument();

    // Should not show activity-specific content
    expect(screen.queryByText('Activity & Timeline')).not.toBeInTheDocument();
    expect(
      screen.queryByText('See your recent activities and timeline here.')
    ).not.toBeInTheDocument();
  });
});

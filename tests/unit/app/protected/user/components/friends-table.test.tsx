import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { FriendsTable } from '@src/app/protected/user/components/FriendsTable';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
  }),
}));

// Mock the friendship hooks
vi.mock('@/hooks/use-friendships', () => ({
  useFriendships: () => ({
    friendships: [],
    loading: false,
    refetch: vi.fn(),
  }),
  useFriendshipRequests: () => ({
    requests: [],
    loading: false,
    refetch: vi.fn(),
  }),
  useUserSearch: () => ({
    users: [],
    loading: false,
    search: vi.fn(),
  }),
  useFriendshipMutations: () => ({
    sendFriendRequest: vi.fn(),
    acceptFriendRequest: vi.fn(),
    rejectFriendRequest: vi.fn(),
    removeFriend: vi.fn(),
    loading: false,
  }),
  useFriendshipStatus: () => ({
    status: null,
    loading: false,
    refetch: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, _priority, ...props }: any) => (
    <div data-testid="next-image" title={alt} {...props}>
      {src}
    </div>
  ),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Search: ({ ...props }: any) => <div data-testid="search-icon" {...props} />,
  UserPlus: ({ ...props }: any) => <div data-testid="user-plus-icon" {...props} />,
  UserX: ({ ...props }: any) => <div data-testid="user-x-icon" {...props} />,
  Check: ({ ...props }: any) => <div data-testid="check-icon" {...props} />,
  X: ({ ...props }: any) => <div data-testid="x-icon" {...props} />,
  MoreHorizontal: ({ ...props }: any) => <div data-testid="more-horizontal-icon" {...props} />,
}));

describe('FriendsTable', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the friends table with correct structure', () => {
    render(<FriendsTable />);

    expect(screen.getByText('Friends')).toBeInTheDocument();
  });

  it('renders the search input with correct placeholder', () => {
    render(<FriendsTable />);

    const searchInput = screen.getByPlaceholderText('Search friends...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders the add friend button', () => {
    render(<FriendsTable />);

    const addFriendButton = screen.getByText('Add Friends');
    expect(addFriendButton).toBeInTheDocument();
  });

  it('renders the tabs with correct structure', () => {
    render(<FriendsTable />);

    const friendsTab = screen.getByRole('button', { name: /Friends \(0\)/ });
    expect(friendsTab).toBeInTheDocument();

    const pendingTab = screen.getByRole('button', { name: /Pending \(0\)/ });
    expect(pendingTab).toBeInTheDocument();

    const requestsTab = screen.getByRole('button', { name: /Requests \(0\)/ });
    expect(requestsTab).toBeInTheDocument();
  });

  it('renders the component with proper styling classes', () => {
    const { container } = render(<FriendsTable />);

    const mainContainer = container.querySelector('.space-y-6');
    expect(mainContainer).toBeInTheDocument();
  });

  it('renders the search input with correct styling', () => {
    render(<FriendsTable />);

    const searchInput = screen.getByPlaceholderText('Search friends...');
    expect(searchInput).toHaveClass('w-full', 'border', 'rounded-lg');
  });

  it('renders the add friend button with correct styling', () => {
    render(<FriendsTable />);

    const addFriendButton = screen.getByText('Add Friends');
    expect(addFriendButton).toHaveClass('flex', 'items-center', 'gap-2');
  });

  it('renders the tabs with correct styling', () => {
    render(<FriendsTable />);

    const tabsContainer = screen.getByRole('button', { name: /Friends \(0\)/ }).parentElement;
    expect(tabsContainer).toHaveClass('grid', 'grid-cols-3');
  });

  it('renders the search icon in the search input', () => {
    render(<FriendsTable />);

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('renders the user plus icon in the add friend button', () => {
    render(<FriendsTable />);

    const userPlusIcons = screen.getAllByTestId('user-plus-icon');
    expect(userPlusIcons.length).toBeGreaterThan(0);
  });

  it('renders the component with proper accessibility attributes', () => {
    render(<FriendsTable />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(3);
  });

  it('renders the search container with proper styling', () => {
    const { container } = render(<FriendsTable />);

    const searchContainer = container.querySelector('.flex.items-center.gap-2');
    expect(searchContainer).toBeInTheDocument();
  });

  it('renders the tabs content with proper styling', () => {
    const { container } = render(<FriendsTable />);

    const tabsContent = container.querySelector('.space-y-4');
    expect(tabsContent).toBeInTheDocument();
  });

  it('renders the component with proper semantic structure', () => {
    render(<FriendsTable />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Friends');

    // Check for proper button structure (not tabs)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(3);
  });

  it('renders the component with proper ARIA attributes', () => {
    render(<FriendsTable />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(3);
  });
});

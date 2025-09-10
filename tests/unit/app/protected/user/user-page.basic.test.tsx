import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ClientProviders } from '@/app/components/providers';
import UserDashboardPage from '@/app/protected/dashboard/page';

// Mock CacheProgressTracker component
vi.mock('@/app/components/cache/CacheProgressTracker', () => {
  return {
    CacheProgressTracker: ({ isVisible, _onComplete }: any) => (
      <div data-testid="cache-progress-tracker">
        {isVisible ? 'Progress Tracker Visible' : 'Progress Tracker Hidden'}
      </div>
    ),
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Trash2: () => <span data-testid="trash2-icon">Trash2</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
  Monitor: () => <span data-testid="monitor-icon">Monitor</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  RefreshCw: () => <span data-testid="refresh-cw-icon">RefreshCw</span>,
  MapPin: () => <span data-testid="map-pin-icon">MapPin</span>,
  Loader2: () => <span data-testid="loader2-icon">Loader2</span>,
  AlertCircle: () => <span data-testid="alert-circle-icon">AlertCircle</span>,
  User: () => <span data-testid="user-icon">User</span>,
  Info: () => <span data-testid="info-icon">Info</span>,
  AtSign: () => <span data-testid="at-sign-icon">AtSign</span>,
  Mail: () => <span data-testid="mail-icon">Mail</span>,
  Phone: () => <span data-testid="phone-icon">Phone</span>,
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  Users: () => <span data-testid="users-icon">Users</span>,
  Shield: () => <span data-testid="shield-icon">Shield</span>,
  Check: () => <span data-testid="check-icon">Check</span>,
  Search: () => <span data-testid="search-icon">Search</span>,
  UserPlus: () => <span data-testid="user-plus-icon">UserPlus</span>,
  X: () => <span data-testid="x-icon">X</span>,
}));

const mockUseUser = vi.fn();
// Mock Clerk at the top level to avoid hoisting issues
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ClerkProviderWrapper
vi.mock('@/app/components/providers/ClerkProvider', () => ({
  ClerkProviderWrapper: ({ children }: any) => (
    <div data-testid="clerk-provider-wrapper">{children}</div>
  ),
}));

// Mock Tabs components
vi.mock('@/app/components/ui/Tabs', () => ({
  Tabs: ({ children, value, _onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button data-testid="tabs-trigger" data-value={value} onClick={onClick}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid="tabs-content" data-value={value}>
      {children}
    </div>
  ),
}));

// Mock mobile detection hook
vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => false,
}));

// Mock table components
vi.mock('@/app/components/game-logs/SimpleGameLogsTable', () => ({
  SimpleGameLogsTable: () => <div data-testid="simple-game-logs-table">Simple Game Logs Table</div>,
}));

vi.mock('@/app/protected/user/components/ActivityTable', () => ({
  ActivityTable: () => <div data-testid="activity-table">Activity Table</div>,
}));

vi.mock('@/app/protected/user/components/FriendsTable', () => ({
  FriendsTable: () => <div data-testid="friends-table">Friends Table</div>,
}));

// Mock components used by UserDashboardPage
vi.mock('@/app/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/app/components/game-logs/PaginatedGameLogsTable', () => ({
  PaginatedGameLogsTable: () => (
    <div data-testid="paginated-game-logs-table">Paginated Game Logs Table</div>
  ),
}));

vi.mock('@/app/protected/dashboard/components/ActivityTable', () => ({
  ActivityTable: () => <div data-testid="activity-table">Activity Table</div>,
}));

// Helper function to render the user page with providers
function renderUserPage() {
  return render(
    <ClientProviders>
      <UserDashboardPage />
    </ClientProviders>
  );
}

// Mock user states
const mockUser = {
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.jpg',
};

const userStates = {
  signedIn: { isLoaded: true, isSignedIn: true, user: mockUser },
  loading: { isLoaded: false, isSignedIn: false, user: null },
  signedOut: { isLoaded: true, isSignedIn: false, user: null },
  noImage: { isLoaded: true, isSignedIn: true, user: { ...mockUser, imageUrl: null } },
  missingUser: { isLoaded: true, isSignedIn: true, user: null },
};

// Helper function to assert dashboard sections are present
function expectDashboardSections() {
  // Look for the navigation tabs specifically
  const gameLogsTab = screen.getByRole('button', { name: 'Game Logs' });
  const friendsTab = screen.getByRole('button', { name: 'Friends' });
  const activityTab = screen.getByRole('button', { name: 'Activity & Timeline' });

  expect(gameLogsTab).toBeInTheDocument();
  expect(friendsTab).toBeInTheDocument();
  expect(activityTab).toBeInTheDocument();
}

describe('UserDashboardPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
    // Default mock implementation
    mockUseUser.mockReturnValue(userStates.signedIn);
  });

  it('shows loading state when user data is not loaded', async () => {
    mockUseUser.mockReturnValue(userStates.loading);

    renderUserPage();

    // When not loaded, the greeting section should not render
    expect(screen.queryByText(/Welcome, testuser/)).not.toBeInTheDocument();
  });

  it('shows guest welcome when user is not signed in', async () => {
    mockUseUser.mockReturnValue(userStates.signedOut);

    renderUserPage();

    expect(screen.getByText(/Welcome, Guest/)).toBeInTheDocument();
  });

  it('renders dashboard page when user is signed in', async () => {
    renderUserPage();

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByText(/Welcome, testuser/)).toBeInTheDocument();
    });

    expectDashboardSections();
  });

  it('renders dashboard without image when imageUrl is not available', async () => {
    mockUseUser.mockReturnValue(userStates.noImage);

    renderUserPage();

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByText(/Welcome, testuser/)).toBeInTheDocument();
    });
  });

  it('handles missing user data gracefully', async () => {
    mockUseUser.mockReturnValue(userStates.missingUser);

    renderUserPage();

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByText(/Welcome, User/)).toBeInTheDocument();
    });
  });

  it('renders all dashboard sections', async () => {
    renderUserPage();

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByText(/Welcome, testuser/)).toBeInTheDocument();
    });

    expectDashboardSections();
  });
});

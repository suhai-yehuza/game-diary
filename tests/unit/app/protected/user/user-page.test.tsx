import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientProviders } from '@src/app/components/providers';

var mockUseUser = vi.fn();
// Mock Clerk at the top level to avoid hoisting issues
vi.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import UserPage from '@src/app/protected/user/page';

// Helper function to render the user page with providers
function renderUserPage() {
  return render(
    <ClientProviders>
      <UserPage />
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
  expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Game Logs')).toBeInTheDocument();
  expect(screen.getByText('Friends')).toBeInTheDocument();
  expect(screen.getByText('Activity & Timeline')).toBeInTheDocument();
}

describe('UserDashboardPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
    // Default mock implementation
    mockUseUser.mockReturnValue(userStates.signedIn);
  });

  it('shows loading state when user data is not loaded', () => {
    mockUseUser.mockReturnValue(userStates.loading);

    renderUserPage();

    // When not loaded, the greeting section should not render
    expect(screen.queryByText('Welcome, testuser!')).not.toBeInTheDocument();
  });

  it('shows guest welcome when user is not signed in', () => {
    mockUseUser.mockReturnValue(userStates.signedOut);

    renderUserPage();

    expect(screen.getByText('Welcome, Guest!')).toBeInTheDocument();
  });

  it('renders dashboard page when user is signed in', () => {
    renderUserPage();

    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    expectDashboardSections();
  });

  it('renders dashboard without image when imageUrl is not available', () => {
    mockUseUser.mockReturnValue(userStates.noImage);

    renderUserPage();

    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('handles missing user data gracefully', () => {
    mockUseUser.mockReturnValue(userStates.missingUser);

    renderUserPage();

    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('renders all dashboard sections', () => {
    renderUserPage();

    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    expectDashboardSections();
  });
});

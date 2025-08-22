import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ClientProviders } from '@src/app/components/providers';
import LiveGamesPage from '@src/app/sports/live/page';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  ClerkProvider: ({ children }: any) => <div data-testid="clerk-provider">{children}</div>,
}));

// Mock the useLiveGames hook
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: () => ({
    games: [
      {
        id: 1,
        status: { long: '3rd Quarter', clock: '5:30' },
        teams: {
          visitors: { name: 'Boston Celtics', nickname: 'Celtics', logo: '/celtics.png' },
          home: { name: 'New York Knicks', nickname: 'Knicks', logo: '/knicks.png' },
        },
        scores: { visitors: { points: 95 }, home: { points: 85 } },
        arena: { name: 'Madison Square Garden', city: 'New York', state: 'NY' },
        periods: { current: 3, total: 4 },
        nugget: 'High scoring game',
      },
    ],
    loading: false,
    error: null,
  }),
}));

describe('LiveGamesPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
  });

  it('renders the live games page with correct structure', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();

    // Check for games count
    expect(screen.getByText('1 game currently live')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for main container
    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');

    // Check for heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-2');
  });

  it('has proper semantic structure', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });

  it('renders consistently', () => {
    const { rerender } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Re-render and check consistency
    rerender(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
  });

  it('displays live game information', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for live game elements
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('3rd Quarter')).toBeInTheDocument();
    expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
    expect(screen.getByText('New York Knicks')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('displays game details correctly', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for arena information
    expect(screen.getByText('Arena:')).toBeInTheDocument();
    expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();

    // Check for period information
    expect(screen.getByText('Period:')).toBeInTheDocument();
    expect(screen.getByText('3 of 4')).toBeInTheDocument();
    expect(screen.getByText('Time: 5:30')).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Multiple re-renders
    for (let i = 0; i < 3; i++) {
      rerender(
        <ClientProviders>
          <LiveGamesPage />
        </ClientProviders>
      );
    }

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
  });

  it('has proper content structure', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
    expect(screen.getByText('1 game currently live')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MenuProvider } from '@src/app/components/providers';
import LiveSportsPage from '@src/app/sports/live/page';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  }),
  ClerkProvider: ({ children }: any) => <div data-testid="clerk-provider">{children}</div>,
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

// Mock the useLiveGames hook
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: () => ({
    games: [],
    loading: false,
    error: null,
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MenuProvider>
    <div data-testid="test-wrapper">{children}</div>
  </MenuProvider>
);

describe('LiveSportsPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders LiveGamesDetail component', () => {
    render(<LiveSportsPage />, { wrapper: TestWrapper });

    // Check for LiveGamesDetail component by looking for its content
    expect(screen.getByText('No Live Games')).toBeInTheDocument();
    expect(screen.getByText('There are currently no live NBA games.')).toBeInTheDocument();
  });

  it('renders no live games message when no games available', () => {
    render(<LiveSportsPage />, { wrapper: TestWrapper });

    expect(screen.getByText('No Live Games')).toBeInTheDocument();
    expect(screen.getByText('There are currently no live NBA games.')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MenuProvider } from '@src/app/components/providers';
import AllSportsPage from '@src/app/sports/all-sports/page';

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

describe('AllSportsPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the all sports page with correct structure', () => {
    render(<AllSportsPage />, { wrapper: TestWrapper });

    expect(screen.getByText('All Sports')).toBeInTheDocument();
  });

  it('renders all sports page title', () => {
    render(<AllSportsPage />, { wrapper: TestWrapper });

    expect(screen.getByText('All Sports')).toBeInTheDocument();
  });

  it('renders sports description', () => {
    render(<AllSportsPage />, { wrapper: TestWrapper });

    expect(
      screen.getByText('Explore all sports leagues - NBA, NFL, MLB, NHL, MLS and more')
    ).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<AllSportsPage />, { wrapper: TestWrapper });

    expect(
      screen.getByText('Welcome to All Sports - Explore your favorite leagues')
    ).toBeInTheDocument();
  });

  it('renders sport buttons', () => {
    render(<AllSportsPage />, { wrapper: TestWrapper });

    expect(screen.getByText('NBA')).toBeInTheDocument();
    expect(screen.getByText('NFL')).toBeInTheDocument();
    expect(screen.getByText('MLB')).toBeInTheDocument();
    expect(screen.getByText('NHL')).toBeInTheDocument();
    expect(screen.getByText('MLS')).toBeInTheDocument();
  });
});

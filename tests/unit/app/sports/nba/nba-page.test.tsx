import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientProviders } from '@src/app/components/providers';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock LiveGamesDetail component
vi.mock('@src/app/components/live-games-detail', () => ({
  LiveGamesDetail: () => <div data-testid="live-games-detail">Live Games Detail</div>,
}));

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

import NBAPage from '@src/app/sports/nba/page';

describe('NBAPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
  });

  it('renders the NBA page with correct structure', () => {
    render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();

    // Check for description
    expect(screen.getByText(/National Basketball Association/)).toBeInTheDocument();
    expect(screen.getByText(/Live scores, stats, and more/)).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText('Live Games')).toBeInTheDocument();

    // Check for user welcome
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    const liveGamesLink = screen.getByText('Live Games').closest('a');
    expect(liveGamesLink).toHaveAttribute('href', '/sports/live');
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    // Check for main section
    const section = container.querySelector('section');
    expect(section).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');

    // Check for heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-2');

    // Check for description
    const description = screen.getByText(/National Basketball Association/);
    expect(description).toHaveClass('text-gray-600', 'dark:text-gray-400', 'mb-4');
  });

  it('applies correct styling to navigation links', () => {
    render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    const liveGamesLink = screen.getByText('Live Games').closest('a');
    expect(liveGamesLink).toHaveClass(
      'inline-flex',
      'items-center',
      'px-4',
      'py-2',
      'bg-red-600',
      'text-white',
      'rounded-md',
      'hover:bg-red-700',
      'transition-colors'
    );
  });

  it('renders the live games indicator with animation', () => {
    render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    const liveIndicator = screen
      .getByText('Live Games')
      .querySelector('.w-2.h-2.bg-white.rounded-full.animate-pulse');
    expect(liveIndicator).toBeInTheDocument();
  });

  it('renders the user welcome section with correct styling', () => {
    const { container } = render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    const welcomeSection = container.querySelector(
      '.mb-6.p-4.bg-blue-50.dark\\:bg-blue-900\\/20.rounded-lg'
    );
    expect(welcomeSection).toBeInTheDocument();

    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for section element
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();

    // Check for navigation links
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
  });

  it('renders consistently', () => {
    const { rerender } = render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    // Re-render and check consistency
    rerender(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();
    expect(screen.getByText('Live Games')).toBeInTheDocument();
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that links are accessible
    const liveGamesLink = screen.getByText('Live Games').closest('a');
    expect(liveGamesLink).toHaveAttribute('href');
  });

  it('handles multiple renders without issues', () => {
    const { rerender } = render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    // Multiple re-renders
    for (let i = 0; i < 3; i++) {
      rerender(
        <ClientProviders>
          <NBAPage />
        </ClientProviders>
      );
    }

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();
  });
});

describe('UserWelcome', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
  });

  it('renders welcome message', () => {
    render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('is contained within the welcome section', () => {
    const { container } = render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    const welcomeSection = container.querySelector(
      '.mb-6.p-4.bg-blue-50.dark\\:bg-blue-900\\/20.rounded-lg'
    );
    const welcomeText = screen.getByText('Welcome, testuser!');

    expect(welcomeSection).toContainElement(welcomeText);
  });

  it('renders as a paragraph element', () => {
    render(
      <ClientProviders>
        <NBAPage />
      </ClientProviders>
    );

    const welcomeText = screen.getByText('Welcome, testuser!');
    expect(welcomeText.tagName).toBe('P');
  });
});

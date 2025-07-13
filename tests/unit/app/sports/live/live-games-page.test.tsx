import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientProviders } from '@src/app/components/providers';

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

import LiveGamesPage from '@src/app/sports/live/page';

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
    expect(screen.getByText('Live Games page')).toBeInTheDocument();

    // Check for welcome message
    expect(
      screen.getByText('Welcome to Live Games - Real-time sports updates')
    ).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for main section
    const section = container.querySelector('section');
    expect(section).toHaveClass(
      'min-h-[calc(100vh-4rem)]',
      'flex',
      'flex-col',
      'items-center',
      'justify-center'
    );

    // Check for heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-4');
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

    // Check for section element
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();
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
    expect(screen.getByText('Live Games page')).toBeInTheDocument();
    expect(
      screen.getByText('Welcome to Live Games - Real-time sports updates')
    ).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
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
    expect(screen.getByText('Live Games page')).toBeInTheDocument();
  });

  it('uses flexbox for centering content', () => {
    const { container } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('has proper content structure', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live Games page')).toBeInTheDocument();
    expect(
      screen.getByText('Welcome to Live Games - Real-time sports updates')
    ).toBeInTheDocument();
  });

  it('centers content both horizontally and vertically', () => {
    const { container } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('items-center', 'justify-center');
  });

  it('has responsive height calculation', () => {
    const { container } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-[calc(100vh-4rem)]');
  });
});

describe('UserGreeting', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
  });

  it('renders welcome message', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    expect(
      screen.getByText('Welcome to Live Games - Real-time sports updates')
    ).toBeInTheDocument();
  });

  it('is contained within the centered container', () => {
    const { container } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    const section = container.querySelector('section');
    const welcomeText = screen.getByText('Welcome to Live Games - Real-time sports updates');

    expect(section).toContainElement(welcomeText);
  });

  it('renders as a paragraph element', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    const welcomeText = screen.getByText('Welcome to Live Games - Real-time sports updates');
    expect(welcomeText.tagName).toBe('P');
  });
});

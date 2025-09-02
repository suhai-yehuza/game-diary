import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ClientProviders } from '@src/app/components/providers';
import AllSportsPage from '@src/app/sports/all-sports/page';

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
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
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

describe('AllSportsPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
  });

  it('renders the all sports page with correct structure', () => {
    render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();

    // Check for welcome message
    expect(
      screen.getByText('Welcome to All Sports - Explore your favorite leagues')
    ).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    // Check for main section
    const section = container.querySelector('section');
    expect(section).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');

    // Check for heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-2', 'all-sports-title');
  });

  it('has proper semantic structure', () => {
    render(
      <ClientProviders>
        <AllSportsPage />
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
        <AllSportsPage />
      </ClientProviders>
    );

    // Re-render and check consistency
    rerender(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
    expect(
      screen.getByText('Welcome to All Sports - Explore your favorite leagues')
    ).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender } = render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    // Multiple re-renders
    for (let i = 0; i < 3; i++) {
      rerender(
        <ClientProviders>
          <AllSportsPage />
        </ClientProviders>
      );
    }

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
  });

  it('uses container layout', () => {
    const { container } = render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });

  it('has proper content structure', () => {
    render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
    expect(
      screen.getByText('Explore all sports leagues - NBA, NFL, MLB, NHL, MLS and more')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Welcome to All Sports - Explore your favorite leagues')
    ).toBeInTheDocument();
  });

  it('centers content with proper spacing', () => {
    const { container } = render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('mx-auto', 'px-4', 'py-8');
  });

  it('has responsive container layout', () => {
    const { container } = render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('container');
  });
});

describe('UserGreeting', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
  });

  it('renders welcome message', () => {
    render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    expect(
      screen.getByText('Welcome to All Sports - Explore your favorite leagues')
    ).toBeInTheDocument();
  });

  it('is contained within the welcome section', () => {
    const { container } = render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    const welcomeSection = container.querySelector('.mb-6.p-4.bg-blue-900\\/20.rounded-lg');
    const welcomeText = screen.getByText('Welcome to All Sports - Explore your favorite leagues');

    expect(welcomeSection).toContainElement(welcomeText);
  });

  it('renders as a paragraph element', () => {
    render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    const welcomeText = screen.getByText('Welcome to All Sports - Explore your favorite leagues');
    expect(welcomeText.tagName).toBe('P');
  });
});

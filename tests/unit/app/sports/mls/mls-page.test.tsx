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

import MLSSportsPage from '@src/app/sports/mls/page';

describe('MLSSportsPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
  });

  it('renders the MLS sports page with correct structure', () => {
    render(
      <ClientProviders>
        <MLSSportsPage />
      </ClientProviders>
    );

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLS page')).toBeInTheDocument();

    // Check for user welcome
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <ClientProviders>
        <MLSSportsPage />
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
        <MLSSportsPage />
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
        <MLSSportsPage />
      </ClientProviders>
    );

    // Re-render and check consistency
    rerender(
      <ClientProviders>
        <MLSSportsPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLS page')).toBeInTheDocument();
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ClientProviders>
        <MLSSportsPage />
      </ClientProviders>
    );

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender } = render(
      <ClientProviders>
        <MLSSportsPage />
      </ClientProviders>
    );

    // Multiple re-renders
    for (let i = 0; i < 3; i++) {
      rerender(
        <ClientProviders>
          <MLSSportsPage />
        </ClientProviders>
      );
    }

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLS page')).toBeInTheDocument();
  });

  it('takes full viewport height', () => {
    const { container } = render(
      <ClientProviders>
        <MLSSportsPage />
      </ClientProviders>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-[calc(100vh-4rem)]');
  });

  it('has proper content structure', () => {
    render(
      <ClientProviders>
        <MLSSportsPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLS page')).toBeInTheDocument();
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('uses flexbox for centering content', () => {
    const { container } = render(
      <ClientProviders>
        <MLSSportsPage />
      </ClientProviders>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('renders MLS specific content', () => {
    render(
      <ClientProviders>
        <MLSSportsPage />
      </ClientProviders>
    );

    expect(screen.getByText('MLS page')).toBeInTheDocument();
  });

  it('has proper text hierarchy', () => {
    render(
      <ClientProviders>
        <MLSSportsPage />
      </ClientProviders>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-4');
  });
});

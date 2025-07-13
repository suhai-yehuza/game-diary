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

import AllSportsPage from '@src/app/sports/all-sports/page';

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

    // Check for description
    expect(
      screen.getByText('Explore all sports leagues - NBA, NFL, MLB, NHL, MLS and more')
    ).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText('Live Games')).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();
    expect(screen.getByText('NFL')).toBeInTheDocument();
    expect(screen.getByText('MLB')).toBeInTheDocument();
    expect(screen.getByText('NHL')).toBeInTheDocument();
    expect(screen.getByText('MLS')).toBeInTheDocument();

    // Check for user welcome
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
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
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-2');

    // Check for description
    const description = screen.getByText(
      'Explore all sports leagues - NBA, NFL, MLB, NHL, MLS and more'
    );
    expect(description).toHaveClass('text-gray-600', 'dark:text-gray-400', 'mb-4');
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

    // Check for navigation links
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(6);
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
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
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

    // Check that links are accessible
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
    });
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

  it('has proper content structure', () => {
    render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText('Explore all sports leagues - NBA, NFL, MLB, NHL, MLS and more')
    ).toBeInTheDocument();
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('renders all sports navigation links', () => {
    render(
      <ClientProviders>
        <AllSportsPage />
      </ClientProviders>
    );

    expect(screen.getByText('Live Games')).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();
    expect(screen.getByText('NFL')).toBeInTheDocument();
    expect(screen.getByText('MLB')).toBeInTheDocument();
    expect(screen.getByText('NHL')).toBeInTheDocument();
    expect(screen.getByText('MLS')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MenuProvider } from '@src/app/components/providers';
import SearchPage from '@src/app/search/page';

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

describe('SearchPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the search page with correct structure', () => {
    render(<SearchPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Global Search')).toBeInTheDocument();
    expect(screen.getByText('Start searching')).toBeInTheDocument();
  });

  it('renders search page title', () => {
    render(<SearchPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Global Search')).toBeInTheDocument();
  });

  it('renders search empty state when no query', () => {
    render(<SearchPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Start searching')).toBeInTheDocument();
    expect(
      screen.getByText('Enter a search term above to find users and game logs.')
    ).toBeInTheDocument();
  });

  it('applies correct CSS classes to container', () => {
    const { container } = render(<SearchPage />, { wrapper: TestWrapper });

    const div = container.querySelector('.container');
    expect(div).toHaveClass('container', 'mx-auto', 'px-4', 'py-8', 'max-w-4xl');
  });

  it('renders search header with correct structure', () => {
    render(<SearchPage />, { wrapper: TestWrapper });

    const header = screen.getByRole('heading', { level: 1 });
    expect(header).toHaveTextContent('Global Search');
  });
});

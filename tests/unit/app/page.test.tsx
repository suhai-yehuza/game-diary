import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MenuProvider } from '@src/app/components/providers';
import HomePage from '@src/app/page';

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

describe('HomePage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the home page with correct structure', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    expect(screen.getByText('Game Diary')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Track your gaming watching experiences, and connect with fellow sports fans'
      )
    ).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Explore Sports')).toBeInTheDocument();
    expect(screen.getByText('Live Games')).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
  });

  it('renders footer links', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    expect(screen.getByText('Live Games')).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
  });

  it('applies correct CSS classes to main container', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    const section = container.querySelector('section');
    expect(section).toHaveClass(
      'grid',
      'grid-rows-[20px_1fr_20px]',
      'items-center',
      'justify-items-center',
      'min-h-screen'
    );
  });

  it('applies correct CSS classes to hero section', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    const hero = container.querySelector('section');
    expect(hero).toHaveClass(
      'grid',
      'grid-rows-[20px_1fr_20px]',
      'items-center',
      'justify-items-center',
      'min-h-screen'
    );
  });

  it('applies correct CSS classes to hero content', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const heroContent = screen.getByText('Game Diary').closest('div');
    expect(heroContent).toHaveClass('flex', 'flex-col', 'items-center', 'gap-6');
  });

  it('applies correct CSS classes to call-to-action button', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const ctaButton = screen.getByText('Explore Sports').closest('a');
    expect(ctaButton).toHaveClass(
      'px-6',
      'py-3',
      'bg-green-600',
      'text-white',
      'rounded-lg',
      'hover:bg-green-700',
      'transition-colors'
    );
  });

  it('applies correct CSS classes to footer', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass(
      'row-start-3',
      'flex',
      'gap-[24px]',
      'flex-wrap',
      'items-center',
      'justify-center'
    );
  });

  it('applies correct CSS classes to footer links', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const footerLinks = screen
      .getAllByRole('link')
      .filter(
        link => link.textContent?.includes('Live Games') ?? link.textContent?.includes('All Sports')
      );

    footerLinks.forEach(link => {
      expect(link).toHaveClass(
        'flex',
        'items-center',
        'gap-2',
        'hover:underline',
        'hover:underline-offset-4'
      );
    });
  });

  it('renders with proper accessibility attributes', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Game Diary');
  });
});

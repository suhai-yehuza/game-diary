import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SignUpLayout from '@src/app/sign-up/layout';

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

describe('SignUpLayout', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders children correctly', () => {
    render(
      <SignUpLayout>
        <div data-testid="test-child">Test Child</div>
      </SignUpLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('applies correct CSS classes to main container', () => {
    const { container } = render(
      <SignUpLayout>
        <div>Test Child</div>
      </SignUpLayout>
    );

    const main = container.querySelector('main');
    expect(main).toHaveClass('grow');
  });

  it('renders with proper structure', () => {
    const { container } = render(
      <SignUpLayout>
        <div>Test Child</div>
      </SignUpLayout>
    );

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SignInPage from '@src/app/sign-in/[[...sign-in]]/page';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  }),
  ClerkProvider: ({ children }: any) => <div data-testid="clerk-provider">{children}</div>,
  SignIn: ({ children }: any) => <div data-testid="clerk-signin">{children}</div>,
}));

// Mock ClerkProviderWrapper
vi.mock('@/app/components/providers/ClerkProvider', () => ({
  ClerkProviderWrapper: ({ children }: any) => (
    <div data-testid="clerk-provider-wrapper">{children}</div>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
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

describe('SignInPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the sign-in page with correct structure', () => {
    render(<SignInPage params={{ 'sign-in': [] }} />);

    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument();
  });

  it('renders Clerk SignIn component', () => {
    render(<SignInPage params={{ 'sign-in': [] }} />);

    const signInComponent = screen.getByTestId('clerk-signin');
    expect(signInComponent).toBeInTheDocument();
  });

  it('applies correct CSS classes to container', () => {
    const { container } = render(<SignInPage params={{ 'sign-in': [] }} />);

    const div = container.querySelector('.flex.min-h-screen');
    expect(div).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center');
  });

  it('renders sign in title', () => {
    render(<SignInPage params={{ 'sign-in': [] }} />);

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<SignInPage params={{ 'sign-in': [] }} />);

    expect(screen.getByText('Welcome back! Please sign in to continue.')).toBeInTheDocument();
  });
});

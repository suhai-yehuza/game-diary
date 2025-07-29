import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SignUpPage from '@src/app/sign-up/[[...sign-up]]/page';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  }),
  ClerkProvider: ({ children }: any) => <div data-testid="clerk-provider">{children}</div>,
  SignUp: ({ children }: any) => <div data-testid="clerk-signup">{children}</div>,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock the SSO utils
vi.mock('@/lib/utils/sso-utils', () => ({
  isClerkCatchallRouteServer: vi.fn().mockReturnValue(false),
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

describe('SignUpPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the sign-up page with correct structure', () => {
    render(<SignUpPage params={{ 'sign-up': [] }} />);

    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
  });

  it('renders Clerk SignUp component', () => {
    render(<SignUpPage params={{ 'sign-up': [] }} />);

    const signUpComponent = screen.getByTestId('clerk-signup');
    expect(signUpComponent).toBeInTheDocument();
  });

  it('applies correct CSS classes to container', () => {
    const { container } = render(<SignUpPage params={{ 'sign-up': [] }} />);

    const div = container.querySelector('.flex.min-h-screen');
    expect(div).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center');
  });

  it('renders sign up title', () => {
    render(<SignUpPage params={{ 'sign-up': [] }} />);

    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<SignUpPage params={{ 'sign-up': [] }} />);

    expect(
      screen.getByText('Join us and start tracking your favorite sports!')
    ).toBeInTheDocument();
  });
});

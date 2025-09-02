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
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock the SSO utils
vi.mock('@/lib/utils/sso-utils', () => ({
  isClerkCatchallRouteServer: vi.fn(),
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
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('renders with empty params', () => {
    render(<SignUpPage params={{ 'sign-up': [] }} />);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
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

  it('renders welcome message', () => {
    render(<SignUpPage params={{ 'sign-up': [] }} />);

    expect(
      screen.getByText('Join Game Diary to start tracking your sports experiences.')
    ).toBeInTheDocument();
  });

  it('handles undefined sign-up segments', () => {
    render(<SignUpPage params={{ 'sign-up': [] }} />);

    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
  });

  it('does not redirect when first segment is not a catchall route', () => {
    render(<SignUpPage params={{ 'sign-up': ['some-other-route'] }} />);

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
  });

  it('handles multiple segments correctly', () => {
    render(<SignUpPage params={{ 'sign-up': ['segment1', 'segment2'] }} />);

    // Should not redirect since segment1 is not a catchall route
    expect(mockPush).not.toHaveBeenCalled();
  });
});

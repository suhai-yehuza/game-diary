import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SignInPage, {
  generateMetadata,
  generateStaticParams,
} from '@src/app/sign-in/[[...sign-in]]/page';

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
    render(<SignInPage />);

    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
  });

  it('renders Clerk SignIn component', () => {
    render(<SignInPage />);

    const signInComponent = screen.getByTestId('clerk-signin');
    expect(signInComponent).toBeInTheDocument();
  });

  it('applies correct CSS classes to container', () => {
    const { container } = render(<SignInPage />);

    const div = container.querySelector('.flex.min-h-screen');
    expect(div).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center');
  });

  it('renders sign in title', () => {
    render(<SignInPage />);

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<SignInPage />);

    expect(screen.getByText('Welcome back! Please sign in to continue.')).toBeInTheDocument();
  });
});

describe('generateMetadata', () => {
  it('should return correct metadata for sign-in page', () => {
    const metadata = generateMetadata();

    expect(metadata).toEqual({
      title: 'Sign In - Game Diary',
      description: 'Sign in to your Game Diary account',
    });
  });

  it('should return metadata with correct title', () => {
    const metadata = generateMetadata();

    expect(metadata.title).toBe('Sign In - Game Diary');
  });

  it('should return metadata with correct description', () => {
    const metadata = generateMetadata();

    expect(metadata.description).toBe('Sign in to your Game Diary account');
  });
});

describe('generateStaticParams', () => {
  it('should return empty array', () => {
    const params = generateStaticParams();

    expect(params).toEqual([]);
  });
});

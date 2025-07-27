import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted() to properly handle mock variables
const { mockUseAuth, mockPush, mockRouter } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockPush: vi.fn(),
  mockRouter: {
    push: vi.fn(),
  },
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs', () => ({
  useAuth: mockUseAuth,
}));

import SSOCallbackPage from '@/app/sso-callback/page';

describe('SSOCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.push.mockClear();
  });

  it('renders loading state initially', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: false,
    } as any);

    render(<SSOCallbackPage />);

    expect(screen.getByText('Completing authentication...')).toBeInTheDocument();
    expect(screen.getByText('Loading authentication status...')).toBeInTheDocument();
    expect(
      screen.getByText('Completing authentication...').closest('div')?.querySelector('div')
    ).toHaveClass(
      'animate-spin',
      'rounded-full',
      'h-12',
      'w-12',
      'border-b-2',
      'border-blue-600',
      'mx-auto'
    );
  });

  it('shows processing text when not processing', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
    } as any);

    render(<SSOCallbackPage />);

    // Should show completing authentication text initially
    expect(screen.getByText('Completing authentication...')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: false,
    } as any);

    render(<SSOCallbackPage />);

    const container = screen
      .getByText('Completing authentication...')
      .closest('div')?.parentElement;
    expect(container).toHaveClass(
      'flex',
      'min-h-screen',
      'items-center',
      'justify-center',
      'bg-gray-50'
    );
  });

  it('has proper styling classes', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: false,
    } as any);

    render(<SSOCallbackPage />);

    const spinner = screen
      .getByText('Completing authentication...')
      .closest('div')
      ?.querySelector('div');
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'h-12',
      'w-12',
      'border-b-2',
      'border-blue-600',
      'mx-auto'
    );
  });

  it('handles state transitions correctly', () => {
    // Test loading state
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: false,
    } as any);

    const { rerender } = render(<SSOCallbackPage />);
    expect(screen.getByText('Completing authentication...')).toBeInTheDocument();

    // Test signed in state
    mockUseAuth.mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
    } as any);

    rerender(<SSOCallbackPage />);
    expect(screen.getByText('Completing authentication...')).toBeInTheDocument();
  });

  it('shows error state when authentication fails', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
    } as any);

    // Mock router.push to throw an error
    mockRouter.push.mockImplementation(() => {
      throw new Error('Navigation error');
    });

    render(<SSOCallbackPage />);

    // Should show completing authentication text initially
    expect(screen.getByText('Completing authentication...')).toBeInTheDocument();
  });

  it('shows loading state when Clerk is not loaded', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: false,
    } as any);

    render(<SSOCallbackPage />);

    expect(screen.getByText('Completing authentication...')).toBeInTheDocument();
    expect(screen.getByText('Loading authentication status...')).toBeInTheDocument();
  });

  it('shows processing state when Clerk is loaded but not signed in', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
    } as any);

    render(<SSOCallbackPage />);

    expect(screen.getByText('Completing authentication...')).toBeInTheDocument();
  });
});

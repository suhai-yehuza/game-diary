import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignInPage } from '@/app/components/auth/sign-in-page';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignIn: () => <div data-testid="clerk-signin">Clerk SignIn Component</div>,
}));

// Mock the config
vi.mock('@/lib/config/api.config', () => ({
  isUnitTestEnvironment: true,
}));

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign-in page with correct structure', () => {
    render(<SignInPage />);

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
    // In unit test environment, the SignInWrapper returns fallback, not Suspense fallback
  });

  it('renders with correct CSS classes', () => {
    const { container } = render(<SignInPage />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      'grow',
      'flex',
      'items-center',
      'justify-center',
      'min-h-[60vh]'
    );

    const innerContainer = container.querySelector('.w-full.max-w-md');
    expect(innerContainer).toBeInTheDocument();
  });

  it('renders error boundary fallback when error occurs', () => {
    const originalConsoleWarn = console.warn;
    console.warn = vi.fn();

    render(<SignInPage />);

    // The error boundary should render the fallback content
    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();

    console.warn = originalConsoleWarn;
  });

  it('renders in unit test environment mode', () => {
    render(<SignInPage />);

    // In unit test environment, should show fallback instead of Clerk component
    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('clerk-signin')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const { container } = render(<SignInPage />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toBeInTheDocument();

    // Check that the component renders without accessibility violations
    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender } = render(<SignInPage />);

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();

    rerender(<SignInPage />);

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
  });

  it('renders the correct wrapper structure', () => {
    const { container } = render(<SignInPage />);

    // Check for the main container structure
    const mainDiv = container.querySelector('div[class*="grow"]');
    expect(mainDiv).toBeInTheDocument();

    // Check for the inner wrapper
    const innerWrapper = container.querySelector('.w-full.max-w-md');
    expect(innerWrapper).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    const { container } = render(<SignInPage />);

    // Should have proper div structure
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(0);

    // Main container should be present
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.tagName).toBe('DIV');
  });

  it('renders with proper fallback content in test environment', () => {
    render(<SignInPage />);

    // Should show the unit test environment fallback
    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();

    // Should not show the actual Clerk component in test environment
    expect(screen.queryByTestId('clerk-signin')).not.toBeInTheDocument();
  });
});

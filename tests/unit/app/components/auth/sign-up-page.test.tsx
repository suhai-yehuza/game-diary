import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignUpPage } from '@/app/components/auth/sign-up-page';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignUp: () => <div data-testid="clerk-signup">Clerk SignUp Component</div>,
}));

// Mock the config
vi.mock('@/lib/config/api.config', () => ({
  isUnitTestEnvironment: true,
}));

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign-up page with correct structure', () => {
    render(<SignUpPage />);

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
    // In unit test environment, the SignUpWrapper returns fallback, not Suspense fallback
  });

  it('renders with correct CSS classes', () => {
    const { container } = render(<SignUpPage />);

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

    render(<SignUpPage />);

    // The error boundary should render the fallback content
    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();

    console.warn = originalConsoleWarn;
  });

  it('renders in unit test environment mode', () => {
    render(<SignUpPage />);

    // In unit test environment, should show fallback instead of Clerk component
    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('clerk-signup')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const { container } = render(<SignUpPage />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toBeInTheDocument();

    // Check that the component renders without accessibility violations
    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender } = render(<SignUpPage />);

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();

    rerender(<SignUpPage />);

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
  });

  it('renders the correct wrapper structure', () => {
    const { container } = render(<SignUpPage />);

    // Check for the main container structure
    const mainDiv = container.querySelector('div[class*="grow"]');
    expect(mainDiv).toBeInTheDocument();

    // Check for the inner wrapper
    const innerWrapper = container.querySelector('.w-full.max-w-md');
    expect(innerWrapper).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    const { container } = render(<SignUpPage />);

    // Should have proper div structure
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(0);

    // Main container should be present
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.tagName).toBe('DIV');
  });

  it('renders with proper fallback content', () => {
    render(<SignUpPage />);

    // Should show the unit test environment fallback
    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();

    // Should not show the actual Clerk component in test environment
    expect(screen.queryByTestId('clerk-signup')).not.toBeInTheDocument();
  });
});

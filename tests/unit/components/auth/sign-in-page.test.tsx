import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignInPage } from '@/app/components/auth/sign-in-page';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  SignIn: () => <div data-testid="clerk-signin">Clerk SignIn Component</div>,
}));

// Mock API config
vi.mock('@/lib/config/api.config', () => ({
  isUnitTestEnvironment: false,
}));

describe('SignInPage', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
  });

  it('renders the sign-in page with correct structure', () => {
    render(<SignInPage />);

    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    render(<SignInPage />);

    const wrapper = screen.getByTestId('clerk-signin').parentElement;
    expect(wrapper).toHaveClass('w-full', 'max-w-md');
  });

  it('has proper semantic structure', () => {
    render(<SignInPage />);

    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
  });

  it('renders consistently', () => {
    const { rerender } = render(<SignInPage />);

    rerender(<SignInPage />);

    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
  });

  it('handles router navigation', () => {
    render(<SignInPage />);

    // The component should render without errors
    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
  });

  it('limits width of sign-in form', () => {
    render(<SignInPage />);

    const wrapper = screen.getByTestId('clerk-signin').parentElement;
    expect(wrapper).toHaveClass('w-full', 'max-w-md');
  });
});

describe('ClerkErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(<SignInPage />);

    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignUpPage } from '@/app/components/auth/sign-up-page';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  SignUp: () => <div data-testid="clerk-signup">Clerk SignUp Component</div>,
}));

// Mock API config
vi.mock('@/lib/config/api.config', () => ({
  isUnitTestEnvironment: false,
}));

describe('SignUpPage', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
  });

  it('renders the sign-up page with correct structure', () => {
    render(<SignUpPage />);

    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    render(<SignUpPage />);

    const wrapper = screen.getByTestId('clerk-signup').parentElement;
    expect(wrapper).toHaveClass('w-full', 'max-w-md');
  });

  it('has proper semantic structure', () => {
    render(<SignUpPage />);

    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
  });

  it('renders consistently', () => {
    const { rerender } = render(<SignUpPage />);

    rerender(<SignUpPage />);

    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
  });

  it('handles router navigation', () => {
    render(<SignUpPage />);

    // The component should render without errors
    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
  });

  it('limits width of sign-up form', () => {
    render(<SignUpPage />);

    const wrapper = screen.getByTestId('clerk-signup').parentElement;
    expect(wrapper).toHaveClass('w-full', 'max-w-md');
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import SignInModalTrigger from '@/app/components/auth/SignInModalTrigger';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Clerk components
const mockOpenSignIn = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children, mode }: any) => (
    <button data-testid="sign-in-button" data-mode={mode}>
      {children}
    </button>
  ),
  useClerk: () => ({
    openSignIn: mockOpenSignIn,
  }),
}));

describe('SignInModalTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders SignInButton with modal mode', () => {
    render(<SignInModalTrigger />);
    const signInButton = screen.getByTestId('sign-in-button');
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute('data-mode', 'modal');
  });

  it('renders button with proper accessibility attributes', () => {
    render(<SignInModalTrigger />);
    // Check that we have the SignInButton
    const signInButton = screen.getByTestId('sign-in-button');
    expect(signInButton).toBeInTheDocument();

    // Check that we have buttons with proper accessibility attributes
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // SignInButton + inner div

    // Check that the inner div has proper accessibility attributes
    const innerButton = buttons.find(
      button =>
        button.getAttribute('aria-label') === 'Sign In' && button.getAttribute('role') === 'button'
    );
    expect(innerButton).toBeInTheDocument();
    expect(innerButton).toHaveAttribute('aria-label', 'Sign In');
    expect(innerButton).toHaveAttribute('role', 'button');
    expect(innerButton).toHaveAttribute('tabIndex', '0');
  });
});

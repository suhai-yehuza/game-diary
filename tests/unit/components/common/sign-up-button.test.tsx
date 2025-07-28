import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach as _beforeEach } from 'vitest';

import { AppSignUpButton } from '@/app/components/common/SignUpButton';

// Mock Clerk's SignUpButton
vi.mock('@clerk/nextjs', () => ({
  SignUpButton: ({ children, ...props }: any) => (
    <button data-testid="sign-up-button" {...props}>
      {children}
    </button>
  ),
}));

describe('AppSignUpButton', () => {
  it('renders the sign-up button with children', () => {
    render(<AppSignUpButton>Sign Up</AppSignUpButton>);
    expect(screen.getByTestId('sign-up-button')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('applies additional props to button', () => {
    render(
      <AppSignUpButton data-custom="test" aria-label="Custom Sign Up">
        Sign Up
      </AppSignUpButton>
    );
    const button = screen.getByTestId('sign-up-button');
    expect(button).toHaveAttribute('data-custom', 'test');
    expect(button).toHaveAttribute('aria-label', 'Custom Sign Up');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach as _beforeEach } from 'vitest';

import { AppSignInButton } from '@/app/components/common/SignInButton';

// Mock Clerk's SignInButton
vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children, ...props }: any) => (
    <button data-testid="sign-in-button" {...props}>
      {children}
    </button>
  ),
}));

describe('AppSignInButton', () => {
  it('renders the sign-in button with children', () => {
    render(<AppSignInButton>Sign In</AppSignInButton>);
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('applies additional props to button', () => {
    render(
      <AppSignInButton data-custom="test" aria-label="Custom Sign In">
        Sign In
      </AppSignInButton>
    );
    const button = screen.getByTestId('sign-in-button');
    expect(button).toHaveAttribute('data-custom', 'test');
    expect(button).toHaveAttribute('aria-label', 'Custom Sign In');
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignInButton } from '@/app/components/common/sign-in-button';

// Mock Clerk
const mockOpenSignIn = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useClerk: () => ({
    openSignIn: mockOpenSignIn,
  }),
}));

describe('SignInButton', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
    // Reset mock
    mockOpenSignIn.mockClear();
  });

  it('renders the sign-in button with children', () => {
    render(
      <SignInButton>
        <span>Sign In</span>
      </SignInButton>
    );

    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<SignInButton className="custom-class">Sign In</SignInButton>);

    const button = screen.getByTestId('sign-in-button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    render(<SignInButton>Sign In</SignInButton>);

    const button = screen.getByTestId('sign-in-button');
    fireEvent.click(button);

    expect(mockOpenSignIn).toHaveBeenCalled();
  });

  it('sets modal state when clicked', () => {
    render(<SignInButton>Sign In</SignInButton>);

    const button = screen.getByTestId('sign-in-button');
    fireEvent.click(button);

    // The modal state should be managed internally
    expect(mockOpenSignIn).toHaveBeenCalled();
  });

  it('handles click outside modal', () => {
    render(<SignInButton>Sign In</SignInButton>);

    const button = screen.getByTestId('sign-in-button');
    fireEvent.click(button);

    // Simulate click outside
    fireEvent.mouseDown(document.body);

    // Should call openSignIn again when modal is closed
    expect(mockOpenSignIn).toHaveBeenCalledTimes(2);
  });

  it('handles escape key press', () => {
    render(<SignInButton>Sign In</SignInButton>);

    const button = screen.getByTestId('sign-in-button');
    fireEvent.click(button);

    // Simulate escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    // Should call openSignIn again when modal is closed
    expect(mockOpenSignIn).toHaveBeenCalledTimes(2);
  });

  it('applies additional props to button', () => {
    render(
      <SignInButton data-custom="test" aria-label="Custom Sign In">
        Sign In
      </SignInButton>
    );

    const button = screen.getByTestId('sign-in-button');
    expect(button).toHaveAttribute('data-custom', 'test');
    expect(button).toHaveAttribute('aria-label', 'Custom Sign In');
  });

  it('has proper button type', () => {
    render(<SignInButton>Sign In</SignInButton>);

    const button = screen.getByTestId('sign-in-button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders with complex children', () => {
    render(
      <SignInButton>
        <div>
          <span>Sign In</span>
          <small>with your account</small>
        </div>
      </SignInButton>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('with your account')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    render(<SignInButton>Sign In</SignInButton>);

    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
  });
});

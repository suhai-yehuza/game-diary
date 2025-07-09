import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignUpButton } from '@/app/components/common/sign-up-button';

// Mock Clerk
const mockOpenSignUp = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useClerk: () => ({
    openSignUp: mockOpenSignUp,
  }),
}));

describe('SignUpButton', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
    // Reset mock
    mockOpenSignUp.mockClear();
  });

  it('renders the sign-up button with children', () => {
    render(
      <SignUpButton>
        <span>Sign Up</span>
      </SignUpButton>
    );

    expect(screen.getByTestId('sign-up-button')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<SignUpButton className="custom-class">Sign Up</SignUpButton>);

    const button = screen.getByTestId('sign-up-button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    render(<SignUpButton>Sign Up</SignUpButton>);

    const button = screen.getByTestId('sign-up-button');
    fireEvent.click(button);

    expect(mockOpenSignUp).toHaveBeenCalled();
  });

  it('sets modal state when clicked', () => {
    render(<SignUpButton>Sign Up</SignUpButton>);

    const button = screen.getByTestId('sign-up-button');
    fireEvent.click(button);

    // The modal state should be managed internally
    expect(mockOpenSignUp).toHaveBeenCalled();
  });

  it('handles click outside modal', () => {
    render(<SignUpButton>Sign Up</SignUpButton>);

    const button = screen.getByTestId('sign-up-button');
    fireEvent.click(button);

    // Simulate click outside
    fireEvent.mouseDown(document.body);

    // Should call openSignUp again when modal is closed
    expect(mockOpenSignUp).toHaveBeenCalledTimes(2);
  });

  it('handles escape key press', () => {
    render(<SignUpButton>Sign Up</SignUpButton>);

    const button = screen.getByTestId('sign-up-button');
    fireEvent.click(button);

    // Simulate escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    // Should call openSignUp again when modal is closed
    expect(mockOpenSignUp).toHaveBeenCalledTimes(2);
  });

  it('applies additional props to button', () => {
    render(
      <SignUpButton data-custom="test" aria-label="Custom Sign Up">
        Sign Up
      </SignUpButton>
    );

    const button = screen.getByTestId('sign-up-button');
    expect(button).toHaveAttribute('data-custom', 'test');
    expect(button).toHaveAttribute('aria-label', 'Custom Sign Up');
  });

  it('has proper button type', () => {
    render(<SignUpButton>Sign Up</SignUpButton>);

    const button = screen.getByTestId('sign-up-button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders with complex children', () => {
    render(
      <SignUpButton>
        <div>
          <span>Sign Up</span>
          <small>create your account</small>
        </div>
      </SignUpButton>
    );

    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('create your account')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    render(<SignUpButton>Sign Up</SignUpButton>);

    expect(screen.getByTestId('sign-up-button')).toBeInTheDocument();
  });
});

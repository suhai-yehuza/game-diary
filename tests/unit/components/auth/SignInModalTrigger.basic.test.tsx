import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SignInModalTrigger from '@/app/components/auth/SignInModalTrigger';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button">{children}</div>
  ),
  useClerk: () => ({
    openSignIn: vi.fn(),
  }),
}));

describe('SignInModalTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the sign-in button', () => {
    render(<SignInModalTrigger />);

    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<SignInModalTrigger />);

    const button = screen.getByRole('button', { name: 'Sign In' });
    expect(button).toHaveClass(
      'px-4',
      'py-2',
      'bg-blue-800',
      'text-white',
      'rounded-lg',
      'shadow-md',
      'hover:bg-blue-900',
      'transition-colors',
      'focus:outline-none',
      'focus-visible:ring-4',
      'focus-visible:ring-blue-400',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-black',
      'cursor-pointer'
    );
  });

  it('should handle keyboard navigation', () => {
    render(<SignInModalTrigger />);

    const button = screen.getByRole('button', { name: 'Sign In' });

    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });

    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
  });

  it('should be a function', () => {
    expect(typeof SignInModalTrigger).toBe('function');
  });

  it('should accept autoTrigger prop', () => {
    render(<SignInModalTrigger autoTrigger={true} />);
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
  });
});

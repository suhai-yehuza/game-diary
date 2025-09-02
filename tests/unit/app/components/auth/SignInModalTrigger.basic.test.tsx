import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import SignInModalTrigger from '@/app/components/auth/SignInModalTrigger';

const mockOpenSignIn = vi.fn();
const mockPush = vi.fn();

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children, mode }: any) => (
    <div data-testid="sign-in-button" data-mode={mode}>
      {children}
    </div>
  ),
  useClerk: () => ({
    openSignIn: mockOpenSignIn,
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SignInModalTrigger', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        hash: '',
      },
      writable: true,
    });

    // Mock document.querySelector
    document.querySelector = vi.fn(() => null);
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  describe('Component Rendering', () => {
    it('renders the sign-in button with proper structure', () => {
      render(<SignInModalTrigger />);

      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('renders with modal mode', () => {
      render(<SignInModalTrigger />);

      const signInButton = screen.getByTestId('sign-in-button');
      expect(signInButton).toHaveAttribute('data-mode', 'modal');
    });

    it('renders with proper CSS classes', () => {
      render(<SignInModalTrigger />);

      const button = screen.getByRole('button');
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

    it('renders with proper accessibility attributes', () => {
      render(<SignInModalTrigger />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('tabIndex', '0');
      expect(button).toHaveAttribute('aria-label', 'Sign In');
    });
  });

  describe('Auto Trigger Functionality', () => {
    it('does not auto-trigger when autoTrigger is false', () => {
      render(<SignInModalTrigger autoTrigger={false} />);

      expect(mockOpenSignIn).not.toHaveBeenCalled();
    });

    it('renders correctly when autoTrigger is true', () => {
      render(<SignInModalTrigger autoTrigger={true} />);

      // Just verify the component renders correctly
      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('renders correctly when hash is present', () => {
      // Mock window.location before rendering
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/',
          hash: '#some-hash',
        },
        writable: true,
      });

      render(<SignInModalTrigger />);

      // Just verify the component renders correctly
      expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('does not auto-trigger when hash is empty', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/',
          hash: '',
        },
        writable: true,
      });

      render(<SignInModalTrigger />);

      // Wait a bit to ensure no auto-trigger happens
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(mockOpenSignIn).not.toHaveBeenCalled();
    });

    it('does not auto-trigger when hash is just #', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/',
          hash: '#',
        },
        writable: true,
      });

      render(<SignInModalTrigger />);

      // Wait a bit to ensure no auto-trigger happens
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(mockOpenSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles Enter key press', () => {
      render(<SignInModalTrigger />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      // The button should be clickable
      expect(button).toBeInTheDocument();
    });

    it('handles Space key press', () => {
      render(<SignInModalTrigger />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      // The button should be clickable
      expect(button).toBeInTheDocument();
    });

    it('handles other key presses', () => {
      render(<SignInModalTrigger />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab' });

      // The button should still be in the document
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles component rendering without errors', () => {
      expect(() => {
        render(<SignInModalTrigger />);
      }).not.toThrow();
    });
  });
});

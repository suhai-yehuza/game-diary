import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ClerkSignIn from '@/app/components/auth/ClerkSignIn';

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignIn: vi.fn(({ children, ...props }) => (
    <div data-testid="clerk-sign-in-component" {...props}>
      {children || 'Sign In Component'}
    </div>
  )),
}));

describe('ClerkSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with proper structure', () => {
    render(<ClerkSignIn />);

    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument();
    expect(screen.getByTestId('clerk-sign-in-component')).toBeInTheDocument();
  });

  it('should render without props', () => {
    render(<ClerkSignIn />);

    const signInComponent = screen.getByTestId('clerk-sign-in');
    expect(signInComponent).toBeInTheDocument();
  });

  it('should apply proper styling classes', () => {
    render(<ClerkSignIn />);

    const container = screen.getByTestId('clerk-sign-in');
    expect(container).toHaveClass('w-full', 'max-w-md', 'space-y-8');
  });

  it('should have proper layout structure', () => {
    render(<ClerkSignIn />);

    const wrapper = screen.getByTestId('clerk-sign-in').parentElement;
    expect(wrapper).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock SignInModalTrigger
vi.mock('@/app/components/auth/SignInModalTrigger', () => ({
  default: ({ autoTrigger }: { autoTrigger: boolean }) => (
    <div data-testid="sign-in-modal-trigger" data-auto-trigger={autoTrigger}>
      Sign In Modal Trigger
    </div>
  ),
}));

import ClientAuthGuard from '@/app/protected/ClientAuthGuard';
import { useUser } from '@clerk/nextjs';

describe('ClientAuthGuard', () => {
  const mockUseUser = useUser as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when authentication is not loaded', () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
    });

    render(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    expect(screen.getByText('Loading authentication...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders sign-in required state when user is not signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });

    render(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.getByText('You must be signed in to view this page.')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-modal-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-modal-trigger')).toHaveAttribute(
      'data-auto-trigger',
      'true'
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });

    render(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Sign In Required')).not.toBeInTheDocument();
    expect(screen.queryByText('Loading authentication...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sign-in-modal-trigger')).not.toBeInTheDocument();
  });

  it('renders complex children when user is signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });

    const ComplexChild = () => (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard</p>
        <button>Click me</button>
      </div>
    );

    render(
      <ClientAuthGuard>
        <ComplexChild />
      </ClientAuthGuard>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles multiple children when user is signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });

    render(
      <ClientAuthGuard>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ClientAuthGuard>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('handles null children when user is signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });

    const { container } = render(<ClientAuthGuard>{null}</ClientAuthGuard>);
    expect(container.firstChild).toBeNull();
  });

  it('handles undefined children when user is signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });

    const { container } = render(<ClientAuthGuard>{undefined}</ClientAuthGuard>);
    expect(container.firstChild).toBeNull();
  });

  it('has proper accessibility attributes in loading state', () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
    });

    render(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    const spinner = screen.getByText('Loading authentication...').previousElementSibling;
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'h-8',
      'w-8',
      'border-b-2',
      'border-blue-600',
      'mx-auto'
    );
  });

  it('has proper styling classes in all states', () => {
    // Test loading state
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
    });

    const { rerender } = render(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    const loadingContainer = screen.getByText('Loading authentication...').closest('.min-h-screen');
    expect(loadingContainer).toHaveClass(
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center',
      'bg-background'
    );

    // Test not signed in state
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });

    rerender(
      <ClientAuthGuard>
        <div>Protected Content</div>
      </ClientAuthGuard>
    );

    const signInContainer = screen.getByText('Sign In Required').closest('.min-h-screen');
    expect(signInContainer).toHaveClass(
      'min-h-screen',
      'flex',
      'items-center',
      'justify-center',
      'bg-background'
    );
  });
});

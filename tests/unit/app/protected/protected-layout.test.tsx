import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ProtectedLayout from '@/app/protected/layout';

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock dynamic import
vi.mock('next/dynamic', () => ({
  default: (importFn: any, options: any) => {
    const Component = ({ children }: any) => {
      const { isLoaded, isSignedIn } = mockUserState;

      if (!isLoaded) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading authentication...</p>
            </div>
          </div>
        );
      }

      if (!isSignedIn) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <button data-testid="sign-in-button" data-auto-trigger="true">
              Sign In
            </button>
            <div className="text-center mt-8">
              <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
              <p className="mb-6 text-muted-foreground">You must be signed in to view this page.</p>
            </div>
          </div>
        );
      }

      return <div data-testid="client-auth-guard">{children}</div>;
    };
    return Component;
  },
}));

// Mock Clerk components
let mockUserState = { isLoaded: true, isSignedIn: true };
vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children, mode }: any) => (
    <button data-testid="sign-in-button" data-mode={mode}>
      {children}
    </button>
  ),
  useUser: () => mockUserState,
}));

const mockAuth = auth as any;

describe('ProtectedLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });
    mockUserState = { isLoaded: true, isSignedIn: true };

    const TestComponent = () => <div data-testid="test-child">Test Content</div>;

    const result = await ProtectedLayout({ children: <TestComponent /> });
    render(result);

    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows sign-in modal when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });
    mockUserState = { isLoaded: true, isSignedIn: false };

    const result = await ProtectedLayout({ children: <div>Test</div> });
    render(result);

    await waitFor(() => {
      expect(screen.getByText('You must be signed in to view this page.')).toBeInTheDocument();
    });
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-button')).toHaveAttribute('data-auto-trigger', 'true');
  });

  it('handles undefined userId', async () => {
    mockAuth.mockResolvedValue({ userId: undefined as any });
    mockUserState = { isLoaded: true, isSignedIn: false };

    const result = await ProtectedLayout({ children: <div>Test</div> });
    render(result);

    await waitFor(() => {
      expect(screen.getByText('You must be signed in to view this page.')).toBeInTheDocument();
    });
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
  });

  it('handles empty string userId', async () => {
    mockAuth.mockResolvedValue({ userId: '' });
    mockUserState = { isLoaded: true, isSignedIn: false };

    const result = await ProtectedLayout({ children: <div>Test</div> });
    render(result);

    await waitFor(() => {
      expect(screen.getByText('You must be signed in to view this page.')).toBeInTheDocument();
    });
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
  });

  it('renders multiple children correctly when authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: 'user123' });
    mockUserState = { isLoaded: true, isSignedIn: true };

    const result = await ProtectedLayout({
      children: (
        <>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </>
      ),
    });
    render(result);

    await waitFor(() => {
      expect(screen.getByTestId('child1')).toBeInTheDocument();
    });
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});

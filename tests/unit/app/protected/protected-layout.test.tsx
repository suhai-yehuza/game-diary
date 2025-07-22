import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { render, screen } from '@testing-library/react';
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

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows sign-in modal when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });
    mockUserState = { isLoaded: true, isSignedIn: false };

    const result = await ProtectedLayout({ children: <div>Test</div> });
    render(result);

    expect(screen.getByText('You must be signed in to view this page.')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-button')).toHaveAttribute('data-mode', 'modal');
  });

  it('handles undefined userId', async () => {
    mockAuth.mockResolvedValue({ userId: undefined as any });
    mockUserState = { isLoaded: true, isSignedIn: false };

    const result = await ProtectedLayout({ children: <div>Test</div> });
    render(result);

    expect(screen.getByText('You must be signed in to view this page.')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
  });

  it('handles empty string userId', async () => {
    mockAuth.mockResolvedValue({ userId: '' });
    mockUserState = { isLoaded: true, isSignedIn: false };

    const result = await ProtectedLayout({ children: <div>Test</div> });
    render(result);

    expect(screen.getByText('You must be signed in to view this page.')).toBeInTheDocument();
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

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});

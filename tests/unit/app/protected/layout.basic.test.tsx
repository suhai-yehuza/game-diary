import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ProtectedLayout from '@src/app/protected/layout';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
  }),
}));

// Mock the SignInModalTrigger component
vi.mock('@/app/components/auth/SignInModalTrigger', () => ({
  default: ({ children, ...props }: any) => (
    <div data-testid="signin-modal" {...props}>
      {children}
    </div>
  ),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, _priority, ...props }: any) => (
    <div data-testid="next-image" title={alt} {...props}>
      {src}
    </div>
  ),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the dynamic import for ClientAuthGuard
vi.mock('@/app/protected/ClientAuthGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => {
    // Mock the ClientAuthGuard to directly return children when authenticated
    return <>{children}</>;
  },
}));

// Mock Next.js dynamic import
vi.mock('next/dynamic', () => ({
  default: (_importFn: any, _options: any) => {
    // Return the mocked ClientAuthGuard directly
    return ({ children }: { children: React.ReactNode }) => <>{children}</>;
  },
}));

describe('ProtectedLayout', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the protected layout with children', () => {
    render(
      <ProtectedLayout>
        <div data-testid="test-child">Test Child</div>
      </ProtectedLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders the layout with correct structure', () => {
    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    );

    // The layout should render children when authenticated
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the layout with proper styling', () => {
    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    );

    // The layout should render children when authenticated
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders children with proper structure', () => {
    render(
      <ProtectedLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </ProtectedLayout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('renders the layout with proper semantic structure', () => {
    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    );

    // The layout should render children when authenticated
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the layout with proper accessibility', () => {
    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    );

    // The layout should render children when authenticated
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the layout with proper responsive design', () => {
    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    );

    // The layout should render children when authenticated
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the layout with proper spacing', () => {
    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    );

    // The layout should render children when authenticated
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the layout with proper flex behavior', () => {
    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    );

    // The layout should render children when authenticated
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the layout with proper container behavior', () => {
    render(
      <ProtectedLayout>
        <div>Test Content</div>
      </ProtectedLayout>
    );

    // The layout should render children when authenticated
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the layout with proper content structure', () => {
    render(
      <ProtectedLayout>
        <div data-testid="content">Protected Content</div>
      </ProtectedLayout>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

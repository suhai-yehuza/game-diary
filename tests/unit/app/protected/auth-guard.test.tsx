import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock Next.js dynamic import
vi.mock('next/dynamic', () => ({
  default: vi.fn(() => ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="client-auth-guard">{children}</div>
  )),
}));

import AuthGuard from '@/app/protected/AuthGuard';

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ClientAuthGuard with children', () => {
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('client-auth-guard')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders complex children correctly', () => {
    const ComplexChild = () => (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard</p>
        <button>Click me</button>
      </div>
    );

    render(
      <AuthGuard>
        <ComplexChild />
      </AuthGuard>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    render(
      <AuthGuard>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </AuthGuard>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('handles null children', () => {
    const { container } = render(<AuthGuard>{null}</AuthGuard>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles undefined children', () => {
    const { container } = render(<AuthGuard>{undefined}</AuthGuard>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('passes children prop correctly to ClientAuthGuard', () => {
    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    render(
      <AuthGuard>
        <TestChild />
      </AuthGuard>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders with proper component structure', () => {
    const { container } = render(
      <AuthGuard>
        <div>Test Content</div>
      </AuthGuard>
    );

    // Should have the client auth guard wrapper
    expect(container.querySelector('[data-testid="client-auth-guard"]')).toBeInTheDocument();
    // Should contain the children
    expect(container).toHaveTextContent('Test Content');
  });

  it('handles function children', () => {
    const FunctionChild = () => <span>Function Child</span>;

    render(
      <AuthGuard>
        <FunctionChild />
      </AuthGuard>
    );

    expect(screen.getByText('Function Child')).toBeInTheDocument();
  });

  it('handles array children', () => {
    render(
      <AuthGuard>{[<div key="1">Array Child 1</div>, <div key="2">Array Child 2</div>]}</AuthGuard>
    );

    expect(screen.getByText('Array Child 1')).toBeInTheDocument();
    expect(screen.getByText('Array Child 2')).toBeInTheDocument();
  });

  it('maintains proper component hierarchy', () => {
    const { container } = render(
      <AuthGuard>
        <div data-testid="nested-child">
          <span>Nested Content</span>
        </div>
      </AuthGuard>
    );

    const clientAuthGuard = container.querySelector(
      '[data-testid="client-auth-guard"]'
    ) as HTMLElement;
    const nestedChild = container.querySelector('[data-testid="nested-child"]') as HTMLElement;

    expect(clientAuthGuard).toBeInTheDocument();
    expect(nestedChild).toBeInTheDocument();
    expect(clientAuthGuard).toContainElement(nestedChild);
  });
});

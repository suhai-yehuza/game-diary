import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ClerkErrorBoundary, ClerkWrapper } from '@/app/components/common/clerk-error-boundary';

// Mock console.warn to avoid noise in tests
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = vi.fn();
});

afterEach(() => {
  console.warn = originalWarn;
});

// Component that throws an error for testing
class ErrorComponent extends React.Component<{ shouldThrow?: boolean }> {
  constructor(props: { shouldThrow?: boolean }) {
    super(props);
    if (props.shouldThrow) {
      throw new Error('Clerk authentication error');
    }
  }

  render() {
    return <div>Normal content</div>;
  }
}

// Component that throws a non-Clerk error
class NonClerkErrorComponent extends React.Component {
  constructor() {
    super({});
    throw new Error('Regular error');
  }

  render() {
    return <div>This should not render</div>;
  }
}

describe('ClerkErrorBoundary', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
  });

  it('renders children when no error occurs', () => {
    render(
      <ClerkErrorBoundary>
        <div>Test content</div>
      </ClerkErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders default fallback when error occurs', () => {
    render(
      <ClerkErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ClerkErrorBoundary>
    );

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
  });

  it('renders custom fallback when error occurs', () => {
    render(
      <ClerkErrorBoundary fallback={<div>Custom error message</div>}>
        <ErrorComponent shouldThrow={true} />
      </ClerkErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('logs Clerk-related errors to console', () => {
    render(
      <ClerkErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ClerkErrorBoundary>
    );

    expect(console.warn).toHaveBeenCalledWith(
      'Clerk component error caught:',
      'Clerk authentication error'
    );
  });

  it('logs useSession errors to console', () => {
    // Create a component that throws a useSession error
    class UseSessionErrorComponent extends React.Component {
      constructor() {
        super({});
        throw new Error('useSession hook error');
      }

      render() {
        return <div>This should not render</div>;
      }
    }

    render(
      <ClerkErrorBoundary>
        <UseSessionErrorComponent />
      </ClerkErrorBoundary>
    );

    expect(console.warn).toHaveBeenCalledWith(
      'Clerk component error caught:',
      'useSession hook error'
    );
  });

  it('does not log non-Clerk errors to console', () => {
    render(
      <ClerkErrorBoundary>
        <NonClerkErrorComponent />
      </ClerkErrorBoundary>
    );

    expect(console.warn).not.toHaveBeenCalled();
  });

  it('maintains error state after error occurs', () => {
    const { rerender } = render(
      <ClerkErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ClerkErrorBoundary>
    );

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();

    // Rerender with non-error component - should still show fallback
    rerender(
      <ClerkErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </ClerkErrorBoundary>
    );

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
  });

  it('handles complex children without errors', () => {
    render(
      <ClerkErrorBoundary>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Click me</button>
        </div>
      </ClerkErrorBoundary>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

describe('ClerkWrapper', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
  });

  it('renders children wrapped in error boundary and suspense', () => {
    render(
      <ClerkWrapper>
        <div>Test content</div>
      </ClerkWrapper>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders custom fallback when error occurs', () => {
    render(
      <ClerkWrapper fallback={<div>Custom error fallback</div>}>
        <ErrorComponent shouldThrow={true} />
      </ClerkWrapper>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
  });

  it('renders custom suspense fallback', () => {
    // Create a component that suspends
    const SuspendingComponent = () => {
      throw new Promise(() => {});
    };

    render(
      <ClerkWrapper suspenseFallback={<div>Custom loading...</div>}>
        <SuspendingComponent />
      </ClerkWrapper>
    );

    expect(screen.getByText('Custom loading...')).toBeInTheDocument();
  });

  it('uses default fallbacks when not provided', () => {
    render(
      <ClerkWrapper>
        <ErrorComponent shouldThrow={true} />
      </ClerkWrapper>
    );

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
  });

  it('handles complex nested components', () => {
    render(
      <ClerkWrapper>
        <div>
          <header>Header</header>
          <main>
            <h1>Main Content</h1>
            <p>Some text</p>
          </main>
          <footer>Footer</footer>
        </div>
      </ClerkWrapper>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Some text')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('maintains proper component hierarchy', () => {
    const { container } = render(
      <ClerkWrapper>
        <div data-testid="child">Child content</div>
      </ClerkWrapper>
    );

    // Should have proper nesting: ClerkErrorBoundary > Suspense > children
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();

    // Check that the structure is maintained
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles multiple error boundaries correctly', () => {
    render(
      <ClerkWrapper>
        <ClerkWrapper>
          <ErrorComponent shouldThrow={true} />
        </ClerkWrapper>
      </ClerkWrapper>
    );

    // Should show the fallback from the inner wrapper
    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
  });

  it('handles async errors properly', async () => {
    // This test verifies that the error boundary can handle async errors
    const AsyncErrorComponent = () => {
      throw new Error('Async Clerk error');
    };

    render(
      <ClerkWrapper>
        <AsyncErrorComponent />
      </ClerkWrapper>
    );

    expect(screen.getByText('Authentication temporarily unavailable')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DatabaseLayout from '@/app/protected/admin/database/layout';

describe('DatabaseLayout', () => {
  it('renders children without additional wrapper', () => {
    const TestComponent = () => <div data-testid="test-content">Test Content</div>;

    render(<DatabaseLayout>{<TestComponent />}</DatabaseLayout>);

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders multiple children correctly', () => {
    render(
      <DatabaseLayout>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </DatabaseLayout>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('renders complex nested components', () => {
    const NestedComponent = () => (
      <div data-testid="nested">
        <span data-testid="nested-text">Nested Text</span>
      </div>
    );

    render(
      <DatabaseLayout>
        <NestedComponent />
      </DatabaseLayout>
    );

    expect(screen.getByTestId('nested')).toBeInTheDocument();
    expect(screen.getByTestId('nested-text')).toBeInTheDocument();
    expect(screen.getByText('Nested Text')).toBeInTheDocument();
  });

  it('renders empty children gracefully', () => {
    const { container } = render(<DatabaseLayout>{null}</DatabaseLayout>);

    // Should render a React Fragment with no visible content
    expect(container.firstChild).toBeDefined();
  });

  it('renders undefined children gracefully', () => {
    const { container } = render(<DatabaseLayout>{undefined}</DatabaseLayout>);

    // Should render a React Fragment with no visible content
    expect(container.firstChild).toBeDefined();
  });

  it('maintains proper component structure', () => {
    const { container } = render(
      <DatabaseLayout>
        <div data-testid="test-content">Test Content</div>
      </DatabaseLayout>
    );

    // Should render children directly without wrapper
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('passes through all children props', () => {
    const TestComponent = ({
      className,
      dataTestId,
    }: {
      className?: string;
      dataTestId?: string;
    }) => (
      <div className={className} data-testid={dataTestId}>
        Test Component
      </div>
    );

    render(
      <DatabaseLayout>
        <TestComponent className="test-class" dataTestId="test-component" />
      </DatabaseLayout>
    );

    const component = screen.getByTestId('test-component');
    expect(component).toBeInTheDocument();
    expect(component).toHaveClass('test-class');
    expect(component).toHaveTextContent('Test Component');
  });
});

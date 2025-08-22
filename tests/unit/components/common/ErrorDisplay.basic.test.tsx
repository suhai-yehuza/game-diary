import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import {
  ErrorDisplay,
  PageErrorDisplay,
  CardErrorDisplay,
  InlineErrorDisplay,
} from '@/app/components/common/ErrorDisplay';

describe('ErrorDisplay', () => {
  const mockError = new Error('Test error message');
  const mockOnRetry = vi.fn();

  it('renders error message', () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders string error', () => {
    render(<ErrorDisplay error="String error message" />);

    expect(screen.getByText('String error message')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<ErrorDisplay error={mockError} title="Custom Error Title" />);

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('does not render retry button when showRetry is false', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} showRetry={false} />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<ErrorDisplay error={mockError} />);

    // Find the outer container that has the variant classes
    const container = screen.getByText('An error occurred').closest('div')?.parentElement;
    expect(container).toHaveClass(
      'bg-semantic-error/10',
      'border-semantic-error/20',
      'text-semantic-error',
      'dark:bg-semantic-error/20',
      'dark:border-semantic-error/30',
      'dark:text-semantic-error'
    );
  });

  it('applies danger variant classes', () => {
    render(<ErrorDisplay error={mockError} variant="danger" />);

    // Find the outer container that has the variant classes
    const container = screen.getByText('An error occurred').closest('div')?.parentElement;
    expect(container).toHaveClass(
      'bg-semantic-error/10',
      'border-semantic-error/20',
      'text-semantic-error',
      'dark:bg-semantic-error/20',
      'dark:border-semantic-error/30',
      'dark:text-semantic-error'
    );
  });

  it('applies warning variant classes', () => {
    render(<ErrorDisplay error={mockError} variant="warning" />);

    // Find the outer container that has the variant classes
    const container = screen.getByText('An error occurred').closest('div')?.parentElement;
    expect(container).toHaveClass(
      'bg-semantic-warning/10',
      'border-semantic-warning/20',
      'text-semantic-warning',
      'dark:bg-semantic-warning/20',
      'dark:border-semantic-warning/30',
      'dark:text-semantic-warning'
    );
  });

  it('applies custom className', () => {
    render(<ErrorDisplay error={mockError} className="custom-class" />);

    // Find the outer container that has the custom class
    const container = screen.getByText('An error occurred').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('renders with correct layout classes', () => {
    render(<ErrorDisplay error={mockError} />);

    // Find the outer container that has the layout classes
    const container = screen.getByText('An error occurred').closest('div')?.parentElement;
    expect(container).toHaveClass('p-4', 'border', 'rounded-md');
  });

  it('renders with centered content', () => {
    render(<ErrorDisplay error={mockError} />);

    // The inner div should have the flex classes
    const content = screen.getByText('An error occurred').closest('div');
    expect(content).toHaveClass('flex', 'flex-col', 'items-center', 'text-center');
  });
});

describe('PageErrorDisplay', () => {
  const mockError = new Error('Test error message');

  it('renders with correct wrapper classes', () => {
    render(<PageErrorDisplay error={mockError} />);

    // The wrapper div should be the parent of the ErrorDisplay container
    const wrapper = screen.getByText('Something went wrong').closest('div')
      ?.parentElement?.parentElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-[400px]');
  });
});

describe('CardErrorDisplay', () => {
  const mockError = new Error('Test error message');

  it('renders with correct wrapper classes', () => {
    render(<CardErrorDisplay error={mockError} />);

    // The wrapper div should be the parent of the ErrorDisplay container
    const wrapper = screen.getByText('Error loading content').closest('div')
      ?.parentElement?.parentElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'p-8');
  });
});

describe('InlineErrorDisplay', () => {
  const mockError = new Error('Test error message');

  it('renders with correct wrapper classes', () => {
    render(<InlineErrorDisplay error={mockError} />);

    // The wrapper div should be the parent of the ErrorDisplay container
    const wrapper = screen.getByText('An error occurred').closest('div')
      ?.parentElement?.parentElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'p-4');
  });
});

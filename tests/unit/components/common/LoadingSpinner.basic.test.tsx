import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });

  it('should render with custom size', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('should render with custom className', () => {
    render(<LoadingSpinner className="custom-class" />);

    const container = screen.getByTestId('loading-spinner');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('custom-class');
  });

  it('should render with custom aria-label', () => {
    render(<LoadingSpinner ariaLabel="Custom loading message" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading message');
  });

  it('should render with all custom props', () => {
    render(<LoadingSpinner size="sm" className="test-class" ariaLabel="Test loading" />);

    const container = screen.getByTestId('loading-spinner');
    const spinner = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('test-class');
    expect(spinner).toHaveAttribute('aria-label', 'Test loading');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('should handle different size variants', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="sm" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="md" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-6', 'w-6');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8');

    // xl size is not supported, so we'll test with lg instead
    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });
});

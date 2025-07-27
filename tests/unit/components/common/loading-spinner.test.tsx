import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import {
  LoadingSpinner,
  PageLoadingSpinner,
  CardLoadingSpinner,
  InlineLoadingSpinner,
} from '@/app/components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Custom loading text" />);

    expect(screen.getByText('Custom loading text')).toBeInTheDocument();
  });

  it('applies small size classes', () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('applies medium size classes', () => {
    render(<LoadingSpinner size="md" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('applies large size classes', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('applies extra large size classes', () => {
    render(<LoadingSpinner size="xl" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('applies default variant classes', () => {
    render(<LoadingSpinner variant="default" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-gray-300', 'dark:border-gray-600');
  });

  it('applies primary variant classes', () => {
    render(<LoadingSpinner variant="primary" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-blue-600', 'dark:border-blue-400');
  });

  it('applies secondary variant classes', () => {
    render(<LoadingSpinner variant="secondary" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-gray-400', 'dark:border-gray-500');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);

    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('renders with correct container classes', () => {
    render(<LoadingSpinner />);

    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('renders with correct spinner classes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2', 'border-t-transparent');
  });
});

describe('PageLoadingSpinner', () => {
  it('renders with correct wrapper classes', () => {
    render(<PageLoadingSpinner />);

    const wrapper = screen.getByRole('status').parentElement?.parentElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-[400px]');
  });

  it('renders with default text', () => {
    render(<PageLoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<PageLoadingSpinner text="Custom page loading" />);

    expect(screen.getByText('Custom page loading')).toBeInTheDocument();
  });

  it('uses xl size and primary variant', () => {
    render(<PageLoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12', 'w-12', 'border-blue-600', 'dark:border-blue-400');
  });
});

describe('CardLoadingSpinner', () => {
  it('renders with correct wrapper classes', () => {
    render(<CardLoadingSpinner />);

    const wrapper = screen.getByRole('status').parentElement?.parentElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'p-8');
  });

  it('renders with default text', () => {
    render(<CardLoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<CardLoadingSpinner text="Custom card loading" />);

    expect(screen.getByText('Custom card loading')).toBeInTheDocument();
  });

  it('uses lg size and primary variant', () => {
    render(<CardLoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8', 'border-blue-600', 'dark:border-blue-400');
  });
});

describe('InlineLoadingSpinner', () => {
  it('renders with correct wrapper classes', () => {
    render(<InlineLoadingSpinner />);

    const wrapper = screen.getByRole('status').parentElement?.parentElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'p-4');
  });

  it('renders without text by default', () => {
    render(<InlineLoadingSpinner />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<InlineLoadingSpinner text="Inline loading" />);

    expect(screen.getByText('Inline loading')).toBeInTheDocument();
  });

  it('uses sm size and default variant', () => {
    render(<InlineLoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4', 'w-4', 'border-gray-300', 'dark:border-gray-600');
  });
});

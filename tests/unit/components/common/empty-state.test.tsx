import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import {
  EmptyState,
  PageEmptyState,
  CardEmptyState,
  NoDataEmptyState,
  NoResultsEmptyState,
} from '@/app/components/common/EmptyState';

describe('EmptyState', () => {
  it('renders with title', () => {
    render(<EmptyState title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(<EmptyState title="Test Title" description="Test Description" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const customIcon = <div data-testid="custom-icon">🚀</div>;
    render(<EmptyState title="Test Title" icon={customIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders with action', () => {
    const action = <button>Click me</button>;
    render(<EmptyState title="Test Title" action={action} />);

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<EmptyState title="Test Title" description="Test Description" />);

    const description = screen.getByText('Test Description');
    expect(description).toHaveClass('text-gray-600', 'dark:text-gray-400');
  });

  it('applies info variant classes', () => {
    render(<EmptyState title="Test Title" description="Test Description" variant="info" />);

    const description = screen.getByText('Test Description');
    expect(description).toHaveClass('text-blue-600', 'dark:text-blue-400');
  });

  it('applies warning variant classes', () => {
    render(<EmptyState title="Test Title" description="Test Description" variant="warning" />);

    const description = screen.getByText('Test Description');
    expect(description).toHaveClass('text-yellow-600', 'dark:text-yellow-400');
  });

  it('applies custom className', () => {
    render(<EmptyState title="Test Title" className="custom-class" />);

    const container = screen.getByText('Test Title').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('renders without description when not provided', () => {
    render(<EmptyState title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('renders without icon when not provided', () => {
    render(<EmptyState title="Test Title" />);

    const container = screen.getByText('Test Title').closest('div');
    expect(container).not.toHaveAttribute('data-testid', 'custom-icon');
  });

  it('renders without action when not provided', () => {
    render(<EmptyState title="Test Title" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('PageEmptyState', () => {
  it('renders with correct wrapper classes', () => {
    render(<PageEmptyState title="Test Title" />);

    const wrapper = screen.getByText('Test Title').closest('div')?.parentElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-[400px]');
  });

  it('passes props to EmptyState', () => {
    render(<PageEmptyState title="Test Title" description="Test Description" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});

describe('CardEmptyState', () => {
  it('renders with correct wrapper classes', () => {
    render(<CardEmptyState title="Test Title" />);

    const wrapper = screen.getByText('Test Title').closest('div')?.parentElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'p-8');
  });

  it('passes props to EmptyState', () => {
    render(<CardEmptyState title="Test Title" description="Test Description" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});

describe('NoDataEmptyState', () => {
  it('renders with default props', () => {
    render(<NoDataEmptyState />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(<NoDataEmptyState title="Custom Title" description="Custom Description" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
  });

  it('renders with action', () => {
    const action = <button>Refresh</button>;
    render(<NoDataEmptyState action={action} />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('renders with document icon', () => {
    render(<NoDataEmptyState />);

    const icon = screen.getByText('No data available').closest('div')?.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-12', 'h-12', 'text-gray-400');
  });
});

describe('NoResultsEmptyState', () => {
  it('renders with default props', () => {
    render(<NoResultsEmptyState />);

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria or filters.')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(<NoResultsEmptyState title="Custom Title" description="Custom Description" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
  });

  it('renders with action', () => {
    const action = <button>Clear Filters</button>;
    render(<NoResultsEmptyState action={action} />);

    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
  });

  it('renders with search icon', () => {
    render(<NoResultsEmptyState />);

    const icon = screen.getByText('No results found').closest('div')?.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-12', 'h-12', 'text-gray-400');
  });
});

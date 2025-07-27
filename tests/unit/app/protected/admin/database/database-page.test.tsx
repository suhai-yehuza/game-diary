import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminDatabasePage from '@/app/protected/admin/database/page';

// Mock the components
vi.mock('@src/app/protected/admin/database/components/database-content', () => ({
  AdminDatabaseContent: () => <div data-testid="admin-database-content">Database Content</div>,
}));

vi.mock('@src/app/protected/admin/database/components/ui/error-boundary', () => ({
  ErrorBoundary: ({
    children,
    componentName,
  }: {
    children: React.ReactNode;
    componentName: string;
  }) => (
    <div data-testid="error-boundary" data-component-name={componentName}>
      {children}
    </div>
  ),
}));

describe('AdminDatabasePage', () => {
  it('renders the admin database page with correct structure', () => {
    render(<AdminDatabasePage />);

    // Check that the error boundary is rendered with correct component name
    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();
    expect(errorBoundary).toHaveAttribute('data-component-name', 'AdminDatabasePage');

    // Check that the database content is rendered
    expect(screen.getByTestId('admin-database-content')).toBeInTheDocument();
    expect(screen.getByText('Database Content')).toBeInTheDocument();
  });

  it('wraps content in error boundary with correct component name', () => {
    render(<AdminDatabasePage />);

    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toHaveAttribute('data-component-name', 'AdminDatabasePage');
  });

  it('renders with proper background styling', () => {
    const { container } = render(<AdminDatabasePage />);

    // Find the div with background styling inside the error boundary
    const backgroundDiv = container.querySelector('.bg-background');
    expect(backgroundDiv).toBeInTheDocument();
    expect(backgroundDiv).toHaveClass('bg-background', 'min-h-screen');
  });

  it('maintains proper component hierarchy', () => {
    const { container } = render(<AdminDatabasePage />);

    // Check the DOM structure
    const errorBoundary = container.querySelector('[data-testid="error-boundary"]');
    expect(errorBoundary).toBeInTheDocument();

    const backgroundDiv = errorBoundary?.querySelector('.bg-background');
    expect(backgroundDiv).toBeInTheDocument();

    const content = backgroundDiv?.querySelector('[data-testid="admin-database-content"]');
    expect(content).toBeInTheDocument();
  });

  it('renders error boundary with correct props', () => {
    render(<AdminDatabasePage />);

    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toHaveAttribute('data-component-name', 'AdminDatabasePage');
  });

  it('renders database content component', () => {
    render(<AdminDatabasePage />);

    expect(screen.getByTestId('admin-database-content')).toBeInTheDocument();
    expect(screen.getByText('Database Content')).toBeInTheDocument();
  });
});

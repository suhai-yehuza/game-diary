import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import AdminDatabasePage from '@src/app/protected/admin/database/page';

// Mock the database content component
vi.mock('@src/app/protected/admin/database/components/database-content', () => ({
  AdminDatabaseContent: () => <div data-testid="admin-database-content">Database Content</div>,
}));

// Mock the error boundary
vi.mock('@src/app/protected/admin/database/components/ui/error-boundary', () => ({
  ErrorBoundary: ({
    children,
    componentName,
  }: {
    children: React.ReactNode;
    componentName: string;
  }) => <div data-testid={`error-boundary-${componentName}`}>{children}</div>,
}));

describe('AdminDatabasePage', () => {
  it('renders the page wrapper', () => {
    render(<AdminDatabasePage />);

    expect(screen.getByTestId('error-boundary-AdminDatabasePage')).toBeInTheDocument();
  });

  it('renders the database content component', () => {
    render(<AdminDatabasePage />);

    expect(screen.getByTestId('admin-database-content')).toBeInTheDocument();
  });

  it('applies correct CSS classes to the wrapper', () => {
    const { container } = render(<AdminDatabasePage />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('bg-background', 'min-h-screen');
  });

  it('wraps content in error boundary with correct component name', () => {
    render(<AdminDatabasePage />);

    const errorBoundary = screen.getByTestId('error-boundary-AdminDatabasePage');
    expect(errorBoundary).toBeInTheDocument();
  });

  it('renders database content inside error boundary', () => {
    render(<AdminDatabasePage />);

    const errorBoundary = screen.getByTestId('error-boundary-AdminDatabasePage');
    const databaseContent = screen.getByTestId('admin-database-content');

    expect(errorBoundary).toContainElement(databaseContent);
  });

  it('maintains proper component hierarchy', () => {
    const { container } = render(<AdminDatabasePage />);

    const structure = container.firstChild;
    expect(structure).toHaveClass('bg-background', 'min-h-screen');

    const errorBoundary = screen.getByTestId('error-boundary-AdminDatabasePage');
    expect(errorBoundary).toBeInTheDocument();

    const databaseContent = screen.getByTestId('admin-database-content');
    expect(databaseContent).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => render(<AdminDatabasePage />)).not.toThrow();
  });

  it('provides proper background styling', () => {
    const { container } = render(<AdminDatabasePage />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('bg-background');
    expect(wrapper).toHaveClass('min-h-screen');
  });

  it('ensures full height layout', () => {
    const { container } = render(<AdminDatabasePage />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('min-h-screen');
  });
});

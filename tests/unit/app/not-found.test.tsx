import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NotFoundPage from '@/app/not-found';

describe('NotFoundPage', () => {
  it('renders the 404 page with correct structure', () => {
    render(<NotFoundPage />);

    // Check main heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');

    // Check description
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    render(<NotFoundPage />);

    const container = screen.getByText('Page not found.').parentElement?.parentElement;
    expect(container).toHaveClass(
      'min-h-screen',
      'bg-background',
      'flex',
      'items-center',
      'justify-center'
    );

    const content = screen.getByText('Page not found.').parentElement;
    expect(content).toHaveClass('text-center');
  });

  it('has proper semantic structure', () => {
    render(<NotFoundPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    // Check for descriptive text
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });

  it('applies correct styling to heading', () => {
    render(<NotFoundPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-4xl', 'font-bold');
  });

  it('applies correct styling to description', () => {
    render(<NotFoundPage />);

    const description = screen.getByText('Page not found.');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('centers content both horizontally and vertically', () => {
    render(<NotFoundPage />);

    const container = screen.getByText('Page not found.').parentElement?.parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('takes full viewport height', () => {
    render(<NotFoundPage />);

    const container = screen.getByText('Page not found.').parentElement?.parentElement;
    expect(container).toHaveClass('min-h-screen');
  });

  it('has proper accessibility attributes', () => {
    render(<NotFoundPage />);

    // Check for proper heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page is accessible
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });

  it('renders consistently', () => {
    const { rerender } = render(<NotFoundPage />);

    // Re-render and check consistency
    rerender(<NotFoundPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import DashboardPage from '@src/app/dashboard/page';

// Mock Next.js metadata
vi.mock('next', () => ({
  Metadata: vi.fn(),
}));

describe('DashboardPage', () => {
  it('renders the dashboard page with correct structure', () => {
    render(<DashboardPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Check for welcome message
    expect(screen.getByText('Welcome to your dashboard.')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<DashboardPage />);

    // Check for main container with background
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-background');

    // Check for inner container
    const innerContainer = mainContainer.firstChild as HTMLElement;
    expect(innerContainer).toHaveClass('container', 'mx-auto', 'p-6');
  });

  it('has proper semantic structure', () => {
    const { container } = render(<DashboardPage />);

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for paragraph
    const paragraph = screen.getByText('Welcome to your dashboard.');
    expect(paragraph.tagName).toBe('P');
  });

  it('applies correct styling to heading', () => {
    const { container } = render(<DashboardPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold');
  });

  it('applies correct styling to description', () => {
    const { container } = render(<DashboardPage />);

    const description = screen.getByText('Welcome to your dashboard.');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders consistently', () => {
    const { rerender } = render(<DashboardPage />);

    // Re-render and check consistency
    rerender(<DashboardPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Welcome to your dashboard.')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<DashboardPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<DashboardPage />);

    // Multiple re-renders
    rerender(<DashboardPage />);
    rerender(<DashboardPage />);
    rerender(<DashboardPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Welcome to your dashboard.')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Welcome to your dashboard.')).toBeInTheDocument();
  });
});

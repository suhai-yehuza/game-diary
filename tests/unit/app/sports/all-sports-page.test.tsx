import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import AllSportsPage from '@src/app/sports/all-sports/page';

describe('AllSportsPage', () => {
  it('renders the all sports page with correct structure', () => {
    render(<AllSportsPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();

    // Check for description
    expect(screen.getByText('Browse all available sports.')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<AllSportsPage />);

    // Check for main section with background
    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-screen', 'bg-background');

    // Check for inner container
    const innerContainer = section?.querySelector('.container');
    expect(innerContainer).toHaveClass('container', 'mx-auto', 'p-6');
  });

  it('has proper semantic structure', () => {
    render(<AllSportsPage />);

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for paragraph
    const paragraph = screen.getByText('Browse all available sports.');
    expect(paragraph.tagName).toBe('P');

    // Check for section element
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();
  });

  it('applies correct styling to heading', () => {
    render(<AllSportsPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold');
  });

  it('applies correct styling to description', () => {
    render(<AllSportsPage />);

    const description = screen.getByText('Browse all available sports.');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders consistently', () => {
    const { rerender } = render(<AllSportsPage />);

    // Re-render and check consistency
    rerender(<AllSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
    expect(screen.getByText('Browse all available sports.')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<AllSportsPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<AllSportsPage />);

    // Multiple re-renders
    rerender(<AllSportsPage />);
    rerender(<AllSportsPage />);
    rerender(<AllSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<AllSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
  });

  it('takes full viewport height', () => {
    const { container } = render(<AllSportsPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-screen');
  });

  it('has proper content structure', () => {
    const { container } = render(<AllSportsPage />);

    // Check that content is properly contained
    const section = container.querySelector('section');
    const containerDiv = section?.querySelector('.container');
    const heading = containerDiv?.querySelector('h1');
    const paragraph = containerDiv?.querySelector('p');

    expect(section).toBeInTheDocument();
    expect(containerDiv).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
  });
});

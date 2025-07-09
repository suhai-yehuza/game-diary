import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import MLSSportsPage from '@src/app/sports/mls/page';

describe('MLSSportsPage', () => {
  it('renders the MLS sports page with correct structure', () => {
    render(<MLSSportsPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLS')).toBeInTheDocument();

    // Check for description
    expect(screen.getByText('Major League Soccer games and statistics.')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<MLSSportsPage />);

    // Check for main section with background
    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-screen', 'bg-background');

    // Check for inner container
    const innerContainer = section?.querySelector('.container');
    expect(innerContainer).toHaveClass('container', 'mx-auto', 'p-6');
  });

  it('has proper semantic structure', () => {
    render(<MLSSportsPage />);

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for paragraph
    const paragraph = screen.getByText('Major League Soccer games and statistics.');
    expect(paragraph.tagName).toBe('P');

    // Check for section element
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();
  });

  it('applies correct styling to heading', () => {
    render(<MLSSportsPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold');
  });

  it('applies correct styling to description', () => {
    render(<MLSSportsPage />);

    const description = screen.getByText('Major League Soccer games and statistics.');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders consistently', () => {
    const { rerender } = render(<MLSSportsPage />);

    // Re-render and check consistency
    rerender(<MLSSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLS')).toBeInTheDocument();
    expect(screen.getByText('Major League Soccer games and statistics.')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<MLSSportsPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<MLSSportsPage />);

    // Multiple re-renders
    rerender(<MLSSportsPage />);
    rerender(<MLSSportsPage />);
    rerender(<MLSSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLS')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<MLSSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLS')).toBeInTheDocument();
  });

  it('takes full viewport height', () => {
    const { container } = render(<MLSSportsPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-screen');
  });

  it('has proper content structure', () => {
    const { container } = render(<MLSSportsPage />);

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

  it('has proper background styling', () => {
    const { container } = render(<MLSSportsPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-background');
  });

  it('has proper container styling', () => {
    const { container } = render(<MLSSportsPage />);

    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toHaveClass('mx-auto', 'p-6');
  });

  it('renders MLS specific content', () => {
    render(<MLSSportsPage />);

    // Check for MLS specific text
    expect(screen.getByText('MLS')).toBeInTheDocument();
    expect(screen.getByText('Major League Soccer games and statistics.')).toBeInTheDocument();
  });

  it('has proper text hierarchy', () => {
    render(<MLSSportsPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    const description = screen.getByText('Major League Soccer games and statistics.');

    // Check that heading comes before description
    expect(
      heading.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});

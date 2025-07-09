import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import NFLSportsPage from '@src/app/sports/nfl/page';

describe('NFLSportsPage', () => {
  it('renders the NFL sports page with correct structure', () => {
    render(<NFLSportsPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NFL')).toBeInTheDocument();

    // Check for description
    expect(screen.getByText('National Football League games and statistics.')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<NFLSportsPage />);

    // Check for main section with background
    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-screen', 'bg-background');

    // Check for inner container
    const innerContainer = section?.querySelector('.container');
    expect(innerContainer).toHaveClass('container', 'mx-auto', 'p-6');
  });

  it('has proper semantic structure', () => {
    render(<NFLSportsPage />);

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for paragraph
    const paragraph = screen.getByText('National Football League games and statistics.');
    expect(paragraph.tagName).toBe('P');

    // Check for section element
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();
  });

  it('applies correct styling to heading', () => {
    render(<NFLSportsPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold');
  });

  it('applies correct styling to description', () => {
    render(<NFLSportsPage />);

    const description = screen.getByText('National Football League games and statistics.');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders consistently', () => {
    const { rerender } = render(<NFLSportsPage />);

    // Re-render and check consistency
    rerender(<NFLSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NFL')).toBeInTheDocument();
    expect(screen.getByText('National Football League games and statistics.')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<NFLSportsPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<NFLSportsPage />);

    // Multiple re-renders
    rerender(<NFLSportsPage />);
    rerender(<NFLSportsPage />);
    rerender(<NFLSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NFL')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<NFLSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NFL')).toBeInTheDocument();
  });

  it('takes full viewport height', () => {
    const { container } = render(<NFLSportsPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-screen');
  });

  it('has proper content structure', () => {
    const { container } = render(<NFLSportsPage />);

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
    const { container } = render(<NFLSportsPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-background');
  });

  it('has proper container styling', () => {
    const { container } = render(<NFLSportsPage />);

    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toHaveClass('mx-auto', 'p-6');
  });

  it('renders NFL specific content', () => {
    render(<NFLSportsPage />);

    // Check for NFL specific text
    expect(screen.getByText('NFL')).toBeInTheDocument();
    expect(screen.getByText('National Football League games and statistics.')).toBeInTheDocument();
  });

  it('has proper text hierarchy', () => {
    render(<NFLSportsPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    const description = screen.getByText('National Football League games and statistics.');

    // Check that heading comes before description
    expect(
      heading.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('maintains consistent styling across renders', () => {
    const { rerender } = render(<NFLSportsPage />);

    // Get initial styling
    const initialHeading = screen.getByRole('heading', { level: 1 });
    const initialDescription = screen.getByText('National Football League games and statistics.');

    // Re-render
    rerender(<NFLSportsPage />);

    // Check that styling is maintained
    const newHeading = screen.getByRole('heading', { level: 1 });
    const newDescription = screen.getByText('National Football League games and statistics.');

    expect(newHeading).toHaveClass('text-2xl', 'font-bold');
    expect(newDescription).toHaveClass('text-muted-foreground');
  });

  it('has proper document structure', () => {
    const { container } = render(<NFLSportsPage />);

    // Check that the component renders as expected in the document
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section?.children.length).toBe(1); // Should have one child (the container div)

    const containerDiv = section?.firstElementChild;
    expect(containerDiv).toHaveClass('container');
    expect(containerDiv?.children.length).toBe(2); // Should have heading and paragraph
  });
});

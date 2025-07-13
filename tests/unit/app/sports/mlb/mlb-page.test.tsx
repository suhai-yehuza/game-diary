import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import MLBPage from '@src/app/sports/mlb/page';

describe('MLBPage', () => {
  it('renders the MLB page with correct structure', () => {
    render(<MLBPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLB page')).toBeInTheDocument();

    // Check for user greeting
    expect(screen.getByText('Welcome, Guest!')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<MLBPage />);

    // Check for main section with flex layout
    const section = container.querySelector('section');
    expect(section).toHaveClass(
      'min-h-[calc(100vh-4rem)]',
      'flex',
      'items-center',
      'justify-center'
    );

    // Check for inner container
    const innerContainer = section?.querySelector('.container');
    expect(innerContainer).toHaveClass('container', 'mx-auto', 'px-4', 'text-center');
  });

  it('has proper semantic structure', () => {
    render(<MLBPage />);

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for paragraph
    const paragraph = screen.getByText('Welcome, Guest!');
    expect(paragraph.tagName).toBe('P');

    // Check for section element
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();
  });

  it('applies correct styling to heading', () => {
    render(<MLBPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold');
  });

  it('renders consistently', () => {
    const { rerender } = render(<MLBPage />);

    // Re-render and check consistency
    rerender(<MLBPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLB page')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Guest!')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<MLBPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-\\[calc\\(100vh-4rem\\)\\]');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<MLBPage />);

    // Multiple re-renders
    rerender(<MLBPage />);
    rerender(<MLBPage />);
    rerender(<MLBPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLB page')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<MLBPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('MLB page')).toBeInTheDocument();
  });

  it('uses flexbox for centering content', () => {
    const { container } = render(<MLBPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('has proper content structure', () => {
    const { container } = render(<MLBPage />);

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

  it('centers content both horizontally and vertically', () => {
    const { container } = render(<MLBPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('items-center', 'justify-center');
  });

  it('has responsive height calculation', () => {
    const { container } = render(<MLBPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-[calc(100vh-4rem)]');
  });
});

describe('UserGreeting', () => {
  it('renders welcome message', () => {
    render(<MLBPage />);

    expect(screen.getByText('Welcome, Guest!')).toBeInTheDocument();
  });

  it('is contained within the centered container', () => {
    const { container } = render(<MLBPage />);

    const containerDiv = container.querySelector('.container.mx-auto.px-4.text-center');
    const greetingText = screen.getByText('Welcome, Guest!');

    expect(containerDiv).toContainElement(greetingText);
  });

  it('renders as a paragraph element', () => {
    render(<MLBPage />);

    const greeting = screen.getByText('Welcome, Guest!');
    expect(greeting.tagName).toBe('P');
  });
});

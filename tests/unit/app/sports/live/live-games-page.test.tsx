import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import LiveGamesPage from '@src/app/sports/live/page';

describe('LiveGamesPage', () => {
  it('renders the live games page with correct structure', () => {
    render(<LiveGamesPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live Games page')).toBeInTheDocument();

    // Check for user greeting
    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<LiveGamesPage />);

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
    render(<LiveGamesPage />);

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for paragraph
    const paragraph = screen.getByText('Welcome, User!');
    expect(paragraph.tagName).toBe('P');

    // Check for section element
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();
  });

  it('applies correct styling to heading', () => {
    render(<LiveGamesPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold');
  });

  it('renders consistently', () => {
    const { rerender } = render(<LiveGamesPage />);

    // Re-render and check consistency
    rerender(<LiveGamesPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live Games page')).toBeInTheDocument();
    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LiveGamesPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-\\[calc\\(100vh-4rem\\)\\]');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<LiveGamesPage />);

    // Multiple re-renders
    rerender(<LiveGamesPage />);
    rerender(<LiveGamesPage />);
    rerender(<LiveGamesPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live Games page')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<LiveGamesPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live Games page')).toBeInTheDocument();
  });

  it('uses flexbox for centering content', () => {
    const { container } = render(<LiveGamesPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('has proper content structure', () => {
    const { container } = render(<LiveGamesPage />);

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
    const { container } = render(<LiveGamesPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('items-center', 'justify-center');
  });

  it('has responsive height calculation', () => {
    const { container } = render(<LiveGamesPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-[calc(100vh-4rem)]');
  });
});

describe('UserGreeting', () => {
  it('renders welcome message', () => {
    render(<LiveGamesPage />);

    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('is contained within the centered container', () => {
    const { container } = render(<LiveGamesPage />);

    const containerDiv = container.querySelector('.container.mx-auto.px-4.text-center');
    const greetingText = screen.getByText('Welcome, User!');

    expect(containerDiv).toContainElement(greetingText);
  });

  it('renders as a paragraph element', () => {
    render(<LiveGamesPage />);

    const greeting = screen.getByText('Welcome, User!');
    expect(greeting.tagName).toBe('P');
  });
});

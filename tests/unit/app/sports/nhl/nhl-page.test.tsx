import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import NHLPage, { NHLSportsPage } from '@src/app/sports/nhl/page';

describe('NHLPage', () => {
  it('renders the NHL page with correct structure', () => {
    render(<NHLPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('This will be the NHL page')).toBeInTheDocument();

    // Check for user greeting
    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<NHLPage />);

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
    render(<NHLPage />);

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
    render(<NHLPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold');
  });

  it('renders consistently', () => {
    const { rerender } = render(<NHLPage />);

    // Re-render and check consistency
    rerender(<NHLPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('This will be the NHL page')).toBeInTheDocument();
    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<NHLPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-\\[calc\\(100vh-4rem\\)\\]');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<NHLPage />);

    // Multiple re-renders
    rerender(<NHLPage />);
    rerender(<NHLPage />);
    rerender(<NHLPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('This will be the NHL page')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<NHLPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('This will be the NHL page')).toBeInTheDocument();
  });

  it('uses flexbox for centering content', () => {
    const { container } = render(<NHLPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('has proper content structure', () => {
    const { container } = render(<NHLPage />);

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
    const { container } = render(<NHLPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('items-center', 'justify-center');
  });

  it('has responsive height calculation', () => {
    const { container } = render(<NHLPage />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-[calc(100vh-4rem)]');
  });
});

describe('NHLSportsPage', () => {
  it('renders the NHL sports page with correct structure', () => {
    render(<NHLSportsPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NHL')).toBeInTheDocument();

    // Check for description
    expect(screen.getByText('National Hockey League games and statistics.')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<NHLSportsPage />);

    // Check for main div with background
    const mainDiv = container.querySelector('div');
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-background');

    // Check for inner container
    const innerContainer = mainDiv?.querySelector('.container');
    expect(innerContainer).toHaveClass('container', 'mx-auto', 'p-6');
  });

  it('has proper semantic structure', () => {
    render(<NHLSportsPage />);

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for paragraph
    const paragraph = screen.getByText('National Hockey League games and statistics.');
    expect(paragraph.tagName).toBe('P');
  });

  it('applies correct styling to heading', () => {
    render(<NHLSportsPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold');
  });

  it('applies correct styling to description', () => {
    render(<NHLSportsPage />);

    const description = screen.getByText('National Hockey League games and statistics.');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders consistently', () => {
    const { rerender } = render(<NHLSportsPage />);

    // Re-render and check consistency
    rerender(<NHLSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NHL')).toBeInTheDocument();
    expect(screen.getByText('National Hockey League games and statistics.')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<NHLSportsPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<NHLSportsPage />);

    // Multiple re-renders
    rerender(<NHLSportsPage />);
    rerender(<NHLSportsPage />);
    rerender(<NHLSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NHL')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<NHLSportsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NHL')).toBeInTheDocument();
  });

  it('takes full viewport height', () => {
    const { container } = render(<NHLSportsPage />);

    const mainDiv = container.querySelector('div');
    expect(mainDiv).toHaveClass('min-h-screen');
  });

  it('has proper content structure', () => {
    const { container } = render(<NHLSportsPage />);

    // Check that content is properly contained
    const mainDiv = container.querySelector('div');
    const containerDiv = mainDiv?.querySelector('.container');
    const heading = containerDiv?.querySelector('h1');
    const paragraph = containerDiv?.querySelector('p');

    expect(mainDiv).toBeInTheDocument();
    expect(containerDiv).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
  });
});

describe('UserGreeting', () => {
  it('renders welcome message', () => {
    render(<NHLPage />);

    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('is contained within the centered container', () => {
    const { container } = render(<NHLPage />);

    const containerDiv = container.querySelector('.container.mx-auto.px-4.text-center');
    const greetingText = screen.getByText('Welcome, User!');

    expect(containerDiv).toContainElement(greetingText);
  });

  it('renders as a paragraph element', () => {
    render(<NHLPage />);

    const greeting = screen.getByText('Welcome, User!');
    expect(greeting.tagName).toBe('P');
  });
});

describe('Component Comparison', () => {
  it('both components render different content', () => {
    const { rerender } = render(<NHLPage />);
    expect(screen.getByText('This will be the NHL page')).toBeInTheDocument();
    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();

    rerender(<NHLSportsPage />);
    expect(screen.getByText('NHL')).toBeInTheDocument();
    expect(screen.getByText('National Hockey League games and statistics.')).toBeInTheDocument();
    expect(screen.queryByText('Welcome, User!')).not.toBeInTheDocument();
  });

  it('both components have different layouts', () => {
    const { container: container1, rerender } = render(<NHLPage />);
    const section1 = container1.querySelector('section');
    expect(section1).toHaveClass('flex', 'items-center', 'justify-center');

    rerender(<NHLSportsPage />);
    const { container: container2 } = render(<NHLSportsPage />);
    const div2 = container2.querySelector('div');
    expect(div2).toHaveClass('min-h-screen', 'bg-background');
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import NotFoundPage from '@src/app/not-found';

describe('NotFoundPage', () => {
  it('renders the 404 page with correct structure', () => {
    render(<NotFoundPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();

    // Check for error message
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<NotFoundPage />);

    // Check for main container with background and centering
    const mainContainer = container.querySelector('div');
    expect(mainContainer).toHaveClass(
      'min-h-screen',
      'bg-background',
      'flex',
      'items-center',
      'justify-center'
    );

    // Check for inner text container
    const textContainer = mainContainer?.querySelector('.text-center');
    expect(textContainer).toHaveClass('text-center');
  });

  it('has proper semantic structure', () => {
    render(<NotFoundPage />);

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for paragraph
    const paragraph = screen.getByText('Page not found.');
    expect(paragraph.tagName).toBe('P');

    // Check for main container
    const mainContainer = heading.closest('div');
    expect(mainContainer).toBeInTheDocument();
  });

  it('applies correct styling to heading', () => {
    render(<NotFoundPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-4xl', 'font-bold');
  });

  it('applies correct styling to error message', () => {
    render(<NotFoundPage />);

    const errorMessage = screen.getByText('Page not found.');
    expect(errorMessage).toHaveClass('text-muted-foreground');
  });

  it('renders consistently', () => {
    const { rerender } = render(<NotFoundPage />);

    // Re-render and check consistency
    rerender(<NotFoundPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<NotFoundPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<NotFoundPage />);

    // Multiple re-renders
    rerender(<NotFoundPage />);
    rerender(<NotFoundPage />);
    rerender(<NotFoundPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<NotFoundPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('takes full viewport height', () => {
    const { container } = render(<NotFoundPage />);

    const mainContainer = container.querySelector('div');
    expect(mainContainer).toHaveClass('min-h-screen');
  });

  it('centers content properly', () => {
    const { container } = render(<NotFoundPage />);

    const mainContainer = container.querySelector('div');
    expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('has proper content structure', () => {
    const { container } = render(<NotFoundPage />);

    // Check that content is properly contained
    const mainContainer = container.querySelector('div');
    const textContainer = mainContainer?.querySelector('.text-center');
    const heading = textContainer?.querySelector('h1');
    const paragraph = textContainer?.querySelector('p');

    expect(mainContainer).toBeInTheDocument();
    expect(textContainer).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
  });

  it('has proper background styling', () => {
    const { container } = render(<NotFoundPage />);

    const mainContainer = container.querySelector('div');
    expect(mainContainer).toHaveClass('bg-background');
  });

  it('has proper text centering', () => {
    const { container } = render(<NotFoundPage />);

    const textContainer = container.querySelector('.text-center');
    expect(textContainer).toHaveClass('text-center');
  });

  it('renders 404 specific content', () => {
    render(<NotFoundPage />);

    // Check for 404 specific text
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });

  it('has proper text hierarchy', () => {
    render(<NotFoundPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    const errorMessage = screen.getByText('Page not found.');

    // Check that heading comes before error message
    expect(
      heading.compareDocumentPosition(errorMessage) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('maintains consistent styling across renders', () => {
    const { rerender } = render(<NotFoundPage />);

    // Get initial styling
    const initialHeading = screen.getByRole('heading', { level: 1 });
    const initialErrorMessage = screen.getByText('Page not found.');

    // Re-render
    rerender(<NotFoundPage />);

    // Check that styling is maintained
    const newHeading = screen.getByRole('heading', { level: 1 });
    const newErrorMessage = screen.getByText('Page not found.');

    expect(newHeading).toHaveClass('text-4xl', 'font-bold');
    expect(newErrorMessage).toHaveClass('text-muted-foreground');
  });

  it('has proper document structure', () => {
    const { container } = render(<NotFoundPage />);

    // Check that the component renders as expected in the document
    const mainContainer = container.querySelector('div');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer?.children.length).toBe(1); // Should have one child (the text container)

    const textContainer = mainContainer?.firstElementChild;
    expect(textContainer).toHaveClass('text-center');
    expect(textContainer?.children.length).toBe(2); // Should have heading and paragraph
  });

  it('is properly centered in viewport', () => {
    const { container } = render(<NotFoundPage />);

    const mainContainer = container.querySelector('div');
    expect(mainContainer).toHaveClass('items-center', 'justify-center');
  });

  it('has appropriate error page styling', () => {
    render(<NotFoundPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    const errorMessage = screen.getByText('Page not found.');

    // Check that heading is large and bold (appropriate for error page)
    expect(heading).toHaveClass('text-4xl', 'font-bold');

    // Check that error message has muted styling
    expect(errorMessage).toHaveClass('text-muted-foreground');
  });
});

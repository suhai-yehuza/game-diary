import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Footer } from '@/app/components/layout/footer';

describe('Footer', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
  });

  it('renders the footer with correct structure', () => {
    render(<Footer />);

    // Check for main footer element
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // Check for all section headings
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('renders all navigation buttons', () => {
    render(<Footer />);

    // About section buttons
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();

    // Help section buttons
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();

    // Social section buttons
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();

    // Legal section buttons
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('renders copyright notice with current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Game Diary. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('applies correct CSS classes to footer', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('w-full', 'border-t', 'py-4');

    const container = footer.querySelector('.container');
    expect(container).toHaveClass('container', 'mx-auto', 'px-4');

    const grid = container?.querySelector('.grid');
    expect(grid).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-4', 'gap-4');
  });

  it('applies correct CSS classes to section headings', () => {
    render(<Footer />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    headings.forEach(heading => {
      expect(heading).toHaveClass('text-xs', 'font-semibold', 'mb-2');
    });
  });

  it('applies correct CSS classes to navigation buttons', () => {
    render(<Footer />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass(
        'hover:text-blue-600',
        'text-left',
        'min-w-[44px]',
        'min-h-[44px]'
      );
    });
  });

  it('applies correct CSS classes to lists', () => {
    render(<Footer />);

    const lists = screen.getAllByRole('list');
    lists.forEach(list => {
      expect(list).toHaveClass('space-y-1', 'text-xs', 'text-gray-600');
    });
  });

  it('handles button clicks (placeholder functionality)', () => {
    render(<Footer />);

    const aboutUsButton = screen.getByText('About Us');
    const newsButton = screen.getByText('News');
    const apiButton = screen.getByText('API');
    const contactButton = screen.getByText('Contact Us');
    const xButton = screen.getByText('X');
    const youtubeButton = screen.getByText('YouTube');
    const privacyButton = screen.getByText('Privacy Policy');

    // All buttons should be clickable (even though they have placeholder functionality)
    fireEvent.click(aboutUsButton);
    fireEvent.click(newsButton);
    fireEvent.click(apiButton);
    fireEvent.click(contactButton);
    fireEvent.click(xButton);
    fireEvent.click(youtubeButton);
    fireEvent.click(privacyButton);

    // No errors should occur
    expect(aboutUsButton).toBeInTheDocument();
    expect(newsButton).toBeInTheDocument();
    expect(apiButton).toBeInTheDocument();
    expect(contactButton).toBeInTheDocument();
    expect(xButton).toBeInTheDocument();
    expect(youtubeButton).toBeInTheDocument();
    expect(privacyButton).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Footer />);

    // Footer should have proper role
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // All buttons should be accessible
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });

    // Lists should be properly structured
    const lists = screen.getAllByRole('list');
    lists.forEach(list => {
      expect(list).toBeInTheDocument();
    });
  });

  it('renders responsive grid layout', () => {
    render(<Footer />);

    const grid = screen.getByRole('contentinfo').querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-4');
  });

  it('has proper semantic structure', () => {
    render(<Footer />);

    // Should have footer element
    const footer = screen.getByRole('contentinfo');
    expect(footer.tagName).toBe('FOOTER');

    // Should have container div
    const container = footer.querySelector('.container');
    expect(container).toBeInTheDocument();

    // Should have grid layout
    const grid = container?.querySelector('.grid');
    expect(grid).toBeInTheDocument();

    // Should have 4 sections
    const sections = grid?.children;
    expect(sections).toHaveLength(4);
  });

  it('maintains consistent styling across sections', () => {
    render(<Footer />);

    // All sections should have the same structure
    const sections = screen.getByRole('contentinfo').querySelectorAll('div > div');
    sections.forEach(section => {
      const heading = section.querySelector('h3');
      const list = section.querySelector('ul');

      if (heading) {
        expect(heading).toHaveClass('text-xs', 'font-semibold', 'mb-2');
      }

      if (list) {
        expect(list).toHaveClass('space-y-1', 'text-xs', 'text-gray-600');
      }
    });
  });
});

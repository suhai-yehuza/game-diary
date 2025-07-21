import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Footer } from '@/app/components/layout/Footer';

describe('Footer', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
  });

  it('renders the footer with correct structure', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('renders footer sections correctly', () => {
    render(<Footer />);
    // Check that all sections are present
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();

    // Check that all links are present
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('applies correct CSS classes to footer', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('w-full', 'border-t');
    const wrapper = footer.querySelector('.max-w-5xl');
    expect(wrapper).toHaveClass('max-w-5xl', 'mx-auto', 'px-2');
    const grid = wrapper?.querySelector('.grid');
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-4', 'gap-2');
  });

  it('applies correct CSS classes to section headings', () => {
    render(<Footer />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    headings.forEach(heading => {
      expect(heading).toHaveClass(
        'text-xs',
        'font-bold',
        'mb-1',
        'tracking-wide',
        'uppercase',
        expect.stringContaining('text-') // matches text-muted-foreground or text-gray-300
      );
    });
  });

  it('applies correct CSS classes to navigation links', () => {
    render(<Footer />);

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass(
        'hover:text-blue-600',
        'transition-colors',
        'block',
        'py-0.5',
        'text-gray-100'
      );
    });
  });

  it('applies correct CSS classes to lists', () => {
    render(<Footer />);
    const lists = screen.getAllByRole('list');
    lists.forEach(list => {
      expect(list).toHaveClass('text-xs');
    });
  });

  it('has proper accessibility attributes', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    const lists = screen.getAllByRole('list');
    lists.forEach(list => {
      expect(list).toBeInTheDocument();
    });
  });

  it('renders responsive grid layout', () => {
    render(<Footer />);
    const grid = screen.getByRole('contentinfo').querySelector('.grid');
    expect(grid).toHaveClass('sm:grid-cols-2', 'md:grid-cols-4');
  });

  it('has proper semantic structure', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.tagName).toBe('FOOTER');
    const wrapper = footer.querySelector('.max-w-5xl');
    expect(wrapper).toBeInTheDocument();
    const grid = wrapper?.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    const sections = grid?.children;
    expect(sections).toHaveLength(4);
  });

  it('maintains consistent styling across sections', () => {
    render(<Footer />);
    const sections = screen.getByRole('contentinfo').querySelectorAll('.grid > div');
    sections.forEach(section => {
      const heading = section.querySelector('h3');
      const list = section.querySelector('ul');
      if (heading) {
        expect(heading).toHaveClass('text-xs', 'font-bold', 'mb-1');
      }
      if (list) {
        expect(list).toHaveClass('text-xs');
      }
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { Footer } from '@/app/components/layout/Footer';

describe('Footer', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
  });

  it('renders the footer with correct structure', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    // Check for the four main links
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('renders four sections in the grid', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    const grid = footer.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.children).toHaveLength(4);
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

  it('applies correct CSS classes to navigation links', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass('hover:text-blue-600', 'transition-colors', 'block', 'py-0.5');
    });
  });

  it('has proper accessibility attributes', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toBeInTheDocument();
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
});

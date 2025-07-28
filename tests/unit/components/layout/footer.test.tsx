import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
    theme: 'light',
    themes: ['light', 'dark', 'system'],
  }),
}));

import { Footer } from '@/app/components/layout/Footer';

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('renders Twitter icon with proper attributes', () => {
    render(<Footer />);
    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/yourprofile');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(twitterLink).toHaveAttribute('aria-label', 'Twitter');
  });

  it('renders Terms of Service link with proper attributes', () => {
    render(<Footer />);
    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    expect(termsLink).toHaveAttribute('href', '/terms-of-service');
    expect(termsLink).toHaveAttribute('target', '_blank');
    expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders News link with proper href', () => {
    render(<Footer />);
    const newsLink = screen.getByRole('link', { name: /news/i });
    expect(newsLink).toHaveAttribute('href', '#news');
  });

  it('renders Contact Us link with proper href', () => {
    render(<Footer />);
    const contactLink = screen.getByRole('link', { name: /contact us/i });
    expect(contactLink).toHaveAttribute('href', '#contact');
  });

  it('renders copyright notice', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
    expect(screen.getByText(/Placeholder/)).toBeInTheDocument();
    expect(screen.getByText(/Made with/)).toBeInTheDocument();
  });

  it('renders love emoji with proper accessibility', () => {
    render(<Footer />);
    const loveEmoji = screen.getByLabelText('love');
    expect(loveEmoji).toBeInTheDocument();
    expect(loveEmoji).toHaveAttribute('role', 'img');
  });

  it('renders with proper spacing and layout classes', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');

    // Check main footer classes (actual classes from the component)
    expect(footer).toHaveClass('w-full', 'border-t', 'py-2', 'text-xs');

    // Check wrapper classes
    const wrapper = footer.querySelector('.max-w-5xl');
    expect(wrapper).toHaveClass('max-w-5xl', 'mx-auto', 'px-2');

    // Check grid classes
    const grid = wrapper?.querySelector('.grid');
    expect(grid).toHaveClass(
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'md:grid-cols-4',
      'gap-2',
      'text-center',
      'md:text-left'
    );
  });

  it('renders all list items with proper structure', () => {
    render(<Footer />);
    const lists = screen.getAllByRole('list');
    expect(lists).toHaveLength(4);

    lists.forEach(list => {
      expect(list).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'md:items-start',
        'gap-1',
        'mt-0'
      );
    });
  });

  it('handles mounted state properly', async () => {
    render(<Footer />);

    // Initially should render (SSR fallback)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // Wait for mounted state
    await waitFor(() => {
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  it('renders Twitter link with icon and text', () => {
    render(<Footer />);
    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    expect(twitterLink).toHaveClass('flex', 'items-center', 'gap-2');
    expect(twitterLink).toHaveTextContent('Twitter');
  });

  it('renders all links with proper hover states', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass('hover:text-blue-600', 'transition-colors');
    });
  });
});

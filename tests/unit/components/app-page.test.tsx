import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/page';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, priority, sizes, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      data-priority={priority}
      data-sizes={sizes}
      {...props}
    />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('HomePage', () => {
  it('renders the homepage with correct structure', () => {
    render(<HomePage />);

    // Check main heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Game Diary');

    // Check description
    expect(
      screen.getByText(/Your personal space to track and share your pro game watching experiences/)
    ).toBeInTheDocument();
  });

  it('renders the Game Diary logo', () => {
    render(<HomePage />);

    const logo = screen.getByAltText('Game Diary Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logos/gamelog-large.svg');
    expect(logo).toHaveAttribute('width', '200');
    expect(logo).toHaveAttribute('height', '50');
    expect(logo).toHaveAttribute('data-priority', 'true');
  });

  it('renders the dashboard link with correct href', () => {
    render(<HomePage />);

    const dashboardLink = screen.getByRole('link', { name: /Go to Dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/protected/user');
    expect(dashboardLink).toHaveClass('px-6', 'py-3', 'bg-blue-600', 'text-white', 'rounded-lg');
  });

  it('renders footer links with correct hrefs', () => {
    render(<HomePage />);

    // Check "How to log a game" link
    const howToLink = screen.getByRole('link', { name: /How to log a game/i });
    expect(howToLink).toBeInTheDocument();
    expect(howToLink).toHaveAttribute('href', '/dashboard');

    // Check "Example game logs" link
    const exampleLink = screen.getByRole('link', { name: /Example game logs/i });
    expect(exampleLink).toBeInTheDocument();
    expect(exampleLink).toHaveAttribute('href', '/dashboard');
  });

  it('renders footer icons', () => {
    render(<HomePage />);

    const fileIcon = screen.getByAltText('File icon');
    const windowIcon = screen.getByAltText('Window icon');

    expect(fileIcon).toBeInTheDocument();
    expect(fileIcon).toHaveAttribute('src', '/icons/file.svg');
    expect(fileIcon).toHaveAttribute('aria-hidden', 'true');

    expect(windowIcon).toBeInTheDocument();
    expect(windowIcon).toHaveAttribute('src', '/icons/window.svg');
    expect(windowIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies correct CSS classes for layout', () => {
    render(<HomePage />);

    const mainSection = screen.getByRole('contentinfo').parentElement;
    expect(mainSection).toHaveClass(
      'grid',
      'grid-rows-[20px_1fr_20px]',
      'items-center',
      'justify-items-center',
      'min-h-screen',
      'p-8',
      'pb-20',
      'gap-16',
      'sm:p-20'
    );
  });

  it('has proper semantic structure', () => {
    render(<HomePage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    // Check for navigation links
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3); // Dashboard + 2 footer links
  });

  it('applies hover effects to links', () => {
    render(<HomePage />);

    const dashboardLink = screen.getByRole('link', { name: /Go to Dashboard/i });
    expect(dashboardLink).toHaveClass('hover:bg-blue-700', 'transition-colors');

    const footerLinks = screen.getAllByRole('link').slice(1); // Skip dashboard link
    footerLinks.forEach(link => {
      expect(link).toHaveClass('hover:underline', 'hover:underline-offset-4');
    });
  });
});

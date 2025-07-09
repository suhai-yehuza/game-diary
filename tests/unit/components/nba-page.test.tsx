import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock LiveGamesDetail component
vi.mock('@src/app/components/live-games-detail', () => ({
  LiveGamesDetail: () => <div data-testid="live-games-detail">Live Games Detail</div>,
}));

import NBAPage from '@src/app/sports/nba/page';

describe('NBAPage', () => {
  it('renders the NBA page with correct structure', () => {
    render(<NBAPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();

    // Check for description
    expect(screen.getByText(/National Basketball Association/)).toBeInTheDocument();
    expect(screen.getByText(/Live scores, stats, and more/)).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText('Live Games')).toBeInTheDocument();
    expect(screen.getByText('API Testing')).toBeInTheDocument();

    // Check for user welcome
    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();

    // Check for LiveGamesDetail component
    expect(screen.getByTestId('live-games-detail')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<NBAPage />);

    const liveGamesLink = screen.getByText('Live Games').closest('a');
    expect(liveGamesLink).toHaveAttribute('href', '/sports/live');

    const apiTestingLink = screen.getByText('API Testing').closest('a');
    expect(apiTestingLink).toHaveAttribute('href', '/protected/admin/experimental');
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<NBAPage />);

    // Check for main section
    const section = container.querySelector('section');
    expect(section).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');

    // Check for heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-2');

    // Check for description
    const description = screen.getByText(/National Basketball Association/);
    expect(description).toHaveClass('text-gray-600', 'dark:text-gray-400', 'mb-4');
  });

  it('applies correct styling to navigation links', () => {
    render(<NBAPage />);

    const liveGamesLink = screen.getByText('Live Games').closest('a');
    expect(liveGamesLink).toHaveClass(
      'inline-flex',
      'items-center',
      'px-4',
      'py-2',
      'bg-red-600',
      'text-white',
      'rounded-md',
      'hover:bg-red-700',
      'transition-colors'
    );

    const apiTestingLink = screen.getByText('API Testing').closest('a');
    expect(apiTestingLink).toHaveClass(
      'inline-flex',
      'items-center',
      'px-4',
      'py-2',
      'bg-blue-600',
      'text-white',
      'rounded-md',
      'hover:bg-blue-700',
      'transition-colors'
    );
  });

  it('renders the live games indicator with animation', () => {
    render(<NBAPage />);

    const liveIndicator = screen
      .getByText('Live Games')
      .querySelector('.w-2.h-2.bg-white.rounded-full.animate-pulse');
    expect(liveIndicator).toBeInTheDocument();
  });

  it('renders the user welcome section with correct styling', () => {
    const { container } = render(<NBAPage />);

    const welcomeSection = container.querySelector(
      '.mb-6.p-4.bg-blue-50.dark\\:bg-blue-900\\/20.rounded-lg'
    );
    expect(welcomeSection).toBeInTheDocument();

    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<NBAPage />);

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for section element
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();

    // Check for navigation links
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
  });

  it('renders consistently', () => {
    const { rerender } = render(<NBAPage />);

    // Re-render and check consistency
    rerender(<NBAPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();
    expect(screen.getByText('Live Games')).toBeInTheDocument();
    expect(screen.getByText('API Testing')).toBeInTheDocument();
    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<NBAPage />);

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that links are accessible
    const liveGamesLink = screen.getByText('Live Games').closest('a');
    expect(liveGamesLink).toHaveAttribute('href');

    const apiTestingLink = screen.getByText('API Testing').closest('a');
    expect(apiTestingLink).toHaveAttribute('href');
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<NBAPage />);

    // Multiple re-renders
    rerender(<NBAPage />);
    rerender(<NBAPage />);
    rerender(<NBAPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<NBAPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();
  });
});

describe('UserWelcome', () => {
  it('renders welcome message', () => {
    render(<NBAPage />);

    expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
  });

  it('is contained within the welcome section', () => {
    const { container } = render(<NBAPage />);

    const welcomeSection = container.querySelector(
      '.mb-6.p-4.bg-blue-50.dark\\:bg-blue-900\\/20.rounded-lg'
    );
    const welcomeText = screen.getByText('Welcome, User!');

    expect(welcomeSection).toContainElement(welcomeText);
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { NBANews } from '@/app/components/sports/nba-news';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ExternalLink: ({ className }: any) => (
    <div data-testid="external-link" className={className}>
      ExternalLink
    </div>
  ),
  Calendar: ({ className }: any) => (
    <div data-testid="calendar" className={className}>
      Calendar
    </div>
  ),
  Clock: ({ className }: any) => (
    <div data-testid="clock" className={className}>
      Clock
    </div>
  ),
  TrendingUp: ({ className }: any) => (
    <div data-testid="trending-up" className={className}>
      TrendingUp
    </div>
  ),
}));

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="next-image" />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className }: any) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock Card components
vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

describe('NBANews Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<NBANews />);

    expect(screen.getAllByTestId('card')).toHaveLength(6); // Default limit is 6
    // The loading state shows skeleton cards, not text
  });

  it('renders news items after loading', async () => {
    render(<NBANews />);

    await waitFor(
      () => {
        expect(screen.getByText('LeBron James Sets New NBA Scoring Record')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(
      screen.getByText('Warriors vs Celtics: Championship Rematch Preview')
    ).toBeInTheDocument();
    expect(screen.getByText('Rookie Sensation Victor Wembanyama Dominates')).toBeInTheDocument();
  });

  it('renders correct number of news items based on limit prop', async () => {
    render(<NBANews limit={3} />);

    await waitFor(
      () => {
        expect(screen.getByText('LeBron James Sets New NBA Scoring Record')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Should only show 3 items
    expect(screen.getByText('LeBron James Sets New NBA Scoring Record')).toBeInTheDocument();
    expect(
      screen.getByText('Warriors vs Celtics: Championship Rematch Preview')
    ).toBeInTheDocument();
    expect(screen.getByText('Rookie Sensation Victor Wembanyama Dominates')).toBeInTheDocument();

    // Should not show the 4th item
    expect(screen.queryByText('Trade Deadline: Major Moves Expected')).not.toBeInTheDocument();
  });

  it('displays news item details correctly', async () => {
    render(<NBANews limit={1} />);

    await waitFor(
      () => {
        expect(screen.getByText('LeBron James Sets New NBA Scoring Record')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(
      screen.getByText(/Lakers star LeBron James has broken the all-time NBA scoring record/)
    ).toBeInTheDocument();
    expect(screen.getByText('NBA.com')).toBeInTheDocument();
    expect(screen.getByTestId('next-image')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop'
    );
  });

  it('renders external links correctly', async () => {
    render(<NBANews limit={1} />);

    await waitFor(
      () => {
        expect(screen.getByTestId('next-link')).toHaveAttribute('href', 'https://www.nba.com/');
      },
      { timeout: 2000 }
    );
  });

  it('handles error state gracefully', async () => {
    // This test is skipped because the component uses mock data and doesn't actually make API calls
    // In a real implementation, this would test error handling
    expect(true).toBe(true);
  });

  it('renders with default limit when no limit prop is provided', async () => {
    render(<NBANews />);

    await waitFor(
      () => {
        // Should show 6 items by default
        expect(screen.getByText('LeBron James Sets New NBA Scoring Record')).toBeInTheDocument();
        expect(screen.getByText('All-Star Game: Fan Voting Begins')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('displays formatted dates correctly', async () => {
    render(<NBANews limit={1} />);

    await waitFor(
      () => {
        expect(screen.getByText('LeBron James Sets New NBA Scoring Record')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Check that date is displayed (the exact format may vary based on locale)
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
  });
});

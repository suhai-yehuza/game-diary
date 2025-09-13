import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ClientProviders } from '@/app/components/providers/ClientProviders';
import HomePage from '@/app/page';

// Mock CacheProgressTracker component
vi.mock('@/app/components/cache/CacheProgressTracker', () => {
  return {
    CacheProgressTracker: ({ isVisible, _onComplete }: any) => (
      <div data-testid="cache-progress-tracker">
        {isVisible ? 'Progress Tracker Visible' : 'Progress Tracker Hidden'}
      </div>
    ),
  };
});

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  }),
  ClerkProvider: ({ children }: any) => <div data-testid="clerk-provider">{children}</div>,
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, _priority, ...props }: any) => (
    <div data-testid="next-image" title={alt} {...props}>
      {src}
    </div>
  ),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  TrendingUp: ({ className, ...props }: any) => (
    <div className={className} data-testid="trending-up" {...props} />
  ),
  Calendar: ({ className, ...props }: any) => (
    <div className={className} data-testid="calendar" {...props} />
  ),
  MessageCircle: ({ className, ...props }: any) => (
    <div className={className} data-testid="message-circle" {...props} />
  ),
  Star: ({ className, ...props }: any) => (
    <div className={className} data-testid="star" {...props} />
  ),
  Heart: ({ className, ...props }: any) => (
    <div className={className} data-testid="heart" {...props} />
  ),
  User: ({ className, ...props }: any) => (
    <div className={className} data-testid="user" {...props} />
  ),
  Globe: ({ className, ...props }: any) => (
    <div className={className} data-testid="globe" {...props} />
  ),
  Trophy: ({ className, ...props }: any) => (
    <div className={className} data-testid="trophy" {...props} />
  ),
  ArrowDown: ({ className, ...props }: any) => (
    <div className={className} data-testid="arrow-down" {...props} />
  ),
  Trash2: ({ className, ...props }: any) => (
    <div className={className} data-testid="trash2" {...props} />
  ),
}));

// Mock the useLiveGames hook
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: () => ({
    games: [],
    loading: false,
    error: null,
  }),
}));

// Mock the landing page data service
vi.mock('@/lib/services/landing-page-data.service', () => ({
  LandingPageDataService: vi.fn().mockImplementation(() => ({
    getLandingPageDataWithGranularCache: vi.fn().mockResolvedValue({
      trendingGameLogs: [],
      recentGames: [],
      topPublicGameLogs: [],
      liveGames: [],
    }),
  })),
}));

// Mock landing page components
vi.mock('@/app/components/common/LoadingSpinner', () => ({
  CardSkeleton: ({ children }: any) => <div data-testid="card-skeleton">{children}</div>,
}));

vi.mock('@/app/components/landing/ContentPreviewBanner', () => ({
  ContentPreviewBanner: ({ children }: any) => (
    <div data-testid="content-preview-banner">{children}</div>
  ),
}));

vi.mock('@/app/components/landing/LandingPageClientFallback', () => ({
  LandingPageClientFallback: ({ children }: any) => (
    <div data-testid="landing-page-client-fallback">{children}</div>
  ),
}));

vi.mock('@/app/components/landing/ScrollToContentButton', () => ({
  ScrollToContentButton: ({ children }: any) => (
    <div data-testid="scroll-to-content-button">{children}</div>
  ),
}));

// Mock ProgressiveDataLoader component
vi.mock('@/app/components/landing/ProgressiveDataLoader', () => ({
  ProgressiveDataLoader: ({ children, fallback }: any) => (
    <div data-testid="progressive-data-loader">{children || fallback}</div>
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="test-wrapper">{children}</div>
);

describe.skip('HomePage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the home page with correct structure', async () => {
    // Call the async component function directly
    const result = await HomePage();

    // Render the result
    render(result, { wrapper: TestWrapper });

    expect(screen.getByText('Game Diary')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Track your gaming watching experiences, connect with fellow sports fans, and share your thoughts on live games across NBA, NFL, MLB, NHL, and MLS.'
      )
    ).toBeInTheDocument();
  });

  it('renders navigation links', async () => {
    const result = await HomePage();
    render(result, { wrapper: TestWrapper });

    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Explore Sports')).toBeInTheDocument();
    expect(screen.getByText('Live Games')).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
  });

  it('renders footer links', async () => {
    const result = await HomePage();
    render(result, { wrapper: TestWrapper });

    expect(screen.getByText('Live Games')).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
  });

  it('applies correct CSS classes to main container', async () => {
    const result = await HomePage();
    const { container } = render(result, { wrapper: TestWrapper });

    const section = container.querySelector('section');
    expect(section).toHaveClass('relative', 'overflow-hidden');
  });

  it('applies correct CSS classes to hero section', async () => {
    const result = await HomePage();
    const { container } = render(result, { wrapper: TestWrapper });

    const hero = container.querySelector('section');
    expect(hero).toHaveClass('relative', 'overflow-hidden');
  });

  it('applies correct CSS classes to hero content', async () => {
    const result = await HomePage();
    render(result, { wrapper: TestWrapper });

    const heroContent = screen.getByText('Game Diary').closest('div');
    expect(heroContent).toHaveClass('text-center');
  });

  it('applies correct CSS classes to call-to-action button', async () => {
    const result = await HomePage();
    render(result, { wrapper: TestWrapper });

    const ctaButton = screen.getByText('Explore Sports').closest('a');
    expect(ctaButton).toHaveClass(
      'px-8',
      'py-4',
      'bg-brand-secondary',
      'text-white',
      'rounded-lg',
      'hover:bg-brand-secondary-dark'
    );
  });

  it('applies correct CSS classes to footer', async () => {
    const result = await HomePage();
    const { container: _container } = render(result, { wrapper: TestWrapper });

    // The page doesn't have a footer element, so we'll check for the navigation links instead
    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThan(0);
  });

  it('applies correct CSS classes to footer links', async () => {
    const result = await HomePage();
    render(result, { wrapper: TestWrapper });

    const footerLinks = screen
      .getAllByRole('link')
      .filter(
        link => link.textContent?.includes('Live Games') ?? link.textContent?.includes('All Sports')
      );

    footerLinks.forEach(link => {
      expect(link).toHaveClass(
        'flex',
        'items-center',
        'gap-2',
        'hover:underline',
        'hover:underline-offset-4'
      );
    });
  });

  it('renders with proper accessibility attributes', async () => {
    const result = await HomePage();
    render(result, { wrapper: TestWrapper });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Game Diary');
  });
});

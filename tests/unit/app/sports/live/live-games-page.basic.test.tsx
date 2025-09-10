import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ClientProviders } from '@/app/components/providers';
import LiveGamesPage from '@/app/sports/live/page';

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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Trash2: () => <span data-testid="trash2-icon">Trash2</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
  Monitor: () => <span data-testid="monitor-icon">Monitor</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  RefreshCw: () => <span data-testid="refresh-cw-icon">RefreshCw</span>,
  MapPin: () => <span data-testid="map-pin-icon">MapPin</span>,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
  }),
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}));

// Mock useLiveGames hook
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: () => ({
    games: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/sports/live',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock common components
vi.mock('@/app/components/common', () => ({
  PageLoadingSpinner: ({ children }: any) => (
    <div data-testid="page-loading-spinner">{children}</div>
  ),
  PageErrorDisplay: ({ error }: any) => (
    <div data-testid="page-error-display">{error?.message}</div>
  ),
  NoDataEmptyState: ({ title, description }: any) => (
    <div data-testid="no-data-empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

// Mock UI components
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

// Mock the types
vi.mock('@/types', () => ({
  IGamesApiResponse: {},
  IUseLiveGamesOptions: {},
  IUseLiveGamesReturn: {},
  LogLevel: 'info',
  ErrorCategory: {
    NETWORK: 'network',
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    BUSINESS_LOGIC: 'business_logic',
    SYSTEM: 'system',
    DATABASE: 'database',
    API: 'api',
    UI: 'ui',
    UNKNOWN: 'unknown',
  },
  ErrorSeverity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
}));

// Mock hooks
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: () => ({
    games: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  ClerkProvider: ({ children }: any) => <div data-testid="clerk-provider">{children}</div>,
}));

// Mock ClerkProviderWrapper
vi.mock('@/app/components/providers/ClerkProvider', () => ({
  ClerkProviderWrapper: ({ children }: any) => (
    <div data-testid="clerk-provider-wrapper">{children}</div>
  ),
}));

// Mock the useLiveGames hook
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: () => ({
    games: [
      {
        id: 1,
        status: { long: '3rd Quarter', clock: '5:30' },
        teams: {
          visitors: { name: 'Boston Celtics', nickname: 'Celtics', logo: '/celtics.png' },
          home: { name: 'New York Knicks', nickname: 'Knicks', logo: '/knicks.png' },
        },
        scores: { visitors: { points: 95 }, home: { points: 85 } },
        arena: { name: 'Madison Square Garden', city: 'New York', state: 'NY' },
        periods: { current: 3, total: 4 },
        nugget: 'High scoring game',
      },
    ],
    loading: false,
    error: null,
  }),
}));

describe('LiveGamesPage', () => {
  beforeEach(() => {
    // Set up environment variable for Clerk
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_1234567890abcdef';
  });

  it('renders the live games page with correct structure', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();

    // Check for games count
    expect(screen.getByText('1 Game currently live')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for main container
    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');

    // Check for heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-2');
  });

  it('has proper semantic structure', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });

  it('renders consistently', () => {
    const { rerender } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Re-render and check consistency
    rerender(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
  });

  it('displays live game information', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for live game elements
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('3rd Quarter')).toBeInTheDocument();
    expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
    expect(screen.getByText('New York Knicks')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('displays game details correctly', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Check for arena information
    expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
    expect(screen.getByText(/New York.*NY/)).toBeInTheDocument();

    // Check for period information
    expect(screen.getByText('Period:')).toBeInTheDocument();
    expect(screen.getByText('3 of 4')).toBeInTheDocument();
    expect(screen.getByText('Time:')).toBeInTheDocument();
    expect(screen.getByText('5:30')).toBeInTheDocument();
  });

  it('handles multiple renders without issues', () => {
    const { rerender } = render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    // Multiple re-renders
    for (let i = 0; i < 3; i++) {
      rerender(
        <ClientProviders>
          <LiveGamesPage />
        </ClientProviders>
      );
    }

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
  });

  it('has proper content structure', () => {
    render(
      <ClientProviders>
        <LiveGamesPage />
      </ClientProviders>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
    expect(screen.getByText('1 Game currently live')).toBeInTheDocument();
  });
});

import { render, screen, waitFor as _waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import { Header } from '@/app/components/layout/Header';
import { MenuProvider } from '@/app/components/providers/MenuContext';
import { NotificationProvider } from '@/app/components/providers/NotificationProvider';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon">Search</span>,
  X: () => <span data-testid="x-icon">X</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">TrendingUp</span>,
  User: () => <span data-testid="user-icon">User</span>,
  Trophy: () => <span data-testid="trophy-icon">Trophy</span>,
  Gamepad2: () => <span data-testid="gamepad2-icon">Gamepad2</span>,
  Building2: () => <span data-testid="building2-icon">Building2</span>,
  Menu: () => <span data-testid="menu-icon">Menu</span>,
  Home: () => <span data-testid="home-icon">Home</span>,
  BarChart3: () => <span data-testid="barchart3-icon">BarChart3</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
  Monitor: () => <span data-testid="monitor-icon">Monitor</span>,
  Hash: () => <span data-testid="hash-icon">Hash</span>,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('next/image', () => ({
  default: ({ priority: _priority, ...props }: any) => <img {...props} />,
}));
vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: any) => <button data-testid="sign-in-button">{children}</button>,
  SignedIn: ({ children }: any) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: any) => <div data-testid="signed-out">{children}</div>,
  UserButton: () => <div data-testid="user-button">User Button</div>,
  useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
}));
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: () => ({ games: [] }),
}));
vi.mock('@/lib/config/app.config', () => ({
  isUnitTestEnvironment: true,
  isE2ETestEnvironment: false,
}));
vi.mock('@/app/components/layout/components/AuthControls', () => ({
  ClientOnlyAuthControls: () => <button data-testid="sign-in-button">Sign In</button>,
}));
vi.mock('@apollo/client', () => ({
  useQuery: () => ({ data: null, refetch: vi.fn() }),
  useMutation: () => [vi.fn(), { loading: false }],
  gql: vi.fn((_strings, ..._args) => ({ kind: 'Document', definitions: [] })),
  createHttpLink: vi.fn(() => ({})),
  ApolloClient: vi.fn(() => ({})),
  from: vi.fn(() => ({})),
  InMemoryCache: vi.fn(() => ({})),
}));
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
if (!global.fetch) {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ results: 0, response: [] }) })
  ) as any;
}

describe('Header', () => {
  it('renders the search bar, sign-in button, logo, and navigation links', () => {
    render(
      <NotificationProvider>
        <MenuProvider>
          <Header />
        </MenuProvider>
      </NotificationProvider>
    );
    // Search bar
    expect(screen.getByPlaceholderText('Global search...')).toBeInTheDocument();
    // Sign-in button
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    // Logo image
    expect(screen.getByAltText('Game Diary Logo')).toBeInTheDocument();
    // Home link
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    // NBA link
    expect(screen.getByRole('link', { name: 'NBA' })).toBeInTheDocument();
    // NFL link
    expect(screen.getByRole('link', { name: 'NFL' })).toBeInTheDocument();
    // MLB link
    expect(screen.getByRole('link', { name: 'MLB' })).toBeInTheDocument();
    // NHL link
    expect(screen.getByRole('link', { name: 'NHL' })).toBeInTheDocument();
    // MLS link
    expect(screen.getByRole('link', { name: 'MLS' })).toBeInTheDocument();
    // All Sports link
    expect(screen.getByRole('link', { name: 'All Sports' })).toBeInTheDocument();
  });
});

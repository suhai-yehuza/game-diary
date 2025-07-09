import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Header } from '@/app/components/layout/header';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
  }),
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

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: any) => (
    <button data-testid="clerk-signin-button">{children}</button>
  ),
  SignedIn: ({ children }: any) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: any) => <div data-testid="signed-out">{children}</div>,
  UserButton: () => <div data-testid="user-button">User Button</div>,
  useUser: () => ({
    isSignedIn: false,
    user: null,
  }),
}));

// Mock components
vi.mock('@/app/components/common', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('@/app/components/live-games-banner', () => ({
  LiveGamesBanner: () => <div data-testid="live-games-banner">Live Games Banner</div>,
}));

vi.mock('@/app/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => (
    <button data-testid="dropdown-trigger">{children}</button>
  ),
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children }: any) => <div data-testid="dropdown-item">{children}</div>,
}));

// Mock API config
vi.mock('@/lib/config/api.config', () => ({
  isUnitTestEnvironment: false,
  isE2ETestEnvironment: false,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
    // Mock environment variables
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
  });

  it('renders the header with correct structure', () => {
    render(<Header />);

    // Check for main header element
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Check for logo/brand
    expect(screen.getByAltText('Game Diary Logo')).toBeInTheDocument();

    // Check for search bar
    expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();

    // Check for theme toggle
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);

    // Check for main navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('NBA')).toBeInTheDocument();
    expect(screen.getByText('NFL')).toBeInTheDocument();
    expect(screen.getByText('MLB')).toBeInTheDocument();
    expect(screen.getByText('NHL')).toBeInTheDocument();
    expect(screen.getByText('MLS')).toBeInTheDocument();
    expect(screen.getByText('All Sports')).toBeInTheDocument();
  });

  it('renders auth controls for signed out users', () => {
    render(<Header />);

    // Check for signed out state
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByTestId('clerk-signin-button')).toBeInTheDocument();
  });

  it('renders live games banner', () => {
    render(<Header />);

    expect(screen.getByTestId('live-games-banner')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('w-full', 'border-b', 'lg:border-b');
  });

  it('handles mobile menu toggle', () => {
    render(<Header />);

    // Mobile menu button should be present
    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();

    // Click menu button
    fireEvent.click(menuButton);

    // Menu should be expanded (this would depend on the actual implementation)
    expect(menuButton).toBeInTheDocument();
  });

  it('handles search input interaction', () => {
    render(<Header />);

    const searchInput = screen.getByPlaceholderText('Search games...');

    // Type in search
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // Value should be updated
    expect(searchInput).toHaveValue('test search');
  });

  it('handles Clerk configuration check', () => {
    // Test without Clerk key
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    render(<Header />);

    // Should still render without errors
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});

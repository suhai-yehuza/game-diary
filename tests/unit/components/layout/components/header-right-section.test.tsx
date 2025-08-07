import { useUser } from '@clerk/nextjs';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { HeaderRightSection } from '@/app/components/layout/components/HeaderRightSection';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock other components
vi.mock('@/app/components/common', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('@/app/components/layout/components/AuthControls', () => ({
  ClientOnlyAuthControls: () => <div data-testid="auth-controls">Auth Controls</div>,
}));

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  SearchBar: ({ isFocused: _isFocused, setIsFocused }: any) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  ),
  useMobileDetection: () => false,
}));

const mockUseUser = useUser as ReturnType<typeof vi.fn>;

describe('HeaderRightSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
      isLoaded: true,
      isSignedIn: true,
    } as any);
  });

  describe('Authentication-based rendering', () => {
    it('should render all components when user is authenticated', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user-123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);

      render(<HeaderRightSection isMenuExpanded={false} />);

      // Should render all core components
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('auth-controls')).toBeInTheDocument();
    });

    it('should render components when user is not authenticated', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);

      render(<HeaderRightSection isMenuExpanded={false} />);

      // Should still render core components
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('auth-controls')).toBeInTheDocument();
    });

    it('should render components when user is not loaded', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);

      render(<HeaderRightSection isMenuExpanded={false} />);

      // Should still render core components
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('auth-controls')).toBeInTheDocument();
    });
  });

  describe('Layout and components', () => {
    it('should always render auth controls regardless of authentication status', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);

      render(<HeaderRightSection isMenuExpanded={false} />);

      expect(screen.getByTestId('auth-controls')).toBeInTheDocument();
    });

    it('should render search bar', () => {
      render(<HeaderRightSection isMenuExpanded={false} />);

      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('should render theme toggle', () => {
      render(<HeaderRightSection isMenuExpanded={false} />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Menu expansion behavior', () => {
    it('should render when menu is expanded', () => {
      render(<HeaderRightSection isMenuExpanded={true} />);

      // Should still render core components even when menu is expanded
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('auth-controls')).toBeInTheDocument();
    });

    it('should render when menu is not expanded', () => {
      render(<HeaderRightSection isMenuExpanded={false} />);

      // Should render core components when menu is not expanded
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('auth-controls')).toBeInTheDocument();
    });
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogsTabs } from '@/app/components/game-logs/GameLogsTabs';

// Mock the mobile detection hook
const mockUseMobileDetection = vi.fn();

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => mockUseMobileDetection(),
}));

describe('GameLogsTabs Extended Tests', () => {
  const defaultProps = {
    selectedTab: 'my-logs',
    onTabChange: vi.fn(),
    children: <div data-testid="tab-content">Tab Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Rendering', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('renders with desktop classes when not on mobile', () => {
      render(<GameLogsTabs {...defaultProps} />);

      const tabsList = screen.getByText('My Logs').closest('div');
      expect(tabsList).toHaveClass('flex', 'w-auto');
      expect(tabsList).not.toHaveClass('grid', 'grid-cols-3');
    });

    it('renders all three tabs with correct values', () => {
      render(<GameLogsTabs {...defaultProps} />);

      expect(screen.getByText('My Logs')).toBeInTheDocument();
      expect(screen.getByText("Friends' Logs")).toBeInTheDocument();
      expect(screen.getByText('Public Logs')).toBeInTheDocument();
    });

    it('applies desktop-specific CSS classes to tab triggers', () => {
      render(<GameLogsTabs {...defaultProps} />);

      const myLogsTab = screen.getByText('My Logs').closest('button');
      expect(myLogsTab).toHaveClass('text-sm', 'py-3', 'px-4');
      expect(myLogsTab).not.toHaveClass('text-xs', 'sm:text-sm');
    });

    it('shows selected tab as active', () => {
      render(<GameLogsTabs {...defaultProps} selectedTab="friends-logs" />);

      const friendsTab = screen.getByText("Friends' Logs").closest('button');
      expect(friendsTab).toHaveAttribute('data-state', 'active');
    });

    it('calls onTabChange when a tab is clicked', () => {
      render(<GameLogsTabs {...defaultProps} />);

      const friendsTab = screen.getByText("Friends' Logs").closest('button');
      fireEvent.click(friendsTab!);

      expect(defaultProps.onTabChange).toHaveBeenCalledWith('friends-logs');
    });

    it('renders children content', () => {
      render(<GameLogsTabs {...defaultProps} />);

      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
      expect(screen.getByText('Tab Content')).toBeInTheDocument();
    });
  });

  describe('Mobile Rendering', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(true);
    });

    it('renders with mobile classes when on mobile', () => {
      render(<GameLogsTabs {...defaultProps} />);

      const tabsList = screen.getByText('My Logs').closest('div');
      expect(tabsList).toHaveClass('flex', 'w-full');
      expect(tabsList).not.toHaveClass('grid', 'grid-cols-3');
    });

    it('applies mobile-specific CSS classes to tab triggers', () => {
      render(<GameLogsTabs {...defaultProps} />);

      const myLogsTab = screen.getByText('My Logs').closest('button');
      expect(myLogsTab).toHaveClass('text-sm', 'py-3', 'px-4');
      expect(myLogsTab).not.toHaveClass('text-xs', 'sm:text-sm');
    });

    it('shows selected tab as active on mobile', () => {
      render(<GameLogsTabs {...defaultProps} selectedTab="public-logs" />);

      const publicTab = screen.getByText('Public Logs').closest('button');
      expect(publicTab).toHaveAttribute('data-state', 'active');
    });

    it('calls onTabChange when a tab is clicked on mobile', () => {
      render(<GameLogsTabs {...defaultProps} />);

      const publicTab = screen.getByText('Public Logs').closest('button');
      fireEvent.click(publicTab!);

      expect(defaultProps.onTabChange).toHaveBeenCalledWith('public-logs');
    });
  });

  describe('Tab Interactions', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('handles tab changes for all tabs', () => {
      render(<GameLogsTabs {...defaultProps} />);

      const myLogsTab = screen.getByText('My Logs').closest('button');
      const friendsTab = screen.getByText("Friends' Logs").closest('button');
      const publicTab = screen.getByText('Public Logs').closest('button');

      fireEvent.click(friendsTab!);
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('friends-logs');

      fireEvent.click(publicTab!);
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('public-logs');

      fireEvent.click(myLogsTab!);
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('my-logs');
    });

    it('handles multiple rapid tab clicks', () => {
      render(<GameLogsTabs {...defaultProps} />);

      const friendsTab = screen.getByText("Friends' Logs").closest('button');
      const publicTab = screen.getByText('Public Logs').closest('button');

      fireEvent.click(friendsTab!);
      fireEvent.click(publicTab!);
      fireEvent.click(friendsTab!);

      expect(defaultProps.onTabChange).toHaveBeenCalledTimes(3);
      expect(defaultProps.onTabChange).toHaveBeenNthCalledWith(1, 'friends-logs');
      expect(defaultProps.onTabChange).toHaveBeenNthCalledWith(2, 'public-logs');
      expect(defaultProps.onTabChange).toHaveBeenNthCalledWith(3, 'friends-logs');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('handles empty children', () => {
      render(<GameLogsTabs {...defaultProps} children={null} />);

      expect(screen.queryByTestId('tab-content')).not.toBeInTheDocument();
    });

    it('handles undefined onTabChange', () => {
      const propsWithoutOnChange = {
        selectedTab: defaultProps.selectedTab,
        children: defaultProps.children,
        onTabChange: undefined as any,
      };

      expect(() => {
        render(<GameLogsTabs {...propsWithoutOnChange} />);
      }).not.toThrow();
    });

    it('handles different selected tab values', () => {
      const tabs = ['my-logs', 'friends-logs', 'public-logs'];
      const tabNames = ['My Logs', "Friends' Logs", 'Public Logs'];

      tabs.forEach((tab, index) => {
        const { unmount } = render(<GameLogsTabs {...defaultProps} selectedTab={tab} />);

        const selectedTabElement = screen.getByText(tabNames[index]).closest('button');
        expect(selectedTabElement).toHaveAttribute('data-state', 'active');

        unmount();
      });
    });

    it('renders with complex children', () => {
      const complexChildren = (
        <div>
          <h2>Complex Content</h2>
          <p>Some paragraph text</p>
          <button>Click me</button>
        </div>
      );

      render(<GameLogsTabs {...defaultProps} children={complexChildren} />);

      expect(screen.getByText('Complex Content')).toBeInTheDocument();
      expect(screen.getByText('Some paragraph text')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });
  });
});

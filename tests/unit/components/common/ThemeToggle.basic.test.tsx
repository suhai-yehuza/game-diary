import { render, screen, fireEvent } from '@testing-library/react';
import { useTheme } from 'next-themes';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ThemeToggle } from '@/app/components/common/ThemeToggle';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

// Mock the useMounted hook
vi.mock('@/hooks/use-mounted', () => ({
  useMounted: () => true,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Sun: ({ className }: any) => (
    <div data-testid="sun-icon" className={className}>
      Sun
    </div>
  ),
  Moon: ({ className }: any) => (
    <div data-testid="moon-icon" className={className}>
      Moon
    </div>
  ),
  Monitor: ({ className }: any) => (
    <div data-testid="monitor-icon" className={className}>
      Monitor
    </div>
  ),
}));

const mockUseTheme = useTheme as ReturnType<typeof vi.fn>;

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('renders with default props', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      expect(screen.getByLabelText('Dark')).toBeInTheDocument();
      expect(screen.getByLabelText('Light')).toBeInTheDocument();
      expect(screen.getByLabelText('System')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle className="custom-toggle" />);

      const container = screen.getByLabelText('Dark').closest('div');
      expect(container).toHaveClass('custom-toggle');
    });
  });

  describe('Theme Buttons', () => {
    it('renders all theme options', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      expect(screen.getByLabelText('Dark')).toBeInTheDocument();
      expect(screen.getByLabelText('Light')).toBeInTheDocument();
      expect(screen.getByLabelText('System')).toBeInTheDocument();
    });

    it('shows active theme with correct styling', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Dark');
      expect(darkButton).toHaveClass(
        'bg-brand-primary',
        'text-theme-toggle-active',
        'shadow-theme-toggle'
      );
    });

    it('shows inactive themes with correct styling', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Dark');
      const systemButton = screen.getByLabelText('System');
      expect(darkButton).toHaveClass('text-theme-toggle-inactive');
      expect(systemButton).toHaveClass('text-theme-toggle-inactive');
    });
  });

  describe('Theme Switching', () => {
    it('calls setTheme when dark button is clicked', () => {
      const mockSetTheme = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Dark');
      fireEvent.click(darkButton);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('calls setTheme when light button is clicked', () => {
      const mockSetTheme = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const lightButton = screen.getByLabelText('Light');
      fireEvent.click(lightButton);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('calls setTheme when system button is clicked', () => {
      const mockSetTheme = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const systemButton = screen.getByLabelText('System');
      fireEvent.click(systemButton);

      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      expect(screen.getByLabelText('Dark')).toBeInTheDocument();
      expect(screen.getByLabelText('Light')).toBeInTheDocument();
      expect(screen.getByLabelText('System')).toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('maintains accessibility across theme changes', () => {
      const mockSetTheme = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByLabelText('Dark')).toBeInTheDocument();
      expect(screen.getByLabelText('Light')).toBeInTheDocument();
      expect(screen.getByLabelText('System')).toBeInTheDocument();

      const darkButton = screen.getByLabelText('Dark');
      fireEvent.click(darkButton);

      expect(screen.getByLabelText('Dark')).toBeInTheDocument();
      expect(screen.getByLabelText('Light')).toBeInTheDocument();
      expect(screen.getByLabelText('System')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies correct CSS classes to container', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      const container = screen.getByLabelText('Dark').closest('div');
      expect(container).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'p-0.5',
        'border',
        'bg-theme-toggle-container',
        'border-theme-toggle-border'
      );
    });

    it('applies correct button styling', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Dark');
      expect(darkButton).toHaveClass(
        'flex',
        'items-center',
        'justify-center',
        'h-11',
        'w-11',
        'rounded-full',
        'transition-colors',
        'mx-0.5'
      );
    });

    it('applies focus styles correctly', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Dark');
      expect(darkButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
    });
  });

  describe('Icon Rendering', () => {
    it('renders sun icon for light theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      const lightButton = screen.getByLabelText('Light');
      const sunIcon = lightButton.querySelector('[data-testid="sun-icon"]');
      expect(sunIcon).toBeInTheDocument();
    });

    it('renders moon icon for dark theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Dark');
      const moonIcon = darkButton.querySelector('[data-testid="moon-icon"]');
      expect(moonIcon).toBeInTheDocument();
    });

    it('renders monitor icon for system theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'system',
        setTheme: vi.fn(),
      });

      render(<ThemeToggle />);

      const systemButton = screen.getByLabelText('System');
      const monitorIcon = systemButton.querySelector('[data-testid="monitor-icon"]');
      expect(monitorIcon).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing setTheme gracefully', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: undefined,
      });

      expect(() => render(<ThemeToggle />)).not.toThrow();
    });

    it('handles missing theme gracefully', () => {
      mockUseTheme.mockReturnValue({
        theme: undefined,
        setTheme: vi.fn(),
      });

      expect(() => render(<ThemeToggle />)).not.toThrow();
    });
  });

  describe('Keyboard Navigation', () => {
    it('responds to keyboard events', () => {
      const mockSetTheme = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Dark');
      fireEvent.keyDown(darkButton, { key: 'Enter' });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('responds to Space key', () => {
      const mockSetTheme = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const lightButton = screen.getByLabelText('Light');
      fireEvent.keyDown(lightButton, { key: ' ' });

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Performance', () => {
    it('renders efficiently', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: vi.fn(),
      });

      const startTime = performance.now();
      render(<ThemeToggle />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
      expect(screen.getByLabelText('Dark')).toBeInTheDocument();
    });

    it('handles rapid theme changes efficiently', () => {
      const mockSetTheme = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Dark');
      const lightButton = screen.getByLabelText('Light');
      const systemButton = screen.getByLabelText('System');

      // Simulate rapid clicks
      fireEvent.click(darkButton);
      fireEvent.click(lightButton);
      fireEvent.click(systemButton);

      expect(mockSetTheme).toHaveBeenCalledTimes(3);
    });
  });
});

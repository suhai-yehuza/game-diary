import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ThemeToggle } from '@/app/components/common/theme-toggle';

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: 'dark',
  }),
}));

// Mock useMounted hook
vi.mock('@/hooks/use-mounted', () => ({
  useMounted: () => true,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Sun: () => <div data-testid="sun-icon">Sun</div>,
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  Monitor: () => <div data-testid="monitor-icon">Monitor</div>,
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
    // Reset mock
    mockSetTheme.mockClear();
  });

  it('renders the theme toggle with all theme options', () => {
    render(<ThemeToggle />);

    // Check for all theme buttons
    expect(screen.getByLabelText('Dark')).toBeInTheDocument();
    expect(screen.getByLabelText('Light')).toBeInTheDocument();
    expect(screen.getByLabelText('System')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<ThemeToggle className="custom-class" />);

    const container = screen.getByLabelText('Dark').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('handles theme switching', () => {
    render(<ThemeToggle />);

    const lightButton = screen.getByLabelText('Light');
    fireEvent.click(lightButton);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('handles all theme options', () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByLabelText('Dark');
    const lightButton = screen.getByLabelText('Light');
    const systemButton = screen.getByLabelText('System');

    fireEvent.click(darkButton);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    fireEvent.click(lightButton);
    expect(mockSetTheme).toHaveBeenCalledWith('light');

    fireEvent.click(systemButton);
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('applies correct CSS classes to container', () => {
    render(<ThemeToggle />);

    const container = screen.getByLabelText('Dark').closest('div');
    expect(container).toHaveClass('inline-flex', 'items-center', 'bg-[#18181b]', 'rounded-full');
  });

  it('has proper accessibility attributes', () => {
    render(<ThemeToggle />);

    // Check for aria-labels
    expect(screen.getByLabelText('Dark')).toBeInTheDocument();
    expect(screen.getByLabelText('Light')).toBeInTheDocument();
    expect(screen.getByLabelText('System')).toBeInTheDocument();
  });

  it('renders with default className when none provided', () => {
    render(<ThemeToggle />);

    const container = screen.getByLabelText('Dark').closest('div');
    expect(container).toHaveClass('inline-flex', 'items-center', 'bg-[#18181b]', 'rounded-full');
  });

  it('maintains consistent button sizing', () => {
    render(<ThemeToggle />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('h-11', 'w-11');
    });
  });

  it('handles keyboard navigation', () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByLabelText('Dark');
    darkButton.focus();

    // Should be focusable
    expect(darkButton).toHaveFocus();
  });

  it('handles theme switching multiple times', () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByLabelText('Dark');
    const lightButton = screen.getByLabelText('Light');

    fireEvent.click(darkButton);
    fireEvent.click(lightButton);
    fireEvent.click(darkButton);

    expect(mockSetTheme).toHaveBeenCalledTimes(3);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MobileMenuButton } from '@/app/components/layout/components/MobileMenuButton';

describe.skip('MobileMenuButton', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render mobile menu button', () => {
    render(<MobileMenuButton onToggle={mockOnToggle} />);

    expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    render(<MobileMenuButton onToggle={mockOnToggle} />);

    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
  });

  it('should call onToggle when clicked', () => {
    render(<MobileMenuButton onToggle={mockOnToggle} />);

    fireEvent.click(screen.getByTestId('mobile-menu-button'));

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should have correct styling classes', () => {
    render(<MobileMenuButton onToggle={mockOnToggle} />);

    expect(screen.getByTestId('mobile-menu-button')).toHaveClass(
      'lg:hidden',
      'mr-4',
      'relative',
      'z-50',
      'p-2',
      'hover:bg-gray-100',
      'dark:hover:bg-gray-800',
      'rounded-md',
      'transition-colors'
    );
  });

  it('should have correct inline styles', () => {
    render(<MobileMenuButton onToggle={mockOnToggle} />);

    expect(screen.getByTestId('mobile-menu-button')).toHaveStyle({ pointerEvents: 'auto' });
  });

  it('should render Menu icon', () => {
    render(<MobileMenuButton onToggle={mockOnToggle} />);

    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
  });

  it('should be hidden on large screens', () => {
    render(<MobileMenuButton onToggle={mockOnToggle} />);

    expect(screen.getByTestId('mobile-menu-button')).toHaveClass('lg:hidden');
  });

  it('should have proper button type', () => {
    render(<MobileMenuButton onToggle={mockOnToggle} />);

    expect(screen.getByTestId('mobile-menu-button').tagName).toBe('BUTTON');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NavItem } from '@/app/components/layout/components/navigation/NavItem';

describe('NavItem', () => {
  describe('Desktop Layout (isStacked = false)', () => {
    it('renders link with correct href and text', () => {
      render(
        <NavItem href="/test" isActive={false}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Test Link');
    });

    it('applies active styling when isActive is true', () => {
      render(
        <NavItem href="/test" isActive={true}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'text-white',
        'bg-blue-600',
        'border',
        'border-blue-700',
        'shadow-md',
        'font-semibold'
      );
    });

    it('applies inactive styling when isActive is false', () => {
      render(
        <NavItem href="/test" isActive={false}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'text-white',
        'bg-gray-600',
        'border-0',
        'hover:border',
        'hover:border-gray-500',
        'hover:bg-gray-500'
      );
    });

    it('calls onClick when provided', () => {
      const mockOnClick = vi.fn();
      render(
        <NavItem href="/test" isActive={false} onClick={mockOnClick}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      link.click();

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
      render(
        <NavItem href="/test" isActive={false} className="custom-class">
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass('custom-class');
    });
  });

  describe('Mobile Layout (isStacked = true)', () => {
    it('renders with mobile styling when isStacked is true', () => {
      render(
        <NavItem href="/test" isActive={false} isStacked={true}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'w-full',
        'max-w-sm',
        'mx-auto',
        'min-h-[56px]',
        'px-6',
        'py-4',
        'flex',
        'items-center',
        'justify-center',
        'text-base',
        'font-medium',
        'rounded-lg',
        'transition-all',
        'duration-200',
        'ease-out',
        'active:scale-98',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-neutral-400',
        'focus:ring-offset-1',
        'shadow-sm',
        'nav-item-google-style'
      );
    });

    it('applies active styling for mobile when isActive is true', () => {
      render(
        <NavItem href="/test" isActive={true} isStacked={true}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'text-white',
        'bg-blue-600',
        'border',
        'border-blue-700',
        'shadow-md',
        'font-semibold'
      );
    });

    it('applies inactive styling for mobile when isActive is false', () => {
      render(
        <NavItem href="/test" isActive={false} isStacked={true}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'text-white',
        'bg-gray-600',
        'border-0',
        'hover:border',
        'hover:border-gray-500',
        'hover:bg-gray-500'
      );
    });

    it('calls closeMenu when provided and isStacked is true', () => {
      const mockCloseMenu = vi.fn();
      render(
        <NavItem href="/test" isActive={false} isStacked={true} closeMenu={mockCloseMenu}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      link.click();

      expect(mockCloseMenu).toHaveBeenCalledTimes(1);
    });

    it('has improved touch target for mobile', () => {
      render(
        <NavItem href="/test" isActive={false} isStacked={true}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass('min-h-[56px]'); // Minimum touch target size
    });

    it('has improved border styling for mobile', () => {
      render(
        <NavItem href="/test" isActive={false} isStacked={true}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass('border-0', 'hover:border'); // Border appears on hover
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(
        <NavItem href="/test" isActive={false}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-neutral-400',
        'focus:ring-offset-1'
      );
    });

    it('has proper focus styles for mobile', () => {
      render(
        <NavItem href="/test" isActive={false} isStacked={true}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-neutral-400',
        'focus:ring-offset-1'
      );
    });

    it('has proper semantic structure', () => {
      render(
        <NavItem href="/test" isActive={false}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Interaction', () => {
    it('handles click events properly', () => {
      const mockOnClick = vi.fn();
      render(
        <NavItem href="/test" isActive={false} onClick={mockOnClick}>
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      link.click();

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('handles click events with closeMenu for mobile', () => {
      const mockOnClick = vi.fn();
      const mockCloseMenu = vi.fn();
      render(
        <NavItem
          href="/test"
          isActive={false}
          isStacked={true}
          onClick={mockOnClick}
          closeMenu={mockCloseMenu}
        >
          Test Link
        </NavItem>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      link.click();

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockCloseMenu).toHaveBeenCalledTimes(1);
    });
  });
});

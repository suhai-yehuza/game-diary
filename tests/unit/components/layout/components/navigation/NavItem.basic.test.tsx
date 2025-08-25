import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { NavItem } from '@/app/components/layout/components/navigation/NavItem';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

describe('NavItem', () => {
  const defaultProps = {
    href: '/test',
    isActive: false,
    children: 'Test Link',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Layout (isStacked = false)', () => {
    it('renders with default props', () => {
      render(<NavItem {...defaultProps} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('applies desktop styling classes', () => {
      render(<NavItem {...defaultProps} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'block',
        'py-2.5',
        'px-4',
        'text-base',
        'font-medium',
        'transition-all',
        'duration-200',
        'whitespace-nowrap',
        'flex',
        'items-center',
        'w-full',
        'h-full',
        'rounded-md',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-brand-primary',
        'focus:ring-offset-2'
      );
    });

    it('applies active styling when isActive is true', () => {
      render(<NavItem {...defaultProps} isActive={true} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'text-brand-primary',
        'dark:text-brand-primary',
        'bg-brand-primary/10',
        'dark:bg-brand-primary/20'
      );
    });

    it('applies inactive styling when isActive is false', () => {
      render(<NavItem {...defaultProps} isActive={false} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'hover:text-neutral-900',
        'dark:hover:text-neutral-100',
        'hover:bg-neutral-100',
        'dark:hover:bg-neutral-800'
      );
    });

    it('calls onClick when provided', () => {
      const onClick = vi.fn();
      render(<NavItem {...defaultProps} onClick={onClick} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      fireEvent.click(link);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call closeMenu on desktop when clicked', () => {
      const closeMenu = vi.fn();
      render(<NavItem {...defaultProps} closeMenu={closeMenu} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      fireEvent.click(link);

      expect(closeMenu).not.toHaveBeenCalled();
    });

    it('passes additional props to link', () => {
      render(<NavItem {...defaultProps} aria-current="page" />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Mobile Layout (isStacked = true)', () => {
    const mobileProps = {
      ...defaultProps,
      isStacked: true,
    };

    it('applies mobile styling classes', () => {
      render(<NavItem {...mobileProps} />);

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
        'rounded-xl',
        'transition-all',
        'duration-200',
        'ease-out',
        'active:scale-98',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-brand-primary',
        'focus:ring-offset-2',
        'shadow-sm'
      );
    });

    it('applies active styling for mobile when isActive is true', () => {
      render(<NavItem {...mobileProps} isActive={true} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'bg-brand-primary/10',
        'dark:bg-brand-primary/20',
        'text-brand-primary',
        'dark:text-brand-primary',
        'border-2',
        'border-brand-primary/30',
        'dark:border-brand-primary/40',
        'shadow-md'
      );
    });

    it('applies inactive styling for mobile when isActive is false', () => {
      render(<NavItem {...mobileProps} isActive={false} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'bg-white',
        'dark:bg-gray-800',
        'text-gray-900',
        'dark:text-gray-100',
        'hover:bg-gray-50',
        'dark:hover:bg-gray-700',
        'border-2',
        'border-gray-200',
        'dark:border-gray-700',
        'hover:border-gray-300',
        'dark:hover:border-gray-600'
      );
    });

    it('calls closeMenu when clicked on mobile', () => {
      const closeMenu = vi.fn();
      render(<NavItem {...mobileProps} closeMenu={closeMenu} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      fireEvent.click(link);

      expect(closeMenu).toHaveBeenCalledTimes(1);
    });

    it('calls both onClick and closeMenu when both are provided on mobile', () => {
      const onClick = vi.fn();
      const closeMenu = vi.fn();
      render(<NavItem {...mobileProps} onClick={onClick} closeMenu={closeMenu} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      fireEvent.click(link);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(closeMenu).toHaveBeenCalledTimes(1);
    });

    it('does not call closeMenu when closeMenu is not provided on mobile', () => {
      render(<NavItem {...mobileProps} />);

      const link = screen.getByRole('link', { name: 'Test Link' });

      // Should not throw error when closeMenu is undefined
      expect(() => {
        fireEvent.click(link);
      }).not.toThrow();
    });

    it('has proper touch target size for mobile', () => {
      render(<NavItem {...mobileProps} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass('min-h-[56px]'); // Minimum 56px touch target
    });

    it('has improved visual feedback with scale animation', () => {
      render(<NavItem {...mobileProps} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass('active:scale-98'); // Slight scale down on active
    });

    it('has improved border styling for mobile', () => {
      render(<NavItem {...mobileProps} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass('border-2'); // Thicker border for better visibility
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<NavItem {...defaultProps} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-brand-primary',
        'focus:ring-offset-2'
      );
    });

    it('has proper focus styles for mobile', () => {
      render(<NavItem {...defaultProps} isStacked={true} />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-brand-primary',
        'focus:ring-offset-2'
      );
    });

    it('passes aria-current when provided', () => {
      render(<NavItem {...defaultProps} aria-current="page" />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<NavItem {...defaultProps} className="custom-class" />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass('custom-class');
    });

    it('applies custom className for mobile', () => {
      render(<NavItem {...defaultProps} isStacked={true} className="custom-mobile-class" />);

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveClass('custom-mobile-class');
    });
  });

  describe('Error Handling', () => {
    it('handles missing onClick gracefully', () => {
      render(<NavItem {...defaultProps} />);

      const link = screen.getByRole('link', { name: 'Test Link' });

      expect(() => {
        fireEvent.click(link);
      }).not.toThrow();
    });

    it('handles missing closeMenu gracefully on mobile', () => {
      render(<NavItem {...defaultProps} isStacked={true} />);

      const link = screen.getByRole('link', { name: 'Test Link' });

      expect(() => {
        fireEvent.click(link);
      }).not.toThrow();
    });
  });
});

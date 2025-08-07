import { render, screen } from '@testing-library/react';
import { Search } from 'lucide-react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { EmptyState } from '@/app/components/common/EmptyState';

describe('EmptyState', () => {
  describe('Default Rendering', () => {
    it('renders with default title and description', () => {
      render(<EmptyState />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
      expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(<EmptyState title="Custom Title" description="Custom description" />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description')).toBeInTheDocument();
    });

    it('renders with test ID', () => {
      render(<EmptyState />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('renders default icon when no icon is provided', () => {
      render(<EmptyState />);

      const icon = screen.getByTestId('empty-state').querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders custom icon when provided', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Custom Icon</div>;

      render(<EmptyState icon={<CustomIcon />} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders Lucide React icons correctly', () => {
      render(<EmptyState icon={<Search />} />);

      const icon = screen.getByTestId('empty-state').querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('applies correct CSS classes', () => {
      render(<EmptyState />);

      const container = screen.getByTestId('empty-state');
      expect(container).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'text-center',
        'p-8'
      );
    });

    it('applies variant classes correctly', () => {
      render(<EmptyState variant="info" />);

      const container = screen.getByTestId('empty-state');
      expect(container).toHaveClass('text-blue-600', 'dark:text-blue-400');
    });

    it('applies custom className', () => {
      render(<EmptyState className="custom-class" />);

      const container = screen.getByTestId('empty-state');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Children Rendering', () => {
    it('renders children when provided', () => {
      render(
        <EmptyState>
          <button>Action Button</button>
        </EmptyState>
      );

      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('renders action prop when provided', () => {
      render(<EmptyState action={<button>Action Button</button>} />);

      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('renders both children and action', () => {
      render(
        <EmptyState action={<button>Action Button</button>}>
          <div>Child Content</div>
        </EmptyState>
      );

      expect(screen.getByText('Action Button')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  describe('Icon Size', () => {
    it('applies correct icon size classes', () => {
      render(<EmptyState iconSize={24} />);

      const icon = screen.getByTestId('empty-state').querySelector('svg');
      expect(icon).toHaveClass('h-6', 'w-6');
    });

    it('applies default icon size classes', () => {
      render(<EmptyState />);

      const icon = screen.getByTestId('empty-state').querySelector('svg');
      expect(icon).toHaveClass('h-12', 'w-12');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<EmptyState />);

      const container = screen.getByTestId('empty-state');
      expect(container).toHaveAttribute('role', 'status');
      expect(container).toHaveAttribute('aria-label');
    });

    it('has proper semantic structure', () => {
      render(<EmptyState />);

      const container = screen.getByTestId('empty-state');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant correctly', () => {
      render(<EmptyState variant="default" />);

      const container = screen.getByTestId('empty-state');
      expect(container).toHaveClass('text-muted-foreground');
    });

    it('renders info variant correctly', () => {
      render(<EmptyState variant="info" />);

      const container = screen.getByTestId('empty-state');
      expect(container).toHaveClass('text-blue-600', 'dark:text-blue-400');
    });

    it('renders warning variant correctly', () => {
      render(<EmptyState variant="warning" />);

      const container = screen.getByTestId('empty-state');
      expect(container).toHaveClass('text-yellow-600', 'dark:text-yellow-400');
    });
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Default Rendering', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with custom text', () => {
      render(<LoadingSpinner text="Loading..." />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders without text when not provided', () => {
      render(<LoadingSpinner />);

      const container = screen.getByTestId('loading-spinner');
      expect(container).toBeInTheDocument();
      expect(container).not.toHaveTextContent('Loading...');
    });
  });

  describe('Size Variants', () => {
    it('renders with small size', () => {
      render(<LoadingSpinner size="sm" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('renders with medium size (default)', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-6', 'w-6');
    });

    it('renders with large size', () => {
      render(<LoadingSpinner size="lg" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('renders with extra large size', () => {
      render(<LoadingSpinner size="xl" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });
  });

  describe('Variant Styling', () => {
    it('renders with default variant', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-gray-300', 'dark:border-gray-600');
    });

    it('renders with primary variant', () => {
      render(<LoadingSpinner variant="primary" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-blue-600', 'dark:border-blue-400');
    });

    it('renders with secondary variant', () => {
      render(<LoadingSpinner variant="secondary" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-gray-400', 'dark:border-gray-500');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<LoadingSpinner className="custom-spinner" />);

      const container = screen.getByTestId('loading-spinner');
      expect(container).toHaveClass('custom-spinner');
    });

    it('combines variant and custom className', () => {
      render(<LoadingSpinner variant="primary" className="custom-spinner" />);

      const container = screen.getByTestId('loading-spinner');
      expect(container).toHaveClass('custom-spinner');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('has proper semantic structure', () => {
      render(<LoadingSpinner />);

      const container = screen.getByTestId('loading-spinner');
      expect(container).toBeInTheDocument();
    });

    it('has proper test ID', () => {
      render(<LoadingSpinner />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('passes through HTML attributes', () => {
      render(<LoadingSpinner data-testid="custom-spinner" />);

      expect(screen.getByTestId('custom-spinner')).toBeInTheDocument();
    });

    it('combines custom attributes with default ones', () => {
      render(<LoadingSpinner data-testid="custom-spinner" className="custom-class" />);

      const spinner = screen.getByTestId('custom-spinner');
      expect(spinner).toHaveClass('custom-class');
    });
  });

  describe('Animation', () => {
    it('has spinning animation', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Layout', () => {
    it('has proper flex layout', () => {
      render(<LoadingSpinner />);

      const container = screen.getByTestId('loading-spinner');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });
});

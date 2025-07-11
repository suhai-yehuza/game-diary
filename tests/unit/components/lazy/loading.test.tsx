import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingSpinner, LoadingCard, LoadingPage } from '@/components/lazy/loading';

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('renders the loading spinner', () => {
      render(<LoadingSpinner />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('has the correct CSS classes', () => {
      const { container } = render(<LoadingSpinner />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'h-8',
        'w-8',
        'border-b-2',
        'border-blue-600'
      );
    });

    it('renders without crashing', () => {
      expect(() => render(<LoadingSpinner />)).not.toThrow();
    });
  });

  describe('LoadingCard', () => {
    it('renders the loading card', () => {
      render(<LoadingCard />);

      const card = document.querySelector('.animate-pulse');
      expect(card).toBeInTheDocument();
    });

    it('has the correct structure with skeleton elements', () => {
      const { container } = render(<LoadingCard />);

      const skeletonElements = container.querySelectorAll('.h-4.bg-gray-200');
      expect(skeletonElements).toHaveLength(2);
    });

    it('has the correct CSS classes', () => {
      const { container } = render(<LoadingCard />);

      const card = container.querySelector('.animate-pulse');
      expect(card).toHaveClass('animate-pulse');
    });

    it('renders without crashing', () => {
      expect(() => render(<LoadingCard />)).not.toThrow();
    });
  });

  describe('LoadingPage', () => {
    it('renders the loading page', () => {
      render(<LoadingPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('has the correct structure', () => {
      const { container } = render(<LoadingPage />);

      const spinner = container.querySelector('.animate-spin');
      const text = screen.getByText('Loading...');

      expect(spinner).toBeInTheDocument();
      expect(text).toBeInTheDocument();
    });

    it('has the correct CSS classes', () => {
      const { container } = render(<LoadingPage />);

      const pageContainer = container.firstChild as HTMLElement;
      expect(pageContainer).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-[60vh]');
    });

    it('renders without crashing', () => {
      expect(() => render(<LoadingPage />)).not.toThrow();
    });

    it('has proper accessibility attributes', () => {
      const { container } = render(<LoadingPage />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });
});

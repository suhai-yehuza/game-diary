import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import {
  SkeletonLoader,
  CardSkeleton,
  PageLoadingSpinner,
  CardLoadingSpinner,
  InlineLoadingSpinner,
} from '@/app/components/common/LoadingSpinner';

describe('LoadingSpinner Skeleton Components', () => {
  describe('SkeletonLoader', () => {
    it('renders with default props', () => {
      const { container } = render(<SkeletonLoader />);

      expect(container.firstChild).toHaveClass('animate-pulse');
      expect(container.querySelectorAll('.h-4')).toHaveLength(1); // Default 1 line
    });

    it('renders with custom number of lines', () => {
      const { container } = render(<SkeletonLoader lines={3} />);

      expect(container.querySelectorAll('.h-4')).toHaveLength(3);
    });

    it('renders with custom className', () => {
      const { container } = render(<SkeletonLoader className="custom-skeleton" />);

      expect(container.firstChild).toHaveClass('animate-pulse', 'custom-skeleton');
    });

    it('renders with zero lines', () => {
      const { container } = render(<SkeletonLoader lines={0} />);

      expect(container.querySelectorAll('.h-4')).toHaveLength(0);
    });

    it('renders with many lines', () => {
      const { container } = render(<SkeletonLoader lines={10} />);

      expect(container.querySelectorAll('.h-4')).toHaveLength(10);
    });

    it('applies correct spacing between lines', () => {
      const { container } = render(<SkeletonLoader lines={3} />);

      const lines = container.querySelectorAll('.h-4');
      expect(lines[0]).toHaveClass('mb-2');
      expect(lines[1]).toHaveClass('mb-2');
      expect(lines[2]).toHaveClass('last:mb-0'); // Last line should have no bottom margin
    });
  });

  describe('CardSkeleton', () => {
    it('renders card skeleton structure', () => {
      const { container } = render(<CardSkeleton />);

      expect(container.firstChild).toHaveClass(
        'bg-white',
        'dark:bg-gray-800',
        'rounded-xl',
        'shadow-2xl'
      );
    });

    it('renders header section', () => {
      const { container } = render(<CardSkeleton />);

      const header = container.querySelector('.bg-gradient-to-r');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('from-gray-300', 'to-gray-400');
    });

    it('renders content section with skeleton items', () => {
      const { container } = render(<CardSkeleton />);

      const skeletonItems = container.querySelectorAll('.flex.items-center.gap-3');
      expect(skeletonItems).toHaveLength(4); // Should have 4 skeleton items
    });

    it('renders avatar placeholders', () => {
      const { container } = render(<CardSkeleton />);

      const avatars = container.querySelectorAll('.w-8.h-8.bg-gray-200.rounded-full');
      expect(avatars).toHaveLength(4); // One avatar per skeleton item
    });

    it('renders text placeholders', () => {
      const { container } = render(<CardSkeleton />);

      const textPlaceholders = container.querySelectorAll('.h-4.bg-gray-200');
      expect(textPlaceholders.length).toBeGreaterThan(0);
    });

    it('applies dark mode styles', () => {
      const { container } = render(<CardSkeleton />);

      expect(container.firstChild).toHaveClass('dark:bg-gray-800');

      const header = container.querySelector('.bg-gradient-to-r');
      expect(header).toHaveClass('dark:from-gray-600', 'dark:to-gray-700');
    });
  });

  describe('PageLoadingSpinner', () => {
    it('renders with default props', () => {
      render(<PageLoadingSpinner />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      const loadingTexts = screen.getAllByText('Loading...');
      expect(loadingTexts.length).toBeGreaterThan(0);
    });

    it('renders with custom text', () => {
      render(<PageLoadingSpinner text="Please wait..." />);

      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('has proper layout structure', () => {
      const { container } = render(<PageLoadingSpinner />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'min-h-[200px]',
        'space-y-4'
      );
    });

    it('uses large spinner', () => {
      render(<PageLoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('h-8', 'w-8'); // lg size
    });

    it('applies correct text styling', () => {
      render(<PageLoadingSpinner />);

      const texts = screen.getAllByText('Loading...');
      const text = texts.find(el => el.tagName === 'P'); // Get the paragraph element, not the sr-only span
      expect(text).toHaveClass('text-gray-600', 'dark:text-gray-400', 'text-lg');
    });
  });

  describe('CardLoadingSpinner', () => {
    it('renders with default props', () => {
      render(<CardLoadingSpinner />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      const loadingTexts = screen.getAllByText('Loading...');
      expect(loadingTexts.length).toBeGreaterThan(0);
    });

    it('renders with custom text', () => {
      render(<CardLoadingSpinner text="Fetching data..." />);

      expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    });

    it('has proper layout structure', () => {
      const { container } = render(<CardLoadingSpinner />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'p-8',
        'space-y-3'
      );
    });

    it('uses medium spinner', () => {
      render(<CardLoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('h-6', 'w-6'); // md size
    });

    it('applies correct text styling', () => {
      render(<CardLoadingSpinner />);

      const texts = screen.getAllByText('Loading...');
      const text = texts.find(el => el.tagName === 'P'); // Get the paragraph element, not the sr-only span
      expect(text).toHaveClass('text-gray-600', 'dark:text-gray-400', 'text-sm');
    });
  });

  describe('InlineLoadingSpinner', () => {
    it('renders with correct size', () => {
      render(<InlineLoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('h-4', 'w-4'); // sm size
    });

    it('uses primary color', () => {
      render(<InlineLoadingSpinner />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('text-blue-600');
    });

    it('has loading spinner test id', () => {
      render(<InlineLoadingSpinner />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('renders without additional wrapper', () => {
      const { container } = render(<InlineLoadingSpinner />);

      // Should be a direct spinner without wrapper divs
      expect(container.firstChild).toHaveAttribute('data-testid', 'loading-spinner');
    });
  });

  describe('Component Integration', () => {
    it('all components render without errors', () => {
      const TestComponent = () => (
        <div>
          <SkeletonLoader lines={2} />
          <CardSkeleton />
          <PageLoadingSpinner text="Loading page..." />
          <CardLoadingSpinner text="Loading card..." />
          <InlineLoadingSpinner />
        </div>
      );

      render(<TestComponent />);

      expect(screen.getByText('Loading page...')).toBeInTheDocument();
      expect(screen.getByText('Loading card...')).toBeInTheDocument();
      expect(screen.getAllByTestId('loading-spinner')).toHaveLength(3);
    });

    it('components can be nested within each other', () => {
      const NestedComponent = () => (
        <div>
          <PageLoadingSpinner />
          <div>
            <CardLoadingSpinner />
            <SkeletonLoader lines={1} />
          </div>
        </div>
      );

      render(<NestedComponent />);

      expect(screen.getAllByTestId('loading-spinner')).toHaveLength(2);
      expect(screen.getAllByText('Loading...')).toHaveLength(4); // Each spinner has sr-only + visible text
    });
  });

  describe('Responsive Design', () => {
    it('skeleton components adapt to different screen sizes', () => {
      const { container } = render(<CardSkeleton />);

      // Should have responsive classes
      expect(container.firstChild).toHaveClass('rounded-xl');
    });

    it('page loading spinner maintains center alignment', () => {
      const { container } = render(<PageLoadingSpinner />);

      expect(container.firstChild).toHaveClass('items-center', 'justify-center');
    });
  });
});

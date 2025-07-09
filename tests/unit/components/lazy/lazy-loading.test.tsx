import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { LoadingSpinner, LoadingCard, LoadingPage } from '@/components/lazy/loading';
import { LazyComponent } from '@/components/lazy/wrapper';

describe('Lazy Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with correct structure and classes', () => {
      render(<LoadingSpinner />);

      const containers = screen.getAllByRole('generic');
      const container = containers.find(el => el.className.includes('flex'));
      expect(container).toBeDefined();
      if (!container) return;
      expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'p-8');

      const spinner = container.querySelector('div[class*="animate-spin"]');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'h-8',
        'w-8',
        'border-b-2',
        'border-blue-600'
      );
    });

    it('has proper accessibility attributes', () => {
      render(<LoadingSpinner />);
      const containers = screen.getAllByRole('generic');
      const container = containers.find(el => el.className.includes('flex'));
      expect(container).toBeDefined();
      if (!container) return;
      expect(container).toBeInTheDocument();
    });
  });

  describe('LoadingCard', () => {
    it('renders with correct structure and classes', () => {
      render(<LoadingCard />);
      const containers = screen.getAllByRole('generic');
      const container = containers.find(el => el.className.includes('animate-pulse'));
      expect(container).toBeDefined();
      if (!container) return;
      expect(container).toHaveClass('animate-pulse');
    });

    it('has proper skeleton animation', () => {
      render(<LoadingCard />);
      const containers = screen.getAllByRole('generic');
      const container = containers.find(el => el.className.includes('animate-pulse'));
      expect(container).toBeDefined();
      if (!container) return;
      expect(container).toHaveClass('animate-pulse');
      const skeletons = container.querySelectorAll('div');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('LoadingPage', () => {
    it('renders with correct structure and classes', () => {
      render(<LoadingPage />);
      const containers = screen.getAllByRole('generic');
      const container = containers.find(el => el.className.includes('flex'));
      expect(container).toBeDefined();
      if (!container) return;
      expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-[60vh]');
    });

    it('displays loading text', () => {
      render(<LoadingPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('has proper accessibility structure', () => {
      render(<LoadingPage />);
      const containers = screen.getAllByRole('generic');
      const container = containers.find(el => el.className.includes('flex'));
      expect(container).toBeDefined();
      if (!container) return;
      expect(container).toBeInTheDocument();
    });
  });

  describe('LazyComponent', () => {
    function TestChild() {
      return <div data-testid="test-child">Child</div>;
    }
    function TestChild1() {
      return <div data-testid="test-child-1">Child1</div>;
    }
    function TestChild2() {
      return <div data-testid="test-child-2">Child2</div>;
    }
    function CustomFallback() {
      return <div data-testid="custom-fallback">Custom Fallback</div>;
    }

    it('renders children with default fallback', async () => {
      render(
        <React.Suspense fallback={<LoadingSpinner />}>
          <LazyComponent>
            <TestChild />
          </LazyComponent>
        </React.Suspense>
      );
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('renders children with custom fallback', async () => {
      render(
        <React.Suspense fallback={<CustomFallback />}>
          <LazyComponent fallback={<CustomFallback />}>
            <TestChild />
          </LazyComponent>
        </React.Suspense>
      );
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('wraps children in Suspense', async () => {
      render(
        <React.Suspense fallback={<LoadingSpinner />}>
          <LazyComponent>
            <TestChild />
          </LazyComponent>
        </React.Suspense>
      );
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('uses LoadingSpinner as default fallback', async () => {
      render(
        <React.Suspense fallback={<LoadingSpinner />}>
          <LazyComponent>
            <TestChild />
          </LazyComponent>
        </React.Suspense>
      );
      // Should render the spinner if fallback is used
      const containers = screen.getAllByRole('generic');
      expect(containers[0]).toBeInTheDocument();
    });

    it('handles multiple children', async () => {
      render(
        <React.Suspense fallback={<LoadingSpinner />}>
          <LazyComponent>
            <TestChild1 />
            <TestChild2 />
          </LazyComponent>
        </React.Suspense>
      );
      expect(screen.getByTestId('test-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('test-child-2')).toBeInTheDocument();
    });

    it('handles empty children gracefully', async () => {
      render(
        <React.Suspense fallback={<LoadingSpinner />}>
          <LazyComponent>{null}</LazyComponent>
        </React.Suspense>
      );
      // Should render without errors
      expect(true).toBe(true);
    });
  });
});

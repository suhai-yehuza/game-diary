import { render, screen } from '@testing-library/react';
import React, { Suspense } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Next.js dynamic imports
vi.mock('next/dynamic', () => ({
  default: (importFn: () => Promise<any>, options: any) => {
    const MockComponent = () => {
      const [Component, setComponent] = React.useState<React.ComponentType | null>(null);
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        // Simulate dynamic import
        const timeoutId = setTimeout(() => {
          setComponent(() => () => <div data-testid="dynamic-component">Dynamic Component</div>);
          setLoading(false);
        }, 100);

        // Cleanup timeout on unmount
        return () => clearTimeout(timeoutId);
      }, []);

      if (loading) {
        return options?.loading ? options.loading() : <div>Loading...</div>;
      }

      return Component ? <Component /> : null;
    };

    return MockComponent;
  },
}));

import { LazyAdminExperimentalPage } from '@/components/lazy';

describe('Extended Lazy Loading Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining timeouts
    vi.clearAllTimers();
  });

  describe('LazyAdminExperimentalPage', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyAdminExperimentalPage />
        </Suspense>
      );

      expect(screen.getByText('Loading admin panel...')).toBeInTheDocument();
    });

    it('renders admin panel content after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyAdminExperimentalPage />
        </Suspense>
      );

      // Wait for dynamic component to load
      const dynamicComponent = await screen.findByTestId('dynamic-component');
      expect(dynamicComponent).toBeInTheDocument();
      expect(dynamicComponent).toHaveTextContent('Dynamic Component');
    });
  });
});

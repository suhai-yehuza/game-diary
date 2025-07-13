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

import {
  LazyAdminExperimentalPage,
  LazyLiveGamesDetail,
  LazyUserPage,
  LazyNBAPage,
  LazyNFLPage,
  LazyMLBPage,
  LazyNHLPage,
  LazyMLSPage,
} from '@src/components/lazy';

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

  describe('LazyLiveGamesDetail', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyLiveGamesDetail data={undefined} />
        </Suspense>
      );

      // There are multiple elements with role 'generic', so filter for the container
      const containers = screen.getAllByRole('generic');
      // The outermost container should have the expected classes
      const loadingContainer = containers.find(el =>
        el.className.includes('flex items-center justify-center p-8')
      );
      expect(loadingContainer).toBeDefined();
      expect(loadingContainer).toHaveClass('flex', 'items-center', 'justify-center', 'p-8');
    });

    it('renders live games detail content after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyLiveGamesDetail data={undefined} />
        </Suspense>
      );

      // Wait for dynamic component to load
      const dynamicComponent = await screen.findByTestId('dynamic-component');
      expect(dynamicComponent).toBeInTheDocument();
      expect(dynamicComponent).toHaveTextContent('Dynamic Component');
    });
  });

  describe('LazyUserPage', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyUserPage />
        </Suspense>
      );

      expect(screen.getByText('Loading user dashboard...')).toBeInTheDocument();
    });

    it('renders user page content after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyUserPage />
        </Suspense>
      );

      // Wait for dynamic component to load
      const dynamicComponent = await screen.findByTestId('dynamic-component');
      expect(dynamicComponent).toBeInTheDocument();
      expect(dynamicComponent).toHaveTextContent('Dynamic Component');
    });
  });

  describe('LazyNBAPage', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyNBAPage />
        </Suspense>
      );

      expect(screen.getByText('Loading NBA page...')).toBeInTheDocument();
    });

    it('renders NBA page content after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyNBAPage />
        </Suspense>
      );

      // Wait for dynamic component to load
      const dynamicComponent = await screen.findByTestId('dynamic-component');
      expect(dynamicComponent).toBeInTheDocument();
      expect(dynamicComponent).toHaveTextContent('Dynamic Component');
    });
  });

  describe('LazyNFLPage', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyNFLPage />
        </Suspense>
      );

      expect(screen.getByText('Loading NFL page...')).toBeInTheDocument();
    });

    it('renders NFL page content after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyNFLPage />
        </Suspense>
      );

      // Wait for dynamic component to load
      const dynamicComponent = await screen.findByTestId('dynamic-component');
      expect(dynamicComponent).toBeInTheDocument();
      expect(dynamicComponent).toHaveTextContent('Dynamic Component');
    });
  });

  describe('LazyMLBPage', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyMLBPage />
        </Suspense>
      );

      expect(screen.getByText('Loading MLB page...')).toBeInTheDocument();
    });

    it('renders MLB page content after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyMLBPage />
        </Suspense>
      );

      // Wait for dynamic component to load
      const dynamicComponent = await screen.findByTestId('dynamic-component');
      expect(dynamicComponent).toBeInTheDocument();
      expect(dynamicComponent).toHaveTextContent('Dynamic Component');
    });
  });

  describe('LazyNHLPage', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyNHLPage />
        </Suspense>
      );

      expect(screen.getByText('Loading NHL page...')).toBeInTheDocument();
    });

    it('renders NHL page content after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyNHLPage />
        </Suspense>
      );

      // Wait for dynamic component to load
      const dynamicComponent = await screen.findByTestId('dynamic-component');
      expect(dynamicComponent).toBeInTheDocument();
      expect(dynamicComponent).toHaveTextContent('Dynamic Component');
    });
  });

  describe('LazyMLSPage', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyMLSPage />
        </Suspense>
      );

      expect(screen.getByText('Loading MLS page...')).toBeInTheDocument();
    });

    it('renders MLS page content after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyMLSPage />
        </Suspense>
      );

      // Wait for dynamic component to load
      const dynamicComponent = await screen.findByTestId('dynamic-component');
      expect(dynamicComponent).toBeInTheDocument();
      expect(dynamicComponent).toHaveTextContent('Dynamic Component');
    });
  });
});

import { render, screen } from '@testing-library/react';
import React, { Suspense } from 'react';
import { describe, it, expect, vi } from 'vitest';

// Mock Next.js dynamic imports
vi.mock('next/dynamic', () => ({
  default: (importFn: () => Promise<any>, options: any) => {
    const MockComponent = () => {
      const [Component, setComponent] = React.useState<React.ComponentType | null>(null);
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        // Simulate dynamic import
        setTimeout(() => {
          setComponent(() => () => <div data-testid="dynamic-component">Dynamic Component</div>);
          setLoading(false);
        }, 100);
      }, []);

      if (loading) {
        return options.loading ? options.loading() : <div>Loading...</div>;
      }

      return Component ? <Component /> : null;
    };

    return MockComponent;
  },
}));

// Import the components after mocking
import {
  LazyAdminExperimentalPage,
  LazyLiveGamesDetail,
  LazyUserPage,
  LazyClientPage,
  LazyAdminDatabasePage,
  LazyDashboardPage,
  LazyNBAPage,
  LazyNFLPage,
  LazyMLBPage,
  LazyNHLPage,
  LazyMLSPage,
  LazyLivePage,
  LazyAllSportsPage,
} from '@src/components/lazy';

describe('Lazy Loading Components - Extended', () => {
  describe('LazyAdminExperimentalPage', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyAdminExperimentalPage />
        </Suspense>
      );

      expect(screen.getByText('Loading admin panel...')).toBeInTheDocument();
      expect(screen.getByText('Loading admin panel...')).toHaveClass('text-gray-600');
    });

    it('renders dynamic component after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyAdminExperimentalPage />
        </Suspense>
      );

      // Wait for dynamic component to load
      await screen.findByTestId('dynamic-component');
      expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
    });

    it('has proper loading structure', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyAdminExperimentalPage />
        </Suspense>
      );

      const loadingContainer = screen.getByText('Loading admin panel...').parentElement;
      expect(loadingContainer).toHaveClass('text-center');

      const spinner = loadingContainer?.querySelector('.animate-spin');
      expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-blue-600');
    });
  });

  describe('LazyLiveGamesDetail', () => {
    it('renders loading state initially', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyLiveGamesDetail />
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

    it('renders dynamic component after loading', async () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyLiveGamesDetail />
        </Suspense>
      );

      await screen.findByTestId('dynamic-component');
      expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
    });

    it('has proper loading spinner structure', () => {
      render(
        <Suspense fallback={<div>Fallback</div>}>
          <LazyLiveGamesDetail />
        </Suspense>
      );

      // There are multiple elements with role 'generic', so filter for the container
      const containers = screen.getAllByRole('generic');
      const loadingContainer = containers.find(el =>
        el.className.includes('flex items-center justify-center p-8')
      );
      expect(loadingContainer).toBeDefined();
      const spinner = loadingContainer?.querySelector('.animate-spin');
      expect(spinner).toHaveClass('rounded-full', 'h-8', 'w-8', 'border-b-2', 'border-blue-600');
    });
  });

  describe('Protected Pages Lazy Components', () => {
    describe('LazyUserPage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyUserPage />
          </Suspense>
        );

        expect(screen.getByText('Loading user dashboard...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyUserPage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading user dashboard...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });

    describe('LazyClientPage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyClientPage />
          </Suspense>
        );

        expect(screen.getByText('Loading client dashboard...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyClientPage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading client dashboard...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });

    describe('LazyAdminDatabasePage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyAdminDatabasePage />
          </Suspense>
        );

        expect(screen.getByText('Loading admin database...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyAdminDatabasePage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading admin database...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });

    describe('LazyDashboardPage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyDashboardPage />
          </Suspense>
        );

        expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyDashboardPage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading dashboard...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });
  });

  describe('Sports Pages Lazy Components', () => {
    describe('LazyNBAPage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyNBAPage />
          </Suspense>
        );

        expect(screen.getByText('Loading NBA page...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyNBAPage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading NBA page...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });

    describe('LazyNFLPage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyNFLPage />
          </Suspense>
        );

        expect(screen.getByText('Loading NFL page...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyNFLPage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading NFL page...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });

    describe('LazyMLBPage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyMLBPage />
          </Suspense>
        );

        expect(screen.getByText('Loading MLB page...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyMLBPage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading MLB page...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });

    describe('LazyNHLPage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyNHLPage />
          </Suspense>
        );

        expect(screen.getByText('Loading NHL page...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyNHLPage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading NHL page...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });

    describe('LazyMLSPage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyMLSPage />
          </Suspense>
        );

        expect(screen.getByText('Loading MLS page...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyMLSPage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading MLS page...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });

    describe('LazyLivePage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyLivePage />
          </Suspense>
        );

        expect(screen.getByText('Loading live games...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyLivePage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading live games...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });

    describe('LazyAllSportsPage', () => {
      it('renders loading state with correct text', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyAllSportsPage />
          </Suspense>
        );

        expect(screen.getByText('Loading all sports...')).toBeInTheDocument();
      });

      it('has proper loading structure', () => {
        render(
          <Suspense fallback={<div>Fallback</div>}>
            <LazyAllSportsPage />
          </Suspense>
        );

        const loadingContainer = screen.getByText('Loading all sports...').parentElement;
        expect(loadingContainer).toHaveClass('text-center');
      });
    });
  });

  describe('Common Loading Structure Validation', () => {
    it('all sports page components have consistent loading structure', () => {
      const components = [
        { Component: LazyNBAPage, text: 'Loading NBA page...' },
        { Component: LazyNFLPage, text: 'Loading NFL page...' },
        { Component: LazyMLBPage, text: 'Loading MLB page...' },
        { Component: LazyNHLPage, text: 'Loading NHL page...' },
        { Component: LazyMLSPage, text: 'Loading MLS page...' },
        { Component: LazyLivePage, text: 'Loading live games...' },
        { Component: LazyAllSportsPage, text: 'Loading all sports...' },
      ];

      components.forEach(({ Component, text }) => {
        const { unmount } = render(
          <Suspense fallback={<div>Fallback</div>}>
            <Component />
          </Suspense>
        );

        const loadingText = screen.getByText(text);
        expect(loadingText).toBeInTheDocument();
        expect(loadingText).toHaveClass('text-gray-600', 'dark:text-gray-300');

        const container = loadingText.parentElement;
        expect(container).toHaveClass('text-center');

        const spinner = container?.querySelector('.animate-spin');
        expect(spinner).toHaveClass(
          'rounded-full',
          'h-12',
          'w-12',
          'border-b-2',
          'border-blue-600'
        );

        unmount();
      });
    });

    it('all protected page components have consistent loading structure', () => {
      const components = [
        { Component: LazyUserPage, text: 'Loading user dashboard...' },
        { Component: LazyClientPage, text: 'Loading client dashboard...' },
        { Component: LazyAdminDatabasePage, text: 'Loading admin database...' },
        { Component: LazyDashboardPage, text: 'Loading dashboard...' },
      ];

      components.forEach(({ Component, text }) => {
        const { unmount } = render(
          <Suspense fallback={<div>Fallback</div>}>
            <Component />
          </Suspense>
        );

        const loadingText = screen.getByText(text);
        expect(loadingText).toBeInTheDocument();
        expect(loadingText).toHaveClass('text-gray-600', 'dark:text-gray-300');

        const container = loadingText.parentElement;
        expect(container).toHaveClass('text-center');

        const spinner = container?.querySelector('.animate-spin');
        expect(spinner).toHaveClass(
          'rounded-full',
          'h-12',
          'w-12',
          'border-b-2',
          'border-blue-600'
        );

        unmount();
      });
    });
  });
});

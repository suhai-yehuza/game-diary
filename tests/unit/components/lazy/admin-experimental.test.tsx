import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LazyAdminExperimentalPage } from '@/components/lazy/admin-experimental';

// Mock Next.js dynamic import
vi.mock('next/dynamic', () => ({
  default: (importFn: () => Promise<any>, options: any) => {
    const Component = () => {
      if (options.loading) {
        return options.loading();
      }
      return <div data-testid="dynamic-component">Dynamic Component</div>;
    };
    Component.displayName = 'DynamicComponent';
    return Component;
  },
}));

describe('LazyAdminExperimentalPage', () => {
  it('renders the lazy loading component', () => {
    render(<LazyAdminExperimentalPage />);

    expect(screen.getByText('Loading admin panel...')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => render(<LazyAdminExperimentalPage />)).not.toThrow();
  });

  it('has the correct component structure', () => {
    const { container } = render(<LazyAdminExperimentalPage />);

    const loadingElement = container.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });
});

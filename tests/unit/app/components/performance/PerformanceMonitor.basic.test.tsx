import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PerformanceMonitor } from '@/app/components/performance/PerformanceMonitor';

// Mock performance API
const mockPerformance = {
  getEntriesByType: vi.fn(),
};

// Mock window object
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock process.env
const originalEnv = process.env;

describe('PerformanceMonitor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };

    // Mock document.readyState
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
    });

    // Mock window.addEventListener and removeEventListener
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('renders nothing in production by default', () => {
    (process.env as any).NODE_ENV = 'production';
    (process.env as any).NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR = 'false';

    const { container } = render(<PerformanceMonitor />);
    expect(container.firstChild).toBeNull();
  });

  it('renders in development mode', () => {
    (process.env as any).NODE_ENV = 'development';

    render(<PerformanceMonitor />);
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });

  it('renders when explicitly enabled', () => {
    (process.env as any).NODE_ENV = 'production';
    (process.env as any).NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR = 'true';

    render(<PerformanceMonitor />);
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });

  it('displays initial metrics', () => {
    (process.env as any).NODE_ENV = 'development';

    render(<PerformanceMonitor />);
    expect(screen.getByText('Queries: 0')).toBeInTheDocument();
    expect(screen.getByText('Avg Time: 0ms')).toBeInTheDocument();
    expect(screen.getByText('Slow Queries: 0')).toBeInTheDocument();
    expect(screen.getByText('Load Time: 0ms')).toBeInTheDocument();
  });

  it('tracks page load time when document is already complete', () => {
    (process.env as any).NODE_ENV = 'development';
    (document as any).readyState = 'complete';

    const mockNavigation = {
      loadEventEnd: 1000,
      loadEventStart: 500,
      domContentLoadedEventEnd: 800,
      fetchStart: 100,
    };

    mockPerformance.getEntriesByType.mockReturnValue([mockNavigation]);

    render(<PerformanceMonitor />);

    expect(screen.getByText('Load Time: 500ms')).toBeInTheDocument();
  });

  it('handles negative load time gracefully', () => {
    (process.env as any).NODE_ENV = 'development';
    (document as any).readyState = 'complete';

    const mockNavigation = {
      loadEventEnd: 500,
      loadEventStart: 1000, // Negative load time
      domContentLoadedEventEnd: 800,
      fetchStart: 100,
    };

    mockPerformance.getEntriesByType.mockReturnValue([mockNavigation]);

    render(<PerformanceMonitor />);

    expect(screen.getByText('Load Time: 700ms')).toBeInTheDocument();
  });

  it('handles zero load time gracefully', () => {
    (process.env as any).NODE_ENV = 'development';
    (document as any).readyState = 'complete';

    const mockNavigation = {
      loadEventEnd: 500,
      loadEventStart: 500, // Zero load time
      domContentLoadedEventEnd: 500,
      fetchStart: 500, // Also zero fallback
    };

    mockPerformance.getEntriesByType.mockReturnValue([mockNavigation]);

    render(<PerformanceMonitor />);

    expect(screen.getByText('Load Time: 0ms')).toBeInTheDocument();
  });

  it('handles missing navigation timing', () => {
    (process.env as any).NODE_ENV = 'development';
    (document as any).readyState = 'complete';

    mockPerformance.getEntriesByType.mockReturnValue([]);

    render(<PerformanceMonitor />);

    expect(screen.getByText('Load Time: 0ms')).toBeInTheDocument();
  });

  it('adds event listeners on mount', () => {
    (process.env as any).NODE_ENV = 'development';

    render(<PerformanceMonitor />);

    expect(window.addEventListener).toHaveBeenCalledWith('slow-query', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('query-complete', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
  });

  it('removes event listeners on unmount', () => {
    (process.env as any).NODE_ENV = 'development';

    const { unmount } = render(<PerformanceMonitor />);

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('slow-query', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('query-complete', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function));
  });

  it('applies correct CSS classes', () => {
    (process.env as any).NODE_ENV = 'development';

    render(<PerformanceMonitor />);

    const container = screen.getByText('Performance Monitor').closest('div')?.parentElement;
    expect(container).toHaveClass(
      'fixed',
      'bottom-4',
      'right-4',
      'bg-black/90',
      'text-white',
      'p-4',
      'rounded-lg',
      'text-xs',
      'font-mono',
      'z-[9999]',
      'max-w-xs',
      'border',
      'border-white/20',
      'shadow-2xl'
    );
  });

  it('handles undefined environment variables', () => {
    delete (process.env as any).NODE_ENV;
    delete (process.env as any).NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR;

    const { container } = render(<PerformanceMonitor />);
    expect(container.firstChild).toBeNull();
  });

  it('handles empty string environment variables', () => {
    (process.env as any).NODE_ENV = '';
    (process.env as any).NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR = '';

    const { container } = render(<PerformanceMonitor />);
    expect(container.firstChild).toBeNull();
  });

  it('handles case insensitive environment variables', () => {
    (process.env as any).NODE_ENV = 'DEVELOPMENT';
    (process.env as any).NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR = 'TRUE';

    render(<PerformanceMonitor />);
    // Should not render because the component checks for exact string matches
    expect(screen.queryByText('Performance Monitor')).not.toBeInTheDocument();
  });
});

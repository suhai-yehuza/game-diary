import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { BackgroundCacheWarmer } from '@/app/components/landing/BackgroundCacheWarmer';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('BackgroundCacheWarmer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    vi.useFakeTimers();

    // Reset logger mocks
    const { logger } = await import('@/lib/utils/logger');
    vi.mocked(logger.info).mockClear();
    vi.mocked(logger.warn).mockClear();
    vi.mocked(logger.error).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(<BackgroundCacheWarmer />);
    expect(container.firstChild).toBeNull();
  });

  it('starts cache warming after delay', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    render(<BackgroundCacheWarmer />);

    // Should not start immediately
    expect(mockFetch).not.toHaveBeenCalled();

    // Fast-forward past the delay
    vi.advanceTimersByTime(1000);

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  it('warms all required cache endpoints', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    render(<BackgroundCacheWarmer />);

    vi.advanceTimersByTime(1000);

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/landing-page/data/trendingContent');
      expect(mockFetch).toHaveBeenCalledWith('/api/landing-page/data/recentGames');
      expect(mockFetch).toHaveBeenCalledWith('/api/landing-page/data/popularGames');
    });
  });

  it('logs successful cache warming start', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    render(<BackgroundCacheWarmer />);

    vi.advanceTimersByTime(1000);

    await vi.waitFor(async () => {
      const { logger } = await import('@/lib/utils/logger');
      expect(logger.info).toHaveBeenCalledWith(
        '🔥 Starting background cache warming for landing page...'
      );
      expect(logger.info).toHaveBeenCalledWith('✅ Background cache warming completed');
    });
  });

  it('handles cache warming failures gracefully', async () => {
    const error = new Error('Network error');
    mockFetch.mockRejectedValue(error);

    render(<BackgroundCacheWarmer />);

    vi.advanceTimersByTime(1000);

    await vi.waitFor(async () => {
      const { logger } = await import('@/lib/utils/logger');
      expect(logger.warn).toHaveBeenCalledWith('Failed to warm trending content cache:', error);
      expect(logger.warn).toHaveBeenCalledWith('Failed to warm recent games cache:', error);
      expect(logger.warn).toHaveBeenCalledWith('Failed to warm popular games cache:', error);
    });
  });

  it('handles mixed success and failure scenarios', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true }) // trendingContent succeeds
      .mockRejectedValueOnce(new Error('Recent games failed')) // recentGames fails
      .mockResolvedValueOnce({ ok: true }); // popularGames succeeds

    render(<BackgroundCacheWarmer />);

    vi.advanceTimersByTime(1000);

    await vi.waitFor(async () => {
      const { logger } = await import('@/lib/utils/logger');
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to warm recent games cache:',
        expect.any(Error)
      );
      expect(logger.info).toHaveBeenCalledWith('✅ Background cache warming completed');
    });
  });

  it('handles unexpected errors during cache warming', async () => {
    // Mock an error that occurs during the cache warming process
    mockFetch.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    render(<BackgroundCacheWarmer />);

    vi.advanceTimersByTime(1000);

    await vi.waitFor(async () => {
      const { logger } = await import('@/lib/utils/logger');
      expect(logger.error).toHaveBeenCalledWith('❌ Background cache warming failed:', {
        error: 'Error: Unexpected error',
      });
    });
  });

  it('cleans up timeout on unmount', () => {
    const { unmount } = render(<BackgroundCacheWarmer />);

    // Should not have started warming yet
    expect(mockFetch).not.toHaveBeenCalled();

    unmount();

    // Fast-forward time - should not trigger warming after unmount
    vi.advanceTimersByTime(1000);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('uses Promise.allSettled for parallel cache warming', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    render(<BackgroundCacheWarmer />);

    vi.advanceTimersByTime(1000);

    await vi.waitFor(() => {
      // All three requests should be made in parallel
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  it('does not block page rendering', () => {
    const { container } = render(<BackgroundCacheWarmer />);

    // Component should render immediately without blocking
    expect(container.firstChild).toBeNull();

    // Should not have started warming yet
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('handles component re-mounting correctly', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    const { unmount } = render(<BackgroundCacheWarmer />);

    // Unmount before warming starts
    unmount();

    // Re-mount
    render(<BackgroundCacheWarmer />);

    vi.advanceTimersByTime(1000);

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});

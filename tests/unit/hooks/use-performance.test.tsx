import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { usePerformance } from '@src/hooks/use-performance';

// Mock performance API
const mockPerformance = {
  now: vi.fn(),
  memory: {
    usedJSHeapSize: 1024 * 1024, // 1MB
  },
};

// Mock console methods
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe('usePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global performance
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true,
    });

    // Mock console methods
    global.console.log = mockConsoleLog;
    global.console.error = mockConsoleError;

    // Mock Date.now
    vi.spyOn(Date, 'now').mockImplementation(() => 1000);

    // Mock process.env.NODE_ENV
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => usePerformance({ componentName: 'TestComponent' }));

    expect(result.current).toHaveProperty('measureAsync');
    expect(result.current).toHaveProperty('measureSync');
    expect(result.current).toHaveProperty('trackRender');
  });

  it('should initialize with custom options', () => {
    const customOptions = {
      componentName: 'CustomComponent',
      enableMemoryTracking: true,
      enableRenderTracking: false,
      onMetrics: vi.fn(),
    };

    const { result } = renderHook(() => usePerformance(customOptions));

    expect(result.current).toHaveProperty('measureAsync');
    expect(result.current).toHaveProperty('measureSync');
    expect(result.current).toHaveProperty('trackRender');
  });

  it('should track render performance when enabled', () => {
    const onMetrics = vi.fn();
    const { result } = renderHook(() =>
      usePerformance({
        componentName: 'TestComponent',
        enableRenderTracking: true,
        onMetrics,
      })
    );

    // Simulate a render
    act(() => {
      result.current.trackRender();
    });

    expect(onMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        componentName: 'TestComponent',
        mountTime: expect.any(Number),
        renderTime: expect.any(Number),
        timestamp: expect.any(String),
      })
    );
  });

  it('should not track render performance when disabled', () => {
    const onMetrics = vi.fn();
    const { result } = renderHook(() =>
      usePerformance({
        componentName: 'TestComponent',
        enableRenderTracking: false,
        onMetrics,
      })
    );

    // Simulate a render
    act(() => {
      result.current.trackRender();
    });

    expect(onMetrics).not.toHaveBeenCalled();
  });

  it('should include memory usage when enabled and available', () => {
    const onMetrics = vi.fn();
    const { result } = renderHook(() =>
      usePerformance({
        componentName: 'TestComponent',
        enableMemoryTracking: true,
        onMetrics,
      })
    );

    // Simulate a render
    act(() => {
      result.current.trackRender();
    });

    expect(onMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        componentName: 'TestComponent',
        mountTime: expect.any(Number),
        renderTime: expect.any(Number),
        timestamp: expect.any(String),
        memoryUsage: 1024 * 1024, // 1MB
      })
    );
  });

  it('should not include memory usage when disabled', () => {
    const onMetrics = vi.fn();
    const { result } = renderHook(() =>
      usePerformance({
        componentName: 'TestComponent',
        enableMemoryTracking: false,
        onMetrics,
      })
    );

    // Simulate a render
    act(() => {
      result.current.trackRender();
    });

    expect(onMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        componentName: 'TestComponent',
        mountTime: expect.any(Number),
        renderTime: expect.any(Number),
        timestamp: expect.any(String),
      })
    );

    expect(onMetrics.mock.calls[0][0]).not.toHaveProperty('memoryUsage');
  });

  it('should handle missing memory API gracefully', () => {
    // Mock performance without memory
    const performanceWithoutMemory = {
      now: vi.fn(),
    };

    Object.defineProperty(global, 'performance', {
      value: performanceWithoutMemory,
      writable: true,
    });

    const onMetrics = vi.fn();
    const { result } = renderHook(() =>
      usePerformance({
        componentName: 'TestComponent',
        enableMemoryTracking: true,
        onMetrics,
      })
    );

    // Simulate a render
    act(() => {
      result.current.trackRender();
    });

    expect(onMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        componentName: 'TestComponent',
        mountTime: expect.any(Number),
        renderTime: expect.any(Number),
        timestamp: expect.any(String),
      })
    );

    expect(onMetrics.mock.calls[0][0]).not.toHaveProperty('memoryUsage');
  });

  it('should measure async operations correctly', async () => {
    const { result } = renderHook(() => usePerformance({ componentName: 'TestComponent' }));

    mockPerformance.now
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1100); // End time (100ms later)

    const asyncOperation = vi.fn().mockResolvedValue('async result');

    let operationResult;
    await act(async () => {
      operationResult = await result.current.measureAsync('testOperation', asyncOperation);
    });

    expect(operationResult).toBe('async result');
    expect(asyncOperation).toHaveBeenCalledTimes(1);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Performance] TestComponent - testOperation: 100.00ms'
    );
  });

  it('should handle async operation errors', async () => {
    const { result } = renderHook(() => usePerformance({ componentName: 'TestComponent' }));

    mockPerformance.now
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1100); // End time (100ms later)

    const asyncOperation = vi.fn().mockRejectedValue(new Error('Async error'));

    await expect(
      act(async () => {
        await result.current.measureAsync('testOperation', asyncOperation);
      })
    ).rejects.toThrow('Async error');

    expect(asyncOperation).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith(
      '[Performance] TestComponent - testOperation failed after 100.00ms:',
      expect.any(Error)
    );
  });

  it('should measure sync operations correctly', () => {
    const { result } = renderHook(() => usePerformance({ componentName: 'TestComponent' }));

    mockPerformance.now
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1100); // End time (100ms later)

    const syncOperation = vi.fn().mockReturnValue('sync result');

    let operationResult;
    act(() => {
      operationResult = result.current.measureSync('testOperation', syncOperation);
    });

    expect(operationResult).toBe('sync result');
    expect(syncOperation).toHaveBeenCalledTimes(1);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Performance] TestComponent - testOperation: 100.00ms'
    );
  });

  it('should handle sync operation errors', () => {
    const { result } = renderHook(() => usePerformance({ componentName: 'TestComponent' }));

    mockPerformance.now
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1100); // End time (100ms later)

    const syncOperation = vi.fn().mockImplementation(() => {
      throw new Error('Sync error');
    });

    expect(() => {
      act(() => {
        result.current.measureSync('testOperation', syncOperation);
      });
    }).toThrow('Sync error');

    expect(syncOperation).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith(
      '[Performance] TestComponent - testOperation failed after 100.00ms:',
      expect.any(Error)
    );
  });

  it('should not log in production environment', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const onMetrics = vi.fn();
    const { result } = renderHook(() =>
      usePerformance({
        componentName: 'TestComponent',
        onMetrics,
      })
    );

    // Simulate a render
    act(() => {
      result.current.trackRender();
    });

    // Should still call onMetrics even in production
    expect(onMetrics).toHaveBeenCalled();
    // But should not log to console
    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('should track component lifecycle', () => {
    const { unmount } = renderHook(() => usePerformance({ componentName: 'TestComponent' }));

    // Mock Date.now for unmount
    vi.spyOn(Date, 'now').mockReturnValue(2000); // 1000ms after mount

    // Unmount the component
    act(() => {
      unmount();
    });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Performance] TestComponent unmounted after 1000ms'
    );
  });

  it('should handle multiple renders correctly', () => {
    const onMetrics = vi.fn();
    const { result, rerender } = renderHook(
      ({ componentName }) =>
        usePerformance({
          componentName,
          onMetrics,
        }),
      { initialProps: { componentName: 'TestComponent' } }
    );

    // The useEffect automatically calls trackRender on mount
    expect(onMetrics).toHaveBeenCalledTimes(1);

    // Manual call to trackRender
    act(() => {
      result.current.trackRender();
    });

    expect(onMetrics).toHaveBeenCalledTimes(2);

    // Second render - useEffect will call trackRender again
    act(() => {
      rerender({ componentName: 'TestComponent' });
    });

    // trackRender should be called again due to useEffect
    expect(onMetrics).toHaveBeenCalledTimes(3);
  });

  it('should handle component name changes', () => {
    const onMetrics = vi.fn();
    const { result, rerender } = renderHook(
      ({ componentName }) =>
        usePerformance({
          componentName,
          onMetrics,
        }),
      { initialProps: { componentName: 'Component1' } }
    );

    // First render
    act(() => {
      result.current.trackRender();
    });

    expect(onMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        componentName: 'Component1',
      })
    );

    // Change component name
    act(() => {
      rerender({ componentName: 'Component2' });
    });

    // Second render with new name
    act(() => {
      result.current.trackRender();
    });

    expect(onMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        componentName: 'Component2',
      })
    );
  });

  it('should handle performance.now with decimal precision', () => {
    const { result } = renderHook(() => usePerformance({ componentName: 'TestComponent' }));

    mockPerformance.now
      .mockReturnValueOnce(1000.123) // Start time
      .mockReturnValueOnce(1100.456); // End time (100.333ms later)

    const syncOperation = vi.fn().mockReturnValue('result');

    act(() => {
      result.current.measureSync('testOperation', syncOperation);
    });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Performance] TestComponent - testOperation: 100.33ms'
    );
  });

  it('should handle very fast operations', () => {
    const { result } = renderHook(() => usePerformance({ componentName: 'TestComponent' }));

    mockPerformance.now
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1000.001); // End time (0.001ms later)

    const syncOperation = vi.fn().mockReturnValue('result');

    act(() => {
      result.current.measureSync('testOperation', syncOperation);
    });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Performance] TestComponent - testOperation: 0.00ms'
    );
  });

  it('should handle very slow operations', () => {
    const { result } = renderHook(() => usePerformance({ componentName: 'TestComponent' }));

    mockPerformance.now
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(60000); // End time (59 seconds later)

    const syncOperation = vi.fn().mockReturnValue('result');

    act(() => {
      result.current.measureSync('testOperation', syncOperation);
    });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      '[Performance] TestComponent - testOperation: 59000.00ms'
    );
  });
});

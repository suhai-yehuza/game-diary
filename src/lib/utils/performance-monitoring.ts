import { analytics } from './analytics';

// Performance metric types
export interface IPerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint

  // Custom metrics
  pageLoadTime?: number;
  componentRenderTime?: number;
  apiResponseTime?: number;
  bundleSize?: number;

  // User experience metrics
  timeToInteractive?: number;
  domContentLoaded?: number;
  windowLoad?: number;
}

// Performance monitoring utility
export const performanceMonitoring = {
  // Track Core Web Vitals
  trackCoreWebVitals: () => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Track Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        analytics.trackPerformance('lcp', lastEntry.startTime, {
          page: window.location.pathname,
          element: (lastEntry as { element?: { tagName?: string } }).element?.tagName || 'unknown',
        });
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const fidEntry = entry as PerformanceEntry & { processingStart: number };
        analytics.trackPerformance('fid', fidEntry.processingStart - entry.startTime, {
          page: window.location.pathname,
          event_type: entry.name,
        });
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const clsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value || 0;
        }
      });
      analytics.trackPerformance('cls', clsValue, {
        page: window.location.pathname,
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  },

  // Track page load performance
  trackPageLoad: (page: string) => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const metrics = {
        ttfb: navigation.responseStart - navigation.requestStart,
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        windowLoad: navigation.loadEventEnd - navigation.loadEventStart,
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      };

      // Track each metric
      Object.entries(metrics).forEach(([key, value]) => {
        if (value > 0) {
          analytics.trackPerformance(key, value, {
            page,
            navigation_type: navigation.type,
          });
        }
      });
    }
  },

  // Track component render performance
  trackComponentRender: (
    componentName: string,
    renderTime: number,
    props?: Record<string, unknown>
  ) => {
    analytics.trackPerformance('component_render_time', renderTime, {
      component: componentName,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      ...props,
    });
  },

  // Track API response times
  trackApiResponse: (endpoint: string, responseTime: number, status: number, method: string) => {
    analytics.trackPerformance('api_response_time', responseTime, {
      endpoint,
      status,
      method,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  },

  // Track bundle size
  trackBundleSize: (bundleName: string, size: number) => {
    analytics.trackPerformance('bundle_size', size, {
      bundle: bundleName,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  },

  // Track user interaction performance
  trackInteraction: (interactionType: string, duration: number, target?: string) => {
    analytics.trackPerformance('interaction_time', duration, {
      interaction_type: interactionType,
      target,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  },

  // Track resource loading performance
  trackResourceLoad: (resourceType: string, loadTime: number, url: string) => {
    analytics.trackPerformance('resource_load_time', loadTime, {
      resource_type: resourceType,
      url: url.substring(0, 100), // Truncate long URLs
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  },

  // Track memory usage (if available)
  trackMemoryUsage: () => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (
        performance as {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;
      if (memory) {
        analytics.trackPerformance('memory_usage', memory.usedJSHeapSize, {
          total_heap: memory.totalJSHeapSize,
          heap_limit: memory.jsHeapSizeLimit,
          page: window.location.pathname,
        });
      }
    }
  },

  // Track network conditions
  trackNetworkConditions: () => {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const connection = (
        navigator as {
          connection?: { effectiveType: string; downlink: number; rtt: number; saveData: boolean };
        }
      ).connection;
      if (connection) {
        analytics.trackPerformance('network_conditions', 0, {
          effective_type: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          save_data: connection.saveData,
          page: window.location.pathname,
        });
      }
    }
  },

  // Initialize all performance monitoring
  initialize: () => {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    performanceMonitoring.trackCoreWebVitals();

    // Track initial page load
    performanceMonitoring.trackPageLoad(window.location.pathname);

    // Track memory usage periodically
    setInterval(() => {
      performanceMonitoring.trackMemoryUsage();
    }, 30000); // Every 30 seconds

    // Track network conditions
    performanceMonitoring.trackNetworkConditions();

    // Track resource loading
    const resourceObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          performanceMonitoring.trackResourceLoad(
            resourceEntry.initiatorType,
            resourceEntry.duration,
            resourceEntry.name
          );
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  },
};

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  return performanceMonitoring;
};

// Performance thresholds for alerts
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals thresholds (Google's recommended values)
  lcp: {
    good: 2500, // 2.5 seconds
    needsImprovement: 4000, // 4 seconds
    poor: 4000, // 4+ seconds
  },
  fid: {
    good: 100, // 100 milliseconds
    needsImprovement: 300, // 300 milliseconds
    poor: 300, // 300+ milliseconds
  },
  cls: {
    good: 0.1, // 0.1
    needsImprovement: 0.25, // 0.25
    poor: 0.25, // 0.25+
  },
  ttfb: {
    good: 800, // 800 milliseconds
    needsImprovement: 1800, // 1.8 seconds
    poor: 1800, // 1.8+ seconds
  },
  fcp: {
    good: 1800, // 1.8 seconds
    needsImprovement: 3000, // 3 seconds
    poor: 3000, // 3+ seconds
  },
  // Custom thresholds
  apiResponseTime: {
    good: 200, // 200 milliseconds
    needsImprovement: 500, // 500 milliseconds
    poor: 500, // 500+ milliseconds
  },
  componentRenderTime: {
    good: 16, // 16 milliseconds (60fps)
    needsImprovement: 33, // 33 milliseconds (30fps)
    poor: 33, // 33+ milliseconds
  },
};

// Performance alert utility
export const performanceAlerts = {
  // Check if a metric exceeds thresholds
  checkThreshold: (metric: string, value: number): 'good' | 'needsImprovement' | 'poor' => {
    const thresholds = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!thresholds) return 'good';

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needsImprovement) return 'needsImprovement';
    return 'poor';
  },

  // Track performance alerts
  trackAlert: (metric: string, value: number, severity: 'good' | 'needsImprovement' | 'poor') => {
    analytics.trackPerformance('performance_alert', value, {
      metric,
      severity,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      timestamp: new Date().toISOString(),
    });
  },

  // Monitor and alert on performance issues
  monitor: (metric: string, value: number) => {
    const severity = performanceAlerts.checkThreshold(metric, value);
    if (severity !== 'good') {
      performanceAlerts.trackAlert(metric, value, severity);
    }
  },
};

export default performanceMonitoring;

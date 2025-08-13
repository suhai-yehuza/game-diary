import { analytics } from './analytics';

// Performance metrics interface
export interface IPerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift

  // Page load metrics
  domContentLoaded?: number;
  windowLoad?: number;
}

// TEMPORARILY DISABLED: Performance monitoring to reduce analytics costs
// Set this to true to re-enable performance monitoring
const PERFORMANCE_MONITORING_ENABLED = false;

// Performance monitoring utility
export const performanceMonitoring = {
  // Initialize performance monitoring
  initialize: () => {
    if (!PERFORMANCE_MONITORING_ENABLED) {
      return;
    }

    // Track Core Web Vitals
    performanceMonitoring.trackCoreWebVitals();
  },

  // Track Core Web Vitals
  trackCoreWebVitals: () => {
    if (
      !PERFORMANCE_MONITORING_ENABLED ||
      typeof window === 'undefined' ||
      !('PerformanceObserver' in window)
    ) {
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
    if (
      !PERFORMANCE_MONITORING_ENABLED ||
      typeof window === 'undefined' ||
      !('performance' in window)
    ) {
      return;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      // Track DOM Content Loaded
      if (navigation.domContentLoadedEventEnd > 0) {
        analytics.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd, {
          page,
          navigation_type: navigation.type,
        });
      }

      // Track Window Load
      if (navigation.loadEventEnd > 0) {
        analytics.trackPerformance('window_load', navigation.loadEventEnd, {
          page,
          navigation_type: navigation.type,
        });
      }

      // Track Total Page Load Time
      const totalLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      analytics.trackPerformance('total_page_load', totalLoadTime, {
        page,
        navigation_type: navigation.type,
      });
    }
  },

  // Track component render performance
  trackComponentRender: (componentName: string, renderTime: number) => {
    if (!PERFORMANCE_MONITORING_ENABLED) {
      return;
    }

    analytics.trackPerformance('component_render_time', renderTime, {
      component: componentName,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  },

  // Track API response times
  trackApiResponse: (endpoint: string, responseTime: number, status: number) => {
    if (!PERFORMANCE_MONITORING_ENABLED) {
      return;
    }

    analytics.trackPerformance('api_response_time', responseTime, {
      endpoint,
      status,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  },

  // Track bundle size
  trackBundleSize: (size: number, bundleName: string) => {
    if (!PERFORMANCE_MONITORING_ENABLED) {
      return;
    }

    analytics.trackPerformance('bundle_size', size, {
      bundle_name: bundleName,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  },

  // Track user interaction times
  trackInteractionTime: (interactionType: string, duration: number) => {
    if (!PERFORMANCE_MONITORING_ENABLED) {
      return;
    }

    analytics.trackPerformance('interaction_time', duration, {
      interaction_type: interactionType,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  },

  // Track resource loading times
  trackResourceLoad: (resourceType: string, loadTime: number, resourceUrl: string) => {
    if (!PERFORMANCE_MONITORING_ENABLED) {
      return;
    }

    analytics.trackPerformance('resource_load_time', loadTime, {
      resource_type: resourceType,
      resource_url: resourceUrl,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  },

  // Track memory usage
  trackMemoryUsage: () => {
    if (
      !PERFORMANCE_MONITORING_ENABLED ||
      typeof window === 'undefined' ||
      !('memory' in performance)
    ) {
      return;
    }

    const memory = (
      performance as {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }
    ).memory;
    if (memory) {
      analytics.trackPerformance('memory_usage', memory.usedJSHeapSize, {
        total_heap_size: memory.totalJSHeapSize,
        heap_size_limit: memory.jsHeapSizeLimit,
        page: window.location.pathname,
      });
    }
  },

  // Track network conditions
  trackNetworkConditions: () => {
    if (
      !PERFORMANCE_MONITORING_ENABLED ||
      typeof window === 'undefined' ||
      !('connection' in navigator)
    ) {
      return;
    }

    const connection = (
      navigator as {
        connection?: {
          effectiveType: string;
          downlink: number;
          rtt: number;
          saveData: boolean;
        };
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
  },

  // Track resource loading performance
  trackResourceLoading: () => {
    if (
      !PERFORMANCE_MONITORING_ENABLED ||
      typeof window === 'undefined' ||
      !('PerformanceObserver' in window)
    ) {
      return;
    }

    const resourceObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const resourceEntry = entry as PerformanceResourceTiming;
        analytics.trackPerformance('resource_load_time', resourceEntry.duration, {
          resource_type: resourceEntry.initiatorType,
          resource_url: resourceEntry.name,
          page: window.location.pathname,
        });
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  },

  // Track performance alerts
  trackPerformanceAlert: (metric: string, value: number, threshold: number) => {
    if (!PERFORMANCE_MONITORING_ENABLED) {
      return;
    }

    if (value > threshold) {
      analytics.trackPerformance('performance_alert', value, {
        metric,
        threshold,
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      });
    }
  },

  // Get current performance metrics
  getCurrentMetrics: (): IPerformanceMetrics => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return {};
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const metrics: IPerformanceMetrics = {};

    if (navigation) {
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd;
      metrics.windowLoad = navigation.loadEventEnd;
    }

    return metrics;
  },
};

export default performanceMonitoring;

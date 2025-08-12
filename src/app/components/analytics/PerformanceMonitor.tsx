'use client';

import { useEffect } from 'react';

import { performanceMonitoring } from '@/lib/utils/performance-monitoring';

interface IPerformanceMonitorProps {
  enabled?: boolean;
  trackCoreWebVitals?: boolean;
  trackMemoryUsage?: boolean;
  trackNetworkConditions?: boolean;
  trackResourceLoading?: boolean;
}

export function PerformanceMonitor({
  enabled = true,
  trackCoreWebVitals = true,
  trackMemoryUsage = true,
  trackNetworkConditions = true,
  trackResourceLoading = true,
}: IPerformanceMonitorProps) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    // Initialize performance monitoring
    performanceMonitoring.initialize();

    // Track initial page load
    performanceMonitoring.trackPageLoad(window.location.pathname);

    // Track network conditions on connection change
    if (trackNetworkConditions && 'connection' in navigator) {
      const connection = (
        navigator as {
          connection?: {
            addEventListener: (event: string, handler: () => void) => void;
            removeEventListener: (event: string, handler: () => void) => void;
          };
        }
      ).connection;
      if (connection) {
        const handleConnectionChange = () => {
          performanceMonitoring.trackNetworkConditions();
        };

        connection.addEventListener('change', handleConnectionChange);

        return () => {
          connection.removeEventListener('change', handleConnectionChange);
        };
      }
    }
  }, [enabled, trackCoreWebVitals, trackMemoryUsage, trackNetworkConditions, trackResourceLoading]);

  return null; // This component doesn't render anything
}

export default PerformanceMonitor;

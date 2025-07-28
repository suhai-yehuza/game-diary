'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to track if component is mounted on client side
 * Useful for preventing hydration mismatches and SSR issues
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

/**
 * Hook to track if component is mounted with a delay
 * Useful for components that need to wait for client-side initialization
 */
export function useMountedWithDelay(delay = 0) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return mounted;
}

/**
 * Hook to track if component is mounted with SSR-safe rendering
 * Returns a loading state until mounted
 */
export function useMountedWithLoading() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setLoading(false);
  }, []);

  return { mounted, loading };
}

'use client';

import { useEffect } from 'react';

import { setupE2ETestEnvironment } from '@/lib/utils/e2e-test-setup';

/**
 * Consolidated E2E Test Setup Component
 * Handles both environment setup and conditional rendering
 */
export function E2ETestSetup() {
  useEffect(() => {
    // Set up E2E test environment variables in the browser
    setupE2ETestEnvironment();
  }, []);

  return null; // This component doesn't render anything
}

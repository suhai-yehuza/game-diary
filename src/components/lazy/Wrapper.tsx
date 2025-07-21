import React, { Suspense } from 'react';

import { LoadingSpinner } from '@/components/lazy/Loading';

// Lazy wrapper component with error boundary
export function LazyComponent({
  children,
  fallback = <LoadingSpinner />,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

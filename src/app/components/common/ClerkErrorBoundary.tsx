'use client';

import React, { Component, Suspense } from 'react';

// Error boundary for Clerk components
export class ClerkErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    // Only log Clerk-related errors during development/testing
    if (error.message.includes('Clerk') || error.message.includes('useSession')) {
      console.warn('Clerk component error caught:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Authentication temporarily unavailable</div>;
    }

    return this.props.children;
  }
}

// Wrapper component that combines error boundary with suspense
export function ClerkWrapper({
  children,
  fallback = <div>Authentication temporarily unavailable</div>,
  suspenseFallback = <div>Loading authentication status...</div>,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suspenseFallback?: React.ReactNode;
}) {
  return (
    <ClerkErrorBoundary fallback={fallback}>
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </ClerkErrorBoundary>
  );
}

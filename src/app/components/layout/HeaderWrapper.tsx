'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import Header without loading skeleton to prevent flash
const Header = dynamic(() => import('./Header').then(mod => ({ default: mod.Header })), {
  ssr: true, // Enable SSR to prevent flash
  loading: () => null, // No loading component to prevent flash
});

export function HeaderWrapper() {
  return <Header />;
}

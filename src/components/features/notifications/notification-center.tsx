'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import with SSR disabled to prevent framer-motion SSR issues
const NotificationCenterClient = dynamic(() => import('./notification-center-client'), {
  ssr: false,
  loading: () => <div className="h-8 w-8" />, // Placeholder while loading
});

export function NotificationCenter() {
  return <NotificationCenterClient />;
}

'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import with SSR disabled to prevent framer-motion SSR issues
const MobileNavClient = dynamic(() => import('./mobile-nav-client'), {
  ssr: false,
  loading: () => <div className="h-12 w-full" />, // Placeholder while loading
});

export const MobileNav: React.FC = () => {
  return <MobileNavClient />;
};

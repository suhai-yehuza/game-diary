'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { analytics } from '@/lib/utils/analytics';

interface IPageViewTrackerProps {
  pageTitle?: string;
}

export function PageViewTracker({ pageTitle }: IPageViewTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when component mounts or pathname changes
    analytics.trackPageView(pathname, {
      page_title: pageTitle || document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
    });
  }, [pathname, pageTitle]);

  return null; // This component doesn't render anything
}

export default PageViewTracker;

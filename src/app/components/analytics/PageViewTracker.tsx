'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface IPageViewTrackerProps {
  pageTitle?: string;
}

export function PageViewTracker({ pageTitle }: IPageViewTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // TEMPORARILY DISABLED: Custom page view tracking to reduce analytics costs
    // The basic Vercel Analytics component in layout.tsx will still track page views
    // To re-enable custom page view tracking, uncomment the following code:
    // Track page view when component mounts or pathname changes
    // analytics.trackPageView(pathname, {
    //   page_title: pageTitle || document.title,
    //   referrer: document.referrer,
    //   user_agent: navigator.userAgent,
    // });
  }, [pathname, pageTitle]);

  return null; // This component doesn't render anything
}

export default PageViewTracker;

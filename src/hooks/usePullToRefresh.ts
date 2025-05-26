import { useState, useEffect } from 'react';

import { UsePullToRefreshOptions } from '@/lib/types/consolidated.types';
import { useTouchEvents } from '@/lib/utils/touch-events';

export const usePullToRefresh = ({
  onRefresh,
  threshold = 60,
  maxPullDistance = 120,
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const { handlers } = useTouchEvents({
    maxDistance: maxPullDistance,
    threshold,
    onTouchMove: state => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop === 0) {
        setPullDistance(state.distance);
      }
    },
    onTouchEnd: async () => {
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
    },
  });

  useEffect(() => {
    document.addEventListener('touchstart', handlers.handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handlers.handleTouchMove, { passive: false });
    document.addEventListener('touchend', handlers.handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handlers.handleTouchStart);
      document.removeEventListener('touchmove', handlers.handleTouchMove);
      document.removeEventListener('touchend', handlers.handleTouchEnd);
    };
  }, [handlers]);

  return {
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
};

import { useState, useCallback, useEffect } from 'react';

import { UsePullToRefreshOptions } from '@/lib/types/consolidated.types';

export const usePullToRefresh = ({
  onRefresh,
  threshold = 60,
  maxPullDistance = 120,
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (startY === 0) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, maxPullDistance));
      }
    },
    [startY, maxPullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  }, [pullDistance, threshold, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
};

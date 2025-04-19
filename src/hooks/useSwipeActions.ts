import { useState, useCallback, useRef, useEffect } from 'react';

import { UseSwipeActionsOptions } from '@/lib/types/generated/types';

export const useSwipeActions = ({
  actions,
  threshold = 50,
  maxSwipeDistance = 200,
}: UseSwipeActionsOptions) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [startX, setStartX] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isSwiping || e.touches.length !== 1) return;

      const currentX = e.touches[0].clientX;
      const distance = currentX - startX;
      const newDirection = distance > 0 ? 'right' : 'left';

      if (Math.abs(distance) > 10) {
        e.preventDefault();
        setDirection(newDirection);
        setSwipeDistance(
          Math.min(Math.abs(distance), maxSwipeDistance) * (newDirection === 'left' ? -1 : 1)
        );
      }
    },
    [isSwiping, startX, maxSwipeDistance]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    const absDistance = Math.abs(swipeDistance);
    if (absDistance >= threshold) {
      const actionIndex = Math.floor((absDistance / maxSwipeDistance) * actions.length);
      const action = actions[Math.min(actionIndex, actions.length - 1)];
      if (action) {
        action.onAction();
      }
    }

    setIsSwiping(false);
    setSwipeDistance(0);
    setDirection(null);
  }, [isSwiping, swipeDistance, threshold, maxSwipeDistance, actions]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    elementRef,
    isSwiping,
    swipeDistance,
    direction,
    swipeProgress: Math.min(Math.abs(swipeDistance) / maxSwipeDistance, 1),
  };
};

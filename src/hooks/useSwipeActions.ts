import { useState, useRef, useEffect } from 'react';

import { UseSwipeActionsOptions } from '@/lib/types/generated/types';
import { useTouchEvents } from '@/lib/utils/touch-events';

export const useSwipeActions = ({
  actions,
  threshold = 50,
  maxSwipeDistance = 200,
}: UseSwipeActionsOptions) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const { handlers } = useTouchEvents({
    maxDistance: maxSwipeDistance,
    threshold,
    onTouchStart: () => {
      setIsSwiping(true);
    },
    onTouchMove: state => {
      const distance = state.currentPosition - state.startPosition;
      const newDirection = distance > 0 ? 'right' : 'left';

      if (Math.abs(distance) > 10) {
        setDirection(newDirection);
        setSwipeDistance(
          Math.min(Math.abs(distance), maxSwipeDistance) * (newDirection === 'left' ? -1 : 1)
        );
      }
    },
    onTouchEnd: state => {
      if (!isSwiping) return;

      const absDistance = Math.abs(state.distance);
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
    },
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handlers.handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handlers.handleTouchMove, { passive: false });
    element.addEventListener('touchend', handlers.handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handlers.handleTouchStart);
      element.removeEventListener('touchmove', handlers.handleTouchMove);
      element.removeEventListener('touchend', handlers.handleTouchEnd);
    };
  }, [handlers]);

  return {
    elementRef,
    isSwiping,
    swipeDistance,
    direction,
    swipeProgress: Math.min(Math.abs(swipeDistance) / maxSwipeDistance, 1),
  };
};

import { useCallback, useState } from 'react';

interface TouchEventState {
  startPosition: number;
  currentPosition: number;
  distance: number;
  isActive: boolean;
}

export const useTouchEvents = (
  options: {
    onTouchStart?: (state: TouchEventState) => void;
    onTouchMove?: (state: TouchEventState) => void;
    onTouchEnd?: (state: TouchEventState) => void;
    maxDistance?: number;
    threshold?: number;
  } = {}
) => {
  const [state, setState] = useState<TouchEventState>({
    startPosition: 0,
    currentPosition: 0,
    distance: 0,
    isActive: false,
  });

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!event.touches[0]) return;
      const touch = event.touches[0];
      setState(prev => ({
        ...prev,
        startPosition: touch.clientX,
        currentPosition: touch.clientX,
        distance: 0,
      }));
      options.onTouchStart?.(state);
    },
    [options, state]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!event.touches[0]) return;
      const touch = event.touches[0];
      const distance = touch.clientX - state.startPosition;
      const maxDistance = options.maxDistance ?? Infinity;
      const boundedDistance = Math.min(Math.max(distance, -maxDistance), maxDistance);

      setState(prev => ({
        ...prev,
        currentPosition: touch.clientX,
        distance: boundedDistance,
      }));

      options.onTouchMove?.(state);
    },
    [options, state]
  );

  const handleTouchEnd = useCallback(() => {
    options.onTouchEnd?.(state);
    setState(prev => ({
      ...prev,
      startPosition: 0,
      currentPosition: 0,
      distance: 0,
    }));
  }, [options, state]);

  return {
    state,
    handlers: {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    },
  };
};

import { useEffect, useRef, useState } from 'react';

import type { IUseScrollAnimationProps } from '@/types';

export function useScrollAnimation({
  speed = 3,
  mobileSpeed = 2, // Slower on mobile for better readability
  pauseOnHover = true,
  autoStart = true,
}: IUseScrollAnimationProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isScrolling, setIsScrolling] = useState(autoStart);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const lastScrollTop = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    // Check if content needs scrolling
    const needsScrolling = content.scrollHeight > container.clientHeight;

    // Detect mobile device
    const isMobile = window.innerWidth < 768;
    const currentSpeed = isMobile ? mobileSpeed : speed;

    console.log('🔍 Scroll Debug:', {
      containerHeight: container.clientHeight,
      contentHeight: content.scrollHeight,
      needsScrolling,
      isScrolling,
      isPaused,
      isManualScrolling,
      isMobile,
      currentSpeed,
    });

    if (!needsScrolling) {
      console.log('⚠️ No scrolling needed - content fits in container');
      return;
    }

    let startTime: number | undefined;
    let currentScrollTop = 0;
    let manualScrollTimeout: NodeJS.Timeout;

    // Handle manual scroll events
    const handleManualScroll = () => {
      const currentScrollTop = container.scrollTop;
      const scrollDelta = Math.abs(currentScrollTop - lastScrollTop.current);

      // Only consider it manual scrolling if there's significant movement
      if (scrollDelta > 5) {
        setIsManualScrolling(true);
        lastScrollTop.current = currentScrollTop;

        // Clear existing timeout
        if (manualScrollTimeout) {
          clearTimeout(manualScrollTimeout);
        }

        // Resume auto-scroll after 2 seconds of no manual interaction
        manualScrollTimeout = setTimeout(() => {
          setIsManualScrolling(false);
          // Reset animation position to current scroll position
          startTime = undefined;
        }, 2000);
      }
    };

    // Add scroll event listeners for manual scrolling
    container.addEventListener('scroll', handleManualScroll);
    container.addEventListener('wheel', handleManualScroll);
    container.addEventListener('touchstart', handleManualScroll);
    container.addEventListener('touchmove', handleManualScroll);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      // Pause auto-scroll if user is manually scrolling
      if (!isScrolling || isPaused || isManualScrolling) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - startTime;
      const scrollDistance = (currentSpeed * elapsed) / 1000; // Convert to pixels

      currentScrollTop += scrollDistance;

      // Reset to top when reaching bottom
      if (currentScrollTop >= content.scrollHeight - container.clientHeight) {
        currentScrollTop = 0;
        startTime = timestamp;
      }

      container.scrollTop = currentScrollTop;
      lastScrollTop.current = currentScrollTop;
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isScrolling) {
      console.log('🚀 Starting scroll animation');
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (manualScrollTimeout) {
        clearTimeout(manualScrollTimeout);
      }
      container.removeEventListener('scroll', handleManualScroll);
      container.removeEventListener('wheel', handleManualScroll);
      container.removeEventListener('touchstart', handleManualScroll);
      container.removeEventListener('touchmove', handleManualScroll);
    };
  }, [speed, mobileSpeed, isScrolling, isPaused, isManualScrolling]);

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);
  const start = () => setIsScrolling(true);
  const stop = () => setIsScrolling(false);

  const handleMouseEnter = () => {
    if (pauseOnHover) pause();
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) resume();
  };

  return {
    containerRef,
    contentRef,
    isPaused,
    isScrolling,
    isManualScrolling,
    pause,
    resume,
    start,
    stop,
    handleMouseEnter,
    handleMouseLeave,
  };
}

'use client';

import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { TABLET_BREAKPOINT } from '@/app/components/layout/components/breakpoints';
import { ClientOnlyNavigationLinks } from '@/app/components/layout/components/navigation/ClientOnlyNavigationLinks';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { useMenuContext } from '@/app/components/providers';
import type { IMobileMenuSheetProps } from '@/lib/types';

export function MobileMenuSheet({ isActive }: IMobileMenuSheetProps) {
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  const isCompactViewport = useMobileDetection(TABLET_BREAKPOINT);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle gesture interactions
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);

    // Haptic feedback on touch start
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;
    const threshold = 100; // Minimum distance to trigger close

    if (deltaY > threshold) {
      // Haptic feedback on successful close
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
      setIsMenuExpanded(false);
    }
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuExpanded) {
        setIsMenuExpanded(false);
      }
    };

    if (isMenuExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuExpanded, setIsMenuExpanded]);

  // Focus trap
  useEffect(() => {
    if (!isMenuExpanded || !sheetRef.current) return;

    const focusableElements = sheetRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (firstElement) firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuExpanded]);

  if (!isCompactViewport || !isMenuExpanded) return null;

  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-out"
        onClick={() => setIsMenuExpanded(false)}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl lg:hidden max-h-[85vh] flex flex-col transform transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${translateY}px)`,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
          <button
            onClick={() => setIsMenuExpanded(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 px-6 py-6 overflow-y-auto text-gray-900 dark:text-gray-100">
          <ClientOnlyNavigationLinks
            isActive={isActive}
            _isMenuExpanded={isMenuExpanded}
            _setIsMenuExpanded={setIsMenuExpanded}
            closeMenu={() => setIsMenuExpanded(false)}
            isStacked={true}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            Swipe down to close
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { Home, Search, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import {
  TOUCH_TARGET_BASE,
  FLUID_TYPOGRAPHY,
} from '@/app/components/layout/components/breakpoints';
import { ClientOnlyNavigationLinks } from '@/app/components/layout/components/navigation/ClientOnlyNavigationLinks';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { useMenuContext } from '@/app/components/providers';
import type { IBottomNavItem } from '@/types';

export function UnifiedMobileNavigation() {
  const pathname = usePathname();
  const isMobile = useMobileDetection(1600); // Use same threshold as NavigationContainer
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show bottom nav on scroll (common mobile pattern)
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY;

      setIsVisible(isScrollingUp || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  // Haptic feedback for touch interactions
  const handleTouch = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') {
        return pathname === '/';
      }
      return pathname === href || pathname.startsWith(href);
    },
    [pathname]
  );

  const handleMenuToggle = useCallback(() => {
    setIsMenuExpanded(!isMenuExpanded);
    handleTouch();
  }, [isMenuExpanded, setIsMenuExpanded, handleTouch]);

  const bottomNavItems: IBottomNavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/search',
      label: 'Search',
      icon: Search,
    },
    {
      href: '/protected/dashboard',
      label: 'Dashboard',
      icon: User,
    },
    {
      href: '#',
      label: 'Menu',
      icon: isMenuExpanded ? X : Menu,
      action: handleMenuToggle,
      isAction: true,
    },
  ];

  if (!isMobile) return null;

  return (
    <>
      {/* Bottom Navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-700 border-t border-gray-500 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div
          className="flex items-center justify-around px-2 py-2"
          style={{ pointerEvents: 'auto' }}
        >
          {bottomNavItems.map(({ href, label, icon: Icon, action, isAction }) => {
            const active = isActive(href);
            const isMenuActive = isAction && isMenuExpanded;

            if (isAction && action) {
              return (
                <button
                  key={href}
                  onClick={action}
                  className={`flex flex-col items-center justify-center rounded-lg transition-all duration-200 touch-target ${
                    isMenuActive
                      ? 'text-brand-primary bg-brand-primary/20'
                      : 'text-text-inverse hover:text-text-inverse'
                  }`}
                  style={{
                    pointerEvents: 'auto',
                    minHeight: TOUCH_TARGET_BASE.minHeight,
                    minWidth: TOUCH_TARGET_BASE.minWidth,
                    padding: TOUCH_TARGET_BASE.padding,
                  }}
                  aria-label={label}
                  aria-expanded={isMenuActive}
                >
                  <Icon
                    className={`mb-1 transition-transform duration-200 ${
                      isMenuActive ? 'scale-110' : ''
                    }`}
                    style={{
                      width: FLUID_TYPOGRAPHY.mobileNavIcon,
                      height: FLUID_TYPOGRAPHY.mobileNavIcon,
                    }}
                  />
                  <span
                    className="font-medium"
                    style={{
                      fontSize: FLUID_TYPOGRAPHY.mobileNavLabel,
                      lineHeight: TOUCH_TARGET_BASE.lineHeight,
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center rounded-lg transition-all duration-200 touch-target ${
                  active
                    ? 'text-brand-primary bg-brand-primary/20'
                    : 'text-text-inverse hover:text-text-inverse'
                }`}
                style={{
                  pointerEvents: 'auto',
                  minHeight: TOUCH_TARGET_BASE.minHeight,
                  minWidth: TOUCH_TARGET_BASE.minWidth,
                  padding: TOUCH_TARGET_BASE.padding,
                }}
                onClick={handleTouch}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={`mb-1 transition-transform duration-200 ${active ? 'scale-110' : ''}`}
                  style={{
                    width: FLUID_TYPOGRAPHY.mobileNavIcon,
                    height: FLUID_TYPOGRAPHY.mobileNavIcon,
                  }}
                />
                <span
                  className="font-medium"
                  style={{
                    fontSize: FLUID_TYPOGRAPHY.mobileNavLabel,
                    lineHeight: TOUCH_TARGET_BASE.lineHeight,
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Sheet - Only show when menu is expanded */}
      {isMenuExpanded && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out"
            onClick={() => setIsMenuExpanded(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col transform transition-transform duration-300 ease-out"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-4 pb-3">
              <div className="w-12 h-1 bg-gray-500 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-500">
              <h2 className="text-xl font-semibold text-white">Menu</h2>
              <button
                onClick={() => setIsMenuExpanded(false)}
                className="p-2 rounded-full hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                aria-label="Close menu"
                style={{
                  minHeight: TOUCH_TARGET_BASE.minHeight,
                  minWidth: TOUCH_TARGET_BASE.minWidth,
                }}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 px-6 py-6 overflow-y-auto text-white">
              <ClientOnlyNavigationLinks
                isActive={isActive}
                _isMenuExpanded={isMenuExpanded}
                _setIsMenuExpanded={setIsMenuExpanded}
                closeMenu={() => setIsMenuExpanded(false)}
                isStacked={true}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-500 bg-gray-600">
              <div className="text-sm text-gray-400 text-center flex items-center justify-center gap-2">
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
        </div>
      )}
    </>
  );
}

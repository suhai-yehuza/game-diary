'use client';

import { Home, Search, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { useMenuContext } from '@/app/components/providers';

interface IBottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon?: React.ComponentType<{ className?: string }>;
  action?: () => void;
  isAction?: boolean;
}

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const isMobile = useMobileDetection();
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show bottom nav on scroll (common mobile pattern)
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const _isScrollingDown = currentScrollY > lastScrollY && currentScrollY > 100;
      const isScrollingUp = currentScrollY < lastScrollY;

      setIsVisible(isScrollingUp || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  // Haptic feedback for touch interactions
  const handleTouch = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(href);
  };

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
      href: '/protected/user',
      label: 'Dashboard',
      icon: User,
    },
    {
      href: '#',
      label: 'Menu',
      icon: Menu,
      action: () => {
        setIsMenuExpanded(!isMenuExpanded);
        handleTouch();
      },
      isAction: true,
    },
  ];

  if (!isMobile) return null;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {bottomNavItems.map(({ href, label, icon: Icon, action, isAction }) => {
          const active = isActive(href);
          const isMenuActive = isAction && isMenuExpanded;

          if (isAction && action) {
            return (
              <button
                key={href}
                onClick={action}
                className={`flex flex-col items-center justify-center min-h-[56px] min-w-[56px] rounded-lg transition-all duration-200 ${
                  isMenuActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                aria-label={label}
                aria-expanded={isMenuActive}
              >
                <Icon
                  className={`w-6 h-6 mb-1 transition-transform duration-200 ${
                    isMenuActive ? 'scale-110' : ''
                  }`}
                />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center min-h-[56px] min-w-[56px] rounded-lg transition-all duration-200 ${
                active
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              onClick={handleTouch}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-transform duration-200 ${
                  active ? 'scale-110' : ''
                }`}
              />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

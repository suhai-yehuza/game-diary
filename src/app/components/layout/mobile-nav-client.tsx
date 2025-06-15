'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

import { NotificationCenter } from '@src/app/protected/user/components/notifications';
import type { INavItem } from '@src/lib/types/component.types';

const navItems: INavItem[] = [
  {
    label: 'Games',
    href: '/sports/nba',
    icon: '🏀',
    badge: 3,
    subItems: [
      { label: 'Overview', href: '/sports/nba', icon: '📈' },
      { label: 'Live Games', href: '/sports/nba/games/live', icon: '🎯', isNew: true },
    ],
  },
  {
    label: 'Teams',
    href: '/sports/nba/teams',
    icon: '🏆',
    subItems: [
      { label: 'Standings', href: '/sports/nba/teams/standings', icon: '📈' },
      { label: 'Favorites', href: '/sports/nba/teams/favorites', icon: '⭐' },
    ],
  },
  {
    label: 'Analysis',
    href: '/sports/nba/analysis',
    icon: '📊',
    subItems: [
      { label: 'Statistics', href: '/sports/nba/analysis/stats', icon: '📈' },
      { label: 'Trends', href: '/sports/nba/analysis/trends', icon: '📊' },
    ],
  },
];

export default function MobileNavClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Close nav when route changes
  useEffect(() => {
    setIsOpen(false);
    setExpandedItem(null);
  }, [pathname]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    // If swipe down more than 50px, close nav
    if (diff < -50) {
      setIsOpen(false);
    }
  };

  const toggleExpanded = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-40 lg:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 tap-scale"
            aria-label="Toggle navigation"
          >
            <div className="space-y-1">
              <div
                className={`w-6 h-0.5 bg-current transition-all ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}
              />
              <div className={`w-6 h-0.5 bg-current transition-all ${isOpen ? 'opacity-0' : ''}`} />
              <div
                className={`w-6 h-0.5 bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
              />
            </div>
          </button>

          <h1 className="text-lg font-semibold text-gray-900">Game Diary</h1>

          <NotificationCenter />
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-overlay-show"
          onClick={() => setIsOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close navigation"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        ref={navRef}
        className={`
          fixed top-16 left-0 w-80 h-[calc(100vh-4rem)] bg-white shadow-lg z-50 lg:hidden
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-4 space-y-2 stagger-children">
            {navItems.map((item, index) => (
              <div
                key={item.label}
                className="animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-1">
                  {/* Main Item */}
                  <div
                    className={`
                      flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer
                      hover-lift tap-scale
                      ${pathname === item.href ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}
                    `}
                    onClick={() => {
                      if (item.subItems && item.subItems.length > 0) {
                        toggleExpanded(item.label);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (item.subItems && item.subItems.length > 0) {
                          toggleExpanded(item.label);
                        }
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <Link href={item.href} className="flex items-center gap-3 flex-1">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-spring">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                    {item.subItems && item.subItems.length > 0 && (
                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpanded(item.label);
                        }}
                        className="p-1 hover:bg-gray-200 rounded tap-scale"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            expandedItem === item.label ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Sub Items */}
                  {item.subItems && (
                    <div
                      className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${expandedItem === item.label ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                      `}
                    >
                      <div className="ml-6 space-y-1 pt-1">
                        {item.subItems.map((subItem: INavItem, subIndex: number) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`
                              flex items-center gap-3 p-2 rounded-lg transition-all
                              hover-lift animate-slide-in-up
                              ${pathname === subItem.href ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}
                            `}
                            style={{ animationDelay: `${subIndex * 0.05}s` }}
                          >
                            <span className="text-sm">{subItem.icon}</span>
                            <span className="text-sm font-medium">{subItem.label}</span>
                            {subItem.isNew && (
                              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-button-pulse">
                                New
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
            <div className="text-center text-sm text-gray-500 animate-fade-in">
              <p>&copy; 2024 Game Diary</p>
              <p className="mt-1">Track your gaming journey</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

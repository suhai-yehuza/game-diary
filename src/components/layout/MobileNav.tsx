'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

import { NotificationCenter } from '@/components/features/notifications';
import { NavItem } from '@/lib/types';

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/nba',
    icon: '📊',
    subItems: [
      { label: 'Overview', href: '/nba', icon: '📈' },
      { label: 'Quick Stats', href: '/nba/stats', icon: '📊' },
    ],
  },
  {
    label: 'Games',
    href: '/nba/games',
    icon: '🏀',
    badge: 3,
    subItems: [
      { label: 'Schedule', href: '/nba/games/schedule', icon: '📅' },
      { label: 'Results', href: '/nba/games/results', icon: '🏆' },
      { label: 'Live Games', href: '/nba/games/live', icon: '🎯', isNew: true },
    ],
  },
  {
    label: 'Players',
    href: '/nba/players',
    icon: '👥',
    subItems: [
      { label: 'Top Scorers', href: '/nba/players/scorers', icon: '🎯' },
      { label: 'Leaders', href: '/nba/players/leaders', icon: '👑' },
      { label: 'Rookies', href: '/nba/players/rookies', icon: '🌟', isNew: true },
    ],
  },
  {
    label: 'Teams',
    href: '/nba/teams',
    icon: '🏆',
    subItems: [
      { label: 'Standings', href: '/nba/teams/standings', icon: '📈' },
      { label: 'Stats', href: '/nba/teams/stats', icon: '📊' },
      { label: 'Power Rankings', href: '/nba/teams/rankings', icon: '💪', isNew: true },
    ],
  },
];

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle scroll position for the menu button
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-nav') && !target.closest('.mobile-nav-button')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Track recently visited items
  useEffect(() => {
    if (pathname) {
      setRecentItems(prev => {
        const newItems = [pathname, ...prev.filter(item => item !== pathname)].slice(0, 5);
        return newItems;
      });
    }
  }, [pathname]);

  // Filter items based on search query
  const filteredItems = navItems.filter(
    item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subItems?.some(subItem =>
        subItem.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="lg:hidden">
      {/* Mobile menu button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`mobile-nav-button fixed z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          scrollPosition > 100 ? 'bottom-4 right-4' : 'bottom-8 right-8'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? '✕' : '☰'}
      </motion.button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mobile-nav fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50"
          >
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              {/* Search Bar */}
              <div className="sticky top-0 bg-white pb-4 z-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">NBA Analytics</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    ✕
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                </div>
              </div>

              {/* Recent Items */}
              {recentItems.length > 0 && !searchQuery && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Recent</h3>
                  <div className="space-y-2">
                    {recentItems.map(item => {
                      const navItem = navItems.find(
                        ni => ni.href === item || ni.subItems?.some(si => si.href === item)
                      );
                      const subItem = navItem?.subItems?.find(si => si.href === item);
                      return (
                        <Link
                          key={item}
                          href={item}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-lg">{subItem?.icon || navItem?.icon}</span>
                          <span>{subItem?.label || navItem?.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-2">
                {filteredItems.map(item => (
                  <div key={item.href} className="space-y-1">
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        pathname === item.href ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (item.subItems) {
                          setActiveSection(activeSection === item.href ? null : item.href);
                        } else {
                          setIsOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                        {item.isNew && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.subItems && (
                          <span className="text-gray-400">
                            {activeSection === item.href ? '▼' : '▶'}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Sub-items */}
                    <AnimatePresence>
                      {item.subItems && activeSection === item.href && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pl-8 space-y-1 overflow-hidden"
                        >
                          {item.subItems.map(subItem => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                                pathname === subItem.href
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <span className="text-lg">{subItem.icon}</span>
                              <span>{subItem.label}</span>
                              {subItem.isNew && (
                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                  New
                                </span>
                              )}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="block text-lg mb-1">📥</span>
                    <span className="text-sm">Export Data</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="block text-lg mb-1">⭐</span>
                    <span className="text-sm">Favorites</span>
                  </motion.button>
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <NotificationCenter />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="block text-lg mb-1">⚙️</span>
                    <span className="text-sm">Settings</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

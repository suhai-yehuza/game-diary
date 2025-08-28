'use client';

import { useState } from 'react';

import type { ISportsTabsProps } from '@/lib/types';

// Interfaces moved to src/lib/types/components.types.ts

export function Tabs({
  tabs,
  defaultTab,
  className = '',
  showLiveGamesTab = true,
}: ISportsTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex items-center justify-between" aria-label="Tabs">
          {/* Main Tabs */}
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const baseClasses = `py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`;

              if (tab.href) {
                return (
                  <a
                    key={tab.id}
                    href={tab.href}
                    className={baseClasses}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {tab.label}
                  </a>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={baseClasses}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Live Games Button - Far Right */}
          {showLiveGamesTab && (
            <button
              onClick={() => (window.location.href = '/sports/live')}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
              Live Games
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{activeTabContent}</div>
    </div>
  );
}

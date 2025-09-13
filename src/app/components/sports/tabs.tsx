'use client';

import { useState } from 'react';

import type { ISportsTabsProps } from '@/types';

export function Tabs({
  tabs,
  defaultTab,
  className = '',
  showLiveGamesTab = true,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
}: ISportsTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  // Use external state if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalOnTabChange || setInternalActiveTab;

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="border-b border-theme-primary">
        <nav className="-mb-px flex items-center justify-between" aria-label="Tabs">
          {/* Main Tabs */}
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const baseClasses = `py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                isActive
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-theme-muted hover:text-theme-secondary hover:border-theme-primary'
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
              className="inline-flex items-center px-4 py-2 bg-semantic-error text-text-inverse rounded-md hover:bg-semantic-error/90 transition-colors focus:outline-none focus:ring-2 focus:ring-semantic-error focus:ring-offset-2 text-sm font-medium"
            >
              <div className="w-2 h-2 bg-text-inverse rounded-full animate-pulse mr-2" />
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

'use client';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import type { IGameLogsTabsProps } from '@/types';

export const GameLogsTabs = ({ selectedTab, onTabChange, children }: IGameLogsTabsProps) => {
  const isMobile = useMobileDetection();

  return (
    <Tabs value={selectedTab} onValueChange={onTabChange} data-testid="tabs" className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <TabsList
          className={`flex ${isMobile ? 'w-full' : 'w-auto'} bg-transparent p-0 h-auto gap-0`}
        >
          <TabsTrigger
            value="my-logs"
            data-testid="tab-trigger-my-logs"
            className="relative px-4 py-3 text-sm font-medium text-white hover:text-gray-100 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none transition-all duration-200 data-[state=active]:shadow-none"
          >
            My Logs
          </TabsTrigger>
          <TabsTrigger
            value="friends-logs"
            data-testid="tab-trigger-friends-logs"
            className="relative px-4 py-3 text-sm font-medium text-white hover:text-gray-100 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none transition-all duration-200 data-[state=active]:shadow-none"
          >
            Friends&apos; Logs
          </TabsTrigger>
          <TabsTrigger
            value="public-logs"
            data-testid="tab-trigger-public-logs"
            className="relative px-4 py-3 text-sm font-medium text-white hover:text-gray-100 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none transition-all duration-200 data-[state=active]:shadow-none"
          >
            Public Logs
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">{children}</div>
    </Tabs>
  );
};

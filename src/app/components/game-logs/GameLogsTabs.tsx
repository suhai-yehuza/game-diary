'use client';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import type { IGameLogsTabsProps } from '@/lib/types';

export const GameLogsTabs = ({ selectedTab, onTabChange, children }: IGameLogsTabsProps) => {
  const isMobile = useMobileDetection();

  return (
    <Tabs value={selectedTab} onValueChange={onTabChange} data-testid="tabs">
      <TabsList className={`w-full gap-2 mb-6 ${isMobile ? 'grid grid-cols-3' : 'flex flex-row'}`}>
        <TabsTrigger
          value="my-logs"
          data-testid="tab-trigger-my-logs"
          className={
            isMobile
              ? 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-6 transition-all duration-300 font-semibold text-sm sm:text-base rounded-xl hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        >
          {isMobile ? 'My Logs' : 'My Logs'}
        </TabsTrigger>
        <TabsTrigger
          value="friends-logs"
          data-testid="tab-trigger-friends-logs"
          className={
            isMobile
              ? 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-6 transition-all duration-300 font-semibold text-sm sm:text-base rounded-xl hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        >
          {isMobile ? "Friends' Logs" : "Friends' Logs"}
        </TabsTrigger>
        <TabsTrigger
          value="public-logs"
          data-testid="tab-trigger-public-logs"
          className={
            isMobile
              ? 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'text-gray-700 dark:text-gray-300 data-[state=active]:text-white dark:data-[state=active]:text-white data-[state=active]:bg-blue-600 dark:data-[state=active]:bg-blue-600 data-[state=active]:shadow-lg data-[state=active]:scale-105 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-6 transition-all duration-300 font-semibold text-sm sm:text-base rounded-xl hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        >
          {isMobile ? 'Public Logs' : 'Public Logs'}
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

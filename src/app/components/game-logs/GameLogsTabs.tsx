'use client';

import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import type { IGameLogsTabsProps } from '@/lib/types';

export const GameLogsTabs = ({ selectedTab, onTabChange, children }: IGameLogsTabsProps) => {
  return (
    <Tabs value={selectedTab} onValueChange={onTabChange} data-testid="tabs">
      <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 mb-4">
        <TabsTrigger
          value="my-logs"
          data-testid="tab-trigger-my-logs"
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
        >
          My Logs
        </TabsTrigger>
        <TabsTrigger
          value="friends-logs"
          data-testid="tab-trigger-friends-logs"
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
        >
          Friends&apos; Logs
        </TabsTrigger>
        <TabsTrigger
          value="public-logs"
          data-testid="tab-trigger-public-logs"
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
        >
          Public Logs
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

'use client';

import React, { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import TableWithSearch from '@/app/protected/admin/database/components/TableWithSearch';
import type { CLASSIFICATION, IGameLog } from '@/types';

export function GameLogsTableWithSearch() {
  const [selectedClassification, setSelectedClassification] =
    useState<(typeof CLASSIFICATION)[keyof typeof CLASSIFICATION]>('PUBLIC');

  const columns = [
    { key: 'id' as string, label: 'id', sortable: true },
    { key: 'user_id' as string, label: 'user_id', sortable: true },
    { key: 'game_id' as string, label: 'game_id', sortable: true },
    { key: 'rating_for_game' as string, label: 'rating_for_game', sortable: true },
    { key: 'classification' as string, label: 'classification', sortable: true },
    { key: 'created_at' as string, label: 'created_at', sortable: true },
  ];

  const getTableName = (_classification: (typeof CLASSIFICATION)[keyof typeof CLASSIFICATION]) => {
    return 'game_logs';
  };

  const getItemLabel = (classification: (typeof CLASSIFICATION)[keyof typeof CLASSIFICATION]) => {
    return `${classification.toLowerCase()} game logs`;
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={selectedClassification}
        onValueChange={value =>
          setSelectedClassification(value as (typeof CLASSIFICATION)[keyof typeof CLASSIFICATION])
        }
      >
        <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 mb-4">
          <TabsTrigger
            value="PUBLIC"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
          >
            Public Logs
          </TabsTrigger>
          <TabsTrigger
            value="PRIVATE"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
          >
            Private Logs
          </TabsTrigger>
          <TabsTrigger
            value="PROTECTED"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
          >
            Protected Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="PUBLIC">
          <TableWithSearch<IGameLog>
            columns={columns}
            itemLabel={getItemLabel('PUBLIC')}
            tableName={getTableName('PUBLIC')}
            additionalParams={{ classification: 'PUBLIC' }}
          />
        </TabsContent>

        <TabsContent value="PRIVATE">
          <TableWithSearch<IGameLog>
            columns={columns}
            itemLabel={getItemLabel('PRIVATE')}
            tableName={getTableName('PRIVATE')}
            additionalParams={{ classification: 'PRIVATE' }}
          />
        </TabsContent>

        <TabsContent value="PROTECTED">
          <TableWithSearch<IGameLog>
            columns={columns}
            itemLabel={getItemLabel('PROTECTED')}
            tableName={getTableName('PROTECTED')}
            additionalParams={{ classification: 'PROTECTED' }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

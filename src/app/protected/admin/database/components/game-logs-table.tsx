'use client';

import React, { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import TableWithSearch from '@/app/protected/admin/database/components/TableWithSearch';

type ClassificationType = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

interface IGameLog {
  id: string;
  user_id: string;
  game_id: string;
  rating_for_game: number;
  classification: string;
  created_at: string;
}

export function GameLogsTableWithSearch() {
  const [selectedClassification, setSelectedClassification] =
    useState<ClassificationType>('PUBLIC');

  const columns = [
    { key: 'id' as keyof IGameLog, label: 'id', sortable: true },
    { key: 'user_id' as keyof IGameLog, label: 'user_id', sortable: true },
    { key: 'game_id' as keyof IGameLog, label: 'game_id', sortable: true },
    { key: 'rating_for_game' as keyof IGameLog, label: 'rating_for_game', sortable: true },
    { key: 'classification' as keyof IGameLog, label: 'classification', sortable: true },
    { key: 'created_at' as keyof IGameLog, label: 'created_at', sortable: true },
  ];

  const getTableName = (classification: ClassificationType) => {
    return `game_logs_${classification.toLowerCase()}`;
  };

  const getItemLabel = (classification: ClassificationType) => {
    return `${classification.toLowerCase()} game logs`;
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={selectedClassification}
        onValueChange={value => setSelectedClassification(value as ClassificationType)}
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
          />
        </TabsContent>

        <TabsContent value="PRIVATE">
          <TableWithSearch<IGameLog>
            columns={columns}
            itemLabel={getItemLabel('PRIVATE')}
            tableName={getTableName('PRIVATE')}
          />
        </TabsContent>

        <TabsContent value="PROTECTED">
          <TableWithSearch<IGameLog>
            columns={columns}
            itemLabel={getItemLabel('PROTECTED')}
            tableName={getTableName('PROTECTED')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
